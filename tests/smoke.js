#!/usr/bin/env node
/*
 * HomeFlow smoke test — dependency-free quality gate for the static site.
 * Verifies: JS syntax, asset integrity, no placeholder text, correct locale.
 */
"use strict";

const fs = require("fs");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.resolve(__dirname, "..");
const failures = [];
const ok = (cond, msg) => {
  if (cond) console.log("  ✓ " + msg);
  else failures.push(msg);
};

console.log("HomeFlow smoke test\n");

// 1. JS syntax — every .js file must parse
console.log("JS syntax:");
const jsFiles = ["js/app.js"];
for (const f of jsFiles) {
  const full = path.join(ROOT, f);
  if (!fs.existsSync(full)) { ok(false, `missing ${f}`); continue; }
  try {
    execFileSync(process.execPath, ["--check", full], { stdio: "pipe" });
    ok(true, `${f} parses`);
  } catch (e) {
    ok(false, `${f} has a syntax error:\n${e.stderr}`);
  }
}

// 2. index.html references resolve
console.log("\nAsset integrity:");
const html = fs.readFileSync(path.join(ROOT, "index.html"), "utf8");
ok(html.includes('lang="vi"'), "index.html declares lang=\"vi\"");
ok(/<title>[^<]*HomeFlow[^<]*<\/title>/.test(html), "index.html has a HomeFlow title");

const refs = [...html.matchAll(/(?:href|src)="([^"]+)"/g)].map((m) => m[1])
  .filter((r) => !r.startsWith("http") && !r.startsWith("#"));
for (const r of refs) {
  const clean = r.split("?")[0];
  const full = path.join(ROOT, clean);
  ok(fs.existsSync(full), `referenced asset exists: ${clean}`);
}

// 3. fonts.css references resolve
const fontsCss = fs.readFileSync(path.join(ROOT, "css/fonts.css"), "utf8");
const fontRefs = [...fontsCss.matchAll(/url\(\.\.\/([^)]+)\)/g)].map((m) => m[1]);
ok(fontRefs.length >= 3, `fonts.css declares ${fontRefs.length} font files`);
for (const f of fontRefs) {
  const full = path.join(ROOT, f);
  ok(fs.existsSync(full) && fs.statSync(full).size > 5000, `font file exists and is non-trivial: ${f}`);
}

// 4. No placeholder / leftover content
console.log("\nContent hygiene:");
const srcFiles = ["index.html", "css/styles.css", "css/fonts.css", "js/app.js"];
let dirty = false;
for (const f of srcFiles) {
  const content = fs.readFileSync(path.join(ROOT, f), "utf8");
  for (const pat of [/lorem ipsum/i, /\bxxxx\b/i, /TODO/i, /FIXME/i, /placeholder-text/i]) {
    if (pat.test(content)) { dirty = true; ok(false, `${f} contains ${pat.source}`); }
  }
}
if (!dirty) ok(true, "no placeholder/lorem/TODO markers in source");

// 5. Core demo strings present (demo readiness)
console.log("\nDemo readiness:");
const appJs = fs.readFileSync(path.join(ROOT, "js/app.js"), "utf8");
ok(appJs.includes("Lớp tiếng Anh của"), "parser produces the demo class item");
ok(appJs.includes("Mua quà sinh nhật bà"), "parser produces the demo gift item");
ok(appJs.includes("Thêm vào HomeFlow"), "confirm CTA present");
ok(appJs.includes("Less to remember"), "brief tagline present");
ok(appJs.includes("SpeechRecognition"), "voice input wired");

console.log("\n" + (failures.length ? `FAILED: ${failures.length} issue(s)` : "ALL CHECKS PASSED"));
process.exit(failures.length ? 1 : 0);