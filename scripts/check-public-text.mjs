import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const roots = ["README.md", "docs", "src", "index.html"];
const patterns = [
  { regex: /[A-Z]:\\\\/g, label: "Windows absolute path" },
  { regex: /Users\\\\/g, label: "user profile path" },
  { regex: /\.codex/gi, label: "local Codex path" },
  { regex: /\bTODO\b/g, label: "TODO marker" },
  { regex: /\bFIXME\b/g, label: "FIXME marker" },
  { regex: /\bChatGPT\b/g, label: "tool artifact" }
];

const failures = [];

async function walk(entry) {
  const info = await stat(entry);
  if (info.isDirectory()) {
    const children = await readdir(entry);
    await Promise.all(children.map((child) => walk(join(entry, child))));
    return;
  }

  const content = await readFile(entry, "utf8");
  for (const pattern of patterns) {
    if (pattern.regex.test(content)) {
      failures.push(`${relative(process.cwd(), entry)}: ${pattern.label}`);
    }
  }
}

await Promise.all(roots.map((entry) => walk(entry)));

if (failures.length > 0) {
  console.error("Public-text check failed:");
  for (const failure of failures) {
    console.error(`- ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("Public-text check passed.");
}

