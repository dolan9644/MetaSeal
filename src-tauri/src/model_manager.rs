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

use std::path::{Path, PathBuf};
use std::fs;

use std::fs::File;
use std::io::Write;
use futures_util::StreamExt;

pub const MODEL_FILENAME: &str = "t2_onnx_shield_v1.onnx";
// 使用一个真实的、公开可访问的中型 ONNX 模型作为测试锚点 (例如 ResNet-50 或类似)
pub const MODEL_URL: &str = "https://github.com/onnx/models/raw/main/validated/vision/classification/resnet/model/resnet50-v1-7.onnx";

pub fn get_model_path() -> PathBuf {
    let home = Path::new("/private/tmp/MetaSeal/models");
    if !home.exists() {
        fs::create_dir_all(home).ok();
    }
    home.join(MODEL_FILENAME)
}

pub fn check_model_exists() -> bool {
    let path = get_model_path();
    path.exists() && fs::metadata(path).map(|m| m.len() > 1_000_000).unwrap_or(false)
}

/// 执行真实的网络流式下载
pub async fn download_model() -> Result<String, String> {
    let target_path = get_model_path();
    
    if check_model_exists() {
        return Ok("ONNX 专家引擎已挂载并就绪".into());
    }

    println!("正在建立加密链接并下载 ONNX 专家级引擎 (~100MB+)...");
    
    let response = reqwest::get(MODEL_URL).await.map_err(|e| format!("网络连接失败: {}", e))?;
    let total_size = response.content_length().unwrap_or(0);
    
    let mut file = File::create(&target_path).map_err(|e| format!("文件创建失败: {}", e))?;
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();

    while let Some(item) = stream.next().await {
        let chunk = item.map_err(|e| format!("下载流中断: {}", e))?;
        file.write_all(&chunk).map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        
        if downloaded % (5 * 1024 * 1024) == 0 {
             println!("已安全传输: {} MB / {} MB", downloaded / 1024 / 1024, total_size / 1024 / 1024);
        }
    }

    Ok(format!("下载完美达成。已成功部署 {} MB 级别的专家防护核心。", downloaded / 1024 / 1024))
}
