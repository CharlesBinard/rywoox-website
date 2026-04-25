/**
 * Injects a build hash into the service worker cache name in dist/sw.js.
 * Run AFTER `vite build` to avoid modifying source-controlled files.
 */

import fs from "fs";
import path from "path";

const DIST_SW_PATH = path.resolve(process.cwd(), "dist/sw.js");

if (!fs.existsSync(DIST_SW_PATH)) {
  console.error("dist/sw.js not found. Run vite build first.");
  process.exit(1);
}

const BUILD_HASH = Date.now().toString(36);

let content = fs.readFileSync(DIST_SW_PATH, "utf8");
content = content.replace(
  /const CACHE_NAME = .*/,
  `const CACHE_NAME = 'rywoox-${BUILD_HASH}'`,
);
fs.writeFileSync(DIST_SW_PATH, content);

console.log(`Injected CACHE_NAME = rywoox-${BUILD_HASH} into dist/sw.js`);
