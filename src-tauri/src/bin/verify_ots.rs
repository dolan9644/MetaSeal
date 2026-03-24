use metaseal_lib::ots_engine;

#[tokio::main]
async fn main() {
    let target_path = "/private/tmp/MetaSeal_Output/seal_demo_artwork.jpg";
    
    println!("🔗 启动 MetaSeal 区块链锚定验证 (OpenTimestamps)...");
    println!("目标文件: {}", target_path);
    
    match ots_engine::anchor_file(target_path).await {
        Ok(msg) => {
            println!("✅ 锚定成功!");
            println!("消息: {}", msg);
        },
        Err(e) => {
            println!("❌ 锚定失败: {}", e);
        }
    }
}
