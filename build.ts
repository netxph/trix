import tailwind from 'bun-plugin-tailwind'
import { cp, readdir, rm, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'

await rm('dist', { recursive: true, force: true })
const result = await Bun.build({
  entrypoints: ['./index.html'],
  outdir: './dist',
  target: 'browser',
  minify: true,
  plugins: [tailwind],
})
if (!result.success) {
  for (const log of result.logs) console.error(log)
  process.exit(1)
}

await cp('public', 'dist', { recursive: true })

async function files(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return (await Promise.all(entries.map((entry) => {
    const path = join(directory, entry.name)
    return entry.isDirectory() ? files(path) : [path]
  }))).flat()
}

const assets = (await files('dist')).map((path) => `./${relative('dist', path).replaceAll('\\', '/')}`)
const cache = `dart-tracker-${Date.now()}`
await writeFile('dist/sw.js', `const CACHE=${JSON.stringify(cache)};const ROOT=new URL('./',self.location.href);const FALLBACK=new URL('index.html',ROOT).href;const ASSETS=${JSON.stringify(assets)}.map(path=>new URL(path,ROOT).href);
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(key=>key!==CACHE).map(key=>caches.delete(key)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request)).catch(()=>event.request.mode==='navigate'?caches.match(FALLBACK):undefined))});
`)

console.log(`Built ${assets.length} cached assets in dist/`)
