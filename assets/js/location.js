var city = '';
var regionName = '';

$.get("http://freegeoip.net/json/", function (response) {
    $("#location").html(response.city + ", " + getRegionCode(response.region_name));
    city = response.city;
    regionName = response.region_name;
}, "jsonp");

function getFullRegionName () {
    return city + ", " + regionName;
}
