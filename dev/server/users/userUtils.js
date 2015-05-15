var Users = require('./userModel');

module.exports = {

	createUser: function(req, res, next) {
		console.log(req.body);
		Users.create(req.body, function(err){
			if(err) {
				console.log('Error creating new user');
				next(err);
			} else {
				console.log('User created successfully');
				next();
			}
		});
	},

	loginUser: function(req, res, next) {
		console.log("loginUser function ", req.body);
		Users.find(req.body)
		.exec(function(err, results){
			if(err) {
				console.log('Error finding that user in DB');
				next(err);
			} else {
				console.log("this is the result of the query: ", results);
				res.queryResults = JSON.stringify(results);
				next();
			}
		})
	},

//End request with proper code and response data
	fns: function(req, res){
    if (res.queryResults) {
      res.writeHead(200);
      res.end(res.queryResults);
    } else {
      res.writeHead(201);
      res.end('userCode');
    }
  }

}