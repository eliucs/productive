var date = document.getElementById("#date");



function getDateText() {
    var monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];

    var date = new Date();
    var month = date.getMonth();
    var day = date.getDate();
    var year = date.getFullYear();
    return monthNames[month] + " " + day + ", " + year;
}