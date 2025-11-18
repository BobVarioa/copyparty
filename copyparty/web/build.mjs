import esbuild from "esbuild";
import process from "node:process";

const entries = ["browser", "md", "md2", "mde", "rups", "shares", "splash", "svcs", "logue" ];
const cssEntries = ["browser", "md", "md2", "mde", "msg", "rups", "shares", "splash", "logue", "ui"];

const entryPoints = [];
for (const entry of entries) {
	entryPoints.push(`./src/${entry}.ts`);
}

const cssEntryPoints = [];
for (const entry of cssEntries) {
	cssEntryPoints.push(`./style/${entry}.css`);
}

/** @type {import("esbuild").BuildOptions} */
const opts = {
	bundle: true,
	outdir: "./dist/",
	external: ["*.woff2"],
	// minify: true,
	splitting: true,
	format: "esm",
	target: [
		'es2020',
		'chrome109',
		'edge139',
		'firefox57',
		'safari11',
	],
	chunkNames: "chunk-[hash]",
	platform: "browser",
	supported: {
		"dynamic-import": true
	}
};

if (process.argv[2] == "watch") {
	const ctx = await esbuild.context({ entryPoints: entryPoints, outbase: "src", ...opts });
	const cssCtx = await esbuild.context({ entryPoints: cssEntryPoints, outbase: "style", ...opts });
	await Promise.all([ctx.watch({ delay: 0 }), cssCtx.watch({ delay: 0 })]);
} else {
	await esbuild.build(opts);
}
