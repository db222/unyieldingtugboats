//Configure Router Middleware
//----------------------------

var bodyParser  = require('body-parser');

module.exports = function (app, express) {

  var huntRouter = express.Router();
  var photoRouter = express.Router();
  var userRouter = express.Router();

  app.use(bodyParser.urlencoded({extended: true}));
  app.use(bodyParser.json());

  // Enable localhost to localhost connections (CORS)
  app.all('/*', function(req, res, next) {
    console.log(req.url);
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "origin, content-type, accept");
    next();
  });
  // use hunt router for all user request
  app.use('/api/hunts', huntRouter); 
  
  // use photo router for link request
  app.use('/api/photos', photoRouter);

  // use user router for logging in
  app.use('/api/users', userRouter);

  // inject our routers into their respective route files
  require('../hunts/huntRoutes.js')(huntRouter);
  require('../photos/photoRoutes.js')(photoRouter);
  require('../users/userRoutes.js')(userRouter);

  console.log('loaded middleware');
};


