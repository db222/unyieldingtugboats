var huntUtils = require('./huntUtils')

// Hunt Routes
// -----------

// app === huntRouter injected from middlware.js
module.exports = function (app) { 

  app.post('/review', huntUtils.updateReview, huntUtils.fns);
  //post request to api/hunts/new will add a hunt to the database
  app.post('/new', huntUtils.addHunt, huntUtils.fns);
  //get request to api/hunts will retrieve hunts from the database
  app.get('/', huntUtils.getHunts, huntUtils.fns);

  console.log('loaded hunt routes');
};