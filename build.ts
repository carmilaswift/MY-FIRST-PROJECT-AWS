const result = await Bun.build({
  entrypoints: ['./src/client/App.tsx'],
  outdir: './src/client/dist/assets',
  naming: 'app.js',
  minify: true,
  target: 'browser',
});

if (!result.success) {
  console.error('Build failed:');
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}

console.log('✅ Frontend compilado com sucesso!');
