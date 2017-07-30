// Create variable to hold map element, give initial settings to map
var map = L.map('map',{ center: [37.763317, -122.443445], zoom: 12, renderer: L.canvas()});
// Add Tile Layer
var basemapUrl = 'http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png';
var basemapAttribution = '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="http://cartodb.com/attributions">CartoDB</a>';
var basemapProperties = {minZoom: 2, maxZoom: 16, attribution: basemapAttribution};
L.tileLayer(basemapUrl, basemapProperties).addTo(map);
  

// Add JSON to map
L.geoJson(myData, {pointToLayer: pointToLayer}).addTo(map);

//specify what the circle markers should look like
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
};

function pointToLayer(feature, latlng) {
        var markerStyle = {radius: null, fillOpacity: 0.7, color: '#666666', opacity: 1, weight: 1, fillColor: '#0E6698'};
        markerStyle.radius = getRadius();
        return L.circleMarker(latlng, markerStyle);
}


//Add code to download PDF Report
document.getElementById('pdf_download').addEventListener('click', function() {
    leafletImage(map, downloadMap);
});


function downloadMap(err, canvas) {

    var imgData = canvas.toDataURL();
    var dimensions = map.getSize();
    
    var pdf = new jsPDF('p', 'pt', 'letter');
    pdf.addImage(imgData, 'PNG', 10, 10, dimensions.x * 0.5, dimensions.y * 0.5);

	var columns = [
	{title: "Address", dataKey: "address"},
	{title: "Market Rate", dataKey: "net_units"}, 
	{title: "Affordable", dataKey: "net_aff_units"},
    {title: "Retail", dataKey: "net_ret"},
    {title: "MIPS", dataKey: "net_mips"},
    {title: "CIE", dataKey: "net_cie"},
    {title: "PDR", dataKey: "net_pdr"},
    {title: "MED", dataKey: "net_med"},
    {title: "VISIT", dataKey: "net_visit"}];
    
    
    var rows = [];
    
    //Define sum functions for sum rows in table
    function getUnitSum(total, num) {
        var number = parseInt(num.net_units.replace(',', ''));
        return parseInt(total) + number;
    }
    function getUnitAffSum(total, num) {
        var number = parseInt(num.net_aff_units.replace(',', ''));
        return parseInt(total) + number;
    }
    function getRetSum(total, num) {
        var number = parseInt(num.net_ret.replace(',', ''));
        var result = parseInt(total) + number
        return result;
    }
    function getMipsSum(total, num) {
        var number = parseInt(num.net_mips.replace(',', ''));
        return parseInt(total) + number;
    }
    function getCieSum(total, num) {
        var number = parseInt(num.net_cie.replace(',', ''));
        return parseInt(total) + number;
    }
    function getPDRSum(total, num) {
        var number = parseInt(num.net_pdr.replace(',', ''));
        return parseInt(total) + number;
    }
    function getMedSum(total, num) {
        var number = parseInt(num.net_med.replace(',', ''));
        return parseInt(total) + number;
    }
    function getVisitSum(total, num) {
        var number = parseInt(num.net_visit.replace(',', ''));
        return parseInt(total) + number;
    }
    
    //Add construction projects to the list
    var cons_rows = [];

    for (i = 0; i < 30; i++) {
        var props = myData.features[i].properties;
        if (props.status == 'CONSTRUCTION') {
            var obj = {"address": props.address.toLocaleString(), "net_units": props.net_units.toLocaleString(), "net_aff_units": props.net_aff_units.toLocaleString(), "net_ret": props.net_ret.toLocaleString(),
            "net_mips": props.net_mips.toLocaleString(), "net_cie": props.net_cie.toLocaleString(), "net_pdr": props.net_pdr.toLocaleString(), "net_med": props.net_med.toLocaleString(), "net_visit": props.net_visit.toLocaleString()};
            cons_rows.push(obj);
        }
    }
    var cons_sum = {"address": "Under Construction", "net_units": cons_rows.reduce(getUnitSum, 0).toLocaleString(), "net_aff_units": cons_rows.reduce(getUnitAffSum, 0).toLocaleString(), "net_ret": cons_rows.reduce(getRetSum, 0).toLocaleString(),
    "net_mips": cons_rows.reduce(getMipsSum, 0).toLocaleString(), "net_cie": cons_rows.reduce(getCieSum, 0).toLocaleString(), "net_pdr": cons_rows.reduce(getPDRSum, 0).toLocaleString(), "net_med": cons_rows.reduce(getMedSum, 0).toLocaleString(), 
    "net_visit": cons_rows.reduce(getVisitSum, 0).toLocaleString()};
    
    //Add BP Approved projects to the list
    var BP_rows = [];

    for (i = 0; i < 30; i++) {
        var props = myData.features[i].properties;
        if (props.status == 'BP ISSUED') {
            var obj = {"address": props.address.toLocaleString(), "net_units": props.net_units.toLocaleString(), "net_aff_units": props.net_aff_units.toLocaleString(), "net_ret": props.net_ret.toLocaleString(),
            "net_mips": props.net_mips.toLocaleString(), "net_cie": props.net_cie.toLocaleString(), "net_pdr": props.net_pdr.toLocaleString(), "net_med": props.net_med.toLocaleString(), "net_visit": props.net_visit.toLocaleString()};
            BP_rows.push(obj);
        }
    }
    var BP_sum = {"address": "Building Approved", "net_units": BP_rows.reduce(getUnitSum, 0).toLocaleString(), "net_aff_units": BP_rows.reduce(getUnitAffSum, 0).toLocaleString(), "net_ret": BP_rows.reduce(getRetSum, 0).toLocaleString(),
    "net_mips": BP_rows.reduce(getMipsSum, 0).toLocaleString(), "net_cie": BP_rows.reduce(getCieSum, 0).toLocaleString(), "net_pdr": BP_rows.reduce(getPDRSum, 0).toLocaleString(), "net_med": BP_rows.reduce(getMedSum, 0).toLocaleString(), 
    "net_visit": BP_rows.reduce(getVisitSum, 0).toLocaleString()};
    
    //concatenate lists together into one master list
    var rows = rows.concat(cons_sum, cons_rows, BP_sum, BP_rows);
    
	pdf.setFontSize(12);

	pdf.autoTable(columns, rows, {
	theme: 'striped',
    drawCell: function(cell, data) {
      if (data.row.cells.address.raw === 'Under Construction' || data.row.cells.address.raw === 'Building Approved') {
        pdf.setFillColor(102, 178, 255);
      }
    },
    startY: 380,
    showHeader: 'firstPage',
    styles: {overflow: 'linebreak', tableWidth: 'auto', },
    margin: 20,
    columnStyles: {address: {columnWidth: 100}}, 
	});

    pdf.save("download.pdf");
    
};