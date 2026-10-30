# 用户名迁移与授权检查 · 2026-10-30

当前作者署名为 Velunelle，仓库为 https://github.com/velunelle/witches-banquet 。检查从 c4f77482b38fbd932f10c3f3a7fd05c7969581b1 开始，未覆盖后续未知提交。

## 仓库与本地环境

新仓库网页 HTTP 200；原仓库网页目前跳转到新仓库，最终 HTTP 200。GitHub 连接确认同一仓库 ID 1439697034 及 admin/push 权限。终端 git ls-remote、clone、fetch 均成功。

当前工作环境原开发目录没有 GitHub origin。已建立 /workspace/repos/witches-banquet 本地克隆，origin 的 fetch/push URL 均为 https://github.com/velunelle/witches-banquet.git 。终端 dry-run push 因未保存 GitHub 凭据失败；实际提交通过已授权 GitHub 连接执行，之后本地 fetch/pull 同步，不声称终端已获得认证凭据。

扫描 /workspace 中现有 Git 仓库，另有独立托管站点和四个第三方参考仓库。托管站点没有指向旧 GitHub 用户名的 remote，参考仓库的 origin 指向各自作者，不改动这些远程地址。不改写历史提交或第三方版权署名。

## 链接、Actions 与托管

当前 README、部署指南、后续操作指引及 package.json 的仓库、反馈和作者元数据已迁移。CI 和 Pages 工作流使用 actions/checkout 的当前仓库上下文，没有写死旧用户名，无需修改 YAML。

旧、新 GitHub Pages 项目地址本次均返回 404，Pages 此前未启用，不能把新预计地址当作已部署网站。保留原手动部署方式，不额外开通 Pages。

独立正式站 https://witches-banquet.fuzzy-egret-1442.chatgpt.site/ 的平台状态为 active/public，浏览器实际加载了游戏和开场。托管配置使用独立项目 ID 与 dist 目录，不引用 GitHub 用户名；未改站点身份、权限或游戏文件。

HANDOFF.md 的旧账号属于带当前提示的历史交接记录；public/releases/v1.0.0/index.html 和 dist 中对应页面是旧版发布审核快照，包含旧仓库链接及当时许可状态，保持原样。该旧仓库链接目前可跳转。忽略的 release 导出文本、旧 ZIP 和既往提交属于历史交付，不批量替换。

## 授权

原创代码及本项目文档保留 MIT，版权署名更新为 Velunelle。项目有权授权的 32 份水彩甜品和 16 份手账贴纸采用 CC BY 4.0，含来源、许可证、修改情况和署名示例。第三方头像、字体、代码、混合截图与视频中的第三方元素不纳入该原创素材授权。详见 ASSETS.md、LICENSE、docs/LICENSING.md 与 docs/CC-BY-4.0.txt。

## 无法代查的范围

用户其他电脑或设备上的 Git 克隆、Git GUI、个人主页和社交平台链接无法从本环境枚举。如存在，请更新 origin 或公开链接为新仓库地址。Entire 等外部平台若已绑定旧账号，须在相应平台核对绑定仓库是否已更新；当前无可用的该平台配置访问能力，不能确认自动迁移完成。

当前修改限于文档、授权及项目元数据。游戏源码、素材字节、视觉、动效、音乐和素材与鸣谢弹窗均未修改。
