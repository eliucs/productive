$(document).ready(function() {
    var city = '';
    var regionName = '';

    $.get("http://freegeoip.net/json/", function (response) {
        $("#location").html(response.city + ", " + getRegionCode(response.region_name));
        city = response.city;
        regionName = response.region_name;
    }, "json");

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
