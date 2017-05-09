$(document).ready(function() {

    // Triggers Google Search on 'Enter' key pressed
    $('#search-bar').keypress(function(e){
        if (e.which == KEY_ENTER) {
            var searchText = $('#search-bar').val();
            searchText = encodeURIComponent(searchText.toLowerCase());

            if (searchText) {
                console.log(SUCCESS_SEARCH + searchText);
                window.location.href = URL_GOOGLE + searchText;
            } else {
                console.log(ERROR_SEARCH);
            }
        }
    });


    $('#notifications-tab').click(function() {
        $('#notifications-container').css('display', 'block');
        $('#task-container').css('display', 'block');
        $('#notes-container').css('display', 'block');
        $('#analytics-container').css('display', 'block');
    });









});