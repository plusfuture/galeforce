var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    urlSlugs = require('mongoose-url-slugs');

var Show = new Schema({
    showID: Number,
    nameEnglish: String,
    nameRomanized: String,
    ratings: [{
        userID: Number,
        rating: Number
    }],
    avgRating: Number,
    synopsis: String,
    dateStart: Date,
    dateEnd: Date,
    image: Buffer
});

Show.plugin(urlSlugs('nameRomanized showID'));

module.exports = mongoose.model('Show', Show);
