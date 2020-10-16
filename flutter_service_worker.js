'use strict';
const MANIFEST = 'flutter-app-manifest';
const TEMP = 'flutter-temp-cache';
const CACHE_NAME = 'flutter-app-cache';
const RESOURCES = {
  "main.dart.js": "bb56230f251d75a3a3be0af6ac00a2a2",
"manifest.json": "f97daee338169e33c7df664c02e2d377",
"version.json": "94b8d2d20241148814ecbd643428edd9",
"index.html": "e12621e74633783305b12e531d25120b",
"/": "e12621e74633783305b12e531d25120b",
"favicon.png": "5dcef449791fa27946b3d35ad8803796",
"icons/Icon-192.png": "ac9a721a12bbc803b44f645561ecb1e1",
"icons/Icon-512.png": "96e752610906ba2a93c65f8abe1645f1",
"assets/packages/cupertino_icons/assets/CupertinoIcons.ttf": "b14fcf3ee94e3ace300b192e9e7c8c5d",
"assets/FontManifest.json": "dc3d03800ccca4601324923c0b1d6d57",
"assets/AssetManifest.json": "d8ec9d440d0bd387df729565cedd8ce1",
"assets/NOTICES": "86ef05b095c22be0063e6cfca18f7687",
"assets/fonts/MaterialIcons-Regular.otf": "1288c9e28052e028aba623321f7826ac",
"assets/assets/trending.svg": "d8f5936be5371ca6a2a366fca9781a6f",
"assets/assets/shapka.png": "c5ed6f7504103babbec35bc4b5ccc085",
"assets/assets/vec1.png": "ae7b3f4d38199cd68133ed7c1e91e485",
"assets/assets/Intersect.svg": "c48c03f0cdbfc9b8704e61043eb9c952",
"assets/assets/vec2.png": "bf4706ed8ced35192ad00901cf22dfef",
"assets/assets/korabl.png": "999321bc8df9c25252969db3f8981eb8",
"assets/assets/korabl.svg": "b60e5fb62af5408755f1f6092d8f10b3",
"assets/assets/wheel3.png": "a74fc0d4ceebc5456affce761f12fe4e",
"assets/assets/Butylki.png": "7afc1c3172ed59109bc51a9ea32b5e8b",
"assets/assets/vector3.png": "0fec5c0a5712cbee80ea70cb2dadf50e",
"assets/assets/lampa.svg": "0b7f08ba75cc2ae6a80c4f92c8cc8760",
"assets/assets/avatar1.png": "888e00664f8ca0b4d1a7cbc3aca6c754",
"assets/assets/wheel.png": "32bade2060d305e277a88edc7f7f2bd2",
"assets/assets/musorka.png": "d471544d1ddf5660361d1b0d1a7612e5",
"assets/assets/kaplya.svg": "68db75c94d8641ae9bdf242bc2f527e1",
"assets/assets/vec3.png": "4bec47198d415962c19d24e7a176847d",
"assets/assets/user_circle.png": "df894da4a2bd21ca21b2471d68c1d13c",
"assets/assets/rubashka.png": "42cb8aee2e09abb84e18a8b2c338156f",
"assets/assets/wheel1.png": "32bade2060d305e277a88edc7f7f2bd2",
"assets/assets/Intersect.png": "85e4b75391bf30270c4e186933cf0720",
"assets/assets/Voda.png": "168fda28fb9cb6d8822bb35970c5162a",
"assets/assets/avatar.png": "e67e358c72e30a5ec593534154b91ea6",
"assets/assets/Vilka_i_lozhka.png": "e85fe0e9a39cc7f9d48f426617b39f5c",
"assets/assets/vilka_i_lozhka.svg": "8a69df248d1dde979bcfc58935b14d51",
"assets/assets/Intersect%2520_light.png": "43989ff9b198772882faf4733ac1bbae",
"assets/assets/map_screen.png": "8cba784295a8bfe98dd3e49a7fd4b0ed",
"assets/assets/butylki.svg": "1463a64dbcf952dae72ef14423af8e58",
"assets/assets/rubashka.svg": "4423eb769fa37365caddf0656e35262d",
"assets/assets/user_circle.svg": "bac54f43483765d0593a36c8689d45a8",
"assets/assets/lampa.png": "7496aeae1ef518c15cd552c5df8bcffc"
};

// The application shell files that are downloaded before a service worker can
// start.
const CORE = [
  "/",
"main.dart.js",
"index.html",
"assets/NOTICES",
"assets/AssetManifest.json",
"assets/FontManifest.json"];
// During install, the TEMP cache is populated with the application shell files.
self.addEventListener("install", (event) => {
  self.skipWaiting();
  return event.waitUntil(
    caches.open(TEMP).then((cache) => {
      return cache.addAll(
        CORE.map((value) => new Request(value + '?revision=' + RESOURCES[value], {'cache': 'reload'})));
    })
  );
});

// During activate, the cache is populated with the temp files downloaded in
// install. If this service worker is upgrading from one with a saved
// MANIFEST, then use this to retain unchanged resource files.
self.addEventListener("activate", function(event) {
  return event.waitUntil(async function() {
    try {
      var contentCache = await caches.open(CACHE_NAME);
      var tempCache = await caches.open(TEMP);
      var manifestCache = await caches.open(MANIFEST);
      var manifest = await manifestCache.match('manifest');
      // When there is no prior manifest, clear the entire cache.
      if (!manifest) {
        await caches.delete(CACHE_NAME);
        contentCache = await caches.open(CACHE_NAME);
        for (var request of await tempCache.keys()) {
          var response = await tempCache.match(request);
          await contentCache.put(request, response);
        }
        await caches.delete(TEMP);
        // Save the manifest to make future upgrades efficient.
        await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
        return;
      }
      var oldManifest = await manifest.json();
      var origin = self.location.origin;
      for (var request of await contentCache.keys()) {
        var key = request.url.substring(origin.length + 1);
        if (key == "") {
          key = "/";
        }
        // If a resource from the old manifest is not in the new cache, or if
        // the MD5 sum has changed, delete it. Otherwise the resource is left
        // in the cache and can be reused by the new service worker.
        if (!RESOURCES[key] || RESOURCES[key] != oldManifest[key]) {
          await contentCache.delete(request);
        }
      }
      // Populate the cache with the app shell TEMP files, potentially overwriting
      // cache files preserved above.
      for (var request of await tempCache.keys()) {
        var response = await tempCache.match(request);
        await contentCache.put(request, response);
      }
      await caches.delete(TEMP);
      // Save the manifest to make future upgrades efficient.
      await manifestCache.put('manifest', new Response(JSON.stringify(RESOURCES)));
      return;
    } catch (err) {
      // On an unhandled exception the state of the cache cannot be guaranteed.
      console.error('Failed to upgrade service worker: ' + err);
      await caches.delete(CACHE_NAME);
      await caches.delete(TEMP);
      await caches.delete(MANIFEST);
    }
  }());
});

// The fetch handler redirects requests for RESOURCE files to the service
// worker cache.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== 'GET') {
    return;
  }
  var origin = self.location.origin;
  var key = event.request.url.substring(origin.length + 1);
  // Redirect URLs to the index.html
  if (key.indexOf('?v=') != -1) {
    key = key.split('?v=')[0];
  }
  if (event.request.url == origin || event.request.url.startsWith(origin + '/#') || key == '') {
    key = '/';
  }
  // If the URL is not the RESOURCE list then return to signal that the
  // browser should take over.
  if (!RESOURCES[key]) {
    return;
  }
  // If the URL is the index.html, perform an online-first request.
  if (key == '/') {
    return onlineFirst(event);
  }
  event.respondWith(caches.open(CACHE_NAME)
    .then((cache) =>  {
      return cache.match(event.request).then((response) => {
        // Either respond with the cached resource, or perform a fetch and
        // lazily populate the cache.
        return response || fetch(event.request).then((response) => {
          cache.put(event.request, response.clone());
          return response;
        });
      })
    })
  );
});

self.addEventListener('message', (event) => {
  // SkipWaiting can be used to immediately activate a waiting service worker.
  // This will also require a page refresh triggered by the main worker.
  if (event.data === 'skipWaiting') {
    self.skipWaiting();
    return;
  }
  if (event.data === 'downloadOffline') {
    downloadOffline();
    return;
  }
});

// Download offline will check the RESOURCES for all files not in the cache
// and populate them.
async function downloadOffline() {
  var resources = [];
  var contentCache = await caches.open(CACHE_NAME);
  var currentContent = {};
  for (var request of await contentCache.keys()) {
    var key = request.url.substring(origin.length + 1);
    if (key == "") {
      key = "/";
    }
    currentContent[key] = true;
  }
  for (var resourceKey in Object.keys(RESOURCES)) {
    if (!currentContent[resourceKey]) {
      resources.push(resourceKey);
    }
  }
  return contentCache.addAll(resources);
}

// Attempt to download the resource online before falling back to
// the offline cache.
function onlineFirst(event) {
  return event.respondWith(
    fetch(event.request).then((response) => {
      return caches.open(CACHE_NAME).then((cache) => {
        cache.put(event.request, response.clone());
        return response;
      });
    }).catch((error) => {
      return caches.open(CACHE_NAME).then((cache) => {
        return cache.match(event.request).then((response) => {
          if (response != null) {
            return response;
          }
          throw error;
        });
      });
    })
  );
}
