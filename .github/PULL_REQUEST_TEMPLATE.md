## Pull Request Introduction / 提案说明

<!-- Describe the purpose of this PR in plain language. -->
<!-- 请简明扼要地描述此 PR 的合并目的。这也是为了确保非技术使用者（如原作者）也能理解其产生的变更影响。 -->

### Changes / 具体改动
- [ ] Added feature A (新增功能 A)
- [ ] Fixed bug B (修复 Bug B)
- [ ] Refactored concept C (重构逻辑 C)
- [ ] Documentation update (文档补充)

### Core Protection Verification / 核心引擎校验约束
<!-- If your PR touches src-tauri engines (image, doc, code...): -->
<!-- 如果您的请求触碰了后端的引擎代码： -->
- [ ] Watermark extraction limits remain tested within `ε ±2px`. (隐写水印容忍阈值仍有效约束在 ±2 位阶像素下)
- [ ] No regressions in Arweave/OTS hash syncing. (确保了哈希文件匹配以及区块链锚定的完整性)
- [ ] The change is tested against large source images/files. (已对较大的源文件或代码工程进行吞吐通过测试)

### Motivation / 动机
<!-- Link strictly to an open issue if applicable. e.g. "Closes #12" -->
<!-- 若为解决现有 Issue，请挂载 ID。 -->

## Visuals / 视效反馈 (Optional)
<!-- Please attach screenshots if UI or visual aesthetics have profoundly changed. MetaSeal relies on a pure high-end UI design layout. -->
<!-- 本项目遵循极高的前端美学纯净度与交互反馈，如果您的 PR 修改了界面的视觉结构，请务必附带截图，甚至是录制的动效反馈。 -->
