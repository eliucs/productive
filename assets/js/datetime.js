function getDateText() {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    var date = new Date();
    var month = date.getMonth();
    var day = date.getDate();
    var year = date.getFullYear();
    return monthNames[month] + " " + day + ", " + year;
}

/*
function startTime() {
    var time = new Date();
    var hour = time.getHours();
    var min = time.getMinutes();

    if (min < 10) {
        min = "0" + min;
    }

    document.getElementById('time').innerHTML = h + ":" + m;
    t = setTimeout(function () {
        startTime()
    }, 500);
}

startTime();*/
