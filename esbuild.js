const esbuild = require('esbuild');
const fs = require('fs');

const watch = process.argv.includes('--watch');
const minify = process.argv.includes('--minify');

function copyWebviewAssets() {
  fs.mkdirSync('dist/webview', { recursive: true });
  fs.cpSync('src/webview', 'dist/webview', { recursive: true });
}

const buildOptions = {
  entryPoints: ['src/extension.ts'],
  bundle: true,
  outfile: 'dist/extension.js',
  external: ['vscode'],
  format: 'cjs',
  platform: 'node',
  sourcemap: true,
  minify,
};

if (watch) {
  copyWebviewAssets();
  esbuild.context(buildOptions).then((ctx) => ctx.watch());
} else {
  esbuild.build(buildOptions)
    .then(() => copyWebviewAssets())
    .catch(() => process.exit(1));
}
