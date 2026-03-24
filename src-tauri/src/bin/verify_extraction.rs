use metaseal_lib::image_engine;

#[tokio::main]
async fn main() {
    let original = "/private/tmp/MetaSeal/demo_artwork.jpg";
    let protected = "/private/tmp/MetaSeal_Output/seal_demo_artwork.jpg";
    
    println!("🔍 启动 MetaSeal Scanner 交叉验证...");
    
    println!("\n[测试 1] 扫描受保护的作品:");
    match image_engine::extract_t1_watermark(protected).await {
        Ok(msg) => println!("✅ 结果: {}", msg),
        Err(e) => println!("❌ 失败: {}", e),
    }

    println!("\n[测试 2] 扫描原始(无水印)作品:");
    match image_engine::extract_t1_watermark(original).await {
        Ok(msg) => println!("✅ 结果: {}", msg),
        Err(e) => println!("❌ 失败: {}", e),
    }
}
