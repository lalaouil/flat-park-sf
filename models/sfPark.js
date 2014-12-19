module.exports = function () {
	var request = require("request");
	return {
		name: "sfPark",
		sfParkURL: "https://publicdata-parking.firebaseio.com/san_francisco.json",
		getData: function(done) {
			request(this.sfParkURL, function(err, res, body){
				var data = JSON.parse(body);
				var results = {};
				results.garages = [];
				console.log()
				for(var key in data.garages) {
					results.garages.push({
						location: data.garages[key].points,
						hours: data.garages[key].hours,
						name: key
					})
				}
				results.streets = []
				for(var key in data.streets) {
					results.streets.push({
						location: data.streets[key].points,
						rate: data.streets[key].rates,
						name: key
					})
				}

				done(results);
			});
		}
	}
}