var showAvgRating = new Rating({
    _id: "showAvgRating",
    field: $('.rating-container-showAvg'),
    defaultRating: $('#showAvgRatingNum').html(),
    onSelect: function(rating) {
        alert(rating);
    },
    readOnly: true
});

var usrRating = new Rating({
    _id: "usrRating",
    field: $('.rating-container-usrRating'),
    defaultRating: $('#usrRatingNum').html(),
    onSelect: function(rating) {
        alert(rating);
    }
});
