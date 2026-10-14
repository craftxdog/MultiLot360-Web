import { access, cp, rm } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const appRoot = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const standaloneRoot = resolve(appRoot, ".next", "standalone", "apps", "web");
const assets = [
  {
    source: resolve(appRoot, ".next", "static"),
    destination: resolve(standaloneRoot, ".next", "static"),
  },
  {
    source: resolve(appRoot, "public"),
    destination: resolve(standaloneRoot, "public"),
  },
];

await access(resolve(standaloneRoot, "server.js"));

for (const { source, destination } of assets) {
  await access(source);
  await rm(destination, { force: true, recursive: true });
  await cp(source, destination, { recursive: true });
}
