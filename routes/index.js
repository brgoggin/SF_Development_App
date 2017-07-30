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
    sql.execute(query, {format: 'geojson'}).done(function(data) {
      var carto_response = JSON.parse(data);
      res.render('map', {
          jsonData: carto_response,
          sent_string: query
      }); 
    });
    
});

// GET the filtered page—commented out for now because I am using Carto API

router.get('/filter*', function (req, res) {
    var proj_status = req.query.name;
    if (proj_status == 'All') {
        var statusvar = "";
    } else {
        var statusvar = " WHERE status = '" + proj_status + "'";
    }
    var query = "SELECT * FROM current_data" + statusvar;

    var sql = new CartoDB.SQL({user:'bgoggin'})
    sql.execute(query, {format: 'geojson'}).done(function(data) {
      var carto_response = JSON.parse(data);
      res.render('map', {
          jsonData: carto_response,
          sent_string: query
      });
    });
    
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