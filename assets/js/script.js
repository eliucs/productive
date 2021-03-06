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
                        'initLinksTimestamp': [],
                        'lastImageUpdate': 0,
                        'lastCachedImageTitle': '',
                        'lastCachedImageUrl': '',
                        'lastCachedLocation': '',
                        'lastCachedCoordinates': '',
                        'lastCachedTemp': KELVIN_CELSIUS_DIFF,
                        'lastCachedWeatherCode': 0,
                        'lastCachedHumidity': '',
                        'lastCachedPressure': '',
                        'lastCachedWindSpeed': ''
                    };

                ProductiveData = cache;
                localStorage['ProductiveData'] = JSON.stringify(cache);
                console.log(SUCCESS_NEW_DATA_LOADED);
            }
        } else {
            console.log(ERROR_LOCAL_STORAGE);
        }
    })();


    // Background Image with Flickr API
    var FlickrAPIKey = '840ad7eca0abe3a19ca841bf407a93e4';

    (function updateBackgroundImage() {
        var lastImageUpdate = parseInt(ProductiveData['lastImageUpdate']);
        var currentTime = parseInt(Date.now());

        if (Math.abs(currentTime - lastImageUpdate) > MS_IN_HR) {
            var time = new Date();
            var hour = time.getHours();
            var FlickrAPI = 'https://api.flickr.com/services/rest/?method=flickr.interestingness.getList&api_key=' + FlickrAPIKey + '&per_page=24&format=json&nojsoncallback=1';

            $.ajax({
                type: 'GET',
                dataType: 'json',
                url: FlickrAPI,
                timeout: 2000,
                success: function(json) {
                    var farmId = json.photos.photo[hour].farm;
                    var id = json.photos.photo[hour].id;
                    var secret = json.photos.photo[hour].secret;
                    var server = json.photos.photo[hour].server;
                    var title = json.photos.photo[hour].title;
                    var url = 'https://farm' + farmId + '.staticflickr.com/' + server + '/' + id + '_' + secret + '_h.jpg';

                    // Handle broken links by loading last valid image
                    var xhr;
                    var _orgAjax = $.ajaxSettings.xhr;
                    $.ajaxSettings.xhr = function () {
                        xhr = _orgAjax();
                        return xhr;
                    };

                    $.ajax(url, {
                        success: function(response) {
                            $('.main-container').removeClass('.bg-image');
                            $('.main-container').css('background-image', 'url("' + url + '")');
                            var html = '<a class="bg-title" href="' + url + '">' + title + '</a>';
                            $('#bg-title').html(html);

                            ProductiveData['lastImageUpdate'] = Date.now();
                            ProductiveData['lastCachedImageUrl'] = url;
                            ProductiveData['lastCachedImageTitle'] = title;
                            localStorage['ProductiveData'] = JSON.stringify(ProductiveData);
                        },
                        error: function(response) {
                            $('.main-container').css('background-image', 'url("' + ProductiveData['lastCachedImageUrl'] + '")');
                            var html = '<a class="bg-title" href="' + ProductiveData['lastCachedImageUrl'] + '">' +
                                ProductiveData['lastCachedImageTitle'] + '</a>';
                            $('#bg-title').html(html);
                        }
                    });
                },
                error: function() {
                    $('.main-container').addClass('bg-image');
                }
            });
        } else {
            // Load default background image if no cached image
            if (!ProductiveData['lastCachedImageUrl'] ||
                !ProductiveData['lastImageUpdate'] ||
                !ProductiveData['lastCachedImageTitle']) {
                ProductiveData['lastImageUpdate'] = 0;
                localStorage['ProductiveData'] = JSON.stringify(ProductiveData);
                $('.main-container').addClass('bg-image');
            } else {
                $('.main-container').css('background-image', 'url("' + ProductiveData['lastCachedImageUrl'] + '")');
                var html = '<a class="bg-title" href="' + ProductiveData['lastCachedImageUrl'] + '">' +
                    ProductiveData['lastCachedImageTitle'] + '</a>';
                $('#bg-title').html(html);
            }
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
            $('#add-task-form')[0].reset();

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


    $('#add-task-bar').keypress(function(e) {
        if (e.which == KEY_ENTER) {
            var timestamp = Date.now();
            var taskText = $(this).val();

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
                $('#add-task-form')[0].reset();

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

            return false;
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
        $('.weather-more-container').slideUp('.open');
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

        var urlPattern = /^(https?:\/\/)?[^ ]+[.][^ ]+([.][^ ]+)*(\/[^ ]+)?$/i;
        var numLinks = ProductiveData['numLinks'];
        var timestamp = Date.now();
        var url = $('#link-url').val();
        var title = $('#link-title').val();
        var desc = $('#link-desc').val();

        var incorrectUrl = url.search(new RegExp(/^http:\/\//i));
        url = incorrectUrl ? 'http://' + url : url;

        if (url && title && desc) {
            if (numLinks === MAX_NUM_LINKS) {
                $('#link-error').css('display', 'none');
                $('#url-error').css('display', 'none');
                $('#manage-error').css('display', 'block');
                console.log(ERROR_MAX_NUM_LINKS);
            } else if (!urlPattern.test(url)) {
                $('#link-error').css('display', 'none');
                $('#manage-error').css('display', 'none');
                $('#url-error').css('display', 'block');
                console.log(ERROR_INVALID_URL);
            } else {
                $('#link-error').css('display', 'none');
                $('#manage-error').css('display', 'none');
                $('#url-error').css('display', 'none');
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
                $('.link-input').each(function() {
                    $(this)[0].reset();
                });

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
            $('#link-error').css('display', 'block');
            console.log(ERROR_NEW_LINK);
        }
    });


    $('#link-url, #link-title, #link-desc').keypress(function(e) {
        if (e.which == KEY_ENTER) {
            var urlPattern = /^(https?:\/\/)?[^ ]+[.][^ ]+([.][^ ]+)*(\/[^ ]+)?$/i;
            var numLinks = ProductiveData['numLinks'];
            var timestamp = Date.now();
            var url = $('#link-url').val();
            var title = $('#link-title').val();
            var desc = $('#link-desc').val();

            if (url && title && desc) {
                if (numLinks === MAX_NUM_LINKS) {
                    $('#link-error').css('display', 'none');
                    $('#url-error').css('display', 'none');
                    $('#manage-error').css('display', 'block');
                    console.log(ERROR_MAX_NUM_LINKS);
                } else if (!urlPattern.test(url)) {
                    $('#link-error').css('display', 'none');
                    $('#manage-error').css('display', 'none');
                    $('#url-error').css('display', 'block');
                    console.log(ERROR_INVALID_URL);
                } else {
                    $('#link-error').css('display', 'none');
                    $('#manage-error').css('display', 'none');
                    $('#url-error').css('display', 'none');
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
                    $('.link-input').each(function() {
                        $(this)[0].reset();
                    });

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
                $('#link-error').css('display', 'block');
                console.log(ERROR_NEW_LINK);
            }

            return false;
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
        }, 100);
    })();


    $('#time').click(function() {
        if (ProductiveData['defaultTimeFormat'] == TIME_12_HR) {
            ProductiveData['defaultTimeFormat'] = TIME_24_HR;
        } else if (ProductiveData['defaultTimeFormat'] == TIME_24_HR) {
            ProductiveData['defaultTimeFormat'] = TIME_12_HR;
        } else if (ProductiveData['defaultTimeFormat'] == TIME_12_HR_AMPM) {
            ProductiveData['defaultTimeFormat'] = TIME_24_HR_AMPM;
        } else {
            ProductiveData['defaultTimeFormat'] = TIME_12_HR_AMPM;
        }
    });


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


    function getWeatherIcon(weatherCode, hour) {
        var weatherIcon = '';

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

        return weatherIcon;
    }


    function getWeatherText(weatherCode, hour) {
        if ((weatherCode >= 200 && weatherCode <= 202) ||
            (weatherCode >= 230 && weatherCode <= 232)) {
            // Thunderstorm with rain
            return WEATHER_TXT_THUNDERSTORM_RAIN;
        } else if (weatherCode >= 211 && weatherCode <= 221) {
            // Thunderstorm
            return WEATHER_TXT_THUNDERSTORM;
        } else if (weatherCode >= 300 && weatherCode <= 321) {
            // Drizzle
            return WEATHER_TXT_DRIZZLE;
        } else if (weatherCode >= 500 && weatherCode <= 531) {
            // Rain
            return WEATHER_TXT_RAIN;
        } else if (weatherCode >= 600 && weatherCode <= 612) {
            // Snow
            return WEATHER_TXT_SNOW;
        } else if (weatherCode >= 615 && weatherCode <= 622) {
            // Snow with rain
            return WEATHER_TXT_SNOW_RAIN;
        } else if (weatherCode >= 700 && weatherCode <= 771) {
            // Fog
            return WEATHER_TXT_FOG;
        } else if (weatherCode === 781 || weatherCode === 900 ||
            weatherCode === 901 || weatherCode === 902) {
            // Tornado
            return WEATHER_TXT_TORNADO;
        } else if (weatherCode === 800 &&
            (hour >= 8 && hour <= 17)) {
            // Clear sun
            return WEATHER_TXT_CLEAR_DAY;
        } else if (weatherCode === 800) {
            // Clear moon
            return WEATHER_TXT_CLEAR_NIGHT;
        } else if (weatherCode >= 801 && weatherCode <= 804) {
            // Cloudy
            return WEATHER_TXT_CLOUDY;
        } else if (weatherCode === 903) {
            // Cold
            return WEATHER_TXT_COLD;
        } else if (weatherCode === 904) {
            // Hot
            return WEATHER_TXT_HOT;
        } else if (weatherCode === 905) {
            // Windy
            return WEATHER_TXT_WINDY;
        } else if (weatherCode === 906) {
            // Hail
            return WEATHER_TXT_HAIL;
        } else if (weatherCode >= 951 && weatherCode <= 960) {
            // Breeze, windy, gale
            return WEATHER_TXT_BREEZE;
        } else if (weatherCode === 961) {
            // Violent storm
            return WEATHER_TXT_VIOLENT_STORM;
        } else if (weatherCode === 962) {
            // Hurricane
            return WEATHER_TXT_HURICANE;
        } else {
            // Error
            return WEATHER_TXT_ERROR;
        }
    }


    //Location and Weather
    (function updateWeather() {
        var ipAPI = 'http://ip-api.com/json';

        $.ajax({
            type: 'GET',
            dataType: 'json',
            url: ipAPI,
            timeout: 2000,
            success: function(json) {
                var latitude = json.lat;
                var longitude = json.lon;
                var city = json.city;
                var region = json.region;
                var coordinates = latitude + ', ' + longitude;
                var location = city + ', ' + region;
                $('#location').html(location);

                ProductiveData['lastCachedLocation'] = location;
                ProductiveData['lastCachedCoordinates'] = coordinates;
                localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

                var weatherAPI = 'http://api.openweathermap.org/data/2.5/weather?lat=' + latitude + '&lon=' + longitude + '&appid=ab942a3cfd636ab43addb4fb159c7d7a';

                $.ajax({
                    type: 'GET',
                    dataType: 'json',
                    url: weatherAPI,
                    timeout: 2000,
                    success: function(json) {
                        var date = new Date();
                        var hour = date.getHours();
                        var kelvinTemp = Math.round(json.main.temp);
                        var celsiusTemp = kelvinTemp - KELVIN_CELSIUS_DIFF;
                        var fahrenTemp = convertCelsiusToFahrenheit(celsiusTemp);
                        var weatherCode = json.weather[0].id;
                        var weatherIcon = getWeatherIcon(weatherCode, hour);
                        var humidity = json.main.humidity;
                        var pressure = json.main.pressure;
                        var windSpeed = json.wind.speed;

                        ProductiveData['lastCachedTemp'] = kelvinTemp;
                        ProductiveData['lastCachedWeatherCode'] = weatherCode;
                        ProductiveData['lastCachedHumidity'] = humidity;
                        ProductiveData['lastCachedPressure'] = pressure;
                        ProductiveData['lastCachedWindSpeed'] = windSpeed;
                        localStorage['ProductiveData'] = JSON.stringify(ProductiveData);

                        if (ProductiveData['defaultTempUnits'] == 'C') {
                            $('#weather').html(celsiusTemp + '&deg;C&nbsp;' + weatherIcon);
                        } else if (ProductiveData['defaultTempUnits'] == 'F') {
                            $('#weather').html(fahrenTemp + '&deg;F&nbsp;' + weatherIcon);
                        } else if (ProductiveData['defaultTempUnits'] == 'K') {
                            $('#weather').html(kelvinTemp + 'K&nbsp;' + weatherIcon);
                        }

                        $('#humidity').html(humidity + '&#37;');
                        $('#pressure').html(pressure + '&nbsp;hpa');
                        $('#wind-speed').html(windSpeed + '&nbsp;m/s');
                    },
                    error: function() {
                        var date = new Date();
                        var hour = date.getHours();

                        var kelvinTemp = ProductiveData['lastCachedTemp'];
                        var celsiusTemp = kelvinTemp - KELVIN_CELSIUS_DIFF;
                        var fahrenTemp = convertCelsiusToFahrenheit(celsiusTemp);
                        var weatherIcon = getWeatherIcon(ProductiveData['lastCachedWeatherCode'], hour);

                        if (ProductiveData['defaultTempUnits'] == 'C') {
                            $('#weather').html(celsiusTemp + '&deg;C&nbsp;' + weatherIcon);
                        } else if (ProductiveData['defaultTempUnits'] == 'F') {
                            $('#weather').html(fahrenTemp + '&deg;F&nbsp;' + weatherIcon);
                        } else if (ProductiveData['defaultTempUnits'] == 'K') {
                            $('#weather').html(kelvinTemp + 'K&nbsp;' + weatherIcon);
                        }

                        $('#humidity').html(ProductiveData['lastCachedHumidity'] + '&#37;');
                        $('#pressure').html(ProductiveData['lastCachedPressure'] + '&nbsp;hpa');
                        $('#wind-speed').html(ProductiveData['lastCachedWindSpeed'] + '&nbsp;m/s');
                    }
                });
            },
            error: function() {
                var date = new Date();
                var hour = date.getHours();

                var kelvinTemp = ProductiveData['lastCachedTemp'];
                var celsiusTemp = kelvinTemp - KELVIN_CELSIUS_DIFF;
                var fahrenTemp = convertCelsiusToFahrenheit(celsiusTemp);
                var weatherIcon = getWeatherIcon(ProductiveData['lastCachedWeatherCode'], hour);

                if (ProductiveData['defaultTempUnits'] == 'C') {
                    $('#weather').html(celsiusTemp + '&deg;C&nbsp;' + weatherIcon);
                } else if (ProductiveData['defaultTempUnits'] == 'F') {
                    $('#weather').html(fahrenTemp + '&deg;F&nbsp;' + weatherIcon);
                } else if (ProductiveData['defaultTempUnits'] == 'K') {
                    $('#weather').html(kelvinTemp + 'K&nbsp;' + weatherIcon);
                }

                $('#humidity').html(ProductiveData['lastCachedHumidity'] + '&#37;');
                $('#pressure').html(ProductiveData['lastCachedPressure'] + '&nbsp;hpa');
                $('#wind-speed').html(ProductiveData['lastCachedWindSpeed'] + '&nbsp;m/s');

                console.log(ERROR_LOCATION);
                $('#location').html(ProductiveData['lastCachedLocation']);
            }
        });
    })();


    $('#location').click(function() {
        if ($(this).html() == ProductiveData['lastCachedLocation']) {
            $(this).html(ProductiveData['lastCachedCoordinates']);
        } else {
            $(this).html(ProductiveData['lastCachedLocation']);
        }
    });


    $('#weather').click(function() {
        var date = new Date();
        var hour = date.getHours();
        var weatherText = getWeatherText(ProductiveData['lastCachedWeatherCode'], hour);

        $('#weather-more-text').html(weatherText);

        if (!$('.weather-more-container').is(':visible')) {
            $('.weather-more-container').slideDown('.open');
        } else {
            $('.weather-more-container').slideUp('.open');
        }
    });


    $('#option-open').click(function() {
        $('.weather-more-container').slideUp('.open');
        $('.option-close').css('display', 'block');
        $('.option-section-container').fadeIn();
    });


    $('#option-close').click(function() {
        $('.option-close').css('display', 'none');
        $('.option-section-container').fadeOut();
        $('#option-save-title').css('display', 'none');
        window.location.href = 'index.html';
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


    $('#option-reset').click(function() {
        ProductiveData['totalTasksCreated'] = 0;
        ProductiveData['totalTasksCompleted'] = 0;
        ProductiveData['totalTasksDeleted'] = 0;
        ProductiveData['initTasksTimestamp'] = [];
        ProductiveData['initLinksTimestamp'] = [];
        ProductiveData['noteText'] = '';
        ProductiveData['numLinks'] = 0;
        ProductiveData['numTasks'] = 0;
        ProductiveData['linkData'] = {};
        ProductiveData['taskData'] = {};
        localStorage['ProductiveData'] = JSON.stringify(ProductiveData);
        window.location.href = 'index.html';
    });


    // Info Modal
    $('#info-open').click(function() {
        $('.weather-more-container').slideUp('.open');
        $('.info-close').css('display', 'block');
        $('.info-section-container').fadeIn();
    });


    $('#info-close').click(function() {
        $('.info-close').css('display', 'none');
        $('.info-section-container').fadeOut();
    });

});
