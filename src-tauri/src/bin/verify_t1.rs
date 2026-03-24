use metaseal_lib::image_engine;

#[tokio::main]
async fn main() {
    let input_path = "/private/tmp/MetaSeal/demo_artwork.jpg";
    let output_dir = "/private/tmp/MetaSeal_Output";
    
    println!("🚀 启动 MetaSeal T1 引擎验证...");
    println!("输入文件: {}", input_path);

    // 确保输出路径存在
    std::fs::create_dir_all(output_dir).unwrap();
    
    match image_engine::apply_t1_protection(input_path, output_dir).await {
        Ok(res) => {
            println!("✅ 验证成功!");
            println!("消息: {}", res.message);
            println!("输出路径: {:?}", res.output_path);
        },
        Err(e) => {
            println!("❌ 验证失败: {}", e);
        }
    }
}
