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
var test_input2 = myData.features[0].properties.f2;
var test_input3 = myData.features[0].properties.f3;
var test_input4 = myData.features[0].properties.f4;
var test_input5 = myData.features[0].properties.f5;
var test_input6 = myData.features[0].properties.f6;
var test_input7 = myData.features[0].properties.f7;
var test_input8 = myData.features[0].properties.f8;
var test_input9 = myData.features[0].properties.f9;
    
/*
var projects = myData.features;
var proj_list = [];
for (i = 0; i < projects.length; i++) {
    var props = projects[i].properties;
    var obj = {"address": props.f1, "net_units": props.f2, "net_aff_units": props.f3, "net_ret": props.f4,
    "net_mips": props.f5, "net_cie": props.f6, "net_pdr": props.f7, "net_med": props.f8, "net_visit": props.f9};
    proj_list.push(obj);
}*/
    

function downloadMap(err, canvas) {
    var imgData = canvas.toDataURL();
    var dimensions = map.getSize();
    //console.log(myData.features[250].properties);
    
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.addImage(imgData, 'PNG', 10, 10, dimensions.x * 0.5, dimensions.y * 0.5);
	
	var columns = [
	{title: "Address", dataKey: "address"},
	{title: "Market Rate", dataKey: "net_units"}, 
	{title: "Affordable", dataKey: "net_aff_units"},
    {title: "Retail", dataKey: "net_ret"},
    {title: "MIPS", dataKey: "net_mips"},
    {title: "CIE", dataKay: "net_cie"},
    {title: "PDR", dataKey: "net_pdr"},
    {title: "MED", dataKey: "net_med"},
    {title: "VISIT", dataKey: "net_visit"}];
    /*
	var rows = [
	{"address": test_input, "net_units": test_input2, "net_aff_units": test_input3, "net_ret": test_input4, "net_mips": test_input5, "net_cie": test_input6,
    "net_pdr": test_input7, "net_med": test_input8, "net_visit": test_input9},
    {"address": test_input, "net_units": test_input2, "net_aff_units": test_input3, "net_ret": test_input4, "net_mips": test_input5, "net_cie": test_input6,
        "net_pdr": test_input7, "net_med": test_input8, "net_visit": test_input9}];*/

    var rows = [];
    
    //Add construction projects to the list
    var cons_rows = [];
    var column1 = {"address": "Under Construction", "net_units": 0, "net_aff_units": 0, "net_ret": 0,
    "net_mips": 0, "net_cie": 0, "net_pdr": 0, "net_med": 0, "net_visit": 0};
    cons_rows.push(column1);
    for (i = 0; i < 8; i++) {
        var props = myData.features[i].properties;
        var obj = {"address": props.f1.toLocaleString(), "net_units": props.f2.toLocaleString(), "net_aff_units": props.f3.toLocaleString(), "net_ret": props.f4.toLocaleString(),
        "net_mips": props.f5.toLocaleString(), "net_cie": props.f6.toLocaleString(), "net_pdr": props.f7.toLocaleString(), "net_med": props.f8.toLocaleString(), "net_visit": props.f9.toLocaleString()};
        cons_rows.push(obj);
    }
    
    //concatenate lists together into one master list
    var rows = rows.concat(cons_rows);
    
	pdf.setFontSize(12);
	pdf.autoTable(columns, rows, {
	theme: 'striped',
    drawCell: function(cell, data) {
      var rows = data.table.rows;
      if (data.row.cells.address.raw === 'Under Construction') {
        pdf.setFillColor(102, 178, 255);
      }
    },
	margin: {top: 380},
	addPageContent: function(data) {
	pdf.text("Development Projects", 80, 370);
	}
	});

    pdf.save("download.pdf");
};