var city = '';
var regionName = '';

$(document).ready(function() {

    $.get("http://freegeoip.net/json/", function (response) {
        $("#location").html(response.city + ", " + getRegionCode(response.region_name));
        city = response.city;
        regionName = response.region_name;
    }, "json");

    $.simpleWeather({
        location: city + ", " + regionName,
        woeid: '',
        unit: 'c',
        success: function(weather) {
            html = weather.temp + '&deg;';
            code = parseInt(weather.code);
            condition = '';

            console.log(code);

            if (code >= 0 && code <= 2) {
                condition += '<span class="pe-7w-hurricane pe-3x pe-va"></span>';
            } else if (code === 3 || code === 4 || code === 37 || code === 38 ||
                code == 39 || code === 45 || code === 47) {
                condition += '<span class="pe-7w-lightning-rain pe-3x pe-va"></span>';
            } else if (code === 5 || code === 6) {
                condition += '<span class="pe-7w-snow pe-3x pe-va"></span>';
            } else if (code === 7 || code === 17 || code === 18 || code === 35) {
                condition += '<span class="pe-7w-hail pe-3x pe-va"></span>';
            } else if (code >= 8 && code <= 10) {
                condition += '<span class="pe-7w-drizzle pe-3x pe-va"></span>';
            } else if (code === 11 || code === 12 || code === 40) {
                condition += '<span class="pe-7w-rain-alt pe-3x pe-va"></span>';
            } else if (code >= 13 && code <= 16 || code === 25 || code === 41 ||
                code === 42 || code === 43 || code === 46) {
                condition += '<span class="pe-7w-snow-alt pe-3x pe-va"></span>';
            } else if (code >= 19 && code <= 23) {
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

/**
 * getFullRegionName returns the location
 *
 * @returns {string} the location in City, Region format
 */
function getFullRegionName () {
    return city + ", " + regionName;
}

/**
 * getRegionCode returns the province/territory/state's region code
 * NOTE: needs to be phased to use third party library to get
 * all international region codes
 *
 * @param {String} regionName - the name of the province/territory/state
 * @returns {String} the two letter regional code
 */
function getRegionCode(regionName) {
    switch (regionName) {
        case 'Ontario':
            return 'ON';
            break;
        case 'Quebec':
            return 'QC';
            break;
        case 'Nova Scotia':
            return 'NS';
            break;
        case 'New Brunswick':
            return 'NB';
            break;
        case 'Manitoba':
            return 'MB';
            break;
        case 'British Columbia':
            return 'BC';
            break;
        case 'Prince Edward Island':
            return 'PE';
            break;
        case 'Saskatchewan':
            return 'SK';
            break;
        case 'Alberta':
            return 'AB';
            break;
        case 'Newfoundland and Labrador':
            return 'NB';
            break;
        case 'Northwest Territories':
            return 'NT';
            break;
        case 'Yukon':
            return 'YT';
            break;
        case 'Nunavut':
            return 'NU';
            break;
        default:
            return regionName.substr(0, 2).toUpperCase();
            break;
    }
}
