$(document).ready(function() {

    /**
     * timeAppendZero appends a '0' to the number if it
     * is less than 10
     *
     * @param {Number} i - The number
     * @returns {String} The number with a '0' appended to the front
     */
    function timeAppendZero(i) {
        if (i < 10) { i = "0" + i }
        return i;
    }

    /**
     * updateTime changes the time div element to the current time
     *
     */
    function updateTime() {
        var time = new Date();
        var hour = time.getHours();
        var min = time.getMinutes();
        hour = timeAppendZero(hour);
        min = timeAppendZero(min);
        $("#time").html(hour + ":" + min);
        time = setTimeout(function () {
            updateTime()
        }, 500);
    }
    updateTime();

    /**
     * updateDate changes the date div element to the current date
     *
     * @returns {string} The date formatted in Month Day, Year format
     */
    function updateDate() {
        var monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        var date = new Date();
        var month = date.getMonth();
        var day = date.getDate();
        var year = date.getFullYear();
        return monthNames[month] + " " + day + ", " + year;
    }
    $("#date").html(getDateText());

});


