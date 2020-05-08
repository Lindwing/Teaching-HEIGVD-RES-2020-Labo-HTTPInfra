var Chance = require('chance');
var chance = new Chance();

var express = require('express');
var app = express();

app.get('/', function(req, res) {
	res.send(generateCities());
});

app.listen(3000, function(){
	console.log('Accepting HTTP requests on port 3000!');
});


function generateCities(){
	var numberOfCities = chance.integer({
		min: 1,
		max: 10
	});
	console.log(numberOfCities);
	var cities = [];
	for (var i = 0; i < numberOfCities; ++i){
		var foundation = chance.year({
			min: 1067,
			max: 1947
		});
		cities.push({
			name: chance.city(),
			country: chance.country({full: true}),
			foundation: foundation,
			coordinates: chance.coordinates()
		});
	};
	console.log(cities);
	return cities;
}
			