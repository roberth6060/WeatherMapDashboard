document.addEventListener('deviceready', onDeviceReady, false);

function onDeviceReady() {
    // Cordova is now initialized. Have fun!

    console.log('Running cordova-' + cordova.platformId + '@' + cordova.version);
    document.getElementById('deviceready').classList.add('ready');
}

navigator.geolocation.getCurrentPosition( onSuccess, onError, { timeout: 30000 } );
 
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

        });
   }
}

function onError(error) {
   alert('code: ' + error.code + '\n' + 'message: ' + error.message + '\n');
}

google.maps.event.addDomListener( window, 'load', onSuccess );