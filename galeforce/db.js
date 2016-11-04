var mongoose = require('mongoose'),
    urlSlugs = require('mongoose-url-slugs'),
    passportLocalMongoose = require('passport-local-mongoose');

var UserShowRating = new mongoose.Schema({
    user: String,
    show: { type: mongoose.Schema.Types.ObjectID, ref: 'Show'},
    rating: Number
});

var User = new mongoose.Schema({
    shows: [{ type: mongoose.Schema.Types.ObjectID, ref:'UserShowRating'}]
});

var Show = new mongoose.Schema({
    nameEnglish: String,
    nameRomanized: String,
    ratings: [{ type: mongoose.Schema.Types.ObjectID, ref:'UserShowRating'}],
    avgRating: Number,
    synopsis: String,
    dateBegin: Date,
    dateEnd: Date
});


User.plugin(urlSlugs('username'));
Show.plugin(urlSlugs('nameRomanized'));
User.plugin(passportLocalMongoose);
