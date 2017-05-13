/*var taskList = $('.task-item-row');
for (var i = 0; i < taskList.length; i++) {

}*/


function addTask() {
    var taskText = $('#add-task-bar').val();

    if (!taskText) {
        // To-DO: Handle case where task bar is empty
    } else {
        var html = '';

        html += '<div class="row task-item-row"><div class="col-md-12"><div class="input-group">';
        html += '<input type="text" class="form-control tasks-item" value="' + taskText + '" disabled>';
        html += '<span class="input-group-btn">';
        html += '<button class="btn btn-default task-complete-button" type="button"><i class="fa fa-check" aria-hidden="true"></i></button>';
        html += '<button class="btn btn-default task-delete-button" type="button"><i class="fa fa-times" aria-hidden="true"></i></button>';
        html += '</span></div></div></div>';

        $('#tasks-items-area').append(html);
        $('#add-task-bar').html('');


    }



}