let restaurant;
var newMap;

/**
 * Initialize Google map, called from HTML.
 */
 document.addEventListener('DOMContentLoaded', (event) => {
   initMap();
 });

 /**
  * Initialize leaflet map
  */
 initMap = () => {
   fetchRestaurantFromURL((error, restaurant) => {
     if (error) { // Got an error!
       console.error(error);
     } else {
       self.newMap = L.map('map', {
         center: [restaurant.latlng.lat, restaurant.latlng.lng],
         zoom: 16,
         scrollWheelZoom: false
       });
       L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.jpg70?access_token={mapboxToken}', {
         mapboxToken: 'pk.eyJ1IjoiYW5nZWl6YWhveSIsImEiOiJjamphM29rZWEzYTJwM2tvNG84MmR6enRzIn0.F2u-rxXUBM7cW04WcFWIWw',
         maxZoom: 18,
         attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
           '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
           'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
         id: 'mapbox.streets'
       }).addTo(newMap);
       fillBreadcrumb();
       DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
     }
   });
 }



/* old google maps
window.initMap = () => {
  fetchRestaurantFromURL((error, restaurant) => {
    if (error) { // Got an error!
      console.error(error);
    } else {
      self.map = new google.maps.Map(document.getElementById('map'), {
        zoom: 16,
        center: restaurant.latlng,
        scrollwheel: false
      });
      fillBreadcrumb();
      DBHelper.mapMarkerForRestaurant(self.restaurant, self.map);
    }
  });
}*/

/**
 * Get current restaurant from page URL.
 */
fetchRestaurantFromURL = (callback) => {
  if (self.restaurant) { // restaurant already fetched!
    callback(null, self.restaurant)
    return;
  }
  const id = getParameterByName('id');
  if (!id) { // no id found in URL
    error = 'No restaurant id in URL'
    callback(error, null);
  } else {
    DBHelper.fetchRestaurantById(id, (error, restaurant) => {
      self.restaurant = restaurant;
      if (!restaurant) {
        console.error(error);
        return;
      }
      fillRestaurantHTML();
      callback(null, restaurant)
    });
  }
}

fetchReviews = () => {
const id = getParameterByName('id');
if (!id) {
  console.log('There is no restaurant ID in the URL');
  return;
}
DBHelper.fetchRestaurantReviewsById(id, (error, reviews) => {
  self.reviews = reviews;
  if (error || !reviews) {
    console.log('Error retrieving reviews', error);
    return;
  }
  fillReviewsHTML();
});
}

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img';
  image.srcset = DBHelper.imageUrlForRestaurantSet(restaurant);
  image.sizes = 'sizes="(max-width: 320px) 280px, (max-width: 480px) 440px, 800px"';
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = 'Restaurant image: ' + restaurant.name;

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;

  const fave = document.getElementById('favourite');
  fave.checked = restaurant.is_favorite;
  // if (restaurant.is_favorite == true) {
  //   fave.checked = true;
  // } else {
  //   fave.checked = false;
  // }

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  //fillReviewsHTML();
  fetchReviews();

}



/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  for (let key in operatingHours) {
    const row = document.createElement('tr');

    const day = document.createElement('td');
    day.innerHTML = key;
    row.appendChild(day);

    const time = document.createElement('td');
    time.innerHTML = operatingHours[key];
    row.appendChild(time);

    hours.appendChild(row);
  }
}

/**
 * Create all reviews HTML and add them to the webpage.
 */
fillReviewsHTML = (reviews = self.reviews) => {
  const container = document.getElementById('reviews-container');
  const title = document.createElement('h3');
  title.innerHTML = 'Reviews';
  container.appendChild(title);

  if (!reviews) {
    const noReviews = document.createElement('p');
    noReviews.innerHTML = 'No reviews yet!';
    container.appendChild(noReviews);
    return;
  }
  const ul = document.getElementById('reviews-list');
  reviews.forEach(review => {
    ul.appendChild(createReviewHTML(review));
  });
  container.appendChild(ul);
}

/**
 * Create review HTML and add it to the webpage.
 */
createReviewHTML = (review) => {
  const li = document.createElement('li');
  const name = document.createElement('p');
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = readableDate(review.createdAt);
  li.appendChild(date);

  const rating = document.createElement('p');
  rating.innerHTML = `Rating: ${review.rating}`;
  li.appendChild(rating);

  const comments = document.createElement('p');
  comments.innerHTML = review.comments;
  li.appendChild(comments);

  return li;
}

/**
 * Add restaurant name to the breadcrumb navigation menu
 */
fillBreadcrumb = (restaurant=self.restaurant) => {
  const breadcrumb = document.getElementById('breadcrumb');
  const li = document.createElement('li');
  li.innerHTML = restaurant.name;
  breadcrumb.appendChild(li);
}

/**
 * Get a parameter by name from page URL.
 */
getParameterByName = (name, url) => {
  if (!url)
    url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  const regex = new RegExp(`[?&]${name}(=([^&#]*)|&|#|$)`),
    results = regex.exec(url);
  if (!results)
    return null;
  if (!results[2])
    return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

readableDate = (unixdate) => {
  let date = new Date(unixdate);
  let year = date.getFullYear();
  let month = date.getMonth();
  let day = date.getDate();
  return month + '/' + day + '/' + year;
}



submitReview = (event) => {
  event.preventDefault();
  const review_body = {
    "restaurant_id": parseInt(getParameterByName('id'),10),
    "name": document.getElementById('review-form-name').value,
    "rating": document.getElementById('review-form-rating').value,
    "comments": document.getElementById('review-form-text').value
  }

  let fetch_vars = {
    method: 'POST',
    body: JSON.stringify(review_body),
    headers: {'Content-Type': 'application/json'}
  }

  fetch(DBHelper.REVIEWS_URL,fetch_vars).then((response) => {
    return response.json();
  });

  return false;
}

submitReview = (event) => {
  event.preventDefault();
  const review_body = {
    "restaurant_id": parseInt(getParameterByName('id'),10),
    "name": document.getElementById('review-form-name').value,
    "rating": document.getElementById('review-form-rating').value,
    "comments": document.getElementById('review-form-text').value
  }

  let fetch_vars = {
    method: 'POST',
    body: JSON.stringify(review_body),
    headers: {'Content-Type': 'application/json'}
  }

  fetch(DBHelper.REVIEWS_URL,fetch_vars).then((response) => {
    return response.json();
  });

  window.location = 'http://localhost:8000/restaurant.html?id=' + getParameterByName('id');
  return false;
}

document.getElementById('favourite').onclick = function() {
  //console.log('click');
    if ( this.checked ) {
        let fetch_vars = {
          method: 'POST',
          body: JSON.stringify({"is_favorite": true})
        }
        let faveURL = DBHelper.DATABASE_URL + '/' + getParameterByName('id')

        fetch(faveURL, fetch_vars).then((response) => {
          console.log('is_favourite: ' + this.checked );
          return response.json();
        });
    } else {
        let fetch_vars = {
          method: 'POST',
          body: JSON.stringify({"is_favorite": false})
        }
        let faveURL = DBHelper.DATABASE_URL + '/' + getParameterByName('id')

        fetch(faveURL, fetch_vars).then((response) => {
          console.log('is_favourite: ' + this.checked );
          return response.json();
        });
    }
};
