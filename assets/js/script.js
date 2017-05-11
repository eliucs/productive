$(document).ready(function() {

    var ProductiveData = {};

    (function () {
        if (Modernizr.localstorage) {
            console.log(SUCCESS_LOCAL_STORAGE);
            if (localStorage['ProductiveData']) {
                ProductiveData = JSON.parse(localStorage['ProductiveData']);
                console.log(SUCCESS_DATA_LOADED);
            } else {
                var cache = {
                        'numTasks': 0,
                        'taskData': [],
                        'noteText': '',
                        'totalTasksCreated': 0,
                        'totalTasksCompleted': 0,
                        'totalTasksDeleted': 0,
                        'buttonLinkID': 0,
                        'numLinks': 0,
                        'linkData': []
                    };

                ProductiveData = cache;
                localStorage['ProductiveData'] = JSON.stringify(cache);
                console.log(SUCCESS_NEW_DATA_LOADED);
            }
        } else {
            // TO-DO: Handle case where user's browser
            // does not have LocalStorage compatibility
            console.log(ERROR_LOCAL_STORAGE);
        }
    })();


    function displayLinks() {
        var numLinks = ProductiveData['numLinks'];

        if (!numLinks) {
            $('#empty-links').css('display', 'block');
        } else {
            $('#empty-links').css('display', 'none');
            var html = '';

            for (var i = 0; i < numLinks; i++) {
                html += '<div class="col-md-3 quick-access-link" id="' + ProductiveData['linkData'][i]['id'] + '">';
                html += '<a class="access-link" href="' + ProductiveData['linkData'][i]['url'] + '">';
                html += '<div class="access-item">';
                html += '<div class="access-item-title">' + ProductiveData['linkData'][i]['title'] + '</div>';
                html += '<div class="access-item-desc">' + ProductiveData['linkData'][i]['desc'] + '</div>';
                html += '</div></a></div>';
            }

            $('#quick-access').html(html);
        }
    }
    displayLinks();


    function displayCurrentLinks() {
        var numLinks = ProductiveData['numLinks'];

        if (!numLinks) {
            $('#empty-current-links').css('display', 'block');
        } else {
            $('#empty-current-links').css('display', 'none');
            var html = '';

            for (var i = 0; i < numLinks; i++) {
                html += '<li class="list-group-item">';
                html += '<button class="btn btn-default current-links-close" value="' + ProductiveData['linkData'][i]['id'] + '"><i class="fa fa-close" aria-hidden="true"></i></button>';
                html += '<div class="current-links-item">' + ProductiveData['linkData'][i]['title'] + '</div></li>';
            }

            $('#current-links').html(html);
        }
    }
    displayCurrentLinks();


    function timeAppendZero(i) {
        if (i < 10) { i = "0" + i }
        return i;
    }


    function updateTime() {
        var time = new Date();
        var hour = time.getHours();
        var ampm = hour >= 12 ? 'PM' : 'AM';
        hour = hour > 12 ? hour - 12 : hour;
        hour = hour === 0 ? 12 : hour;
        var min = time.getMinutes();
        min = timeAppendZero(min);
        $("#time").html(hour + ':' + min + ' ' + ampm);
        time = setTimeout(function () {
            updateTime();
        }, 500);
    }
    updateTime();


    function updateDate() {
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        var date = new Date();
        var month = date.getMonth();
        var day = date.getDate();
        var year = date.getFullYear();
        $('#date').html(monthNames[month] + ' ' + day + ', ' + year);
    }
    updateDate();


    // Triggers Google Search on 'Enter' key pressed
    $('#search-bar').keypress(function(e){
        if (e.which == KEY_ENTER) {
            var searchText = $('#search-bar').val();
            searchText = encodeURIComponent(searchText.toLowerCase());

            if (searchText) {
                console.log(SUCCESS_SEARCH + searchText);
                window.location.href = URL_GOOGLE + searchText;
            } else {
                console.log(ERROR_SEARCH);
            }
        }
    });


    $('#notifications-tab').click(function() {
        $('#notifications-tab').addClass('active');
        $('#task-tab').removeClass('active');
        $('#notes-tab').removeClass('active');
        $('#analytics-tab').removeClass('active');
        $('#notifications-container').show();
        $('#tasks-container').hide();
        $('#notes-container').hide();
        $('#analytics-container').hide();
    });

    $('#task-tab').click(function() {
        $('#notifications-tab').removeClass('active');
        $('#task-tab').addClass('active');
        $('#notes-tab').removeClass('active');
        $('#analytics-tab').removeClass('active');

        $('#notifications-container').hide();
        $('#tasks-container').show();
        $('#notes-container').hide();
        $('#analytics-container').hide();

    });

    $('#notes-tab').click(function() {
        $('#notifications-tab').removeClass('active');
        $('#task-tab').removeClass('active');
        $('#notes-tab').addClass('active');
        $('#analytics-tab').removeClass('active');

        $('#notifications-container').hide();
        $('#tasks-container').hide();
        $('#notes-container').show();
        $('#analytics-container').hide();
    });


    // Analytics Tab
    $('#analytics-tab').click(function() {
        $('#notifications-tab').removeClass('active');
        $('#task-tab').removeClass('active');
        $('#notes-tab').removeClass('active');
        $('#analytics-tab').addClass('active');

        $('#notifications-container').hide();
        $('#tasks-container').hide();
        $('#notes-container').hide();
        $('#analytics-container').show();

        $('#total-tasks-created').html(ProductiveData['totalTasksCreated']);
        $('#total-tasks-completed').html(ProductiveData['totalTasksCompleted']);
        $('#total-tasks-deleted').html(ProductiveData['totalTasksDeleted']);
    });


    $.get('http://freegeoip.net/json/', function(response) {
        var city = response.city;
        var regionName = getRegionCode(response.region_name);
        $('#location').html(city + ", " + regionName);
    }, 'jsonp');


    $('#manage-open').click(function() {
        $('.manage-close').css('display', 'block');
        $('.manage-container').fadeIn();
    });


    $('#manage-close').click(function() {
        $('.manage-close').css('display', 'none');
        $('.manage-container').fadeOut();
    });


    // Changes LocalStorage
    $('#link-button').click(function() {
        var numLinks = ProductiveData['numLinks'];
        var newLinkURL = $('#link-url').val();
        var newLinkTitle = $('#link-title').val();
        var newLinkDesc = $('#link-desc').val();
        var newID = ProductiveData['buttonLinkID'];

        if (newLinkURL && newLinkTitle && newLinkDesc) {
            if (numLinks == MAX_NUM_LINKS) {
                $('.manage-error').css('display', 'block');
                console.log(ERROR_MAX_NUM_LINKS);
            } else {
                $('.manage-error').css('display', 'none');

                // TO-DO: Convert newLinkURL, newLinkTitle and newLinkDesc
                // to HTML safe strings

                ProductiveData['linkData'].push({
                    'id': newID,
                    'url': newLinkURL,
                    'title': newLinkTitle,
                    'desc': newLinkDesc
                });

                ProductiveData['buttonLinkID']++;
                ProductiveData['numLinks']++;

                localStorage['ProductiveData'] = JSON.stringify(ProductiveData);
                displayLinks(); // Update links
                displayCurrentLinks(); // Update current links

                $('.current-links-close').click(function() {
                    $(this).prop('disabled', true);
                    $(this).css('cursor', 'default');

                    var numLinks = ProductiveData['numLinks'];
                    var id = $(this).attr('value');

                    // Remove from Current Links
                    $(this).closest('.list-group-item').fadeOut(250);

                    ProductiveData['linkData'] = $.grep(ProductiveData['linkData'], function(e) {
                        return e['id'] != id;
                    });

                    ProductiveData['numLinks']--;

                    // Refresh Quick Access
                    $('.quick-access-link').each(function() {
                        $(this).hide();
                    });

                    if (ProductiveData['numLinks'] == 0) {
                        $('#empty-current-links').css('display', 'block');
                    } else {
                        $('#empty-current-links').css('display', 'none');
                    }

                    displayLinks();

                    localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

                    console.log(SUCCESS_DELETE_LINK + id);
                });

                console.log(SUCCESS_NEW_LINK + newID + ', ' + newLinkURL + ', ' + newLinkTitle + ', ' + newLinkDesc);
            }
        } else {
            console.log(ERROR_NEW_LINK);
        }
    });

});