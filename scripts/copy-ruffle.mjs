import { cp, mkdir } from "node:fs/promises";
import { resolve } from "node:path";

const source = resolve("node_modules/@ruffle-rs/ruffle");
const destination = resolve("public/ruffle");
await mkdir(destination, { recursive: true });
for (const file of ["ruffle.js", "72a20ef1c0b8ceb37720.wasm", "826bb0938097485a2c9d.wasm", "core.ruffle.c80159b526e567babaf5.js", "core.ruffle.f000070ea72f8ae4fe3a.js"]) {
  await cp(resolve(source, file), resolve(destination, file));
}
