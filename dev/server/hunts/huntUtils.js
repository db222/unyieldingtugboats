var Hunts = require('./huntModel');

module.exports = {

  // Hunt Helper Functions
  // ---------------------

  // Get a list of hunts from the database, optional zip code, limit 10
  // curl -i http://localhost:3000/api/hunts
  // OR
  // curl -i http://localhost:3000/api/hunts?zip=94536
  getHunts: function(req, res, next) {
    var queryObj = {};
    if (req.query.zip) {
      queryObj = {region: req.query.zip};
      //retrieve hunts in specified zipcode
      Hunts.find(queryObj)
           .limit(10)
           .exec(function(err, results) { 
              if (err) {
                console.log('Error fetching from Hunts DB');
                next(err);
              } else {
                res.queryResults = JSON.stringify(results);
                next();
              }
            });
    } else {
      //retrieve most recently added hunts
      Hunts.find({})
           .limit(10)
           .sort({date: -1})
           .exec(function(err, results) { 
              if (err) {
                console.log('Error fetching from Hunts DB');
                next(err);
              } else {
                res.queryResults = JSON.stringify(results);
                next();
              }
            });
    }

  },

  // Add a new hunt to the database
  // curl -H "Content-Type: application/json" -X POST -d '{"info" : "infos about hunt", "region" : 94536, "tags" : [ "tag", "another tag" ], "photos" : [ "photo1_id", "photo2_id" ]}' http://localhost:3000/api/hunts/new
  addHunt: function(req, res, next) {
    console.log(req.body);
     Hunts.create(req.body, function(err) {
       if (err) {
         console.log('Error creating new hunt');
         next(err);
       } else {
         console.log('hunt was added');
         next();
       }
    });
  },

  // End request with proper code and response data
  fns: function(req, res){

    if (res.queryResults) {

      res.writeHead(200);
      res.end(res.queryResults);

    } else {

      res.writeHead(201);
      res.end('Successfully added your hunt');

    }

  }
}
