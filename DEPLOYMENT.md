# 静态部署指南 · v1.0.0

## 无需构建的静态托管

1. 解压完整项目 ZIP，打开 `witches-banquet-v1.0.0/`。
2. 把 `dist/` **里面的全部文件和目录**放到服务的发布目录。首页是 `dist/index.html`。
3. 开启 HTTPS。保持 `assets/`、`opening/`、`vendor/` 与 HTML 的相对位置。
4. 访问网站，检查开屏、进入、甜品、音乐、单机及联机入口。不要上传独立 HTML 代替多文件站点。

运行文件不需要 npm、Node 或 Python；它们只用于构建和本地检查。任何 HTTPS 静态托管都可使用同一 dist，实际是否允许 WebRTC 连接还受浏览器和网络限制。

## GitHub Pages：推荐 GitHub Actions

目标仓库仅使用 `2952561418qqcom-tech/witches-banquet`，不新建、不使用 credit-test。

1. 由具备写权限的对话解压 ZIP，把项目目录**内部的内容**提交到仓库根，保留目录结构和 `.github/`；不要只把整个 ZIP 放进仓库。
2. 公开前核对 `docs/PUBLIC-REVIEW.md`，尤其头像原文件的分发范围与代码许可证。
3. 仓库 Settings → Pages → Build and deployment → Source 选择 **GitHub Actions**。
4. 打开 Actions → **Deploy GitHub Pages** → Run workflow → 选择 main → Run workflow。
5. 工作流安装锁定依赖、运行测试、构建和资源检查，把 `dist/` 作为 Pages artifact 上传后部署。
6. 等待 build 和 deploy 均成功，以 deploy 输出的 `page_url` 或 Settings → Pages 的实际网址为准。预期项目路径是 `https://2952561418qqcom-tech.github.io/witches-banquet/`，但本轮未实际发布或验证这个地址。
7. 部署后测试开屏、进主界面、单机一局与房间码入口。无须加入 SPA 回退规则；资源全为相对路径，适配 `/witches-banquet/` 子路径。

工作流只启用手动触发，避免审核前上传源码就自动公开游戏。确认发布后，可自行增加 `push: branches: [main]` 自动部署；本轮未擅自启用。

## GitHub Pages：按分支发布，无需 Actions 构建

适用于无法启动工作流的情况：

1. 保留仓库的 src、public、scripts、配置和文档。
2. 将 `dist/` **内部内容复制到仓库根**，使根目录直接出现 `index.html`、`assets/`、`opening/`、`vendor/`、app 哈希文件；不是放一个 `dist.zip`。
3. 在仓库根增加空文件 `.nojekyll`。
4. Settings → Pages → Source 选择 **Deploy from a branch** → Branch 选择 `main` → Folder 选择 `/(root)` → Save。
5. 等待 GitHub 的 Pages 部署任务完成；访问界面实际显示的网址。

也可把 dist 内部内容复制到仓库的 `docs/`，然后选择 `main /docs`；不要让现有项目文档或旧首页覆盖生成的 `index.html`。

## 重建与更新

Node.js 22 环境下执行：

```sh
npm ci
npm test
npm run build
npm run check
npm run check:assets
npm run export:text
```

`package-lock.json` 固定构建依赖；不需上传 node_modules。修改 `src/` 或 `public/` 后重建，再替换托管的 dist 全部内容。换域名会使用新的浏览器存储空间；请先导出 JSON 存档。刷新不能恢复联机房间。

## 已完成／待验证

- 原正式网站已经运行；本轮更新后以发布结果为准。
- ZIP 内 dist 是完整构建产物，已检查本地路径和内嵌素材，无需当前开发工作区。
- Pages 工作流与步骤已准备，**未在 GitHub Actions 或 Pages 上运行**。
- 当前对话此前调用 GitHub 内容写入返回 403，未推送本包；请由另一个具备写权限的对话完成。无需重复让项目发起者创建仓库。

官方依据：https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages
