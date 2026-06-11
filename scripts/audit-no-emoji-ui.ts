import fs from "fs";
import path from "path";

// A basic regex for emojis. Not perfect but covers standard ranges.
const emojiRegex = /[\p{Extended_Pictographic}]/gu;

function scanDirectory(dir: string, failOnHit: boolean = true): number {
  let hits = 0;
  const files = fs.readdirSync(dir);

  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      hits += scanDirectory(fullPath, failOnHit);
    } else if (fullPath.endsWith(".tsx") || fullPath.endsWith(".ts")) {
      const content = fs.readFileSync(fullPath, "utf-8");
      let match;
      while ((match = emojiRegex.exec(content)) !== null) {
        console.error(`❌ Emoji found in ${fullPath}: '${match[0]}'`);
        hits++;
      }
    }
  }

  return hits;
}

import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const srcDir = path.join(__dirname, "../src");
console.log("🔍 Auditing UI for emojis...");
const totalHits = scanDirectory(srcDir);

if (totalHits > 0) {
  console.error(`\n❌ Audit Failed: Found ${totalHits} emoji(s) in source code.`);
  process.exit(1);
} else {
  console.log("✅ Audit Passed: No emojis found in source code.");
  process.exit(0);
}
