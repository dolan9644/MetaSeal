use metaseal_lib::{ProcessResult, compute_file_hash_core, image_engine, ots_engine, t2_engine, model_manager, arweave_engine, settings_manager, doc_engine, code_engine};

// 核心命令：计算文件的 SHA256 指纹 (极速确权基础)
#[tauri::command]
async fn compute_file_hash(path: String) -> Result<ProcessResult, String> {
    compute_file_hash_core(&path).await
}

// 核心命令：图像保护 T1 均衡档 (OpenCV DCT)
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

// 核心命令：图像保护 T2 对抗档 (AI 防火墙)
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

// 文档保护端点 (ZWSP 水印)
#[tauri::command]
async fn protect_document(path: String, output_dir: String) -> Result<ProcessResult, String> {
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;
    doc_engine::protect_document(&path, &output_dir).await
}

// 源码保护端点 (密码学注释块签名)
#[tauri::command]
async fn protect_code(path: String, output_dir: String) -> Result<ProcessResult, String> {
    std::fs::create_dir_all(&output_dir).map_err(|e| e.to_string())?;
    code_engine::protect_code(&path, &output_dir).await
}

// 核心命令：图像水印提取与验证
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

// 核心命令：区块链存证锚定
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

// 下载 T2 增强模型
#[tauri::command]
async fn download_model_t2() -> Result<String, String> {
    model_manager::download_model().await
}

// 永久存证：Arweave 上链
#[tauri::command]
async fn anchor_to_arweave(path: String, hash: String) -> Result<arweave_engine::ArweaveResult, String> {
    arweave_engine::anchor_to_permaweb(&path, &hash).await
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
            anchor_to_blockchain,
            download_model_t2,
            anchor_to_arweave,
            // Settings Commands
            settings_manager::load_settings,
            settings_manager::save_settings,
            settings_manager::get_unprotected_files
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
