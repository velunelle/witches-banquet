# 素材、字体与第三方许可

原创代码与本项目编写的文档采用 MIT；不覆盖图片、字体与第三方作品。以下清单按当前实际文件划分；“AI 创作”不是对第三方权利的保证。

| 文件范围 | 来源及状态 | 使用权限 |
| --- | --- | --- |
| `docs/demo.mp4` | 项目发起者提供的 74 秒游戏演示视频，压缩为网页预览版 | 仅用于演示本游戏；画面中的素材不因此获得额外复用许可。 |
| `docs/screenshots/*.jpg`（5份） | 两份当前公开游戏截图，以及项目发起者提供的三份手机截图，用于仓库介绍 | 截图仅展示本游戏，不额外授予其中头像、贴纸或字体的提取及复用权；各元素仍适用本表对应条款。 |
| `public/assets/watercolor/water-*.webp`（32份） | 本项目生成的 AI 水彩甜品 | 目前仅记录为本项目生成素材；是否对第三方开放复用、分发及商用权，待项目发起者确认；不自动适用代码许可。 |
| `public/assets/journal-v5/*.png`（16份） | 本项目生成并裁切的 AI 万圣节手账贴纸，参考用户给出的风格 | 同上；不包含原参考贴纸图。 |
| `public/assets/halloween/avatar-*.webp`（2份） | 小红书博主 **野莓甜心**老师的 AI 创作；由项目发起者提供并说明作者允许使用 | 作者规则截图允许保存、自裁、头像和壁纸用途，禁止商用、倒卖、临摹、搬运、二创等。保留作者署名。本项目不授予额外权限；规则未明确允许将头像原文件随公开源码分发，此项仍需向作者确认。不能将“AI 创作”视为自动获得再分发许可。 |
| `cute-round.ttf` | ZCOOL KuaiLe／站酷快乐体；https://github.com/googlefonts/zcool-kuaile | SIL OFL 1.1，保留 `licenses/ZCOOLKuaiLe-OFL.txt`。 |
| `pacifico.ttf` | Pacifico；https://github.com/googlefonts/Pacifico | SIL OFL 1.1，保留 `licenses/Pacifico-OFL.txt`。 |
| `public/vendor/peerjs.min.js` | PeerJS；https://github.com/peers/peerjs | MIT，保留 `licenses/PEERJS-LICENSE.txt`。 |
| `src/audio/` | 本游戏合成的音乐《南瓜糖果圆舞曲》《月亮躲猫猫》及音效，无外部音频文件 | 随原创代码采用 MIT。 |
| 翻牌与动作设计参考 | 47、nival、baink 的 https://github.com/knacl47/between-us；https://github.com/qimingjiu/Trianon | 保留原代码许可，见 `licenses/BETWEEN-US-MIT.txt` 与 `TRIANON-LICENSE.txt`。MIT 代码许可不覆盖原项目的图片；本版本不打包旧版开屏图片。 |

`dist/assets/` 是相同素材的部署副本；独立 HTML 也包含相同素材，不改变授权范围。构建依赖的许可由 `package-lock.json` 对应的 npm 包提供；安装依赖时保留其许可证。

本清单如实记录已知来源，不能替代头像作者的授权证明。公开源码与素材可任意商用是两回事。
