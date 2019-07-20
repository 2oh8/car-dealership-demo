var server = require('./config/dev-server').server
console.log(server)
let mongoose = require('mongoose')
let connection = mongoose.connection;

// Establishes MongoDb Connection
mongoose.connect(process.env.CONNECTIONSTRING, {
	keepAlive: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
	useNewUrlParser: true
});

connection.on('error', console.error.bind(console, 'connection error:'))

connection.once('open', function () {
	server.listen(process.env.PORT, function () {
		console.log(`Running on port: ${process.env.PORT}`);
	})
});