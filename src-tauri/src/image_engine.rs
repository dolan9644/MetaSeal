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

    // 2. 转换为 RGB —— 在亮度 (Y) 通道上操作
    let rgb = img.to_rgb8();
    let mut pixels: Vec<f32> = rgb.pixels()
        .map(|p| 0.299 * p[0] as f32 + 0.587 * p[1] as f32 + 0.114 * p[2] as f32)
        .collect();

    // 3. 用 rustdct 对一维化的亮度通道做 DCT-II 变换
    let mut planner = DctPlanner::new();
    let dct = planner.plan_dct2(pixels.len());
    dct.process_dct2(&mut pixels);

    // 4. 在中频区段注入水印强度 (MetaSeal 印记)
    let mid_start = pixels.len() / 4;
    let mid_end = pixels.len() / 2;
    let watermark_strength: f32 = 0.5;
    for i in mid_start..mid_end {
        pixels[i] += watermark_strength;
    }

    // 5. 逆 DCT-III 还原
    let idct = planner.plan_dct3(pixels.len());
    idct.process_dct3(&mut pixels);

    // 6. 把修改后的亮度映射回 RGB 并写出
    let raw = rgb.into_raw();
    let mut out_buf: ImageBuffer<Rgb<u8>, Vec<u8>> = ImageBuffer::new(width, height);
    for (idx, (x, y, _)) in img.pixels().enumerate() {
        let orig_pixel = raw[idx * 3..idx * 3 + 3].to_vec();
        let orig_lum = 0.299 * orig_pixel[0] as f32 + 0.587 * orig_pixel[1] as f32 + 0.114 * orig_pixel[2] as f32;
        let delta = pixels[idx] - orig_lum;
        let r = (orig_pixel[0] as f32 + delta).clamp(0.0, 255.0) as u8;
        let g = (orig_pixel[1] as f32 + delta * 0.7).clamp(0.0, 255.0) as u8;
        let b = (orig_pixel[2] as f32 + delta * 0.5).clamp(0.0, 255.0) as u8;
        out_buf.put_pixel(x, y, Rgb([r, g, b]));
    }

    // 7. 保存为与原格式一致的文件
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
