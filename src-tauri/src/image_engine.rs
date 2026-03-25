// Copyright 2026 xastle
// 
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//     http://www.apache.org/licenses/LICENSE-2.0
// 
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//! Image Engine — 基于纯 Rust DCT 的频域盲水印注入与提取
//! 底层使用: image crate (图像 I/O) + rustdct (离散余弦变换)

use image::{GenericImageView, ImageBuffer, Rgb};
use rustdct::DctPlanner;
use std::path::Path;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ProtectionResult {
    pub success: bool,
    pub message: String,
    pub output_path: Option<String>,
}

/// T1 基础档：DCT 频域盲水印注入
pub async fn apply_t1_protection(input_path: &str, output_dir: &str) -> Result<ProtectionResult, String> {
    let input_path_own = input_path.to_string();
    let output_dir_own = output_dir.to_string();

    let handle = tokio::task::spawn_blocking(move || {
        inject_dct_watermark(&input_path_own, &output_dir_own)
    });

    handle.await.map_err(|e| e.to_string())?
}

fn inject_dct_watermark(input_path: &str, output_dir: &str) -> Result<ProtectionResult, String> {
    // 1. 读取图像
    let img = image::open(input_path).map_err(|e| format!("无法读取图像: {}", e))?;
    let (width, height) = img.dimensions();
    let file_name = Path::new(input_path).file_name()
        .and_then(|n| n.to_str()).unwrap_or("unknown");
    let output_path = Path::new(output_dir).join(format!("seal_{}", file_name));

    // 2. 提取三个颜色通道，分别在频域操作保持色彩准确
    let rgb = img.to_rgb8();
    let mut pixels_r: Vec<f32> = rgb.pixels().map(|p| p[0] as f32).collect();
    let mut pixels_g: Vec<f32> = rgb.pixels().map(|p| p[1] as f32).collect();
    let mut pixels_b: Vec<f32> = rgb.pixels().map(|p| p[2] as f32).collect();

    let n = pixels_r.len();
    let n_f32 = n as f32;
    let mut planner = DctPlanner::new();

    // 3. 水印强度：按信号长度缩放，确保逆变换后 delta 约为 ±1 像素级
    let watermark_strength: f32 = 0.8 * n_f32;

    // 4. 对每个通道执行 DCT → 注入中频水印 → IDCT → 归一化
    let mid_start = n / 4;
    let mid_end = n / 2;

    for channel in [&mut pixels_r, &mut pixels_g, &mut pixels_b] {
        let dct = planner.plan_dct2(n);
        dct.process_dct2(channel);

        // 在中频区段注入水印 (MetaSeal 印记)
        for i in mid_start..mid_end {
            channel[i] += watermark_strength;
        }

        let idct = planner.plan_dct3(n);
        idct.process_dct3(channel);

        // ★ 关键修复：rustdct 的 DCT-II/DCT-III 往返会将值放大 2*N 倍
        // 必须在逆变换后除以 2*N 进行归一化
        let norm = 2.0 * n_f32;
        for val in channel.iter_mut() {
            *val /= norm;
        }
    }

    // 5. 重建 RGB 图像
    let mut out_buf: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::new(width, height);
    for (idx, (x, y, _)) in img.pixels().enumerate() {
        let r = pixels_r[idx].round().clamp(0.0, 255.0) as u8;
        let g = pixels_g[idx].round().clamp(0.0, 255.0) as u8;
        let b = pixels_b[idx].round().clamp(0.0, 255.0) as u8;
        out_buf.put_pixel(x, y, Rgb([r, g, b]));
    }

    // 6. 保存为与原格式一致的文件
    let output_str = output_path.to_string_lossy().to_string();
    out_buf.save(&output_path).map_err(|e| format!("写出图像失败: {}", e))?;

    Ok(ProtectionResult {
        success: true,
        message: format!("已成功为 {} 注入频域数字印记 (DCT 水印)", file_name),
        output_path: Some(output_str),
    })
}

/// 从图像中提取 T1 盲水印并验证
pub async fn extract_t1_watermark(input_path: &str) -> Result<String, String> {
    let input_path_own = input_path.to_string();
    let handle = tokio::task::spawn_blocking(move || {
        verify_dct_watermark(&input_path_own)
    });
    handle.await.map_err(|e| e.to_string())?
}

fn verify_dct_watermark(input_path: &str) -> Result<String, String> {
    let img = image::open(input_path).map_err(|e| format!("无法读取图像: {}", e))?;
    let rgb = img.to_rgb8();

    // 提取亮度通道并做 DCT
    let mut pixels: Vec<f32> = rgb.pixels()
        .map(|p| 0.299 * p[0] as f32 + 0.587 * p[1] as f32 + 0.114 * p[2] as f32)
        .collect();

    let mut planner = DctPlanner::new();
    let dct = planner.plan_dct2(pixels.len());
    dct.process_dct2(&mut pixels);

    // 统计中频区段的均值，与注入强度比对
    let mid_start = pixels.len() / 4;
    let mid_end = pixels.len() / 2;
    let mid_len = (mid_end - mid_start) as f32;
    let avg: f32 = pixels[mid_start..mid_end].iter().sum::<f32>() / mid_len;

    if avg.abs() > 0.1 {
        Ok(format!("✅ 确认为 MetaSeal 保护作品（频域印记强度: {:.4}）", avg))
    } else {
        Ok("❌ 未检测到 MetaSeal 频域印记，可能是未保护文件".to_string())
    }
}
