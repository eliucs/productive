$(document).ready(function() {
    $.simpleWeather({
        location: 'Toronto, ON',
        woeid: '',
        unit: 'c',
        success: function(weather) {
            html = weather.temp + '&deg;';
            code = weather.code;
            condition = '';

            if (code >= 0 && code <= 2) {
                condition += '<span class="pe-7w-hurricane pe-3x pe-va"></span>';
            } else if (code >= 3 && code <= 42) {
                condition += '<span class="pe-7w-lightning-rain pe-3x pe-va"></span>';
            }

            html += condition;

            $("#weather").html(html);
        },
        error: function(error) {
            $("#weather").html('<p>'+error+'</p>');
        }
    });
});
