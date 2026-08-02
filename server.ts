import app from './index.html'

const asset = (name: string, type: string) => () => new Response(Bun.file(`public/${name}`), { headers: { 'Content-Type': type } })

const server = Bun.serve({
  port: Number(process.env.PORT) || 3000,
  routes: {
    '/': app,
    '/sw.js': asset('sw.js', 'text/javascript'),
    '/manifest.webmanifest': asset('manifest.webmanifest', 'application/manifest+json'),
    '/pwa-192.png': asset('pwa-192.png', 'image/png'),
    '/pwa-512.png': asset('pwa-512.png', 'image/png'),
    '/pwa-maskable-192.png': asset('pwa-maskable-192.png', 'image/png'),
    '/pwa-maskable-512.png': asset('pwa-maskable-512.png', 'image/png'),
  },
  development: { hmr: true, console: true },
})

console.log(`trix dev server running at ${server.url}`)
