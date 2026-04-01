use metaseal_lib::{
    ProcessResult, compute_file_hash_core,
    image_engine, ots_engine, t2_engine,
    model_manager, arweave_engine, settings_manager,
    doc_engine, code_engine, cert_engine
};

// 核心命令：计算文件的 SHA256 指纹
#[tauri::command]
async fn compute_file_hash(path: String) -> Result<ProcessResult, String> {
    compute_file_hash_core(&path).await
}

// 图像保护 T1 均衡档 (DCT 频域盲水印，纯 Rust)
#[tauri::command]
async fn protect_image_t1(path: String, output_dir: String) -> Result<ProcessResult, String> {
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;
    let res = image_engine::apply_t1_protection(&path, &output_dir).await?;
    Ok(ProcessResult {
        success: true,
        message: res.message,
        file_hash: None,
        output_path: res.output_path,
    })
}

// 图像保护 T2 对抗档 (F-SAM 对抗噪声，纯 Rust)
#[tauri::command]
async fn protect_image_t2(path: String, output_dir: String) -> Result<ProcessResult, String> {
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;
    let res = t2_engine::apply_t2_protection(&path, &output_dir).await?;
    Ok(ProcessResult {
        success: res.success,
        message: res.message,
        file_hash: None,
        output_path: res.output_path,
    })
}

// 文档保护 (ZWSP 零宽隐写术)
#[tauri::command]
async fn protect_document(path: String, output_dir: String) -> Result<ProcessResult, String> {
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;
    doc_engine::protect_document(&path, &output_dir).await
}

// 源码保护 (密码学注释块签名)
#[tauri::command]
async fn protect_code(path: String, output_dir: String) -> Result<ProcessResult, String> {
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;
    code_engine::protect_code(&path, &output_dir).await
}

// 图像水印验证
#[tauri::command]
async fn verify_image_t1(path: String) -> Result<ProcessResult, String> {
    let message = image_engine::extract_t1_watermark(&path).await?;
    Ok(ProcessResult {
        success: true,
        message,
        file_hash: None,
        output_path: None,
    })
}

// 文档水印验证
#[tauri::command]
async fn verify_document(path: String) -> Result<ProcessResult, String> {
    doc_engine::verify_document(&path).await
}

// 源码签章验证
#[tauri::command]
async fn verify_code(path: String) -> Result<ProcessResult, String> {
    code_engine::verify_code(&path).await
}

// 区块链时间戳锚定 (OTS)
#[tauri::command]
async fn anchor_to_blockchain(path: String) -> Result<ProcessResult, String> {
    let message = ots_engine::anchor_file(&path).await?;
    Ok(ProcessResult {
        success: true,
        message,
        file_hash: None,
        output_path: None,
    })
}

// 下载 T2 ONNX 增强模型
#[tauri::command]
async fn download_model_t2() -> Result<String, String> {
    model_manager::download_model().await
}

// Arweave 永久上链
#[tauri::command]
async fn anchor_to_arweave(path: String, hash: String) -> Result<arweave_engine::ArweaveResult, String> {
    arweave_engine::anchor_to_permaweb(&path, &hash).await
}

// 制作版权法务证据包
#[tauri::command]
async fn generate_certificate_bundle(
    original_path: String,
    protected_path: String,
    original_hash: String,
    protected_hash: String,
    author: String,
    copyright_suffix: String,
    t1_enabled: bool,
    t2_enabled: bool,
    ots_proof: String,
    arweave_tx: String,
    batch_id: String,
) -> Result<ProcessResult, String> {
    let final_dir = cert_engine::generate_bundle(
        &original_path, &protected_path, &original_hash, &protected_hash,
        &author, &copyright_suffix, t1_enabled, t2_enabled, &ots_proof, &arweave_tx, &batch_id
    ).await?;
    
    Ok(ProcessResult {
        success: true,
        message: "证据包归档完成".into(),
        file_hash: None,
        output_path: Some(final_dir),
    })
}

// 验证法务证据包
#[tauri::command]
async fn verify_certificate_bundle(path: String) -> Result<ProcessResult, String> {
    let message = cert_engine::verify_bundle(&path).await?;
    Ok(ProcessResult {
        success: true, message, file_hash: None, output_path: None
    })
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            compute_file_hash,
            protect_image_t1,
            protect_image_t2,
            protect_document,
            protect_code,
            verify_image_t1,
            verify_document,
            verify_code,
            anchor_to_blockchain,
            download_model_t2,
            anchor_to_arweave,
            generate_certificate_bundle,
            verify_certificate_bundle,
            settings_manager::load_settings,
            settings_manager::save_settings,
            settings_manager::get_unprotected_files
        ])
        .run(tauri::generate_context!())
        .expect("MetaSeal 运行时发生致命错误");
}
