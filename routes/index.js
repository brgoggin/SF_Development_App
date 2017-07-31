var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine
var json2csv = require('json2csv');
var jquery = require('jQuery');
var CartoDB = require('cartodb');

//I comment the below section out because I am opting to use Carto PostGIS for now instead.

// PostgreSQL and PostGIS module and connection setup 
var pg = require("pg"); // require Postgres module

// Setup connection
var username = "briangoggin" // sandbox username
var password = "" // read only privileges on our table
var host = "localhost"
var database = "briangoggin" // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

//initialize data here so that we make it global in scope for this file
var data = null;

// GET the map page 
router.get('/map', function(req, res) {
    var sql = new CartoDB.SQL({user:'bgoggin'})
    var query = "SELECT * FROM current_data";
    var status_select = "All"; //start with all to start
    var place = "All"; //start with all to start
    sql.execute(query, {format: 'geojson'}).done(function(data) {
      var layer_response = 'All'; //string meant as filler here since no polygon layer sent to client.
      var carto_response = JSON.parse(data);
      res.render('map', {
          jsonData: carto_response,
          layerData: layer_response,
          sent_string: query,
          lower_bound: '',
          upper_bound: '',
          status_select: status_select,
          place_select: place
      }); 
    });
    
});

// GET the filtered page—commented out for now because I am using Carto API

router.get('/filter*', function (req, res) {
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
    
    var proj_status = req.query.name;
    if (proj_status == 'All') {
        var statusvar = "";
    } else {
        var statusvar = " AND status = '" + proj_status + "'";
    }
    
    //Get place filter
    var place_response = req.query.place;
    var place = JSON.parse(place_response).placename;
    var type = JSON.parse(place_response).type;
    
    //Get correct variable name
    if (type=='neighborhoods_41') {
        var var_name = 'nhood';
    }
    else if (type == 'pdas') {
        var var_name = 'name';
    }
    else if (type == 'area_plans') {
        var var_name = 'planarea';
    }
    else if (type == 'supervisor_districts') {
        var var_name = 'supdist';
    }

    if (place == 'All') {
        var placevar = "(SELECT * FROM table_41_neighborhoods)";
    } else {
        var placevar = "(SELECT * FROM " + type + " WHERE " + var_name + " = '" + place + "')";
    }
    
    var combined_query = "SELECT cd.address, cd.net_units, cd.status, cd.zoning_sim, cd.pln_desc, cd.net_aff_units, cd.net_gsf, cd.net_ret, cd.net_mips, cd.net_cie, cd.net_pdr, cd.net_med, cd.net_visit, cd.the_geom FROM current_data AS cd, " + placevar + " AS dd_nc WHERE ST_Intersects(cd.the_geom, dd_nc.the_geom) " + unit_query  + statusvar;
    
    var sql_layer = new CartoDB.SQL({user:'bgoggin'});
    var layer_response = 'hello2'; //initialize layer_response outside of the function below
    var sql = new CartoDB.SQL({user:'bgoggin'})
    
    //Select layers to send to client. If user selects a specific place, send that polygon and intersecting points layer to client. If not, just send the points layer to the client. 
    if (place !='All') {
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
                  status_select: proj_status,
                  place_select: place
              });
            });
        });
    } else {
        sql.execute(combined_query, {format: 'geojson'}).done(function(data2) {
          var layer_response = 'All'; //string meant as filler here since no polygon layer sent to client.
          var carto_response = JSON.parse(data2);
          res.render('map', {
              jsonData: carto_response,
              layerData: layer_response,
              sent_string: combined_query,
              lower_bound: lower_bound,
              upper_bound: upper_bound,
              status_select: proj_status,
              place_select: place
          });
        });
    }
    
});


router.get('/csv_export', function(req, res, next) {
    var query = req.query.lastname;
    
    var sql = new CartoDB.SQL({user:'bgoggin'})
    
    sql.execute(query, {format: 'geojson'}).done(function(data) {
      var carto = JSON.parse(data);
      var myArray=[];

      for (i = 0; i < carto.features.length; i++) {
          var myObject = {'Address': carto.features[i].properties.address, 'Net Units': carto.features[i].properties.net_units, 'Status': carto.features[i].properties.status};
          myArray.push(myObject);
      }
      var fields = ['Address', 'Net Units', 'Status'];
      var csv = json2csv({data: myArray, fields: fields});
      res.setHeader('Content-disposition', 'attachment; filename=data.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(csv);
      });

});

module.exports = router;