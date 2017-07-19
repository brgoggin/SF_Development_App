// Create variable to hold map element, give initial settings to map
var map = L.map('map',{ center: [37.763317, -122.443445], zoom: 12, renderer: L.canvas()});
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

//Add code to download PDF Report
document.getElementById('pdf_download').addEventListener('click', function() {
    leafletImage(map, downloadMap);
});
var test_input = myData.features[0].properties.f1;
function downloadMap(err, canvas) {
    var imgData = canvas.toDataURL();
    var dimensions = map.getSize();
    
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.addImage(imgData, 'PNG', 10, 10, dimensions.x * 0.5, dimensions.y * 0.5);
	
	var columns = [
	{title: "ID", dataKey: "id"},
	{title: "Name", dataKey: "name"}, 
	{title: "Country", dataKey: "country"}];
	var rows = [
	{"id": 1, "name": test_input, "country": "Tanzania"},
	{"id": 2, "name": "Nelson", "country": "Kazakhstan"},
	{"id": 3, "name": "Garcia", "country": "Madagascar"},
	{"id": 3, "name": "Garcia", "country": "Madagascar"}];
	
	pdf.autoTable(columns, rows, {
	theme: 'striped',
	margin: {top: 300},
	addPageContent: function(data) {
	pdf.text("Development Projects", 100, 290);
	}
	});

    pdf.save("download.pdf");
};