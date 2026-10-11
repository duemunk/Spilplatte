// Offline support. Every request goes to the network first (so new games show up), falls
// back to the cached copy when offline, and stores what it gets. Query strings such as
// ?v=<time> are ignored for the cache key. Plain ES2017 for iOS 12.
var CACHE = "spilplatte";
var NETWORK_TIMEOUT_IN_MS = 4000;
var CORE_FILES = [
  "./", "index.html", "games.json", "manifest.json", "shared/seal.json",
  "shared/engine.js", "shared/style.css", "shared/lyde.html", "shared/fonts/press-start-2p.woff2",
  "shared/icons/icon-180.png", "shared/icons/icon-192.png"
];
var GAME_FILES = ["index.html", "game.js"];

function keyFor(url) {
  var clean = new URL(url, self.location.href);
  clean.search = "";
  clean.hash = "";
  if (clean.pathname.slice(-1) === "/") clean.pathname += "index.html";
  return clean.href;
}

function fetchWithTimeout(url) {
  return new Promise(function (resolve, reject) {
    var timer = setTimeout(function () { reject(new Error("timeout")); }, NETWORK_TIMEOUT_IN_MS);
    fetch(url, { cache: "no-store" }).then(function (response) {
      clearTimeout(timer);
      resolve(response);
    }, function (error) {
      clearTimeout(timer);
      reject(error);
    });
  });
}

function store(url) {
  return fetchWithTimeout(url + (url.indexOf("?") === -1 ? "?" : "&") + "sw=" + Date.now())
    .then(function (response) {
      if (!response.ok) return;
      return caches.open(CACHE).then(function (cache) { return cache.put(keyFor(url), response); });
    })
    .catch(function () {});
}

function storeEverything() {
  var base = self.registration.scope;
  return Promise.all(CORE_FILES.map(function (file) { return store(base + file); })).then(function () {
    return caches.open(CACHE).then(function (cache) { return cache.match(keyFor(base + "games.json")); });
  }).then(function (response) {
    if (!response) return;
    return response.json().then(function (games) {
      var files = [];
      games.forEach(function (game) {
        var folder = base + "games/" + game.folder + "/";
        GAME_FILES.forEach(function (file) { files.push(folder + file); });
        if (game.icon) files.push(folder + game.icon);
        (game.assets || []).forEach(function (file) { files.push(folder + file); });
      });
      return Promise.all(files.map(store));
    });
  });
}

self.addEventListener("install", function (event) {
  event.waitUntil(storeEverything().then(function () { return self.skipWaiting(); }));
});

self.addEventListener("activate", function (event) {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("message", function (event) {
  if (event.data === "refresh") storeEverything();
});

self.addEventListener("fetch", function (event) {
  var request = event.request;
  if (request.method !== "GET" || request.url.indexOf(self.registration.scope) !== 0) return;
  var key = keyFor(request.url);
  event.respondWith(
    fetchWithTimeout(request.url).then(function (response) {
      if (response.ok) {
        var copy = response.clone();
        caches.open(CACHE).then(function (cache) { cache.put(key, copy); });
        return response;
      }
      return caches.match(key).then(function (cached) { return cached || response; });
    }).catch(function () {
      return caches.match(key).then(function (cached) {
        if (cached) return cached;
        if (request.mode === "navigate") return caches.match(keyFor(self.registration.scope));
        return new Response("", { status: 504 });
      });
    })
  );
});
