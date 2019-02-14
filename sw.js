var CACHE_NAME = 'restaurant-site-cache-v1';
var urlsToCache = [
  '/',
  '/index.html',
  '/restaurant.html',
  '/css/styles.css',
  '/img/icon.png',
  '/img/1.jpg',
  '/img/2.jpg',
  '/img/3.jpg',
  '/img/4.jpg',
  '/img/5.jpg',
  '/img/6.jpg',
  '/img/7.jpg',
  '/img/8.jpg',
  '/img/9.jpg',
  '/img/10.jpg',
  '/js/dbhelper.js',
  '/js/main.js',
  '/js/restaurant_info.js'
];

/**
 * Open a cache to store all our files.
 */
self.addEventListener('install', function(event) {
  // Perform install steps
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(function(cache) {
        console.log('Opened cache');
        return cache
          .addAll(urlsToCache)
          .catch(function(error){
          console.log("Caches opened failed: "+error);
        });;
      })
  );
});

/**
 * Remove old caches if there is a new cache.
 */
self.addEventListener('activate', function(event) {
  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.filter(function(cacheName) {
          return cacheName.startsWith('restaurant-') &&
                 cacheName != CACHE_NAME;
        }).map(function(cacheName) {
          return caches.delete(cacheName);
        })
      );
    })
  );
});

/**
 * Fetch cached data.
 */
self.addEventListener('fetch', function(event) {
  let cacheUrlObject = new URL(event.request.url);
  if (cacheUrlObject.hostname !== "localhost"){
    event.request.mode = "no-cors";
  }

  event.respondWith(
    caches.match(event.request)
      .then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        return fetch(event.request).then(
          function(response) {
            // Check if we received a valid response
            if(!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // IMPORTANT: Clone the response. A response is a stream
            // and because we want the browser to consume the response
            // as well as the cache consuming the response, we need
            // to clone it so we have two streams. They are each read
            // once.
            var responseToCache = response.clone();

            caches.open(CACHE_NAME)
              .then(function(cache) {
                cache.put(event.request, responseToCache);
              });

            return response;
          }
        ).catch(function(error){
          if (event.request.url.endsWith('.jpg')){
            return caches.match(fetch('/img/icon.png'));
          } else {
            return new Response('<p>Service worker fetch failure!</p>', {
              headers: { 'Content-Type': 'text/html' }
            });
          }
        });
      })
    );
  });
