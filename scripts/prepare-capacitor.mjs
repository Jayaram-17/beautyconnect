import { existsSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const outputDirectory = resolve(".output/public");
const entryPoint = resolve(outputDirectory, "index.html");

if (!existsSync(outputDirectory)) {
  throw new Error("Production build output is missing. Run `npm run build` first.");
}

// TanStack Start produces an SSR deployment without a static index.html.
// Capacitor requires one even though the native apps load the configured HTTPS server.
if (!existsSync(entryPoint)) {
  writeFileSync(
    entryPoint,
    "<!doctype html><html lang=\"en\"><head><meta charset=\"utf-8\"><meta name=\"viewport\" content=\"width=device-width,initial-scale=1\"><title>Glowlist</title></head><body><p>Connect to the internet to use Glowlist.</p></body></html>\n",
  );
}
