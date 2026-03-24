use metaseal_lib::t2_engine;

#[tokio::main]
async fn main() {
    let target_path = "/private/tmp/MetaSeal/demo_artwork.jpg";
    let output_dir = "/private/tmp/MetaSeal_Output";
    
    println!("🛡️ 启动 MetaSeal T2 (AI 防火墙) 引擎验证...");
    println!("目标文件: {}", target_path);
    
    match t2_engine::apply_t2_protection(target_path, output_dir).await {
        Ok(res) => {
            println!("✅ T2 加固成功!");
            println!("模式: {}", res.mode);
            println!("消息: {}", res.message);
            println!("输出路径: {:?}", res.output_path);
            
            // 检查输出文件是否存在
            if let Some(path) = res.output_path {
                if std::path::Path::new(&path).exists() {
                    println!("📁 文件状态: 已生成 ({})", path);
                }
            }
        },
        Err(e) => {
            println!("❌ T2 加固失败: {}", e);
        }
    }
}
