var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine
var json2csv = require('json2csv');
var CartoDB = require('cartodb');
var NodeGeocoder = require('node-geocoder');
var dummy = require('./key.json');


//initialize data here so that we make it global in scope for this file
var data = null;
var dataset = 'q12018';
var cartouser = 'bgoggin';

//first, specify FAQ page
router.get('/map/faq', function(req, res, next) {
    res.render('faq');
});

// GET the map page 
router.get('/map', function(req, res) {
    var sql = new CartoDB.SQL({user: cartouser})
    var query = "SELECT * FROM " + dataset;
    var status_select = "All"; //start with all to start
    var place = "None"; //start with none to start
    var address = '';
    var distance = '';
    sql.execute(query, {format: 'geojson'}).done(function(data) {
      var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
      var carto_response = JSON.parse(data);
      res.render('map', {
          jsonData: carto_response,
          layerData: layer_response,
          sent_string: query,
          lower_bound: '',
          upper_bound: '',
          afflower_bound: '',
          affupper_bound: '',
          sflower_bound: '',
          sfupper_bound: '',
          status_select: status_select,
          place_select: place,
          address: address,
          distance: distance
      }); 
    });
});


// GET the filtered page—commented out for now because I am using Carto API

router.get('/filter*', function (req, res) {
    //Grab Net Units input
    var lower_bound = req.query.lower_bound;
    var upper_bound = req.query.upper_bound;
    if (lower_bound != '' && upper_bound != '') {
        var unit_query = "AND net_units BETWEEN " + lower_bound.toString() + " AND " + upper_bound.toString();
    } else if (lower_bound == '' && upper_bound !='') {
        var unit_query = "AND net_units <= " + upper_bound.toString();
    } else if (lower_bound != '' && upper_bound =='') {
        var unit_query = "AND net_units >= " + lower_bound.toString();
    } else {
        var unit_query = "";
    }
    
    //Grab Net Affordable Units Input
    var afflower_bound = req.query.afflower_bound;
    var affupper_bound = req.query.affupper_bound;
    if (afflower_bound != '' && affupper_bound != '') {
        var affunit_query = "AND net_aff_units BETWEEN " + afflower_bound.toString() + " AND " + affupper_bound.toString();
    } else if (afflower_bound == '' && affupper_bound !='') {
        var affunit_query = "AND net_aff_units <= " + affupper_bound.toString();
    } else if (afflower_bound != '' && affupper_bound =='') {
        var affunit_query = "AND net_aff_units >= " + afflower_bound.toString();
    } else {
        var affunit_query = "";
    }
    
    //Grab Net Square Footage Input
    var sflower_bound = req.query.sflower_bound;
    var sfupper_bound = req.query.sfupper_bound;
    if (sflower_bound != '' && sfupper_bound != '') {
        var sfquery = "AND net_gsf BETWEEN " + sflower_bound.toString() + " AND " + sfupper_bound.toString();
    } else if (sflower_bound == '' && sfupper_bound !='') {
        var sfquery = "AND net_gsf <= " + sfupper_bound.toString();
    } else if (sflower_bound != '' && sfupper_bound =='') {
        var sfquery = "AND net_gsf >= " + sflower_bound.toString();
    } else {
        var sfquery = "";
    }
    
    //Grab Project Status Input
    var proj_status = req.query.name;
    if (proj_status == 'All') {
        var statusvar = "";
    } else {
        var statusvar = " AND proj_status = '" + proj_status + "'";
    }
    
    //Get place filter
    var place_response = req.query.place;
    var place = JSON.parse(place_response).placename;
    var type = JSON.parse(place_response).type;
    place = place.replace(/&#39;/g, "'");
    
    //Get correct variable name
    if (type=='neighborhoods_41') {
        var var_name = 'nhood';
    }
    else if (type == 'pdas') {
        var var_name = 'name';
    }
    else if (type == 'planning_areas') {
        var var_name = 'planarea';
    }
    else if (type == 'supervisor_districts') {
        var var_name = 'supdist';
    }
    else if (type == 'current_planning_quad') {
        var var_name = 'quad';
    }
    else if (type == 'agg_taz') {
        var var_name = 'fullname';
    }
    else if (type=='better_market_street') {
        var var_name='name'
    }
    else if (type=='bart_buffer') {
        var var_name='name'
    }
    else if (type=='muni_buffer') {
        var var_name='name'
    }

    if (place == 'None') {
        var placevar = "(SELECT * FROM neighborhoods_41)";
    } else {
        var placevar = "(SELECT * FROM " + type + " WHERE " + var_name + " = '" + place + "')";
    }
    
    //for Q4 2017, got rid of zoning information from the below query because no zoning information in that quarter
    var combined_query = "SELECT cd.address, cd.net_units, cd.proj_status, cd.bp_desc, cd.net_aff_units, cd.net_gsf, cd.net_ret, cd.net_mips, cd.net_cie, cd.net_pdr, cd.net_med, cd.net_visit, cd.the_geom FROM " + dataset + " AS cd, " + placevar + " AS dd_nc WHERE ST_Intersects(cd.the_geom, dd_nc.the_geom) " + unit_query + affunit_query + sfquery + statusvar;
    
    var sql_layer = new CartoDB.SQL({user:cartouser});
    var layer_response = 'hello2'; //initialize layer_response outside of the function below
    var sql = new CartoDB.SQL({user:cartouser})
    //Geocoder variables if User Selects Distance and Address. Address sql search in conditional clause below.
    var address = req.query.address;
    var distance = req.query.distance;
    var lat = ''; //initialize lat and lon
    var lon = '';
    
    var address_layer = new CartoDB.SQL({user:cartouser});
    console.log(combined_query);
    //Select layers to send to client. If user selects a specific place, send that polygon and intersecting points layer to client. If not, just send the points layer to the client. 
    if (place =='None' && (address !="" && distance =="")) {
        sql.execute(combined_query, {format: 'geojson'}).done(function(data2) {
          var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
          var carto_response = JSON.parse(data2);
          res.render('map', {
              jsonData: carto_response,
              layerData: layer_response,
              sent_string: combined_query,
              lower_bound: lower_bound,
              upper_bound: upper_bound,
              afflower_bound: afflower_bound,
              affupper_bound: affupper_bound,
              sflower_bound: sflower_bound,
              sfupper_bound: sfupper_bound,
              status_select: proj_status,
              place_select: place,
              address: address, 
              distance: distance,
              lat: lat,
              lon: lon
          });
        });
    } else if (place == 'None' && (address =="" && distance != "")) {
        sql.execute(combined_query, {format: 'geojson'}).done(function(data2) {
          var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
          var carto_response = JSON.parse(data2);
          res.render('map', {
              jsonData: carto_response,
              layerData: layer_response,
              sent_string: combined_query,
              lower_bound: lower_bound,
              upper_bound: upper_bound,
              afflower_bound: afflower_bound,
              affupper_bound: affupper_bound,
              sflower_bound: sflower_bound,
              sfupper_bound: sfupper_bound,
              status_select: proj_status,
              place_select: place,
              address: address, 
              distance: distance,
              lat: lat,
              lon: lon
          });
        });
    } else if (place == 'None' && address !="" && distance != "")  {
        var geocoder = NodeGeocoder({provider: 'google', apiKey: dummy.apikey}); //using Google geocoder API for now. 
        geocoder.geocode(address+", San Francisco", function(err, res_geo) {
            var lat = JSON.stringify(res_geo[0].latitude);
            var lon = JSON.stringify(res_geo[0].longitude);
            var conversion_factor = "*1609.34"; //convert from miles to meters
            var address_query = "SELECT * FROM " + dataset + " WHERE ST_Distance(ST_SetSRID(the_geom::geography, 4326), ST_SetSRID(ST_MakePoint(" + lon + "," + lat + ")::geography, 4326)) <= " + distance + conversion_factor + unit_query + affunit_query + sfquery + statusvar;
            
            address_layer.execute(address_query, {format: 'geojson'}).done(function(data) {
              var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
              var carto_response = JSON.parse(data);
              res.render('map', {
                  jsonData: carto_response,
                  layerData: layer_response,
                  sent_string: address_query,
                  lower_bound: lower_bound,
                  upper_bound: upper_bound,
                  afflower_bound: afflower_bound,
                  affupper_bound: affupper_bound,
                  sflower_bound: sflower_bound,
                  sfupper_bound: sfupper_bound,
                  status_select: proj_status,
                  place_select: place,
                  address: address, 
                  distance: distance,
                  lat: lat,
                  lon: lon
              });
            });
        });
    } else if (place == 'None' && address =="" && distance == "") {
        sql.execute(combined_query, {format: 'geojson'}).done(function(data2) {
          var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
          var carto_response = JSON.parse(data2);
          res.render('map', {
              jsonData: carto_response,
              layerData: layer_response,
              sent_string: combined_query,
              lower_bound: lower_bound,
              upper_bound: upper_bound,
              afflower_bound: afflower_bound,
              affupper_bound: affupper_bound,
              sflower_bound: sflower_bound,
              sfupper_bound: sfupper_bound,
              status_select: proj_status,
              place_select: place,
              address: address, 
              distance: distance,
              lat: lat,
              lon: lon
          });
        })
    } else if (place !='None' && (address !="" && distance == "")) {
        var query = "SELECT * FROM " + dataset;
        var status_select = "All"; //start with all to start
        sql.execute(query, {format: 'geojson'}).done(function(data) {
          var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
          var carto_response = JSON.parse(data);
          res.render('map', {
              jsonData: carto_response,
              layerData: layer_response,
              sent_string: query,
              lower_bound: '',
              upper_bound: '',
              afflower_bound: '',
              affupper_bound: '',
              sflower_bound: '',
              sfupper_bound: '',
              status_select: status_select,
              place_select: place,
              address: address, 
              distance: distance,
          }); 
        });
    } else if (place !='None' && (address =="" && distance != "")) {
        var query = "SELECT * FROM " + dataset;
        var status_select = "All"; //start with all to start
        sql.execute(query, {format: 'geojson'}).done(function(data) {
          var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
          var carto_response = JSON.parse(data);
          res.render('map', {
              jsonData: carto_response,
              layerData: layer_response,
              sent_string: query,
              lower_bound: '',
              upper_bound: '',
              afflower_bound: '',
              affupper_bound: '',
              sflower_bound: '',
              sfupper_bound: '',
              status_select: status_select,
              place_select: place,
              address: address, 
              distance: distance,
          }); 
        });
    } else if (place !='None' && (address !="" && distance != "")) {
        var geocoder = NodeGeocoder({provider: 'google', apiKey: dummy.apikey}); //using Google geocoder API for now. 
        geocoder.geocode(address+", San Francisco", function(err, res_geo) {
            var lat = JSON.stringify(res_geo[0].latitude);
            var lon = JSON.stringify(res_geo[0].longitude);
            var conversion_factor = "*1609.34"; //convert from miles to meters
            var address_query = "SELECT * FROM " + dataset + " WHERE ST_Distance(ST_SetSRID(the_geom::geography, 4326), ST_SetSRID(ST_MakePoint(" + lon + "," + lat + ")::geography, 4326)) <= " + distance + conversion_factor + unit_query + affunit_query + sfquery + statusvar;
            
            address_layer.execute(address_query, {format: 'geojson'}).done(function(data) {
              var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
              var carto_response = JSON.parse(data);
              res.render('map', {
                  jsonData: carto_response,
                  layerData: layer_response,
                  sent_string: address_query,
                  lower_bound: lower_bound,
                  upper_bound: upper_bound,
                  afflower_bound: afflower_bound,
                  affupper_bound: affupper_bound,
                  sflower_bound: sflower_bound,
                  sfupper_bound: sfupper_bound,
                  status_select: proj_status,
                  place_select: place,
                  address: address, 
                  distance: distance,
                  lat: lat,
                  lon: lon
              });
            });
        });
    } else if (place !='None' && (address =="" && distance == "")) {
        var layer_query = "SELECT the_geom FROM " + type + " WHERE " + var_name + " = '" + place + "'";
        sql_layer.execute(layer_query, {format: 'geojson'}).done(function(data) {
            layer_response = JSON.parse(data);
            sql.execute(combined_query, {format: 'geojson'}).done(function(data2) {
              var carto_response = JSON.parse(data2);
              res.render('map', {
                  jsonData: carto_response,
                  layerData: layer_response,
                  sent_string: combined_query,
                  lower_bound: lower_bound,
                  upper_bound: upper_bound,
                  afflower_bound: afflower_bound,
                  affupper_bound: affupper_bound,
                  sflower_bound: sflower_bound,
                  sfupper_bound: sfupper_bound,
                  status_select: proj_status,
                  place_select: place, 
                  address: address, 
                  distance: distance,
                  lat: lat,
                  lon: lon
              });
            });
        });
    }
});


router.get('/csv_export', function(req, res, next) {
    var query = req.query.export_query;
    
    var sql = new CartoDB.SQL({user:cartouser})
    
    sql.execute(query, {format: 'geojson'}).done(function(data) {
      var carto = JSON.parse(data);
      var myArray=[];
      //console.log("Office space:" + carto.features[16].properties.net_cie);
      for (i = 0; i < carto.features.length; i++) {
          var myObject = {'Address': carto.features[i].properties.address, 'Status': carto.features[i].properties.proj_status, 
          'Net Units': carto.features[i].properties.net_units, 'Net Affordable Units': carto.features[i].properties.net_aff_units,
          'Net Retail': carto.features[i].properties.net_ret, 'Net Office': carto.features[i].properties.net_mips, 
          'Net Institutional': carto.features[i].properties.net_cie, 'Net Industrial': carto.features[i].properties.net_pdr,
          'Net Medical': carto.features[i].properties.net_med, 'Net Hotel': carto.features[i].properties.net_visit};
          myArray.push(myObject);
      }
      var fields = ['Address', 'Status','Net Units', 'Net Affordable Units', 'Net Retail', 'Net Office', 'Net Institutional', 'Net Industrial', 'Net Medical', 'Net Hotel'];
      var csv = json2csv({data: myArray, fields: fields});
      res.setHeader('Content-disposition', 'attachment; filename=data.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
      });

});

//Add extra section to capture any forwarding errors from GoDaddy that add set of random extra characters to end of URL. Send to map homepage
router.get('/*', function(req, res) {
    var sql = new CartoDB.SQL({user:cartouser})
    var query = "SELECT * FROM " + dataset;
    var status_select = "All"; //start with all to start
    var place = "None"; //start with none to start
    var address = '';
    var distance = '';
    sql.execute(query, {format: 'geojson'}).done(function(data) {
      var layer_response = 'None'; //string meant as filler here since no polygon layer sent to client.
      var carto_response = JSON.parse(data);
      res.render('map', {
          jsonData: carto_response,
          layerData: layer_response,
          sent_string: query,
          lower_bound: '',
          upper_bound: '',
          afflower_bound: '',
          affupper_bound: '',
          sflower_bound: '',
          sfupper_bound: '',
          status_select: status_select,
          place_select: place,
          address: address,
          distance: distance
      }); 
    });
});

module.exports = router;