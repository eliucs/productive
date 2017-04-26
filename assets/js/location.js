$.get("http://freegeoip.net/json/", function (response) {
    $("#location").html(response.city + ", " + getRegionName(response.region_name));
}, "jsonp");
