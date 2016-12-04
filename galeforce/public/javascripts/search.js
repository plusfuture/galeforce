function searchReqErr(jqXHR, textStatus, errorThrown) {
    // add an alert box to DOM using bootstrap
}

document.addEventListener("DOMContentLoaded", function() {
    $('#searchForm').submit(function() {
            var searchText = $('#searchFormText').val();
            $.ajax({
                url: '/search',
                method: 'POST',
                contentType: 'application/json',
                data: JSON.stringify({search: searchText}),
                dataType: 'json',
                error: searchReqErr,
                success: function(data, textStatus, jqXHR) {
                    var showsDiv = $('#showsDiv');
                    showsDiv.empty();
                    var shows = data.shows;
                    console.log(JSON.stringify(shows, null, 4));
                    if (shows !== undefined) {
                        for (var i = 0; i < shows.length; i++) {
                            showsDiv.append('<h3><a href=/shows/' + shows[i].slug + '>' + 
                                shows[i].nameRomanized + '</a></h3>');
                        }
                    }
                },
            });
            return false;
        });
});
