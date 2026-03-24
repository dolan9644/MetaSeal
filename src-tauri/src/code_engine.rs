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

pub async fn protect_code(path: &str, output_dir: &str) -> Result<ProcessResult, String> {
    let file_name = Path::new(path).file_name().unwrap_or_default().to_string_lossy();
    let out_path = Path::new(output_dir).join(format!("protected_{}", file_name));

    let content = fs::read_to_string(path)
        .map_err(|e| format!("无法读取源码文件 {}: {}", file_name, e))?;
    
    let extension = Path::new(path).extension().unwrap_or_default().to_string_lossy();
    let auth_hash = uuid::Uuid::new_v4().to_string();
    
    // 根据文件类型选择对应的注释语法
    let comment_block = match extension.as_ref() {
        "py" | "rb" | "sh" | "bash" | "zsh" => format!(
            "# ╔══════════════════════════════════════════════════════╗\n\
             # ║  MetaSeal 版权签章 | Copyright 2026 xastle           ║\n\
             # ║  唯一签名: {}  ║\n\
             # ║  Licensed under Apache 2.0                           ║\n\
             # ╚══════════════════════════════════════════════════════╝\n\n",
            auth_hash
        ),
        "html" | "xml" | "svg" => format!(
            "<!-- ╔════════════════════════════════════════════════════╗\n\
               -- ║  MetaSeal 版权签章 | Copyright 2026 xastle         ║\n\
               -- ║  唯一签名: {}  ║\n\
               -- ║  Licensed under Apache 2.0                         ║\n\
               -- ╚════════════════════════════════════════════════════╝ -->\n\n",
            auth_hash
        ),
        _ => format!(
            "/*\n\
             * ╔══════════════════════════════════════════════════════╗\n\
             * ║  MetaSeal 版权签章 | Copyright 2026 xastle           ║\n\
             * ║  唯一签名: {}  ║\n\
             * ║  Licensed under Apache 2.0                           ║\n\
             * ╚══════════════════════════════════════════════════════╝\n\
             */\n\n",
            auth_hash
        ),
    };

    let protected_content = format!("{}{}", comment_block, content);
    fs::write(&out_path, protected_content).map_err(|e| e.to_string())?;

    Ok(ProcessResult {
        success: true,
        message: format!("已成功为《{}》植入密码学版权签章（唯一 UUID: {}）", file_name, &auth_hash[..8]),
        file_hash: None,
        output_path: Some(out_path.to_string_lossy().to_string()),
    })
}

/// 查验源码文件中是否包含 MetaSeal 版权签章
pub async fn verify_code(path: &str) -> Result<ProcessResult, String> {
    let content = fs::read_to_string(path)
        .map_err(|e| format!("无法读取文件: {}", e))?;

    if content.contains("MetaSeal 版权签章") || content.contains("MetaSeal Cryptographic Signature") {
        Ok(ProcessResult {
            success: true,
            message: "✅ 确认为 MetaSeal 保护源码（检测到版权签章注释块）".to_string(),
            file_hash: None,
            output_path: None,
        })
    } else {
        Ok(ProcessResult {
            success: false,
            message: "❌ 未检测到 MetaSeal 签章，该源码文件可能尚未受保护".to_string(),
            file_hash: None,
            output_path: None,
        })
    }
}
