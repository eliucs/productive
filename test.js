var tasks = {};

var numOfTasks = 0;

$('#task-add-button').click(function() {
    var newTaskText = $('#task-text').val();

    if (newTaskText) {
        console.log('New Task: ' + '');
    } else {
        console.log('Error: No text added.');
    }
});


