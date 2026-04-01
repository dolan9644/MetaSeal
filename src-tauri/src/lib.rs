pub mod image_engine;
pub mod ots_engine;
pub mod t2_engine;
pub mod model_manager;
pub mod arweave_engine;
pub mod settings_manager;
pub mod doc_engine;
pub mod code_engine;
pub mod cert_engine;

use std::fs::File;
use std::io::{Read, BufReader};
use sha2::{Sha256, Digest};
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ProcessResult {
    pub success: bool,
    pub message: String,
    pub file_hash: Option<String>,
    pub output_path: Option<String>,
}

pub async fn compute_file_hash_core(path: &str) -> Result<ProcessResult, String> {
    let file = File::open(path).map_err(|e| e.to_string())?;
    let mut reader = BufReader::new(file);
    let mut hasher = Sha256::new();
    let mut buffer = [0; 8192];

    while let Ok(count) = reader.read(&mut buffer) {
        if count == 0 { break; }
        hasher.update(&buffer[..count]);
    }

    let hash_result = format!("{:x}", hasher.finalize());
    let file_name = std::path::Path::new(path).file_name().unwrap_or_default().to_str().unwrap_or_default();

    Ok(ProcessResult {
        success: true,
        message: format!("文件指纹计算成功: {}", file_name),
        file_hash: Some(hash_result),
        output_path: None,
    })
}
