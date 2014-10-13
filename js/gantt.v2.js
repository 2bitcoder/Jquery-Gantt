$(document)
.ready(function() {
  $('.masthead .information')
  .transition('scale in')
  ;
  $('.ui.new-task')
  .popup()
  ;
  $('.ui.form')
  .form({
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
  })
  ;
  $('.ui.dropdown').dropdown("set selected", "108");
  $("input[name='status']").val(108);
  $('.new-task')
  .on('click',function(e){

    // var $attr = $('.task-container ul').last('li').attr('class');
    // alert($attr);
    // $('.task-container').append('<div class="task-list-container"><ul class="task" id="c'+Math.floor((Math.random() * 10000) + 1)+'"><li class="expand-menu">+&nbsp;</li><li class="col-name"><input type="text" placeholder="New plan" size="38"></li><li class="col-start"><input type="date" placeholder="Start Date" style="width:80px;"></li><li class="col-end"><input type="date" placeholder="End Date" style="width:80px;"></li><li class="col-complete"><input type="number" placeholder="2" style="width: 30px;margin-left: -14px;" min="0"></li><li class="col-status"><select style="width: 70px;"><option value="incomplete">Inompleted</option><option value="completed">Completed</option></select></li><li class="col-duration"><input type="number" placeholder="24" style="width: 32px;margin-left: -8px;" min="0"> d</li><li class="add-item"><button class="mini green ui button"> <i class="small plus icon"></i></button></li><li class="remove-item"><button class="mini red ui button"> <i class="small trash icon"></i></button></li></ul><ul class="sub-task-list ui-sortable"></ul></div>').hide().slideDown();
  })
;

$(document)
.on('click','.add-item button',function(){

})
;
$(document)
.on('click','.remove-item button',function(){
  $(this).closest('ul').fadeOut(1000, function(){
    $(this).remove();
  });
})
;

})
;