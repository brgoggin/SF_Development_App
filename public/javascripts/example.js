// Create variable to hold map element, give initial settings to map
var map = L.map('map',{ center: [37.763317, -122.443445], zoom: 12});
// Add Tile Layer
var basemapUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
var basemapAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
var basemapProperties = {minZoom: 2, maxZoom: 16, attribution: basemapAttribution};
L.tileLayer(basemapUrl, basemapProperties).addTo(map);


//specify what the circle markers should look like (radius and fill color are dynamically set later)
var markerStyle = {radius: null, fillOpacity: 0.7, color: '#666666', opacity: 1, weight: 1, fillColor: null};

if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
    var initialZoomLevel = 12;
} else {
    var initialZoomLevel = 10;
}
function getRadius() {
    //Make dots bigger if viewed on mobile
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ) {
        if (map.getZoom()) { radius = Math.pow(map.getZoom(), 0.9); } //if map already exists, get current zoom level
        else { radius = Math.pow(initialZoomLevel, 0.9); } //if it's the initial startup, use initial zoom level
        return radius;
    } else {
        if (map.getZoom()) { radius = Math.pow(map.getZoom(), 0.8); } //if map already exists, get current zoom level
        else { radius = Math.pow(initialZoomLevel, 0.8); } //if it's the initial startup, use initial zoom level
        return radius;
        }
}

// function to add data points to map layer with proper styling
function pointToLayer(feature, latlng) {
        markerStyle.fillColor = '#666666';
        markerStyle.radius = getRadius();
        return L.circleMarker(latlng, markerStyle);
}

// Add JSON to map
L.geoJson(myData,{pointToLayer: pointToLayer}).addTo(map);