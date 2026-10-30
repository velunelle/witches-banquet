# 素材、字体与第三方许可

原创代码与本项目编写的文档采用 MIT；不覆盖图片、字体与第三方作品。以下清单按当前实际文件划分；“AI 创作”不是对第三方权利的保证。

| 文件范围 | 来源及状态 | 使用权限 |
| --- | --- | --- |
| `docs/demo.mp4` | 项目发起者提供的 74 秒游戏演示视频，压缩为网页预览版 | 仅用于演示本游戏；画面中的素材不因此获得额外复用许可。 |
| `docs/screenshots/*.jpg`（5份） | 两份当前公开游戏截图，以及项目发起者提供的三份手机截图，用于仓库介绍 | 截图仅展示本游戏，不额外授予其中头像、贴纸或字体的提取及复用权；各元素仍适用本表对应条款。 |
| `public/assets/watercolor/water-*.webp`（32份） | 本项目生成的 AI 水彩甜品 | 由 Velunelle 按 CC BY 4.0 授权，可修改、传播及商用；须注明作者、来源、许可证链接和修改情况。仅在本项目有权授权的范围内授予，不自动适用代码 MIT 许可。 |
| `public/assets/journal-v5/*.png`（16份） | 本项目生成并裁切的 AI 万圣节手账贴纸，参考用户给出的风格 | 由 Velunelle 按 CC BY 4.0 授权，条件同上；不包含原参考贴纸图。 |
| `public/assets/halloween/avatar-*.webp`（2份） | 小红书博主 **野莓甜心**老师的 AI 创作；由项目发起者提供并说明作者允许使用 | 作者规则截图允许保存、自裁、头像和壁纸用途，禁止商用、倒卖、临摹、搬运、二创等。保留作者署名。本项目不授予额外权限；规则未明确允许将头像原文件随公开源码分发，此项仍需向作者确认。不能将“AI 创作”视为自动获得再分发许可。 |
| `cute-round.ttf` | ZCOOL KuaiLe／站酷快乐体；https://github.com/googlefonts/zcool-kuaile | SIL OFL 1.1，保留 `licenses/ZCOOLKuaiLe-OFL.txt`。 |
| `pacifico.ttf` | Pacifico；https://github.com/googlefonts/Pacifico | SIL OFL 1.1，保留 `licenses/Pacifico-OFL.txt`。 |
| `public/vendor/peerjs.min.js` | PeerJS；https://github.com/peers/peerjs | MIT，保留 `licenses/PEERJS-LICENSE.txt`。 |
| `src/audio/` | 本游戏合成的音乐《南瓜糖果圆舞曲》《月亮躲猫猫》及音效，无外部音频文件 | 随原创代码采用 MIT。 |
| 翻牌与动作设计参考 | 47、nival、baink 的 https://github.com/knacl47/between-us；https://github.com/qimingjiu/Trianon | 保留原代码许可，见 `licenses/BETWEEN-US-MIT.txt` 与 `TRIANON-LICENSE.txt`。MIT 代码许可不覆盖原项目的图片；本版本不打包旧版开屏图片。 |

`dist/assets/` 是相同素材的部署副本；独立 HTML 也包含相同素材，不改变授权范围。构建依赖的许可由 `package-lock.json` 对应的 npm 包提供；安装依赖时保留其许可证。

本清单如实记录已知来源，不能替代头像作者的授权证明。公开源码与素材可任意商用是两回事。

## 原创 AI 素材的 CC BY 4.0 授权

署名作者：**Velunelle**；来源：https://github.com/velunelle/witches-banquet 。仅覆盖 `public/assets/watercolor/water-*.webp` 的 32 份水彩甜品和 `public/assets/journal-v5/*.png` 的 16 份万圣节手账贴纸，以及 dist 和独立 HTML 中对应的相同素材副本。

许可证：https://creativecommons.org/licenses/by/4.0/ ，项目授权声明见 [docs/CC-BY-4.0.txt](docs/CC-BY-4.0.txt)，完整法律条款见 https://creativecommons.org/licenses/by/4.0/legalcode。可以复制、传播、修改和商用；必须合理注明 Velunelle、作品来源、许可证链接及是否修改，保留既有修改说明，不暗示作者为使用者背书，也不附加限制该许可权利的条款或技术措施。

署名示例：“水彩甜品／万圣节贴纸：Velunelle，来源 https://github.com/velunelle/witches-banquet ，CC BY 4.0（https://creativecommons.org/licenses/by/4.0/）；已修改：裁切与调色。”未修改时注明“未修改”。

此授权仅限本项目有权许可的权利，不保证 AI 生成内容在所有地区均享有版权，不覆盖角色头像、第三方图片、字体、代码或演示画面中混合使用的第三方元素。第三方原作者署名和原许可不变。
