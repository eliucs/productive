$.getJSON("http://freegeoip.net/json/", function(data) {
    var country_code = data.country_code;
    var country = data.country_name;
    var ip = data.ip;
    var time_zone = data.time_zone;
    var latitude = data.latitude;
    var longitude = data.longitude;
});

$.get("http://freegeoip.net/json/", function (response) {
    $("#location").html(response.city + ", " + getRegionName(response.region_name));
    $("#details").html(JSON.stringify(response, null, 4));
}, "jsonp");