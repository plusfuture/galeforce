document.addEventListener('DOMContentLoaded', function(event) {
    var slug = $('#showSlug').html();
    slug = $.trim(slug);
    console.log(slug);

    var showAvgRating = new Rating({
        _id: "showAvgRating",
        field: $('.rating-container-showAvg'),
        defaultRating: $('#showAvgRatingNum').html(),
        onSelect: function(rating) {
            // read only, do nothing
        },
        readOnly: true
    });

    var usrRating = new Rating({
        _id: "usrRating",
        field: $('.rating-container-usrRating'),
        defaultRating: $('#usrRatingNum').html(),
        onSelect: function(rating) {
            console.log(rating);
            console.log(typeof rating);
            $.ajax({
                url: "/shows/" + slug + "/rate",
                contentType: "application/json",
                method: "POST",
                data: JSON.stringify({usrRating: rating}),
                dataType: "json",
                success: function(data, textStatus, jqXHR) {
                    showAvgRating.set(parseInt(data.newAvg, 10));
                }
            });
        }
    });
});

