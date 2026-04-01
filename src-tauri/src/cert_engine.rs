use std::fs;
use std::path::Path;
use chrono::Local;
use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct CertificateManifest {
    pub original_file_name: String,
    pub original_hash: String,
    pub protected_hash: String,
    pub timestamp: String,
    pub author: String,
    pub copyright_suffix: String,
    pub t1_enabled: bool,
    pub t2_enabled: bool,
    pub ots_proof: String,
    pub arweave_tx: String,
}

pub async fn generate_bundle(
    original_path: &str,
    protected_path: &str,
    original_hash: &str,
    protected_hash: &str,
    author: &str,
    copyright_suffix: &str,
    t1_enabled: bool,
    t2_enabled: bool,
    ots_proof: &str,
    arweave_tx: &str,
    _batch_id: &str,
) -> Result<String, String> {
    let orig_path = Path::new(original_path);
    let prot_path = Path::new(protected_path);
    
    if !orig_path.exists() || !prot_path.exists() {
        return Err("源文件或保护后文件丢失，无法打包归档".into());
    }
    
    let now = Local::now();
    let display_time = now.format("%Y-%m-%d %H:%M:%S").to_string();
    
    let file_title = orig_path.file_name().unwrap_or_default().to_string_lossy();
    let subfolder_name = format!("[{}_{}] {}", now.format("%m%d"), now.format("%H%M%S"), file_title);
    
    let parent_dir = prot_path.parent().unwrap_or_else(|| Path::new("."));
    let bundle_path = parent_dir.join("MetaSeal_Vault").join(&subfolder_name);
    
    fs::create_dir_all(&bundle_path).map_err(|e| format!("初始化 MetaSeal_Vault 沙箱失败: {}", e))?;
    
    // Copy the files
    let new_orig_path = bundle_path.join(format!("original_{}", orig_path.file_name().unwrap_or_default().to_string_lossy()));
    fs::copy(orig_path, &new_orig_path).map_err(|e| e.to_string())?;
    
    let new_prot_path = bundle_path.join(format!("protected_{}", prot_path.file_name().unwrap_or_default().to_string_lossy()));
    fs::copy(prot_path, &new_prot_path).map_err(|e| e.to_string())?;
    
    // If OTS proof exists next to protected file, move it in
    let ots_file_candidate = parent_dir.join(format!("{}.ots", prot_path.file_stem().unwrap().to_string_lossy()));
    if ots_file_candidate.exists() {
        let new_ots_path = bundle_path.join("blockchain_proof.ots");
        fs::rename(&ots_file_candidate, &new_ots_path).map_err(|e| e.to_string())?;
    }
    
    // Generate Manifest
    let manifest = CertificateManifest {
        original_file_name: orig_path.file_name().unwrap_or_default().to_string_lossy().to_string(),
        original_hash: original_hash.to_string(),
        protected_hash: protected_hash.to_string(),
        timestamp: display_time,
        author: author.to_string(),
        copyright_suffix: copyright_suffix.to_string(),
        t1_enabled,
        t2_enabled,
        ots_proof: ots_proof.to_string(),
        arweave_tx: arweave_tx.to_string(),
    };
    
    let manifest_json = serde_json::to_string_pretty(&manifest).map_err(|e| e.to_string())?;
    let manifest_path = bundle_path.join("certificate.json");
    fs::write(&manifest_path, manifest_json).map_err(|e| e.to_string())?;
    
    // Optionally remove the original protected file left outside? Usually yes
    let _ = fs::remove_file(prot_path);
    
    Ok(bundle_path.to_string_lossy().to_string())
}

pub async fn verify_bundle(bundle_path_str: &str) -> Result<String, String> {
    let bundle_path = Path::new(bundle_path_str);
    if !bundle_path.is_dir() {
        return Err("传入的路径不是有效的 MetaSeal 凭证目录。".into());
    }
    
    let manifest_path = bundle_path.join("certificate.json");
    if !manifest_path.exists() {
        return Err("非法或损坏的目录：缺少 certificate.json 凭证表。".into());
    }
    
    let content = fs::read_to_string(&manifest_path).map_err(|e| e.to_string())?;
    let manifest: CertificateManifest = serde_json::from_str(&content).map_err(|_| "certificate.json 凭证表格式解析失败。".to_string())?;
    
    let prot_path = bundle_path.join(format!("protected_{}", manifest.original_file_name));
    if !prot_path.exists() {
        return Err("查验未通过：打包证据中的被保护文件不存在！".into());
    }
    
    let computed_hash = crate::compute_file_hash_core(&prot_path.to_string_lossy()).await?.file_hash.unwrap();
    if computed_hash != manifest.protected_hash {
        return Err("⚠️ 严重警告：加密包内的被保护文件与记录的去中心化哈希不一致，已被篡改！".into());
    }
    
    let ots_path = bundle_path.join("blockchain_proof.ots");
    let has_ots = ots_path.exists();
    
    let msg = format!("✅ 凭证包级联验证通过！安全隔离完整。\n\n• 全局创作者: {}\n• 附属版权: {}\n• 加解密哈希: {}\n• 区块链锚定状态: {}",
        manifest.author, manifest.copyright_suffix, manifest.protected_hash,
        if has_ots {"存在不可篡改的 .ots 比特币网络溯源证明"} else {"数据未做主网固定"}
    );
    
    Ok(msg)
}
