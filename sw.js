let staticCacheName = "restaurant-reviews-v1";

/**
 *  It store the cache in "staticCacheName"
 * 
 *  Code obtain from MDN: 
 *  https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API/Using_Service_Workers
 */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open('staticCacheName').then(cache => {
      return cache.addAll([
        '/index.html',
        '/restaurant.html',
        '/css/styles.css',
        '/data/restaurants.json',
        '/js/dbhelper.js',
        '/js/main.js',
        '/js/restaurant_info.js'
      ]);
    })
  );
});

/**
 *  It filter in the cache names list, the cache names that start 
 *  with 'restaurant-reviews-' but don't match with staticCacheName.
 *  The filtered cache names are deleted
 * 
 *  Code obtain from Udacity: 
 *  https://classroom.udacity.com/nanodegrees/nd001/parts/b1808a20-5e71-4dd3-bbc1-4ae86beefd6d/modules/d9cfe693-34d7-4daf-91f2-d66ab009089a/lessons/6381510081/concepts/63885494590923
 */
self.addEventListener('activate', event => {
	event.waitUntil(
		caches.keys().then(cacheNames => {
			return Promise.all(
				cacheNames.filter(cacheName => {
					return cacheName.startsWith('restaurant-reviews-') && 
                 cacheName != staticCacheName;
				}).map(cacheName => {
					return caches.delete(cacheName);
				})    
			);
		})
	);
});

/**
 *  When a request matches some cache content, the service worker uses the stored resource
 *
 *  Code obtain from MDN: 
 *  https://developer.mozilla.org/es/docs/Web/API/Service_Worker_API/Using_Service_Workers
 */
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchResponse => {    
        return caches.open('staticCacheName').then(cache => {
          cache.put(event.request, fetchResponse.clone());
          return fetchResponse;
        });
      }).catch(error => {
        console.log('[ServiceWorker] Error fetching new data.', error);
      })
    })
  );
});
