use std::fs::File;
use std::io::Write;
use std::path::Path;
use sha2::{Sha256, Digest};
use reqwest::Client;

pub async fn anchor_file(file_path: &str) -> Result<String, String> {
    let path = Path::new(file_path);
    if !path.exists() {
        return Err("文件不存在".into());
    }

    // 1. 计算文件哈希
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut hasher = Sha256::new();
    std::io::copy(&mut file, &mut hasher).map_err(|e| e.to_string())?;
    let hash = hasher.finalize();

    // 2. 提交至 OpenTimestamps 公共 Calendar (以二进制形式提交 32字节哈希)
    let client = Client::builder()
        .no_proxy() // 强制不使用可能导致连接失败的系统代理
        .build()
        .map_err(|e| e.to_string())?;

    let calendars = [
        "https://alice.btc.calendar.opentimestamps.org/digest",
        "https://bob.btc.calendar.opentimestamps.org/digest",
        "https://finney.calendar.opentimestamps.org/digest",
    ];
    
    let mut last_error = String::new();
    let mut ots_data = None;

    for calendar_url in calendars {
        match client.post(calendar_url)
            .header("Content-Type", "application/octet-stream")
            .body(hash.to_vec())
            .send()
            .await 
        {
            Ok(resp) if resp.status().is_success() => {
                match resp.bytes().await {
                    Ok(bytes) => {
                        ots_data = Some(bytes);
                        break;
                    },
                    Err(e) => last_error = format!("解析数据失败: {}", e),
                }
            },
            Ok(resp) => last_error = format!("服务器返回错误: {}", resp.status()),
            Err(e) => last_error = format!("连接失败: {}", e),
        }
    }

    let ots_data = ots_data.ok_or_else(|| format!("所有 OTS 日历均无法访问，最后错误: {}", last_error))?;

    // 3. 保存 .ots 证明文件
    let ots_path = path.with_extension(format!("{}.ots", path.extension().unwrap_or_default().to_str().unwrap_or("file")));
    let mut ots_file = File::create(&ots_path).map_err(|e| e.to_string())?;
    ots_file.write_all(&ots_data).map_err(|e| e.to_string())?;

    Ok(format!("区块链存证成功！证明已保存至：{}", ots_path.display()))
}
