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

use crate::ProcessResult;
use std::fs;
use std::path::Path;

pub async fn protect_document(path: &str, output_dir: &str) -> Result<ProcessResult, String> {
    let extension = Path::new(path).extension()
        .unwrap_or_default().to_string_lossy().to_lowercase();
    
    // 拦截不支持的富文本二进制格式，防止结构损坏
    if extension == "docx" || extension == "doc" || extension == "pdf" {
        return Err(format!(
            "出于二进制防损毁机制，暂不支持直接向 .{} 格式注入零宽字符。请将文件转换为 .txt 或 .md 纯文本格式后再使用。",
            extension.to_uppercase()
        ));
    }

    let file_name = Path::new(path).file_name().unwrap_or_default().to_string_lossy();
    let out_path = Path::new(output_dir).join(format!("protected_{}", file_name));

    let content = fs::read_to_string(path)
        .map_err(|e| format!("无法读取文件 {}: {}", file_name, e))?;
    
    // 零宽字符水印注入 (ZWSP)：对人眼完全透明，可被 MetaSeal 查验引擎识别
    let zwsp_watermark = "\u{200B}\u{200C}\u{200D}\u{FEFF}";
    let protected_content = format!("{}{}", content, zwsp_watermark);

    fs::write(&out_path, protected_content).map_err(|e| e.to_string())?;

    Ok(ProcessResult {
        success: true,
        message: format!("已成功为《{}》注入零宽字符水印（ZWSP 隐写术）", file_name),
        file_hash: None,
        output_path: Some(out_path.to_string_lossy().to_string()),
    })
}

/// 从文本中查验 ZWSP 水印是否存在
pub async fn verify_document(path: &str) -> Result<ProcessResult, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("无法读取文件: {}", e))?;

    let has_zwsp = content.contains('\u{200B}') 
        || content.contains('\u{200C}') 
        || content.contains('\u{200D}')
        || content.contains('\u{FEFF}');
    
    if has_zwsp {
        Ok(ProcessResult {
            success: true,
            message: "✅ 确认为 MetaSeal 保护文档（检测到零宽字符 ZWSP 水印）".to_string(),
            file_hash: None,
            output_path: None,
        })
    } else {
        Ok(ProcessResult {
            success: false,
            message: "❌ 未检测到 MetaSeal 文本水印，该文件可能尚未受保护".to_string(),
            file_hash: None,
            output_path: None,
        })
    }
}
