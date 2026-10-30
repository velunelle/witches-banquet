import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { parseExpressionAt } from "acorn";
import { SWEETS } from "../src/data/menu.js";
const root = path.resolve("dist");
async function walk(dir) {
  const result = [];
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    result.push(...(entry.isDirectory() ? await walk(file) : [file]));
  }
  return result;
}
let references = 0;
async function check(ref, base) {
  if (/^(data:|https?:|#|mailto:)/.test(ref)) return;
  assert.ok(!ref.startsWith("/"), `Root-relative resource breaks project Pages: ${ref}`);
  const file = path.resolve(base, decodeURIComponent(ref.split(/[?#]/)[0]));
  assert.ok(file === root || file.startsWith(root + path.sep), `Resource outside dist: ${ref}`);
  await fs.access(file);
  references++;
}
const files = await walk(root);
for (const file of files) {
  if (!/\.(html|css)$/.test(file)) continue;
  const text = await fs.readFile(file, "utf8");
  const refs = file.endsWith(".css")
    ? [...text.matchAll(/url\(["']?([^)'"\s]+)["']?\)/g)].map((m) => m[1])
    : [...text.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  for (const ref of refs) await check(ref, path.dirname(file));
}
for (const dish of SWEETS) await check(dish.image, root);
const html = await fs.readFile("release/witches-banquet-standalone.html", "utf8");
function embedded(name) {
  const offset = html.indexOf(`window.${name}=`) + `window.${name}=`.length;
  assert.ok(offset > name.length, `Missing ${name}`);
  const expression = parseExpressionAt(html, offset, { ecmaVersion: "latest" });
  return JSON.parse(html.slice(offset, expression.end));
}
const map = embedded("SUPPER_ASSETS");
const opening = embedded("SUPPER_OPENING_HTML");
for (const file of files.filter((file) => /\.(png|webp|ttf|woff2|svg)$/.test(file))) {
  const key = path.relative(root, file).split(path.sep).join("/");
  assert.ok(map[key]?.startsWith("data:"), `Not embedded: ${key}`);
  assert.deepEqual(Buffer.from(map[key].split(",")[1], "base64"), await fs.readFile(file), key);
}
for (const m of opening.matchAll(/\.\.\/(assets\/[^\s"'()<>]+)/g))
  assert.ok(map[m[1]], `Opening asset not embedded: ${m[1]}`);
assert.ok(!/<script\s+src=|<link[^>]+rel="stylesheet"/.test(html));
const { script } = JSON.parse(await fs.readFile("dist/version.json", "utf8"));
assert.ok(html.includes((await fs.readFile(path.join(root, script), "utf8")).replaceAll("</script", "<\\/script")));
const result = { status: "passed", localReferences: references, embeddedAssets: Object.keys(map).length, desserts: SWEETS.length, missing: 0, projectSubpathSafe: true };
await fs.writeFile("release/asset-audit.json", JSON.stringify(result, null, 2) + "\n");
console.log(JSON.stringify(result));
