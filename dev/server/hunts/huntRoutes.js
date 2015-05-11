var huntUtils = require('./huntUtils')

// Hunt Routes
// -----------

module.exports = function (app) { // app === huntRouter injected from middlware.js

  app.post('/new', huntUtils.addHunt, huntUtils.fns);
  app.get('/', huntUtils.getHunts, huntUtils.fns);

  console.log('loaded hunt routes');
};