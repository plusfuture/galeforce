var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    passportLocalMongoose = require('passport-local-mongoose');

var User = new Schema({
    // future fields could include MAL account for auto-integration
    email: String,
    ratings: [{
        rating: Number,
        showID: Number,
    }],
    recs: [{
        expectedRating: Number,
        showID: Number,
    }],
});

User.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', User);
