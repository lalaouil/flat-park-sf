module.exports = function () {
	var request = require("request");
	return {
		name: "sfPark",
		sfParkURL: "https://publicdata-parking.firebaseio.com/san_francisco.json",
		getData: function(done) {
			request(this.sfParkURL, function(err, res, body){
				var results = {};
				results.garages = [];
				console.log(body.garages)
				console.log("******")
				for(var key in body.garages) {
					results.garages.push({
						location: body.garages[key].points,
						name: key
					})
				}
				done(body);
			});
		}
	}
}