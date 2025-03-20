document.addEventListener('deviceready', getCurrentLocation, false);

function getCurrentLocation() {
   navigator.geolocation.getCurrentPosition(onSuccess, onError, {
       enableHighAccuracy: true,
       timeout: 5000,
       maximumAge: 0
   });
}
 
function onSuccess( position ) {
   if ( position.coords ) {
      let latitude = position.coords.latitude;
      let longitude = position.coords.longitude;
      let reverseGeocodeUrl = `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`;

      //Google Maps
        myLatlng = new google.maps.LatLng( latitude, longitude),
        mapOptions = { zoom: 3, center: myLatlng },
        map = new google.maps.Map( document.getElementById( "map-canvas" ), mapOptions ),
        marker = new google.maps.Marker( { position: myLatlng, map: map } );

        //Add support for openstreetmap API to fetch location information 
        fetch(reverseGeocodeUrl).then(reponse => reponse.json()).then(data=>{
            let city = "";
            let state = "";
            let country = "";

            // Get data about address
            if (data.address) {
                city = data.address.city || data.address.town || data.address.village || "";
                state = data.address.state || data.address.region || "";
                country = data.address.country || "";
            }
            
            //Intialize location details: 
            document.querySelector('.city').innerText = city || state || country;
            document.querySelector('.coordinates').innerText = `Latitude: ${latitude.toFixed(2)}, Longitude: ${longitude.toFixed(2)}`;
            
            // Fetch and display the weather data
            fetchWeather(latitude, longitude);
        });
   }
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
           document.querySelector('.time').innerText = localDate.toLocaleTimeString();
       })
       .catch(error => {
           console.error('Error fetching weather data:', error); // Log any errors
           document.querySelector('.temperature').innerText = 'N/A'; // Fallback for temperature
           document.querySelector('.time').innerText = new Date().toLocaleTimeString(); // Fallback for time
       });
}

function onError(error) {
   alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}

