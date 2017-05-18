// Productive Google Chrome Extension
// Copyright (c) 2017 Eric Liu (ericliu.ca)
// Website: startproductive.com
// Twitter: @startproductive

$(document).ready(function() {

    // Initialize localStorage data
    var ProductiveData = {};

    (function initializeDataStorage () {
        if (Modernizr.localstorage) {
            console.log(SUCCESS_LOCAL_STORAGE);
            if (localStorage['ProductiveData']) {
                ProductiveData = JSON.parse(localStorage['ProductiveData']);
                console.log(SUCCESS_DATA_LOADED);
            } else {
                var cache = {
                        'defaultTimeFormat': TIME_12_HR_AMPM,
                        'defaultTempUnits': 'C',
                        'numTasks': 0,
                        'taskData': {},
                        'initTasksTimestamp': [],
                        'noteText': '',
                        'totalTasksCreated': 0,
                        'totalTasksCompleted': 0,
                        'totalTasksDeleted': 0,
                        'numLinks': 0,
                        'linkData': {},
                        'initLinksTimestamp': []
                    };

                ProductiveData = cache;
                localStorage['ProductiveData'] = JSON.stringify(cache);
                console.log(SUCCESS_NEW_DATA_LOADED);
            }
        } else {
            console.log(ERROR_LOCAL_STORAGE);
        }
    })();


    // Search Bar
    $('#search-bar').keypress(function(e){

        function nav(searchText){
            if (/^(?:(?:https?|ftp):\/\/).*/i.test(searchText)) {
                window.location.href = searchText;
            } else {
                window.location.href = "http://" + searchText;
            }
        }

        // Triggers Google Search on 'Enter' key pressed
        if (e.which == KEY_ENTER) {
            var searchText = $('#search-bar').val();
            searchText = encodeURIComponent(searchText.toLowerCase());

            if (searchText) {
                var urlPattern = /^(https?:\/\/)?[^ ]+[.][^ ]+([.][^ ]+)*(\/[^ ]+)?$/i;

                console.log(SUCCESS_SEARCH + searchText);

                // Test if URL
                if (urlPattern.test(searchText)) {
                    // Navigate to URL
                    nav(searchText);
                }
                else {
                    var isQuickAccess = false;
                    // Check if searchText is a quick acess
                    for (var property in ProductiveData['linkData']) {
                        if (ProductiveData['linkData'].hasOwnProperty(property) &&
                            ProductiveData['linkData'][property]['title'].toLowerCase() == searchText.toLowerCase()) {
                                isQuickAccess = true;
                                nav(ProductiveData['linkData'][property]['url']);
                        }
                    }
                    if (!isQuickAccess) {
                        window.location.href = URL_GOOGLE + searchText;
                    }
                }
            } else {
                console.log(ERROR_SEARCH);
            }
        }
    });


    // Tasks Tab and Section
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


    (function displayTasks() {
        var numTasks = ProductiveData['numTasks'];

        if (!numTasks) {
            $('#empty-tasks').css('display', 'block');
        } else {
            $('#empty-tasks').css('display', 'none');
            var html = '';

            ProductiveData['initTasksTimestamp'] = [];

            for (var property in ProductiveData['taskData']) {
                if (ProductiveData['taskData'].hasOwnProperty(property)) {
                    html += '<div class="row task-item-row"><div class="col-md-12"><div class="input-group">';
                    html += '<input type="text" class="form-control tasks-item" value="' +
                        ProductiveData['taskData'][property]['text'] + '" disabled>';
                    html += '<span class="input-group-btn">';
                    html += '<button class="btn btn-default task-complete-button" type="button" data-timestamp="' +
                        property + '"><i class="fa fa-check" aria-hidden="true"></i></button>';
                    html += '<button class="btn btn-default task-delete-button" type="button" data-timestamp="' +
                        property + '"><i class="fa fa-times" aria-hidden="true"></i></button>';
                    html += '</span></div></div></div>';

                    ProductiveData['initTasksTimestamp'].push(property);
                }
            }

            localStorage['ProductiveData'] = JSON.stringify(ProductiveData);
            $('#tasks-items-area').append(html);
        }
    })();


    (function initializeCompleteButtons() {
        $('.task-complete-button').click(function() {
            var timestamp = $(this).attr('data-timestamp');

            $(this).prop('disabled', 'true');
            $(this).css('cursor', 'default');
            $(this).parent().parent().parent().parent().fadeOut();

            delete ProductiveData['taskData'][timestamp];

            ProductiveData['totalTasksCompleted']++;
            ProductiveData['numTasks']--;

            localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

            if (ProductiveData['numTasks'] === 0) {
                $('#empty-tasks').fadeIn();
            } else {
                $('#empty-tasks').fadeOut();
            }
        })
    })();


    (function initializeDeleteButtons() {
        $('.task-delete-button').click(function () {
            var timestamp = $(this).attr('data-timestamp');

            $(this).prop('disabled', 'true');
            $(this).css('cursor', 'default');
            $(this).parent().parent().parent().parent().fadeOut();

            delete ProductiveData['taskData'][timestamp];

            ProductiveData['totalTasksDeleted']++;
            ProductiveData['numTasks']--;

            localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

            if (ProductiveData['numTasks'] === 0) {
                $('#empty-tasks').fadeIn();
            } else {
                $('#empty-tasks').fadeOut();
            }
        });
    })();


    $('#add-task-button').click(function() {
        var timestamp = Date.now();
        var taskText = $('#add-task-bar').val();

        if (taskText) {
            $('#empty-tasks').css('display', 'none');

            var html = '';

            html += '<div class="row task-item-row"><div class="col-md-12"><div class="input-group">';
            html += '<input type="text" class="form-control tasks-item" value="' + taskText + '" disabled>';
            html += '<span class="input-group-btn">';
            html += '<button class="btn btn-default task-complete-button" type="button" data-timestamp="' + timestamp + '"><i class="fa fa-check" aria-hidden="true"></i></button>';
            html += '<button class="btn btn-default task-delete-button" type="button" data-timestamp="' + timestamp + '"><i class="fa fa-times" aria-hidden="true"></i></button>';
            html += '</span></div></div></div>';

            $('#tasks-items-area').append(html);
            $('#add-task-bar').html('');

            timestamp = String(timestamp);

            ProductiveData['taskData'][timestamp] = {
                'text': taskText
            };

            ProductiveData['totalTasksCreated']++;
            ProductiveData['numTasks']++;
            localStorage['ProductiveData'] = JSON.stringify(ProductiveData);


            $('.task-complete-button[data-timestamp="' + timestamp + '"]').click(function() {
                $(this).prop('disabled', 'true');
                $(this).css('cursor', 'default');
                $(this).parent().parent().parent().parent().fadeOut();

                delete ProductiveData['taskData'][timestamp];

                ProductiveData['totalTasksCompleted']++;
                ProductiveData['numTasks']--;

                localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

                if (ProductiveData['numTasks'] === 0) {
                    $('#empty-tasks').fadeIn();
                } else {
                    $('#empty-tasks').fadeOut();
                }
            });

            $('.task-delete-button[data-timestamp="' + timestamp + '"]').click(function() {
                $(this).prop('disabled', 'true');
                $(this).css('cursor', 'default');
                $(this).parent().parent().parent().parent().fadeOut();

                delete ProductiveData['taskData'][timestamp];

                ProductiveData['totalTasksDeleted']++;
                ProductiveData['numTasks']--;

                localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

                if (ProductiveData['numTasks'] === 0) {
                    $('#empty-tasks').fadeIn();
                } else {
                    $('#empty-tasks').fadeOut();
                }
            });
        }
    });


    // Notes Tab and Section
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

    (function initializeNotes() {
        var notes = ProductiveData['noteText'];

        if (notes) {
            $('.notes-area').html(notes);
        }
    })();

    $('.notes-area').keydown(function(e) {
        ProductiveData['noteText'] = $('.notes-area').val();
        localStorage['ProductiveData'] = JSON.stringify(ProductiveData);
    });


    // Analytics Tab and Section
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


    // Quick Access Links Section
    (function initializeLinks() {
        var numLinks = ProductiveData['numLinks'];

        if (!numLinks) {
            $('#empty-links').css('display', 'block');
        } else {
            $('#empty-links').css('display', 'none');
            var html = '';

            ProductiveData['initLinksTimestamp'] = [];

            for (var property in ProductiveData['linkData']) {
                if (ProductiveData['linkData'].hasOwnProperty(property)) {

                    html += '<div class="col-md-3 quick-access-link" data-timestamp="' + property + '">';
                    html += '<a class="access-link" href="' + ProductiveData['linkData'][property]['url'] + '">';
                    html += '<div class="access-item">';
                    html += '<div class="access-item-title">' + ProductiveData['linkData'][property]['title'] + '</div>';
                    html += '<div class="access-item-desc">' + ProductiveData['linkData'][property]['desc'] + '</div>';
                    html += '</div></a></div>';

                    ProductiveData['initLinksTimestamp'].push(property);
                }
            }

            localStorage['ProductiveData'] = JSON.stringify(ProductiveData);
            $('#quick-access').append(html);
        }
    })();


    (function initializeCurrentLinks() {
        var numLinks = ProductiveData['numLinks'];

        if (!numLinks) {
            $('#empty-current-links').css('display', 'block');
        } else {
            $('#empty-current-links').css('display', 'none');
            var html = '';

            for (var property in ProductiveData['linkData']) {
                if (ProductiveData['linkData'].hasOwnProperty(property)) {
                    html += '<li class="list-group-item">';
                    html += '<button class="btn btn-default current-links-close" data-timestamp="' + property + '"><i class="fa fa-close" aria-hidden="true"></i></button>';
                    html += '<div class="current-links-item">' + ProductiveData['linkData'][property]['title'] + '</div></li>';
                }
            }

            $('#current-links').append(html);
        }
    })();


    $('#manage-open').click(function() {
        $('.manage-close').css('display', 'block');
        $('.manage-container').fadeIn();
    });


    $('#manage-close').click(function() {
        $('.manage-close').css('display', 'none');
        $('.manage-container').fadeOut();
    });


    (function initializeDeleteLinkButtons() {
        $('.current-links-close').click(function() {
           var timestamp = $(this).attr('data-timestamp');

           $(this).prop('disabled', 'true');
           $(this).css('cursor', 'default');
           $(this).parent().fadeOut();
           $('.quick-access-link[data-timestamp="' + timestamp + '"]').fadeOut();

           delete ProductiveData['linkData'][timestamp];

           ProductiveData['numLinks']--;

           localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

           if (ProductiveData['numLinks'] === 0) {
               $('#empty-links').fadeIn();
               $('#empty-current-links').fadeIn();
           } else {
               $('#empty-links').fadeOut();
               $('#empty-current-links').fadeOut();
           }
        });
    })();


    $('#link-button').click(function() {
        var numLinks = ProductiveData['numLinks'];
        var timestamp = Date.now();
        var url = $('#link-url').val();
        var title = $('#link-title').val();
        var desc = $('#link-desc').val();

        if (url && title && desc) {
            if (numLinks === MAX_NUM_LINKS) {
                $('#manage-error').css('display', 'block');
                console.log(ERROR_MAX_NUM_LINKS);
            } else {
                $('#manage-error').css('display', 'none');
                $('#empty-links').css('display', 'none');
                $('#empty-current-links').css('display', 'none');

                var html = '';

                html += '<li class="list-group-item">';
                html += '<button class="btn btn-default current-links-close" data-timestamp="' + timestamp + '"><i class="fa fa-close" aria-hidden="true"></i></button>';
                html += '<div class="current-links-item">' + title + '</div></li>';

                $('#current-links').append(html);

                html = '';

                html += '<div class="col-md-3 quick-access-link" data-timestamp="' + timestamp + '">';
                html += '<a class="access-link" href="' + url + '">';
                html += '<div class="access-item">';
                html += '<div class="access-item-title">' + title + '</div>';
                html += '<div class="access-item-desc">' + desc + '</div>';
                html += '</div></a></div>';

                $('#quick-access').append(html);

                timestamp = String(timestamp);

                ProductiveData['linkData'][timestamp] = {
                    'url': url,
                    'title': title,
                    'desc': desc
                };

                ProductiveData['numLinks']++;
                localStorage['ProductiveData'] = JSON.stringify(ProductiveData);


                $('.current-links-close[data-timestamp="' + timestamp + '"]').click(function() {
                    $(this).prop('disabled', 'true');
                    $(this).css('cursor', 'default');
                    $(this).parent().fadeOut();
                    $('.quick-access-link[data-timestamp="' + timestamp + '"]').fadeOut();

                    delete ProductiveData['linkData'][timestamp];

                    ProductiveData['numLinks']--;

                    localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

                    if (ProductiveData['numLinks'] === 0) {
                        $('#empty-links').fadeIn();
                        $('#empty-current-links').fadeIn();
                    } else {
                        $('#empty-links').fadeOut();
                        $('#empty-current-links').fadeOut();
                    }
                });

                console.log(SUCCESS_NEW_LINK + timestamp + ', ' + url + ', ' + title + ', ' + desc);
            }
        } else {
            console.log(ERROR_NEW_LINK);
        }
    });


    // Time and Date
    function timeAppendZero(i) {
        if (i < 10) { i = "0" + i }
        return i;
    }


    (function updateTime() {
        var time = new Date();
        var hour = time.getHours();
        var ampm = hour >= 12 ? 'PM' : 'AM';

        if (ProductiveData['defaultTimeFormat'] == TIME_12_HR ||
            ProductiveData['defaultTimeFormat'] == TIME_12_HR_AMPM) {
            hour = hour > 12 ? hour - 12 : hour;
        }

        hour = hour === 0 ? 12 : hour;
        var min = time.getMinutes();
        min = timeAppendZero(min);

        if (ProductiveData['defaultTimeFormat'] == TIME_12_HR_AMPM ||
            ProductiveData['defaultTimeFormat'] == TIME_24_HR_AMPM) {
            $("#time").html(hour + ':' + min + ' ' + ampm);
        } else {
            $("#time").html(hour + ':' + min);
        }

        time = setTimeout(function () {
            updateTime();
        }, 500);
    })();


    (function updateDate() {
        var dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday',' Thursday',
            'Friday', 'Saturday'];
        var monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'];
        var date = new Date();
        var dayOfTheWeek = date.getDay();
        var month = date.getMonth();
        var day = date.getDate();
        var year = date.getFullYear();
        $('#date').html(dayNames[dayOfTheWeek] + ', ' + monthNames[month] + ' ' + day + ', ' + year);
    })();


    // Notifications Tab and Section
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


    function convertCelsiusToFahrenheit(temp) {
        return Math.round(1.8 * temp + 32);
    }


    //Location and Weather
    (function updateWeather() {
        var ipAPI = 'http://ip-api.com/json';

        $.getJSON(ipAPI, function(json) {
            var latitude = json.lat;
            var longitude = json.lon;
            var city = json.city;
            var region = json.region;
            var location = city + ', ' + region;
            $('#location').html(location);

            // Change App ID
            var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&appid=ab942a3cfd636ab43addb4fb159c7d7a';

            $.getJSON(weatherAPI, function(json) {
                var date = new Date();
                var hour = date.getHours();
                var kelvinTemp = json.main.temp;
                var celsiusTemp = Math.round((kelvinTemp - 273).toFixed(2));
                var fahrenTemp = convertCelsiusToFahrenheit(celsiusTemp);
                var weatherCode = json.weather[0].id;
                var weatherIcon = '';

                console.log(weatherCode);

                if ((weatherCode >= 200 && weatherCode <= 202) ||
                    (weatherCode >= 230 && weatherCode <= 232)) {
                    // Thunderstorm with rain
                    weatherIcon = '<span class="pe-7w-lightning-rain pe-3x pe-va"></span>';
                } else if (weatherCode >= 211 && weatherCode <= 221) {
                    // Thunderstorm
                    weatherIcon = '<span class="pe-7w-lightning pe-3x pe-va"></span>';
                } else if (weatherCode >= 300 && weatherCode <= 321) {
                    // Drizzle
                    weatherIcon = '<span class="pe-7w-drizzle pe-3x pe-va"></span>';
                } else if (weatherCode >= 500 && weatherCode <= 531) {
                    // Rain
                    weatherIcon = '<span class="pe-7w-rain-alt pe-3x pe-va"></span>';
                } else if (weatherCode >= 600 && weatherCode <= 612) {
                    // Snow
                    weatherIcon = '<span class="pe-7w-snow-alt pe-3x pe-va"></span>';
                } else if (weatherCode >= 615 && weatherCode <= 622) {
                    // Snow with rain
                    weatherIcon = '<span class="pe-7w-snow pe-3x pe-va"></span>';
                } else if (weatherCode >= 700 && weatherCode <= 771) {
                    // Fog
                    weatherIcon = '<span class="pe-7w-fog pe-3x pe-va"></span>';
                } else if (weatherCode === 781 || weatherCode === 900 ||
                           weatherCode === 901 || weatherCode === 902) {
                    // Tornado
                    weatherIcon = '<span class="pe-7w-hurricane pe-3x pe-va"></span>';
                } else if (weatherCode === 800 &&
                           (hour >= 8 && hour <= 17)) {
                    // Clear sun
                    weatherIcon = '<span class="pe-7w-sun pe-3x pe-va"></span>';
                } else if (weatherCode === 800) {
                    // Clear moon
                    weatherIcon = '<span class="pe-7w-moon pe-3x pe-va"></span>';
                } else if (weatherCode >= 801 && weatherCode <= 804) {
                    // Cloudy
                    weatherIcon = '<span class="pe-7w-cloud pe-3x pe-va"></span>';
                } else if (weatherCode === 903) {
                    // Cold
                    weatherIcon = '<span class="pe-7w-thermometer-0 pe-3x pe-va"></span>';
                } else if (weatherCode === 904) {
                    // Hot
                    weatherIcon = '<span class="pe-7w-sun pe-3x pe-va"></span>';
                } else if (weatherCode === 905) {
                    // Windy
                    weatherIcon = '<span class="pe-7w-wind pe-3x pe-va"></span>';
                } else if (weatherCode === 906) {
                    // Hail
                    weatherIcon = '<span class="pe-7w-hail pe-3x pe-va"></span>';
                } else if (weatherCode >= 951 && weatherCode <= 960) {
                    // Breeze, windy, gale
                    weatherIcon = '<span class="pe-7w-cloud-wind pe-3x pe-va"></span>';
                } else if (weatherCode === 961) {
                    // Violent storm
                    weatherIcon = '<span class="pe-7w-light pe-3x pe-va"></span>';
                } else if (weatherCode === 962) {
                    // Hurricane
                    weatherIcon = '<span class="pe-7w-hurricane pe-3x pe-va"></span>';
                } else {
                    // Error
                    weatherIcon = '<span class="pe-7w-compass pe-3x pe-va"></span>';
                }

                if (ProductiveData['defaultTempUnits'] == 'C') {
                    $('#weather').html(celsiusTemp + '&deg;C&nbsp;' + weatherIcon);
                } else {
                    $('#weather').html(fahrenTemp + '&deg;F&nbsp;' + weatherIcon);
                }

            });
        });
    })();


    $('#option-open').click(function() {
        $('.option-close').css('display', 'block');
        $('.option-section-container').fadeIn();
    });


    $('#option-close').click(function() {
        $('.option-close').css('display', 'none');
        $('.option-section-container').fadeOut();
        $('#option-save-title').css('display', 'none');
    });


    $('#option-save').click(function() {
        var timeFormat = $('#option-time').val();
        var tempUnits = $('#option-weather').val();

        if (timeFormat == '12 hr.') {
            ProductiveData['defaultTimeFormat'] = TIME_12_HR;
        } else if (timeFormat == '12 hr. with AM/PM') {
            ProductiveData['defaultTimeFormat'] = TIME_12_HR_AMPM;
        } else if (timeFormat == '24 hr.') {
            ProductiveData['defaultTimeFormat'] = TIME_24_HR;
        } else if (timeFormat == '24 hr. with AM/PM') {
            ProductiveData['defaultTimeFormat'] = TIME_24_HR_AMPM;
        }

        if (tempUnits == 'Celsius') {
            ProductiveData['defaultTempUnits'] = 'C';
        } else if (tempUnits == 'Fahrenheit') {
            ProductiveData['defaultTempUnits'] = 'F';
        } else if (tempUnits == 'Kelvin') {
            ProductiveData['defaultTempUnits'] = 'K';
        }

        localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

        $('#option-save-title').fadeIn();
    });

});
