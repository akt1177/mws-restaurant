self.addEventListener('install', function(event) {
 event.waitUntil(
   caches.open('restaurant-reviews1').then(function(cache) {
     return cache.addAll([
       '/',
       '/index.html',
       '/img',
       '/js',
       '/js/dbhelper.js',
       '/js/main.js',
       '/js/restaurant_info.js',
       '/css/styles.css',
       '/data/restaurants.json',
       '/restaurant.html'
     ]).cache(function(error) {
       console.log('Cache fail: ' + error);
     });
   })
 );
});


self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request).then(function(response) {
      return response ||
      fetch(event.request).then(function(fetchResponse) {
        return caches.open('restaurant-reviews1').then(function(cache) {
          cache.put(event.request. fetchResponse.clone());
          return fetchResponse;
        });
      });
    })
  );
});
