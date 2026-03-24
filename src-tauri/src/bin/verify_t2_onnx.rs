use metaseal_lib::{model_manager, t2_engine};

#[tokio::main]
async fn main() {
    println!("🧪 验证 T2 ONNX 增强档流程...");

    // 1. 初始状态：模型不应存在
    let p = model_manager::get_model_path();
    if p.exists() {
        std::fs::remove_file(&p).ok();
    }
    println!("   - 初始状态: 模型未安装 (预期)");

    // 2. 模拟下载
    println!("   - 正在执行下载指令...");
    match model_manager::download_model().await {
        Ok(res) => println!("   - ✅ 下载成功: {}", res),
        Err(e) => println!("   - ❌ 下载失败: {}", e),
    }

    // 3. 执行 T2 保护 (此时模型存在，但内容是 MOCK，应触发 Fallback to F-SAM)
    let input = "/private/tmp/MetaSeal/demo_artwork.jpg";
    let output_dir = "/private/tmp/MetaSeal_Output";
    
    match t2_engine::apply_t2_protection(input, output_dir).await {
        Ok(res) => {
            println!("   - ✅ T2 执行成功!");
            println!("   - 实际运行模式: {}", res.mode); // 应显示 "F-SAM (Fallback)" 或类似
            println!("   - 消息反馈: {}", res.message);
        },
        Err(e) => println!("   - ❌ T2 执行异常: {}", e),
    }

    println!("🎉 T2 ONNX 架构验证完成。");
}
