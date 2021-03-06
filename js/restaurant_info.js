let restaurant;
var newMap;

/**
 * Initialize map as soon as the page is loaded.
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
        mapboxToken: 'pk.eyJ1IjoidGJtODUiLCJhIjoiY2pwbGExYWNxMGJ4dDQybXJlaG9senEwZyJ9.m8bceApLivA3Nyg-YSuSPw',
        maxZoom: 18,
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/" tabindex="-1">OpenStreetMap</a> contributors, ' +
          '<a href="https://creativecommons.org/licenses/by-sa/2.0/" tabindex="-1">CC-BY-SA</a>, ' +
          'Imagery © <a href="https://www.mapbox.com/" tabindex="-1">Mapbox</a>',
        id: 'mapbox.streets'    
      }).addTo(newMap);

      fillBreadcrumb();
      addTabindexToMap();

      DBHelper.mapMarkerForRestaurant(self.restaurant, self.newMap);
    }
  });
}  

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

/**
 * Create restaurant HTML and add it to the webpage
 */
fillRestaurantHTML = (restaurant = self.restaurant) => {
  const name = document.getElementById('restaurant-name');
  name.innerHTML = restaurant.name;
  name.setAttribute("tabIndex", "0"); 
  name.setAttribute("aria-label", "Restaurant name: " + restaurant.name); 

  const address = document.getElementById('restaurant-address');
  address.innerHTML = restaurant.address;
  address.setAttribute("tabIndex", "0"); 
  address.setAttribute("aria-label", "Restaurant address: " + restaurant.address); 

  const image = document.getElementById('restaurant-img');
  image.className = 'restaurant-img'
  image.src = DBHelper.imageUrlForRestaurant(restaurant);
  image.alt = DBHelper.imageAltForRestaurant(restaurant);

  const cuisine = document.getElementById('restaurant-cuisine');
  cuisine.innerHTML = restaurant.cuisine_type;
  cuisine.setAttribute("tabIndex", "0"); 
  cuisine.setAttribute("aria-label", "Restaurant cuisine type: " + restaurant.cuisine_type); 

  // fill operating hours
  if (restaurant.operating_hours) {
    fillRestaurantHoursHTML();
  }
  // fill reviews
  fillReviewsHTML();
}

/**
 * Create restaurant operating hours HTML table and add it to the webpage.
 */
fillRestaurantHoursHTML = (operatingHours = self.restaurant.operating_hours) => {
  const hours = document.getElementById('restaurant-hours');
  hours.setAttribute("tabIndex", "0"); 
  hours.setAttribute('role', 'listbox');
  hours.setAttribute('aria-label', 'Schedules');
  for (let key in operatingHours) {
    const row = document.createElement('tr');
    row.setAttribute("tabIndex", "0"); 

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
fillReviewsHTML = (reviews = self.restaurant.reviews) => {
  const container = document.getElementById('reviews-container');
  container.setAttribute("tabIndex", "0"); 
  container.setAttribute('role', 'listbox');
  container.setAttribute('aria-label', 'Reviews');
  const title = document.createElement('h2');
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
  li.setAttribute("tabIndex", "0"); 
  name.innerHTML = review.name;
  li.appendChild(name);

  const date = document.createElement('p');
  date.innerHTML = review.date;
  li.appendChild(date);

  const rating = document.createElement('div');
  rating.className = 'restaurant-rating';
  rating.setAttribute('aria-label', `${review.rating}` + ' stars');
  li.appendChild(rating);

  const fullStar = `<img src="./icons/fullstar.svg" alt="full-star">`;
  const emptyStar = `<img src="./icons/emptystar.svg" alt="empty-star">`;

  const starScores = () => {
          (review.rating === 5) ? html = fullStar + fullStar + fullStar + fullStar + fullStar
      :
          (review.rating === 4) ? html = fullStar + fullStar + fullStar + fullStar + emptyStar
      :
          (review.rating === 3) ? html = fullStar + fullStar + fullStar + emptyStar + emptyStar
      :
          (review.rating === 2) ? html = fullStar + fullStar + emptyStar + emptyStar + emptyStar
      :
          (review.rating === 1) ? html = fullStar + emptyStar + emptyStar + emptyStar + emptyStar
      :
          html = emptyStar + emptyStar + emptyStar + emptyStar + emptyStar

      rating.innerHTML = html;
  };

  starScores();

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

/**
 * Add tabindex attribute to elements in the map
 */
addTabindexToMap = () => {
  const zoomTabindexIn = document.querySelector('.leaflet-control-zoom-in');
  zoomTabindexIn.setAttribute('tabindex', '-1');

  const zoomTabindexOut = document.querySelector('.leaflet-control-zoom-out');
  zoomTabindexOut.setAttribute('tabindex', '-1');

  const attributionTabindex = document.querySelector('.leaflet-control-attribution a');
  attributionTabindex.setAttribute('tabindex', '-1');

  const mapTabindex = document.querySelector('#map');
  mapTabindex.setAttribute('tabindex', '-1');
}