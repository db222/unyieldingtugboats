var userUtils = require('./userUtils')


module.exports = function(app){

	app.post('/newUser', userUtils.createUser, userUtils.fns);

	app.post('/loginUser', userUtils.loginUser, userUtils.fns);

	console.log('accessed the user routes');
};