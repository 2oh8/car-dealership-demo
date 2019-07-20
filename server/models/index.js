var Router = require('express').Router
var models = require('../config/constants').models

let api = Router();

Object.keys(models).forEach((k) => {
	let model = models[k]

	let customRoutes = require('../custom-routes/' + model.name.toLowerCase() + '-routes')//.default kills it
	if (customRoutes) {
		Object.keys(customRoutes).forEach(k => {
			let route = customRoutes[k]
			console.log(route)
			api.route(route.path)[route.reqType](route.method)
		})
	}


});

module.exports = api