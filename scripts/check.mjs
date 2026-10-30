import fs from "node:fs/promises";
import path from "node:path";
import { spawnSync } from "node:child_process";
import postcss from "postcss";
import { parse } from "acorn";
async function walk(dir) {
  let a = [];
  for (const f of await fs.readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    a.push(...(f.isDirectory() ? await walk(p) : [p]));
  }
  return a;
}
for (const f of (await walk("src")).filter((f) => f.endsWith(".js")))
  parse(await fs.readFile(f, "utf8"), {
    ecmaVersion: "latest",
    sourceType: "module",
  });
const css = postcss.parse(await fs.readFile("src/styles/app.css", "utf8")),
  seen = new Set();
let rules = 0;
css.walkRules((r) => {
  if (r.parent.name?.includes("keyframes")) return;
  const context = r.parent.type === "atrule" ? r.parent.params : "base";
  for (const s of postcss.list.comma(r.selector)) {
    const key = context + "::" + s.trim();
    if (seen.has(key)) throw Error("Duplicate selector: " + key);
    seen.add(key);
  }
  rules++;
});
const graph = new Map();
for (const f of (await walk("src")).filter((f) => f.endsWith(".js"))) {
  const source = await fs.readFile(f, "utf8"),
    ast = parse(source, { ecmaVersion: "latest", sourceType: "module" });
  graph.set(
    path.resolve(f),
    ast.body
      .filter(
        (n) => n.type === "ImportDeclaration" && n.source.value.startsWith("."),
      )
      .map((n) => path.resolve(path.dirname(f), n.source.value)),
  );
}
function visit(f, trail = []) {
  if (trail.includes(f))
    throw Error("Circular import: " + [...trail, f].join(" → "));
  for (const g of graph.get(f) || []) visit(g, [...trail, f]);
}
for (const f of graph.keys()) visit(f);
for (const file of [
  "dist/index.html",
  "release/witches-banquet-standalone.html",
]) {
  const html = await fs.readFile(file, "utf8");
  for (const match of html.matchAll(/<script>([\s\S]*?)<\/script>/g))
    parse(match[1], { ecmaVersion: "latest", sourceType: "script" });
  if (!html.includes("女巫的毒药")) throw Error("Missing title");
  if (
    file.startsWith("release/") &&
    (/<script\s+src=/.test(html) || /<link[^>]+rel="stylesheet"/.test(html))
  )
    throw Error("Standalone has external code");
}
const lint = spawnSync(
  process.execPath,
  [
    "node_modules/eslint/bin/eslint.js",
    "src",
    "scripts",
    "tests",
    "--max-warnings",
    "0",
  ],
  { stdio: "inherit" },
);
if (lint.status) process.exit(lint.status);
console.log(
  `Validated ${graph.size} source modules, ${rules} CSS rules, acyclic imports and standalone script/style embedding.`,
);
