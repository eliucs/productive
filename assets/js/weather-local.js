$(document).ready(function() {
    $.simpleWeather({
        location: 'Toronto, ON',
        woeid: '',
        unit: 'c',
        success: function(weather) {
            html = weather.temp + '&deg;';
            code = parseInt(weather.code);
            condition = '';

            console.log(typeof code);

            if (code >= 0 && code <= 2) {
                condition += '<span class="pe-7w-hurricane pe-3x pe-va"></span>';
            } else if (code === 3 || code === 4 || code === 37 || code === 38 || code == 39 || code === 45 || code === 47) {
                condition += '<span class="pe-7w-lightning-rain pe-3x pe-va"></span>';
            } else if (code === 5 || code === 6) {
                condition += '<span class="pe-7w-snow pe-3x pe-va"></span>';
            } else if (code === 7 || code === 17 || code === 18 || code === 35) {
                condition += '<span class="pe-7w-hail pe-3x pe-va"></span>';
            } else if (code >= 8 && code <= 10) {
                condition += '<span class="pe-7w-drizzle pe-3x pe-va"></span>';
            } else if (code === 11 || code === 12 || code === 40) {
                condition += '<span class="pe-7w-rain-alt pe-3x pe-va"></span>';
            } else if (code >= 13 && code <= 16 || code === 25 || code === 41 || code === 42 || code === 43 || code === 46) {
                condition += '<span class="pe-7w-snow-alt pe-3x pe-va"></span>';
            } else if (code >= 19 || code <= 23) {
                condition += '<span class="pe-7w-fog pe-3x pe-va"></span>';
            } else if (code === 24) {
                condition += '<span class="pe-7w-wind pe-3x pe-va"></span>';
            } else if (code >= 26 && code <= 28 || code === 44) {
                condition += '<span class="pe-7w-cloud pe-3x pe-va"></span>';
            } else if (code === 29) {
                condition += '<span class="pe-7w-cloud-moon pe-3x pe-va"></span>';
            } else if (code === 30) {
                condition += '<span class="pe-7w-cloud-sun pe-3x pe-va"></span>';
            } else if (code === 31 || code === 33) {
                condition += '<span class="pe-7w-moon pe-3x pe-va"></span>';
            } else if (code === 32 || code === 34 || code === 36) {
                condition += '<span class="pe-7w-sun pe-3x pe-va"></span>';
            } else {
                condition += '<span class="pe-7w-cloud-sun pe-3x pe-va"></span>';
            }

            html += condition;

            $("#weather").html(html);
        },
        error: function(error) {
            $("#weather").html('<p>'+error+'</p>');
        }
    });
});
