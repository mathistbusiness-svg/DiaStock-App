const CACHE = "diastock-offline-ce5b98def5a40b20";
const ASSETS = ["apple-touch-icon.png","assets/Scanner-DyDRHcWS.js","assets/index-DT_Gdv9e.css","assets/index-DecDMPPw.js","icon-192.png","icon-512.png","icon.svg","index.html","manifest.webmanifest","pdf.worker.min.mjs","tesseract/core/tesseract-core-lstm.wasm","tesseract/core/tesseract-core-lstm.wasm.js","tesseract/core/tesseract-core-relaxedsimd-lstm.wasm","tesseract/core/tesseract-core-relaxedsimd-lstm.wasm.js","tesseract/core/tesseract-core-simd-lstm.wasm","tesseract/core/tesseract-core-simd-lstm.wasm.js","tesseract/lang/deu.traineddata.gz","tesseract/worker.min.js"];
const BASE = self.registration.scope;
self.addEventListener("install", event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    try {
      // Bounded precache: no device data, only application files.
      let cursor = 0;
      await Promise.all(Array.from({length:4}, async () => {
        while (cursor < ASSETS.length) {
          const url = new URL(ASSETS[cursor++], BASE).href;
          const response = await fetch(new Request(url, {cache:"reload"}));
          if (!response.ok) throw new Error("Offline asset unavailable: " + url);
          await cache.put(url, response);
        }
      }));
    } catch (error) { await caches.delete(CACHE); throw error; }
    // Updates wait for old windows to close; no forced reload/lost form inputs.
  })());
});
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    for (const name of await caches.keys()) if (name.startsWith("diastock-offline-") && name !== CACHE) await caches.delete(name);
    await self.clients.claim();
  })());
});
self.addEventListener("fetch", event => {
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || event.request.method !== "GET") return;
  if (!url.href.startsWith(BASE)) return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    if (event.request.mode === "navigate") return (await cache.match(new URL("index.html", BASE).href)) || fetch(event.request);
    return (await cache.match(event.request, {ignoreSearch:true})) || fetch(event.request);
  })());
});
