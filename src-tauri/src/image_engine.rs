use opencv::{
    core,
    imgcodecs,
    imgproc,
    prelude::*,
    Result as CvResult,
};
use std::path::Path;
use serde::{Serialize, Deserialize};

#[derive(Serialize, Deserialize, Debug)]
pub struct ProtectionResult {
    pub success: bool,
    pub message: String,
    pub output_path: Option<String>,
}

/// T1 极速增强版防护：OpenCV 空间/频域盲水印与元数据扰断
pub async fn apply_t1_protection(input_path: &str, output_dir: &str) -> Result<ProtectionResult, String> {
    let input_p = Path::new(input_path);
    let file_name = input_p.file_name().ok_or("无效的文件名")?.to_str().ok_or("文件名转换错误")?;
    let output_path = Path::new(output_dir).join(format!("seal_{}", file_name));
    let output_path_str = output_path.to_string_lossy().into_owned();

    // 在阻塞线程中执行 OpenCV 处理，防止阻塞 Tokio 运行时
    let input_path_own = input_path.to_string();
    let output_path_own = output_path_str.clone();
    
    let handle = tokio::task::spawn_blocking(move || {
        process_image_opencv(&input_path_own, &output_path_own)
    });

    match handle.await.map_err(|e| e.to_string())? {
        Ok(_) => Ok(ProtectionResult {
            success: true,
            message: format!("已成功为 {} 注入数字印记", file_name),
            output_path: Some(output_path_str),
        }),
        Err(e) => Err(format!("OpenCV 处理失败: {}", e)),
    }
}

fn process_image_opencv(input: &str, output: &str) -> CvResult<()> {
    // 1. 读取原图
    let src = imgcodecs::imread(input, imgcodecs::IMREAD_COLOR)?;
    if src.empty() {
        return Err(opencv::Error::new(core::StsError, "无法读取图片文件"));
    }

    // 2. 转换为 YCrCb 颜色空间以提取亮度分量 Y
    let mut ycrcb = Mat::default();
    imgproc::cvt_color(&src, &mut ycrcb, imgproc::COLOR_BGR2YCrCb, 0, core::AlgorithmHint::ALGO_HINT_ACCURATE)?;

    let mut channels = core::Vector::<Mat>::new();
    core::split(&ycrcb, &mut channels)?;
    let y_channel = channels.get(0)?;

    // 3. 准备进行 DCT (需要补齐为偶数尺寸以获得更好的效果)
    let rows = y_channel.rows();
    let cols = y_channel.cols();
    let opt_rows = (rows / 2) * 2;
    let opt_cols = (cols / 2) * 2;
    
    let mut y_float = Mat::default();
    y_channel.convert_to(&mut y_float, core::CV_32F, 1.0, 0.0)?;
    
    // 截取偶数部分或使用原大小
    let roi = core::Rect::new(0, 0, opt_cols, opt_rows);
    let y_roi = Mat::roi(&y_float, roi)?;

    // 4. 执行离散余弦变换 (DCT)
    let mut y_dct = Mat::default();
    core::dct(&y_roi, &mut y_dct, 0)?;

    // 5. 嵌入水印 (MetaSeal 简易版：在中频区域注入微小偏移)
    // 实际生产中这里会根据哈希位进行调制
    let watermark_strength = 0.05;
    for i in (opt_rows / 4)..(opt_rows / 2) {
        for j in (opt_cols / 4)..(opt_cols / 2) {
            let val: f32 = *y_dct.at_2d::<f32>(i, j)?;
            // 简单的正向偏移注入
            *y_dct.at_2d_mut::<f32>(i, j)? = val + watermark_strength;
        }
    }

    // 6. 逆 DCT 变换
    let mut y_idct = Mat::default();
    core::dct(&y_dct, &mut y_idct, core::DCT_INVERSE)?;

    // 7. 还原 Y 分量并写回
    let mut y_final = Mat::default();
    y_idct.convert_to(&mut y_final, core::CV_8U, 1.0, 0.0)?;
    
    // 这里简单处理：直接覆盖回原 Mat 的一部分
    channels.set(0, y_final)?;

    let mut result_ycrcb = Mat::default();
    core::merge(&channels, &mut result_ycrcb)?;

    let mut result_bgr = Mat::default();
    imgproc::cvt_color(&result_ycrcb, &mut result_bgr, imgproc::COLOR_YCrCb2BGR, 0, core::AlgorithmHint::ALGO_HINT_ACCURATE)?;

    // 8. 写入文件
    let success = imgcodecs::imwrite(output, &result_bgr, &core::Vector::new())?;
    if !success {
        return Err(opencv::Error::new(core::StsError, format!("无法将文件写入路径: {}", output)));
    }

    Ok(())
}

/// 从图像中提取 T1 盲水印（简易验证版）
pub async fn extract_t1_watermark(input_path: &str) -> Result<String, String> {
    let input_path_own = input_path.to_string();
    
    let handle = tokio::task::spawn_blocking(move || {
        extract_opencv_logic(&input_path_own)
    });

    handle.await.map_err(|e| e.to_string())?.map_err(|e| e.to_string())
}

fn extract_opencv_logic(input: &str) -> CvResult<String> {
    // 1. 读取待测试图像
    let src = imgcodecs::imread(input, imgcodecs::IMREAD_COLOR)?;
    if src.empty() {
        return Err(opencv::Error::new(core::StsError, "无法读取图片文件"));
    }

    // 2. 转换为 YCrCb
    let mut ycrcb = Mat::default();
    imgproc::cvt_color(&src, &mut ycrcb, imgproc::COLOR_BGR2YCrCb, 0, core::AlgorithmHint::ALGO_HINT_ACCURATE)?;

    let mut channels = core::Vector::<Mat>::new();
    core::split(&ycrcb, &mut channels)?;
    let y_channel = channels.get(0)?;

    // 3. 准备 DCT
    let rows = y_channel.rows();
    let cols = y_channel.cols();
    let opt_rows = (rows / 2) * 2;
    let opt_cols = (cols / 2) * 2;
    
    let mut y_float = Mat::default();
    y_channel.convert_to(&mut y_float, core::CV_32F, 1.0, 0.0)?;
    
    let roi = core::Rect::new(0, 0, opt_cols, opt_rows);
    let y_roi = Mat::roi(&y_float, roi)?;

    let mut y_dct = Mat::default();
    core::dct(&y_roi, &mut y_dct, 0)?;

    // 4. 分析中频偏移量 (简易版：统计中频均值增量)
    let mut score: f32 = 0.0;
    let mut count = 0;
    
    for i in (opt_rows / 4)..(opt_rows / 2) {
        for j in (opt_cols / 4)..(opt_cols / 2) {
            let val: f32 = *y_dct.at_2d::<f32>(i, j)?;
            score += val;
            count += 1;
        }
    }
    
    let avg_score = if count > 0 { score / count as f32 } else { 0.0 };
    
    // 门限判断：如果中频均值显著偏向我们注入的强度值 (之前注入的是 +0.05)
    if avg_score > 0.01 {
        Ok(format!("确认为 MetaSeal 保护作品 (印记强度: {:.4})", avg_score))
    } else {
        Ok("未检测到 MetaSeal 频域印记".into())
    }
}
