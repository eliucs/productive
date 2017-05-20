// OAuth2 authentication to Google API/Gmail API


chrome.identity.getAuthToken(
    {'interactive': true},
    function() {
        window.gapi_onload = authorize;
        loadScript('https://apis.google.com/js/client.js');
    }
);


function loadScript(url) {
    var request = new XMLHttpRequest();

    request.onreadystatechange = function() {
        if (request.readyState !== 4) {
            return;
        }

        if (request.status !== 200) {
            return;
        }

        eval(request.responseText);
    };

    request.open('GET', url);
    request.send();
}


function authorize() {
    gapi.auth.authorize({
        client_id: '<clientid>',
        immediate: true,
        scope: 'https://www.googleapis.com/auth/gmail.modify'
    },
        function() {
            gapi.client.load('gmail', 'v1', gmailAPILoaded);
        }
    )
}


function getThreads(query, labels) {
    return gapi.client.gmail.users.threads.list({
        userId: 'me',
        q: query,
        labelIds: labels
    });
}


function getThreadDetails(threads) {
    var batch = new gapi.client.newBatch();

    for(var i = 0; i < threads.length; i++) {
        batch.add(gapi.client.gmail.users.threads.get({
            userId: 'me',
            id: threads[i].id
        }));
    }

    return batch;
}


function getThreadHTML(threadDetails){
    var body = threadDetails.result.messages[0].payload.parts[1].body.data;
    return B64.decode(body);
}


function archiveThread(id){
    var request = gapi.client.request(
        {
            path: '/gmail/v1/users/me/threads/' + id + '/modify',
            method: 'POST',
            body: {
                removeLabelIds: ['INBOX']
            }
        }
    );

    request.execute();
}