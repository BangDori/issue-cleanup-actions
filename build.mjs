import * as esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["./src/*.ts", "./src/**/*.ts"],
  tsconfig: "./tsconfig.json",
  bundle: true,
  outdir: "./dist",
  sourcemap: true,
  minify: false,
  platform: "node",
});