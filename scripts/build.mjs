import fs from "node:fs/promises";
import path from "node:path";
import crypto from "node:crypto";
import { build } from "esbuild";
import postcss from "postcss";
const { version } = JSON.parse(await fs.readFile("package.json", "utf8"));
const root = process.cwd(),
  dist = path.join(root, "dist"),
  release = path.join(root, "release");
const hash = (s) =>
  crypto.createHash("sha256").update(s).digest("hex").slice(0, 10);
await fs.mkdir(dist, { recursive: true });
await fs.cp("public", dist, { recursive: true });
await fs.mkdir(release, { recursive: true });
const app = await build({
  entryPoints: ["src/app.js"],
  bundle: true,
  write: false,
  format: "iife",
  target: "es2022",
  legalComments: "inline",
  minify: false,
});
const js = app.outputFiles[0].text;
const css = await fs.readFile("src/styles/app.css", "utf8");
postcss.parse(css);
const jsName = `app.${hash(js)}.js`,
  cssName = `app.${hash(css)}.css`;
await fs.writeFile(path.join(dist, jsName), js);
await fs.writeFile(path.join(dist, cssName), css);
const openingCss = await fs.readFile("src/opening/opening.css", "utf8"),
  openingJs = await fs.readFile("src/opening/opening.js", "utf8");
let opening = await fs.readFile("src/opening/index.html", "utf8");
const oc = `opening.${hash(openingCss)}.css`,
  oj = `opening.${hash(openingJs)}.js`;
opening = opening.replace("opening.css", oc).replace("opening.js", oj);
await fs.mkdir(path.join(dist, "opening"), { recursive: true });
await fs.writeFile(path.join(dist, "opening/index.html"), opening);
await fs.writeFile(path.join(dist, "opening", oc), openingCss);
await fs.writeFile(path.join(dist, "opening", oj), openingJs);
let html = await fs.readFile("src/index.html", "utf8");
html = html.replace(
  "<!--BOOT_STYLE-->",
  `<style>${await fs.readFile("src/ui/loading.css", "utf8")}</style>`,
);
html = html
  .replace(/<link rel="stylesheet"[^>]+>/g, "")
  .replace(/<script src="[^"]+"><\/script>/g, "");
html = html
  .replace("</head>", `<link rel="stylesheet" href="${cssName}"></head>`)
  .replace(
    "</body>",
    `<script src="vendor/peerjs.min.js"></script><script src="${jsName}"></script></body>`,
  );
await fs.writeFile(path.join(dist, "index.html"), html);
const mime = {
  ".png": "image/png",
  ".webp": "image/webp",
  ".ttf": "font/ttf",
  ".woff2": "font/woff2",
  ".svg": "image/svg+xml",
};
const data = async (file) =>
  `data:${mime[path.extname(file)] || "application/octet-stream"};base64,${(await fs.readFile(file)).toString("base64")}`;
async function inlineCss(text, base) {
  const urls = [
    ...new Set(
      [...text.matchAll(/url\((['"]?)([^)'"\s]+)\1\)/g)]
        .map((m) => m[2])
        .filter((s) => !s.startsWith("data:")),
    ),
  ];
  for (const u of urls) {
    text = text.split(u).join(await data(path.resolve(base, u.split("?")[0])));
  }
  return text;
}
let standaloneOpening = await fs.readFile("src/opening/index.html", "utf8");
standaloneOpening = standaloneOpening
  .replace(
    /<link rel="stylesheet"[^>]+>/,
    `<style>${openingCss}</style>`,
  )
  .replace(
    /<script src="[^"]+"><\/script>/,
    () => `<script>${openingJs.replaceAll("</script", "<\\/script")}</script>`,
  );
// Opening assets are resolved from the shared asset map at runtime, rather
// than duplicating several megabytes inside a second embedded document.
const assetMap = {};
async function assets(dir) {
  for (const f of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) await assets(p);
    else if (mime[path.extname(p)])
      assetMap[path.relative(dist, p).split(path.sep).join("/")] =
        await data(p);
  }
}
await assets(path.join(dist, "assets"));
const json = (v) => JSON.stringify(v).replaceAll("<", "\\u003c");
const peerJs = await fs.readFile("public/vendor/peerjs.min.js", "utf8");
let standalone = html
  .replace(/<link rel="preload"[^>]+>/g, "")
  .replace(
    /<link rel="stylesheet"[^>]+>/,
    `<style>${await inlineCss(css, dist)}</style>`,
  )
  .replace(
    /<script src="vendor\/peerjs.min.js"><\/script>/,
    () => `<script>${peerJs.replaceAll("</script", "<\\/script")}</script>`,
  )
  .replace(
    `<script src="${jsName}"></script>`,
    () =>
      `<script>window.SUPPER_ASSETS=${json(assetMap)};window.SUPPER_OPENING_HTML=${json(standaloneOpening)};${js.replaceAll("</script", "<\\/script")}</script>`,
  );
await fs.writeFile(
  path.join(release, "witches-banquet-standalone.html"),
  standalone,
);
await fs.writeFile(
  path.join(dist, "version.json"),
  JSON.stringify({ version, script: jsName, style: cssName }),
);
console.log(
  JSON.stringify({
    website: dist,
    standalone: path.join(release, "witches-banquet-standalone.html"),
    standaloneBytes: Buffer.byteLength(standalone),
  }),
);

// Remove only obsolete generated bundles after the new entry points are written.
for (const f of await fs.readdir(dist)) {
  if (/^app\.[a-f0-9]+\.(js|css)$/.test(f) && ![jsName, cssName].includes(f))
    await fs.unlink(path.join(dist, f));
}
for (const f of await fs.readdir(path.join(dist, "opening"))) {
  if (/^opening\.[a-f0-9]+\.(js|css)$/.test(f) && ![oc, oj].includes(f))
    await fs.unlink(path.join(dist, "opening", f));
}
