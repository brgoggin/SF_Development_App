var express = require('express'); // require Express
var router = express.Router(); // setup usage of the Express router engine
var json2csv = require('json2csv');


/* PostgreSQL and PostGIS module and connection setup */
var pg = require("pg"); // require Postgres module

// Setup connection
var username = "briangoggin" // sandbox username
var password = "" // read only privileges on our table
var host = "localhost"
var database = "briangoggin" // database name
var conString = "postgres://"+username+":"+password+"@"+host+"/"+database; // Your Database Connection

var variables = "nameaddr, net_units, net_aff_units, net_ret, net_mips, net_cie, net_pdr, net_med, net_visit, beststat"

// Set up your database query to display GeoJSON
var dev_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((" + variables + ")) As properties FROM dev_pipeline As lg) As f) As fc";

//initialize data here so that we make it global in scope for this file
var data = null;

/* GET the map page */
router.get('/map', function(req, res) {
    
    var client = new pg.Client(conString); // Setup our Postgres Client
    client.connect(); // connect to the client
    var query = client.query(dev_query); // Run our Query
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    // Pass the result to the map page
    query.on("end", function (result) {
        data = result.rows[0].row_to_json // Save the JSON as variable data
        res.render('map', {
            title: "Express API", // Give a title to our page
            jsonData: data, // Pass data to the View
            name: dev_query
        });
    });
});

/* GET the filtered page */
router.get('/filter*', function (req, res) {
    
    var name = req.query.name;
    if (name.indexOf("--") > -1 || name.indexOf("'") > -1 || name.indexOf(";") > -1 || name.indexOf("/*") > -1 || name.indexOf("xp_") > -1){
        console.log("Bad request detected");
        res.redirect('/map');
        return;
    } else {
        console.log("Request passed")
        var filter_query = "SELECT row_to_json(fc) FROM ( SELECT 'FeatureCollection' As type, array_to_json(array_agg(f)) As features FROM (SELECT 'Feature' As type, ST_AsGeoJSON(lg.geom)::json As geometry, row_to_json((" + variables + ")) As properties FROM dev_pipeline As lg WHERE lg.beststat = \'" + name + "\') As f) As fc";
        var client = new pg.Client(conString);
        client.connect();
        var query = client.query(filter_query);
        query.on("row", function (row, result) {
            result.addRow(row);
        });
        query.on("end", function (result) {
            data = result.rows[0].row_to_json
            res.render('map', {
                title: "Express API",
                jsonData: data,
                name: filter_query
            });
        });
    };
    
});


router.get('/csv_export', function(req, res, next) {
    var filter_query = req.query.lastname;
    
    var data = null;
    var client = new pg.Client(conString);
    client.connect();
    var query = client.query(filter_query);
    query.on("row", function (row, result) {
        result.addRow(row);
    });
    query.on("end", function (result) {
        data = result.rows[0].row_to_json
        //res.send(data.features[0].properties.f1);
        //res.send(JSON.stringify(data));
        
        var myArray=[];

        for (i = 0; i < data.features.length; i++) {
            var myObject = {'nameaddr': data.features[i].properties.f1, 'net_units': data.features[i].properties.f2, 'beststat': data.features[i].properties.f3};
            myArray.push(myObject);
        }
        //res.send(myArray[0].nameaddr);
        var fields = ['nameaddr', 'net_units', 'beststat'];
        var csv = json2csv({data: myArray, fields: fields});
        res.setHeader('Content-disposition', 'attachment; filename=data.csv');
        res.set('Content-Type', 'text/csv');
        res.status(200).send(csv);
    });

});

router.post('/csv_export', function(req, res, next) {
    
    var data = JSON.parse(req.body.ID);
    
    var myArray=[];

    for (i = 0; i < data.features.length; i++) {
        var myObject = {'nameaddr': data.features[i].properties.f1, 'net_units': data.features[i].properties.f2, 'beststat': data.features[i].properties.f3};
        myArray.push(myObject);
    }
    //res.send(myArray[0].nameaddr);
    
    var fields = ['nameaddr', 'net_units', 'beststat'];
    var csv = json2csv({data: myArray, fields: fields});
    res.setHeader('Content-disposition', 'attachment; filename=data.csv');
    res.set('Content-Type', 'text/csv');
    res.status(200).send(csv);

});



module.exports = router;