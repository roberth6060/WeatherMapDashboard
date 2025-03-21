document.addEventListener('deviceready', getCurrentLocation, false);
// Variable to track the currently displayed marker
let currentMarker; 

function getCurrentLocation() {
   navigator.geolocation.getCurrentPosition(onSuccess, onError, {
       enableHighAccuracy: true,
       timeout: 5000,
       maximumAge: 0
   });
}
 
function onSuccess( position ) {
    let latitude = position.coords.latitude;
    let longitude = position.coords.longitude;

    // Initialize the map and set the user's current location
    let map = L.map('map-canvas').setView([latitude, longitude], 13);

    // Add OpenStreetMap tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    // Reverse geocode to get initial location name
    fetchReverseGeoLocation(map, latitude, longitude);

    // Handle map click event
    map.on('click', function (e) {
        const clickedLat = e.latlng.lat;
        const clickedLng = e.latlng.lng;

        // Update coordinates info
        document.querySelector('.coordinates').innerText = `Latitude: ${clickedLat.toFixed(2)}, Longitude: ${clickedLng.toFixed(2)}`;

        // Reverse geocode to get location name
        fetchReverseGeoLocation(map, clickedLat, clickedLng);
    });
}

function fetchReverseGeoLocation(map, latitude, longitude) {
        // Reverse geocode to get initial location name
        let reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

        fetch(reverseGeocodeUrl)
        .then(response => response.json())
        .then(data => {
            console.log(data)
            let city = '';
            let state = '';
            let country = '';

            // Get data about address
            if (data.address) {
                city = data.address.city || data.address.town || data.address.village || '';
                state = data.address.state || data.address.region || '';
                country = data.address.country || '';
            }

            // Initialize UI with the current location
            document.querySelector('.city').innerText = city || state || country;
            document.querySelector('.coordinates').innerText = `Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}`;

            // Create initial marker
            createMap(map, latitude, longitude, city, state, country);

            // Fetch and display the weather data
            return fetchWeather(latitude, longitude);
        })
        .catch(error => {
            console.error("Error fetching location indormation:", error);
            alert("Error fetching location indormation:" + error);
        });
}

function createMap(map, latitude, longitude, city, state, country) {
    // Remove existing marker if it exists
    if (currentMarker) {
        map.removeLayer(currentMarker);
    }

    // Create a new marker at the specified location
    currentMarker = L.marker([latitude, longitude]).addTo(map)
        .bindPopup(`${city !== "" ? city : state}, ${country}`)
        .openPopup();
}


function fetchWeather(latitude, longitude) {
   // Use Open-Meteo API to get weather data
   const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`;

   fetch(weatherUrl)
       .then(response => {
           if (!response.ok) {
               throw new Error('Network response was not ok');
           }
           return response.json();
       })
       .then(data => {
           // Check if data is returned and contains current weather information
           if (!data.current_weather) {
               throw new Error('No weather data available');
           }

           // Extract temperature from the data
           const temperature = data.current_weather.temperature; // Get temperature in Celsius
           document.querySelector('.temperature').innerText = `${temperature}°C`;

           // Update the current time
           const localDate = new Date();
           document.querySelector(".time").innerText = localDate.toLocaleTimeString();
       })
       .catch(error => {
           console.error("Error fetching weather data:", error); // Log any errors
           document.querySelector(".temperature").innerText = "N/A"; // Fallback for temperature
           document.querySelector(".time").innerText = new Date().toLocaleTimeString(); // Fallback for time
       });
}

function onError(error) {
   alert("code: " + error.code + "\n" + "message: " + error.message + "\n");
}

