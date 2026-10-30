import fs from "node:fs/promises";
import path from "node:path";
const { version } = JSON.parse(await fs.readFile("package.json", "utf8"));
async function collect(dir) {
  let files = [];
  for (const item of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, item.name);
    files.push(...(item.isDirectory() ? await collect(file) : [file]));
  }
  return files;
}
const files = [
  "README.md",
  "CHANGELOG.md",
  "package.json",
  "package-lock.json",
  "eslint.config.js",
  ...(await collect("src")),
  ...(await collect("scripts")),
  ...(await collect("tests")),
  "LICENSE",
  "ASSETS.md",
  ...(await collect("docs")),
  ...(await collect(".github")),
];
const header = `女巫的毒药 v${version} · 源码 TXT 合集\n\n本文件便于手机阅读、查找和复制。各段 FILE 标题对应项目里的真实路径。\n完整项目及图片/字体/第三方依赖文件请使用同版本源码 ZIP。\n此 TXT 收录全部自编源码、构建脚本、测试及配置，不把图片、字体或压缩后的第三方库伪装成可读源码。\n独立 HTML 可直接作为备用分享文件；TXT 不是可执行网页。\n\n文件目录：\n${files.map((f, i) => `${String(i + 1).padStart(2, "0")}  ${f}`).join("\n")}\n`;
let text = header;
for (const file of files)
  text += `\n\n${"=".repeat(64)}\nFILE: ${file}\n${"=".repeat(64)}\n\n${await fs.readFile(file, "utf8")}\n`;
await fs.mkdir("release", { recursive: true });
const output = `release/witches-banquet-v${version}-source.txt`;
await fs.writeFile(output, "\ufeff" + text);
console.log(
  JSON.stringify({
    output,
    files: files.length,
    bytes: Buffer.byteLength(text) + 3,
  }),
);
