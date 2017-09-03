
// Create variable to hold map element, give initial settings to map
var map = L.map('map', { center: [37.763317, -122.443445], zoom: 12, renderer: L.canvas()});

// Add Tile Layer

L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/streets-v10/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1Ijoic2ZwbGFubmluZzEiLCJhIjoiY2o3M3VxYWZoMGp0ODJ3bnU2cng2Z21ldiJ9.XuWMZzFbn_fjFWamKYzv0w', {
    attribution: '© <a href="https://www.mapbox.com/about/maps/">Mapbox</a> © <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'your.mapbox.access.token'
}).addTo(map);

//Check if data returned by user query is empty. If it is, return "No such developments". If not, run the rest of the code on this page. 
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}
var object = {};
if (myData.features.length == 0) {
    alert('There are no developments with the entered criteria.');
} else{
    //Add polygon layer to map if user selects a specific neighborhood. If user did not select a place, string 'All' sent to client instead of a GeoJson
    if (layerData2 != 'None') {
        L.geoJson(layerData2).addTo(map);
    }

    //Add user alerts
    if (place_status == "None" && address !="" && distance == "") {
        alert("You have chosen an address but not a distance around the address. Please specify a distance or clear the address field." );
    } else if (place_status == "None" && address =="" && distance != "") {
        alert("You have chosen a distance but not an address. Please specify an address or clear the distance field.");
    } else if (place_status != "None" && address !="" && distance == "") {
        alert("You have chosen an address but not a distance around the address. Please specify the distance. If you instead would like to search by an area, clear the address field.");
    } else if (place_status != "None" && address =="" && distance != "") {
        alert("You have chosen a distance but not an address. Please specify an address. If you instead would like to search by an area, clear the distance field.");
    } else if (place_status != "None" && address !="" && distance != "") { 
        alert("You have entered both and address search and an area search. We returned the address search here. If you would like to instead search by area, clear the address and distance fields.");
    } 

    // Add projects layer (i.e. dots) to map
    var points = L.geoJson(myData, {pointToLayer: pointToLayer, onEachFeature: onEachFeature}).addTo(map);
    map.fitBounds(points.getBounds());

    /**********************************************
    **Get Summary Statistics of Selection
    **********************************************/
    //Define sum functions for sum rows in table
    function getUnitSum(total, num) {
        var number = parseInt(num.net_units.replace(/,/g, ''));
        return parseInt(total) + number;
    }
    function getUnitAffSum(total, num) {
        var number = parseInt(num.net_aff_units.replace(/,/g, ''));
        return parseInt(total) + number;
    }
    function getRetSum(total, num) {
        var number = parseInt(num.net_ret.replace(/,/g, ''));
        var result = parseInt(total) + number
        return result;
    }
    function getMipsSum(total, num) {
        var number = parseInt(num.net_mips.replace(/,/g, ''));
        return parseInt(total) + number;
    }
    function getCieSum(total, num) {
        var number = parseInt(num.net_cie.replace(/,/g, ''));
        return parseInt(total) + number;
    }
    function getPDRSum(total, num) {
        var number = parseInt(num.net_pdr.replace(/,/g, ''));
        return parseInt(total) + number;
    }
    function getMedSum(total, num) {
        var number = parseInt(num.net_med.replace(/,/g, ''));
        return parseInt(total) + number;
    }
    function getVisitSum(total, num) {
        var number = parseInt(num.net_visit.replace(/,/g, ''));
        return parseInt(total) + number;
    }

    //Add construction projects to the list
    var cons_rows = [];

    for (i = 0; i < myData.features.length; i++) {
        var props = myData.features[i].properties;
        if (props.proj_status == 'Under Construction') {
            var obj = {"address": props.address.toLocaleString(), "net_units": props.net_units.toLocaleString(), "net_aff_units": props.net_aff_units.toLocaleString(), "net_ret": props.net_ret.toLocaleString(),"net_mips": props.net_mips.toLocaleString(), "net_cie": props.net_cie.toLocaleString(), "net_pdr": props.net_pdr.toLocaleString(), "net_med": props.net_med.toLocaleString(), "net_visit": props.net_visit.toLocaleString()};
            cons_rows.push(obj);
        }
    }

    var cons_sum = {"address": "Under Construction", "net_units": cons_rows.reduce(getUnitSum, 0).toLocaleString(), "net_aff_units": cons_rows.reduce(getUnitAffSum, 0).toLocaleString(), "net_ret": cons_rows.reduce(getRetSum, 0).toLocaleString(),
    "net_mips": cons_rows.reduce(getMipsSum, 0).toLocaleString(), "net_cie": cons_rows.reduce(getCieSum, 0).toLocaleString(), "net_pdr": cons_rows.reduce(getPDRSum, 0).toLocaleString(), "net_med": cons_rows.reduce(getMedSum, 0).toLocaleString(), 
    "net_visit": cons_rows.reduce(getVisitSum, 0).toLocaleString()};

    //Add BP Approved projects to the list
    var BP_rows = [];

    for (i = 0; i < myData.features.length; i++) {
        var props = myData.features[i].properties;
        if (props.proj_status == 'Building Permit Approved') {
            var obj = {"address": props.address.toLocaleString(), "net_units": props.net_units.toLocaleString(), "net_aff_units": props.net_aff_units.toLocaleString(), "net_ret": props.net_ret.toLocaleString(),
            "net_mips": props.net_mips.toLocaleString(), "net_cie": props.net_cie.toLocaleString(), "net_pdr": props.net_pdr.toLocaleString(), "net_med": props.net_med.toLocaleString(), "net_visit": props.net_visit.toLocaleString()};
            BP_rows.push(obj);
        }
    }

    var BP_sum = {"address": "Building Approved", "net_units": BP_rows.reduce(getUnitSum, 0).toLocaleString(), "net_aff_units": BP_rows.reduce(getUnitAffSum, 0).toLocaleString(), "net_ret": BP_rows.reduce(getRetSum, 0).toLocaleString(),
    "net_mips": BP_rows.reduce(getMipsSum, 0).toLocaleString(), "net_cie": BP_rows.reduce(getCieSum, 0).toLocaleString(), "net_pdr": BP_rows.reduce(getPDRSum, 0).toLocaleString(), "net_med": BP_rows.reduce(getMedSum, 0).toLocaleString(), 
    "net_visit": BP_rows.reduce(getVisitSum, 0).toLocaleString()};

    //Add Planning Entitled Projects to the list
    var PL_rows = [];

    for (i = 0; i < myData.features.length; i++) {
        var props = myData.features[i].properties;
        if (props.proj_status == 'Planning Entitled') {
            var obj = {"address": props.address.toLocaleString(), "net_units": props.net_units.toLocaleString(), "net_aff_units": props.net_aff_units.toLocaleString(), "net_ret": props.net_ret.toLocaleString(),
            "net_mips": props.net_mips.toLocaleString(), "net_cie": props.net_cie.toLocaleString(), "net_pdr": props.net_pdr.toLocaleString(), "net_med": props.net_med.toLocaleString(), "net_visit": props.net_visit.toLocaleString()};
            PL_rows.push(obj);
        }
    }

    var PL_sum = {"address": "Planning Entitled", "net_units": PL_rows.reduce(getUnitSum, 0).toLocaleString(), "net_aff_units": PL_rows.reduce(getUnitAffSum, 0).toLocaleString(), "net_ret": PL_rows.reduce(getRetSum, 0).toLocaleString(),
    "net_mips": PL_rows.reduce(getMipsSum, 0).toLocaleString(), "net_cie": PL_rows.reduce(getCieSum, 0).toLocaleString(), "net_pdr": PL_rows.reduce(getPDRSum, 0).toLocaleString(), "net_med": PL_rows.reduce(getMedSum, 0).toLocaleString(), 
    "net_visit": PL_rows.reduce(getVisitSum, 0).toLocaleString()};

    //Add Planning Entitled Projects to the list
    var PP_rows = [];

    for (i = 0; i < myData.features.length; i++) {
        var props = myData.features[i].properties;
        if (props.proj_status == 'Proposed') {
            var obj = {"address": props.address.toLocaleString(), "net_units": props.net_units.toLocaleString(), "net_aff_units": props.net_aff_units.toLocaleString(), "net_ret": props.net_ret.toLocaleString(),
            "net_mips": props.net_mips.toLocaleString(), "net_cie": props.net_cie.toLocaleString(), "net_pdr": props.net_pdr.toLocaleString(), "net_med": props.net_med.toLocaleString(), "net_visit": props.net_visit.toLocaleString()};
            PP_rows.push(obj);
        }
    }

    var PP_sum = {"address": "Proposed", "net_units": PP_rows.reduce(getUnitSum, 0).toLocaleString(), "net_aff_units": PP_rows.reduce(getUnitAffSum, 0).toLocaleString(), "net_ret": PP_rows.reduce(getRetSum, 0).toLocaleString(),
    "net_mips": PP_rows.reduce(getMipsSum, 0).toLocaleString(), "net_cie": PP_rows.reduce(getCieSum, 0).toLocaleString(), "net_pdr": PP_rows.reduce(getPDRSum, 0).toLocaleString(), "net_med": PP_rows.reduce(getMedSum, 0).toLocaleString(), 
    "net_visit": PP_rows.reduce(getVisitSum, 0).toLocaleString()};

    //Create total sum row
    var total_rows = [];
    total_rows.push(cons_sum, BP_sum, PL_sum, PP_sum);

    var total = {"address": "Total", "net_units": total_rows.reduce(getUnitSum, 0).toLocaleString(), "net_aff_units": total_rows.reduce(getUnitAffSum, 0).toLocaleString(), "net_ret": total_rows.reduce(getRetSum, 0).toLocaleString(),
    "net_mips": total_rows.reduce(getMipsSum, 0).toLocaleString(), "net_cie": total_rows.reduce(getCieSum, 0).toLocaleString(), "net_pdr": total_rows.reduce(getPDRSum, 0).toLocaleString(), "net_med": total_rows.reduce(getMedSum, 0).toLocaleString(), 
    "net_visit": total_rows.reduce(getVisitSum, 0).toLocaleString()};

    document.getElementById("Total").innerHTML = "Net Total Units: " + total.net_units;
    document.getElementById("Affordable").innerHTML = "Net Affordable Units: " + total.net_aff_units;
    document.getElementById("Retail").innerHTML = "Net Retail Sq Ft: " + total.net_ret;
    document.getElementById("MIPS").innerHTML = "Net Office Sq Ft: " + total.net_mips;
    document.getElementById("CIE").innerHTML = "Net Institutional Sq Ft: " + total.net_cie;
    document.getElementById("PDR").innerHTML = "Net PDR Sq Ft: " + total.net_pdr;
    document.getElementById("MED").innerHTML = "Net Medical Sq Ft: " + total.net_med;
    document.getElementById("VISIT").innerHTML = "Net Hotel Sq Ft: " + total.net_visit;


    /**********************************************
    **End Summary Statistics
    **********************************************/
    
    if (lat != '' && lon != '') {
        // decided to try this later: var markericon = L.icon({iconU'marker-icon-2x.png', iconSize: [38, 95], iconAnchor: [22, 94], popupAnchor:  [-3, -76]});
        var marker = L.marker([lat, lon]).addTo(map);
        map.setView([lat, lon], 15);
    }

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
            var markerStyle = {radius: null, fillOpacity: 1, color: '#ffffff', opacity: 1, weight: 1.5, fillColor: '#0E6698'};
            markerStyle.radius = getRadius();
            return L.circleMarker(latlng, markerStyle);
    }
    
	//on mouseover, highlight the feature hovered over
	function highlightFeature(e) {
	    var target = e.target;
	    target.setStyle({radius: getRadius()*1.2, weight: 2,}); //make radius 20% bigger when hovering, plus make outline thicker
	    target.bringToFront();
	}

	//on mouseout, reset highlighted feature's style
	function resetHighlight(e) {
	    var target = e.target;
	    target.setStyle({radius: getRadius(), color: '#ffffff'}); //reset to default settings
	}

    function onEachFeature(feature, layer) {
        layer.on({
	        mouseover: highlightFeature,
	        mouseout: resetHighlight,
    		click: clickFeature
        });
    }
    //define function to toggle project descriptions
    function change( el ) {
    if ( el.value === "Show Description" )
        el.value = "Hide Description";
    else
        el.value = "Show Description";
    $(".description").toggle();
    }
    //on click, pan/zoom to feature and show popup
    function clickFeature(e) {
        var target = e.target;
        var latlng = target._latlng;
        var props = target.feature.properties;

    	var popupContent ='<span class="popup-label"><b>' + props.address + '</b></span>' +
        '<br /><span class="popup-label">Net Units: ' + props.net_units + '</span>' +
        '<br /><span class="popup-label">Net Affordable Units: ' + props.net_aff_units + '</span>' +
        '<br /><span class="popup-label">Net Non-Res SqFt: ' + props.net_gsf.toLocaleString() + '</span>' +
        '<br /><span class="popup-label">Status: ' + props.proj_status + '</span>' +
        '<br /><span class="popup-label">Zoning: ' + props.zoning_sim + '</span>' +
        '<div id = "pano" class = "pano"></div>' +
        '<input type="button" value="Show Description" onclick="return change(this);"/>' +
        '<br /><span class="description">' + props.pln_desc + '</span>';

        var popup = L.popup({closeOnClick: false}).setContent(popupContent).setLatLng(latlng);
        target.bindPopup(popup).openPopup(); 

         //Google Panorama Element 
         var panoelement = document.getElementsByClassName("pano");
         var panorama = new google.maps.StreetViewPanorama(
         	panoelement[panoelement.length - 1], {
         		position: latlng,
         		pov: {
         			heading: 34,
         			pitch: 10
         		}, 
         		addressControl: false
         	});

    		$("button").click(function(){
    			$(".description").toggle();
    		 });
    	 //updates popup content so that toggling works when opening popup a second time in the same session. Don't understand why this fixes it, but it does. 
    	 target.updatePopup();
    }


    //Add code to download PDF Report
    
    document.getElementById('pdf_download').addEventListener('click', function() {
        leafletImage(map, downloadMap);
    });


    function downloadMap(err, canvas) {
        
        var imgData = canvas.toDataURL();
        var dimensions = {'x': 600, 'y': 600}

        var pdf = new jsPDF('p', 'pt', 'letter');

        //get place
        if (address =='') {
            if (place_status == 'None') {
                var place_report = "Citywide"
            } else {
                var place_report = place_status
            }
        } else {
            var place_report = " Within " + distance + " miles of " + address;
        }
        //get status
        if (proj_status == 'All') {
            var proj_report = "All projects";
        } else {
            var proj_report = proj_status;
        }

        //get unit bounds
        if (lower_bound != '' && upper_bound != '') {
            var unit_query = " Between " + lower_bound + " and " + upper_bound;
        } else if (lower_bound == '' && upper_bound !='') {
            var unit_query = " Less than " + upper_bound;
        } else if (lower_bound != '' && upper_bound =='') {
            var unit_query = " At least " + lower_bound;
        } else {
            var unit_query = "No filters applied";
        }

        //get affordable unit bounds
        if (afflower_bound != '' && affupper_bound != '') {
            var affunit_query = "Between " + afflower_bound + " and " + affupper_bound;
        } else if (afflower_bound == '' && affupper_bound !='') {
            var affunit_query = "Less than " + affupper_bound;
        } else if (afflower_bound != '' && affupper_bound =='') {
            var affunit_query = "At least " + afflower_bound;
        } else {
            var affunit_query = "No filters applied";
        }

        //get sq ft bounds
        if (sflower_bound != '' && sfupper_bound != '') {
            var sfquery = "Between " + sflower_bound + " and " + sfupper_bound;
        } else if (sflower_bound == '' && sfupper_bound !='') {
            var sfquery = "Less than " + sfupper_bound;
        } else if (sflower_bound != '' && sfupper_bound =='') {
            var sfquery = "At least " + sflower_bound;
        } else {
            var sfquery = "No filters applied";
        }

        pdf.setFontSize(16);
        var center = (pdf.internal.pageSize.width/2);
        var width = pdf.getStringUnitWidth('Development Pipeline Report') * pdf.internal.getFontSize() / pdf.internal.scaleFactor; //get text width
        var starting = center - (width/2);
        pdf.text(starting, 20, 'Development Pipeline Report');
        var height = pdf.getTextDimensions('Selection Characteristics').h;
        pdf.text(20, 40+height, 'Selection Characteristics');
        pdf.setFontSize(11);
        var split_place = pdf.splitTextToSize('Location: ' + place_report, 260); //260 seems like a good margin to use the text wrap functinality. It tested well.
        pdf.text(20, 40+height+20, split_place);
        var split_status = pdf.splitTextToSize('Project Status: ' + proj_report, 260);
        pdf.text(20, 40+height+50, split_status);
        var split_total = pdf.splitTextToSize('Total Units Added: ' + unit_query, 260);
        pdf.text(20, 40+height+80, split_total);
        var split_aff = pdf.splitTextToSize('Affordable Units Added: ' + affunit_query, 260);
        pdf.text(20, 40+height+110, split_aff);
        var split_sf = pdf.splitTextToSize('Non-residential Sq Ft Added: ' + sfquery, 260);
        pdf.text(20, 40+height+140, split_sf);


        var right = 292; //this seems aligned with the right edge of the table
        pdf.addImage(imgData, 'PNG', right, 40, dimensions.x * 0.5, dimensions.y * 0.5);

    	var columns = [
    	{title: "Address", dataKey: "address"},
    	{title: "Total Units", dataKey: "net_units"}, 
    	{title: "Affordable Units", dataKey: "net_aff_units"},
        {title: "Retail", dataKey: "net_ret"},
        {title: "Office", dataKey: "net_mips"},
        {title: "Institutional", dataKey: "net_cie"},
        {title: "PDR", dataKey: "net_pdr"},
        {title: "Medical", dataKey: "net_med"},
        {title: "Hotel", dataKey: "net_visit"}];


        var rows = [];

        //concatenate lists together into one master list
        var rows = rows.concat(cons_sum, cons_rows, BP_sum, BP_rows, PL_sum, PL_rows, PP_sum, PP_rows, total);

    	pdf.autoTable(columns, rows, {
    	theme: 'striped',
        drawCell: function(cell, data) {
          if (data.row.cells.address.raw === 'Under Construction' || data.row.cells.address.raw === 'Building Approved' || data.row.cells.address.raw === 'Planning Entitled' || data.row.cells.address.raw === 'Proposed' || data.row.cells.address.raw === 'Total') {
            pdf.setFillColor(102, 178, 255);
            pdf.setTextColor(255,255,255);
          }
        },
        startY: 350,
        showHeader: 'firstPage',
        styles: {overflow: 'linebreak', tableWidth: 'auto', },
        margin: 20,
        columnStyles: {address: {columnWidth: 100}}, 
    	});

        pdf.save("download.pdf");
    };
}


