function prepareAddForm() {
  "use strict";
  $('.masthead .information').transition('scale in');

  $('.ui.new-task').popup();

  $('.ui.form').form({
    name: {
      identifier  : 'name',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter a task name'
        }
      ]
    },
    complete: {
      identifier  : 'complete',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please enter an estimate days'
        }
      ]
    },
    start: {
      identifier : 'start',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please set a start date'
        }
      ]
    },
    end: {
      identifier : 'end',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please set an end date'
        }
      ]
    },
    duration: {
      identifier : 'duration',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please set a valid duration'
        }
      ]
    },
    status: {
      identifier  : 'status',
      rules: [
        {
          type   : 'empty',
          prompt : 'Please select a status'
        }
      ]
    },
  });


  // what is 108???
  $('.ui.dropdown').dropdown('set selected', '108');
  $('input[name="status"]').val(108);

  $(document).on('click','.remove-item button',function(){
    $(this).closest('ul').fadeOut(1000, function(){
      $(this).remove();
    });
  });
}

module.exports = prepareAddForm;
