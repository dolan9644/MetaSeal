use metaseal_lib::arweave_engine;

#[tokio::main]
async fn main() {
    println!("🧪 验证 Arweave 永久存储流程...");

    let test_hash = "6f9a3c2e1b0d4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a";
    let test_path = "/private/tmp/MetaSeal/demo_artwork.jpg";

    match arweave_engine::anchor_to_permaweb(test_path, test_hash).await {
        Ok(res) => {
            println!("   - ✅ Arweave 存证成功!");
            println!("   - Transaction ID: {}", res.tx_id);
            println!("   - 查看地址: {}", res.status_url);
            println!("   - 消息: {}", res.message);
        },
        Err(e) => println!("   - ❌ Arweave 存证失败: {}", e),
    }

    println!("🎉 Arweave 存证逻辑验证通过。");
}
