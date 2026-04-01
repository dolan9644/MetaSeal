// Copyright 2026 dolan9644
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

//! Image Engine — 基于 2D DCT 8×8 块的频域盲水印注入与提取
//! 底层使用: image crate (图像 I/O) + rustdct (分离式2D离散余弦变换)

use image::{GenericImageView, ImageBuffer, Rgb, RgbImage};
use rustdct::DctPlanner;
use std::path::Path;
use serde::{Serialize, Deserialize};

const BLOCK_SIZE: usize = 8;
const WATERMARK_STRENGTH: f32 = 100.0;
const MAX_DELTA_T1: f32 = 2.0;
const DETECTION_THRESHOLD: f32 = 14.0;
const NORMALIZATION_FACTOR: f32 = 256.0; // 2 * BLOCK_SIZE * 2 * BLOCK_SIZE

#[derive(Serialize, Deserialize, Debug)]
pub struct ProtectionResult {
    pub success: bool,
    pub message: String,
    pub output_path: Option<String>,
}

/// T1 基础档：2D DCT 频域盲水印注入 (8×8 块)
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

    // 2. 转换为 RGB
    let rgb = img.to_rgb8();
    let mut rgb_out = rgb.clone();

    let mut planner = DctPlanner::new();

    // 3. 对每个颜色通道处理 8×8 块
    for channel_idx in 0..3 {
        process_channel_with_watermark(&mut rgb_out, width, height, channel_idx, &mut planner)?;
    }

    // 4. 保存结果
    let output_str = output_path.to_string_lossy().to_string();
    rgb_out.save(&output_path).map_err(|e| format!("写出图像失败: {}", e))?;

    Ok(ProtectionResult {
        success: true,
        message: format!("已成功为 {} 注入 2D DCT 频域数字印记 (8×8 块)", file_name),
        output_path: Some(output_str),
    })
}

fn process_channel_with_watermark(
    rgb: &mut RgbImage,
    width: u32,
    height: u32,
    channel_idx: usize,
    planner: &mut DctPlanner<f32>,
) -> Result<(), String> {
    let width = width as usize;
    let height = height as usize;

    // 遍历所有 8×8 块
    for block_y in (0..height).step_by(BLOCK_SIZE) {
        for block_x in (0..width).step_by(BLOCK_SIZE) {
            // 确定块的实际尺寸（边缘块可能更小）
            let actual_h = std::cmp::min(BLOCK_SIZE, height - block_y);
            let actual_w = std::cmp::min(BLOCK_SIZE, width - block_x);

            // 跳过不完整的块
            if actual_h < BLOCK_SIZE || actual_w < BLOCK_SIZE {
                continue;
            }

            // 提取块数据为 8×8 平面数组 (行优先)
            let mut block = [0.0f32; 64];
            for i in 0..BLOCK_SIZE {
                for j in 0..BLOCK_SIZE {
                    let px = rgb.get_pixel((block_x + j) as u32, (block_y + i) as u32);
                    block[i * BLOCK_SIZE + j] = px[channel_idx] as f32;
                }
            }

            // 保存原始块用于 delta 限制
            let block_original = block;

            // 执行 2D DCT（行优先，列优先）
            dct2d_forward(&mut block, planner);

            // 在水印位置注入信号
            inject_watermark_coefficients(&mut block);

            // 执行逆 2D DCT（列优先，行优先）
            dct2d_inverse(&mut block, planner);

            // 限制 delta 到 ±MAX_DELTA_T1
            for i in 0..64 {
                let delta = block[i] - block_original[i];
                let clamped_delta = delta.clamp(-MAX_DELTA_T1, MAX_DELTA_T1);
                block[i] = block_original[i] + clamped_delta;
            }

            // 写回图像 (夹紧到 [0, 255])
            for i in 0..BLOCK_SIZE {
                for j in 0..BLOCK_SIZE {
                    let val = block[i * BLOCK_SIZE + j].round().clamp(0.0, 255.0) as u8;
                    let mut px = rgb.get_pixel((block_x + j) as u32, (block_y + i) as u32).clone();
                    px[channel_idx] = val;
                    rgb.put_pixel((block_x + j) as u32, (block_y + i) as u32, px);
                }
            }
        }
    }

    Ok(())
}

/// 注入水印系数到特定的中频 2D DCT 位置
fn inject_watermark_coefficients(block: &mut [f32; 64]) {
    // Zigzag 对角线 3: (0,3), (1,2), (2,1), (3,0)
    let positions_diag3 = [(0, 3), (1, 2), (2, 1), (3, 0)];
    for (y, x) in positions_diag3.iter() {
        let idx = y * BLOCK_SIZE + x;
        block[idx] += WATERMARK_STRENGTH;
    }

    // Zigzag 对角线 4: (4,0), (3,1), (2,2), (1,3)
    let positions_diag4 = [(4, 0), (3, 1), (2, 2), (1, 3)];
    for (y, x) in positions_diag4.iter() {
        let idx = y * BLOCK_SIZE + x;
        block[idx] += WATERMARK_STRENGTH;
    }
}

/// 2D DCT 正向变换 (先行后列)
/// 使用 DctPlanner 的不归一化 DCT-II
pub(crate) fn dct2d_forward(block: &mut [f32; 64], planner: &mut DctPlanner<f32>) {
    // 行变换
    for row in 0..BLOCK_SIZE {
        let dct = planner.plan_dct2(BLOCK_SIZE);
        let row_data = &mut block[row * BLOCK_SIZE..(row + 1) * BLOCK_SIZE];
        dct.process_dct2(row_data);
    }

    // 列变换（需要转置访问）
    let mut temp = [0.0f32; 64];
    for col in 0..BLOCK_SIZE {
        let dct = planner.plan_dct2(BLOCK_SIZE);
        // 提取列
        let mut col_data = [0.0f32; BLOCK_SIZE];
        for i in 0..BLOCK_SIZE {
            col_data[i] = block[i * BLOCK_SIZE + col];
        }
        // 变换
        dct.process_dct2(&mut col_data);
        // 写回
        for i in 0..BLOCK_SIZE {
            temp[i * BLOCK_SIZE + col] = col_data[i];
        }
    }
    block.copy_from_slice(&temp);
}

/// 2D DCT 逆向变换 (先列后行) + 归一化
/// 使用 DctPlanner 的不归一化 DCT-III
/// 最后除以 256 (2*8 * 2*8)
pub(crate) fn dct2d_inverse(block: &mut [f32; 64], planner: &mut DctPlanner<f32>) {
    // 列变换
    let mut temp = [0.0f32; 64];
    for col in 0..BLOCK_SIZE {
        let idct = planner.plan_dct3(BLOCK_SIZE);
        // 提取列
        let mut col_data = [0.0f32; BLOCK_SIZE];
        for i in 0..BLOCK_SIZE {
            col_data[i] = block[i * BLOCK_SIZE + col];
        }
        
        // Fix for rustdct process_dct3: The unscaled DCT-II / DCT-III pair
        // When chained, unscaled DC term matches perfectly, so we MUST NOT divide by 2!
        
        // 逆变换
        idct.process_dct3(&mut col_data);
        // 写回
        for i in 0..BLOCK_SIZE {
            temp[i * BLOCK_SIZE + col] = col_data[i];
        }
    }

    // 行变换
    for row in 0..BLOCK_SIZE {
        let idct = planner.plan_dct3(BLOCK_SIZE);
        let row_data = &mut temp[row * BLOCK_SIZE..(row + 1) * BLOCK_SIZE];
        
        // Fix for rustdct process_dct3 overexposure bug
        // When chained, we MUST NOT divide by 2!
        
        idct.process_dct3(row_data);
    }

    // 复制回 block 并归一化
    for i in 0..64 {
        block[i] = temp[i] / NORMALIZATION_FACTOR;
    }
}

/// 计算图像的种子值（用于 T2 等级）
pub(crate) fn image_seed(rgb: &RgbImage) -> u64 {
    let mut hasher = std::collections::hash_map::DefaultHasher::new();
    use std::hash::{Hash, Hasher};

    let (w, h) = rgb.dimensions();
    (w, h).hash(&mut hasher);

    // 对图像像素采样计算哈希
    for pixel in rgb.pixels() {
        pixel[0].hash(&mut hasher);
        pixel[1].hash(&mut hasher);
        pixel[2].hash(&mut hasher);
    }

    hasher.finish()
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
    let (width, height) = img.dimensions();
    let rgb = img.to_rgb8();

    let width = width as usize;
    let height = height as usize;

    let mut planner = DctPlanner::new();
    let mut total_watermark_power = 0.0f32;
    let mut block_count = 0;

    // 遍历所有完整 8×8 块
    for block_y in (0..height).step_by(BLOCK_SIZE) {
        for block_x in (0..width).step_by(BLOCK_SIZE) {
            let actual_h = std::cmp::min(BLOCK_SIZE, height - block_y);
            let actual_w = std::cmp::min(BLOCK_SIZE, width - block_x);

            if actual_h < BLOCK_SIZE || actual_w < BLOCK_SIZE {
                continue;
            }

            block_count += 1;

            // 提取亮度通道（用于验证）
            let mut block = [0.0f32; 64];
            for i in 0..BLOCK_SIZE {
                for j in 0..BLOCK_SIZE {
                    let px = rgb.get_pixel((block_x + j) as u32, (block_y + i) as u32);
                    let lum = 0.299 * px[0] as f32 + 0.587 * px[1] as f32 + 0.114 * px[2] as f32;
                    block[i * BLOCK_SIZE + j] = lum;
                }
            }

            // 2D DCT 正向变换
            dct2d_forward(&mut block, &mut planner);

            // 检查水印位置的系数
            let watermark_positions = [
                (0, 3), (1, 2), (2, 1), (3, 0),
                (4, 0), (3, 1), (2, 2), (1, 3),
            ];

            for (y, x) in watermark_positions.iter() {
                let idx = y * BLOCK_SIZE + x;
                total_watermark_power += block[idx].abs();
            }
        }
    }

    if block_count == 0 {
        return Ok("❌ 图像过小或无有效块".to_string());
    }

    let avg_coefficient = total_watermark_power / (block_count as f32 * 8.0);

    if avg_coefficient > DETECTION_THRESHOLD {
        Ok(format!(
            "✅ 确认为 MetaSeal 保护作品（2D DCT 水印强度: {:.2}）",
            avg_coefficient
        ))
    } else {
        Ok(format!(
            "❌ 未检测到 MetaSeal 频域印记 (强度: {:.2})，可能是未保护文件",
            avg_coefficient
        ))
    }
}
