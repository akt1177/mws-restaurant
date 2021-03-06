
/**
 * Common database helper functions.
 */
class DBHelper {

  /**
   * Database URL.
   * Change this to restaurants.json file location on your server.
   */
  static get DATABASE_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/restaurants`;

    /* project 1 running on localhost:8000 and using local json*/
    /*const port = 8000 // Change this to your server port
    return `http://localhost:${port}/data/restaurants.json`;*/
  }

  static get REVIEWS_URL() {
    const port = 1337 // Change this to your server port
    return `http://localhost:${port}/reviews`;
  }

  /**
   * Fetch all restaurants.
   */

  static fetchRestaurants(callback) {
    //if(navigator.onLine) {
      //Get the JSON and store in IDB

      let fetchURL = DBHelper.DATABASE_URL;
      fetch(fetchURL).then(response => {
        const restaurants = response.json()
        .then(restaurants => {
          var dbPromise = idb.open('restaurant-reviews',1,function(upgradeDb) {
            var keyValStore = upgradeDb.createObjectStore('keyval', {keyPath: 'id'});
            for (var i = 0; i < restaurants.length; i++) {
              keyValStore.put(restaurants[i]);
            } //end for
          });
          callback(null,restaurants);
      });// end .then
      }); //end fetchURL



    /*if (!navigator.onLine) {

      console.log('offline');

      dbPromise.then((db) => {
        var tx = db.transaction('keyval');
        var store = tx.objectStore('keyval');

        var restaurants =  store.getAll();

        console.log(restaurants);
        callback(null, restaurants);
        //return tx.complete;
      });*/

    }
  //}


  static fetchRestaurantReviewsById(id, callback) {
    let fetchURL = DBHelper.REVIEWS_URL + '/?restaurant_id=' + id;
    fetch(fetchURL).then(response => {
      const reviews = response.json()
      .then(reviews => {
        console.log('1');
        var dbPromise = idb.open('restaurant-reviews-list',1,function(upgradeDb) {
          console.log('2');
          var keyValStore = upgradeDb.createObjectStore('keyval', {keyPath: 'id'});
          // for (var i = 0; i < reviews.length; i++) {
          //   keyValStore.put(reviews[i]);
          // } //end for
        })
        dbPromise.then(function(db) {
          console.log('here');
          var tx = db.transaction('keyval','readwrite');
          var keyValStore = tx.objectStore('keyval');
          for (var i = 0; i < reviews.length; i++) {
            keyValStore.put(reviews[i]);
          } //end for
        });
        callback(null,reviews);
    });// end .then
    }); //end fetchURL
  }



  /*static fetchRestaurants(callback) {
    let xhr = new XMLHttpRequest();
    xhr.open('GET', DBHelper.DATABASE_URL);
    xhr.onload = () => {
      if (xhr.status === 200) { // Got a success response from server!
        const json = JSON.parse(xhr.responseText);
        const restaurants = json.restaurants;
        callback(null, restaurants);
      } else { // Oops!. Got an error from server.
        const error = (`Request failed. Returned status of ${xhr.status}`);
        callback(error, null);
      }
    };
    xhr.send();
  }*/

  /**
   * Fetch a restaurant by its ID.
   */
  static fetchRestaurantById(id, callback) {
    // fetch all restaurants with proper error handling.
    DBHelper.fetchRestaurants((error,restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        const restaurant = restaurants.find(r => r.id == id);
        if (restaurant) { // Got the review
          callback(null, restaurant);
        } else { // Restaurant does not exist in the database
          callback('Restaurant does not exist', null);
        }
      }
    });
  }


  /**
   * Fetch restaurants by a cuisine type with proper error handling.
   */
  static fetchRestaurantByCuisine(cuisine, callback) {
    // Fetch all restaurants  with proper error handling
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given cuisine type
        const results = restaurants.filter(r => r.cuisine_type == cuisine);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a neighborhood with proper error handling.
   */
  static fetchRestaurantByNeighborhood(neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Filter restaurants to have only given neighborhood
        const results = restaurants.filter(r => r.neighborhood == neighborhood);
        callback(null, results);
      }
    });
  }

  /**
   * Fetch restaurants by a cuisine and a neighborhood with proper error handling.
   */
  static fetchRestaurantByCuisineAndNeighborhood(cuisine, neighborhood, callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        let results = restaurants
        if (cuisine != 'all') { // filter by cuisine
          results = results.filter(r => r.cuisine_type == cuisine);
        }
        if (neighborhood != 'all') { // filter by neighborhood
          results = results.filter(r => r.neighborhood == neighborhood);
        }
        callback(null, results);
      }
    });
  }

  /**
   * Fetch all neighborhoods with proper error handling.
   */
  static fetchNeighborhoods(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all neighborhoods from all restaurants
        const neighborhoods = restaurants.map((v, i) => restaurants[i].neighborhood)
        // Remove duplicates from neighborhoods
        const uniqueNeighborhoods = neighborhoods.filter((v, i) => neighborhoods.indexOf(v) == i)
        callback(null, uniqueNeighborhoods);
      }
    });
  }

  /**
   * Fetch all cuisines with proper error handling.
   */
  static fetchCuisines(callback) {
    // Fetch all restaurants
    DBHelper.fetchRestaurants((error, restaurants) => {
      if (error) {
        callback(error, null);
      } else {
        // Get all cuisines from all restaurants
        const cuisines = restaurants.map((v, i) => restaurants[i].cuisine_type)
        // Remove duplicates from cuisines
        const uniqueCuisines = cuisines.filter((v, i) => cuisines.indexOf(v) == i)
        callback(null, uniqueCuisines);
      }
    });
  }

  /**
   * Restaurant page URL.
   */
  static urlForRestaurant(restaurant) {
    return (`./restaurant.html?id=${restaurant.id}`);
  }

  /**
   * Restaurant image URL.
   */
  static imageUrlForRestaurant(restaurant) {
    return (`/img/${restaurant.id}-med.jpg`);
  }

  static imageUrlForRestaurantSet(restaurant) {
    return (`/img/${restaurant.id}-low50.jpg 320w, /img/${restaurant.id}-med50.jpg 480w, /img/${restaurant.id}-med.jpg 800w`);
  }

  /**
   * Map marker for a restaurant.
   */
   static mapMarkerForRestaurant(restaurant, map) {
       // https://leafletjs.com/reference-1.3.0.html#marker
       const marker = new L.marker([restaurant.latlng.lat, restaurant.latlng.lng],
         {title: restaurant.name,
         alt: restaurant.name,
         url: DBHelper.urlForRestaurant(restaurant)
         })
         marker.addTo(newMap);
       return marker;
     }


     /*old google maps
  static mapMarkerForRestaurant(restaurant, map) {
    const marker = new google.maps.Marker({
      position: restaurant.latlng,
      title: restaurant.name,
      url: DBHelper.urlForRestaurant(restaurant),
      map: map,
      animation: google.maps.Animation.DROP}
    );
    return marker;
  }*/


}



/*var dbPromise = idb.open('restaurant-reviews',1,function(upgradeDb) {
  var keyValStore = upgradeDb.createObjectStore('keyval');
  keyValStore.put('world', 'hello');
});

dbPromise.then((db) => {
    var tx = db.transaction('keyval');
    var keyValStore = tx.objectStore('keyval');
    return keyValStore.get('hello');
}).then((val) => {
  console.log('The value of "hello" is ', val);
});
*/



/*dbPromise.then(function(db) {
  var tx = db.transaction('keyval','readwrite');
  var keyValStore = tx.objectStore('keyval');
  keyValStore.put('two','one');
}).then(() => console.log('Second done'));*/
