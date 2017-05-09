$(document).ready(function() {


    function timeAppendZero(i) {
        if (i < 10) { i = "0" + i }
        return i;
    }

    function updateTime() {
        var time = new Date();
        var hour = time.getHours();
        var ampm = hour >= 12 ? 'PM' : 'AM';
        var min = time.getMinutes();
        min = timeAppendZero(min);
        $("#time").html(hour + ':' + min + ' ' + ampm);
        time = setTimeout(function () {
            updateTime();
        }, 500);
    }
    updateTime();

    function updateDate() {
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        var date = new Date();
        var month = date.getMonth();
        var day = date.getDate();
        var year = date.getFullYear();
        return monthNames[month] + ' ' + day + ', ' + year;
    }
    $("#date").html(updateDate());

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