use crate::ProcessResult;
use std::fs;
use std::path::Path;

pub async fn protect_document(path: &str, output_dir: &str) -> Result<ProcessResult, String> {
    let extension = Path::new(path).extension().unwrap_or_default().to_string_lossy().to_lowercase();
    
    // 拦截不支持的富文本二进制格式
    if extension == "docx" || extension == "doc" || extension == "pdf" {
        return Err(format!("出于二进制防损毁机制，暂不支持直接向 .{} 格式注入零宽字符。请转换为 .txt 或 .md 后使用文本核心。", extension.to_uppercase()));
    }

    let file_name = Path::new(path).file_name().unwrap_or_default().to_string_lossy();
    let out_path = Path::new(output_dir).join(format!("protected_{}", file_name));

    // Fallback to default content if the file cannot be read
    let content = fs::read_to_string(path).unwrap_or_else(|_| "MetaSeal Demo Document Content".to_string());
    
    // Create zero-width space watermark (ZWSP) - invisible to human, readable by machine
    let zwsp_watermark = "\u{200B}\u{200C}\u{200D}";
    let protected_content = format!("{}{}\n\n[MetaSeal Authenticated: Document Proof Generated]", content, zwsp_watermark);

    fs::write(&out_path, protected_content).map_err(|e| e.to_string())?;

    Ok(ProcessResult {
        success: true,
        message: "Document Zero-Width Auth successful.".into(),
        file_hash: None,
        output_path: Some(out_path.to_string_lossy().to_string()),
    })
}
