window.konvasData = [];

app.controller('viewPeController', ['$scope','globalSettingsService','utilService', '$timeout', 'activityService','$compile','sessionService', 'peConfigService', function($s, gss, us, timeout, acts, compile, ses, pcs) {
  $s.gss = gss; 
  $s.us = us;
  
  $s.book = {};
  $s.unity = {};
  $s.book_loaded = false; 
  $s.unityDemo = 1;
  $s.activitys = [];
  $s.activitysByPage = [];
  $s.page_read = 0;
  $s.real_pg = 0;
  $s.displayActive = [];

  $s.activityOpen = {};
  $s.resourceOpen = {};
  $s.step2Activity = false;
  $s.data_send = {};
  $s.dataFormFinal = [];
  $s.pageActivityOpen = 0;
  $s.activityProccess = 0;
  $s.timerRunning = false;
  $s.times = 0;
  $s.lastCheck = 0;
  $s.sesdata = {};

  $s.colors = gss.activity_buttons_colors;
  $s.colors_style_head = gss.activity_head_style;

  $s.init_controller = function(){   
      //$s.esferasAzules();
      //$s.espacioAzulado();  
 
      $s.sesdata = ses.getDataPe();
      var code = us.getPartUrl(2);  
      var numberunity = us.getPartUrl(3); 
      $s.getBookAndUnity(code, numberunity);   

      $s.getImgsHead();
      $s.getGrades();

      $(document).on('focusin', function(e) {
        if ($(e.target).closest(".mce-window").length) {
          e.stopImmediatePropagation();
        }
      });
  }

  $s.hhmmss = function(secs) {
    console.log(secs);
    function pad(num) {
        return ("0"+num).slice(-2);
    }

    var minutes = Math.floor(secs / 60);
    secs = secs%60;
    var hours = Math.floor(minutes/60)
    minutes = minutes%60;
    return pad(hours)+":"+pad(minutes)+":"+pad(secs);
  }

  $s.getImgsHead = function(){
    pcs.getImgsHead(function(rhi){
      $s.listImgHead = rhi.data.result;
    })
  }

  $s.getBookAndUnity = function(code, numberunity){
    acts.getBookByCode(code, function(rb){ 
      $s.book = rb.data.result;   
      if($s.book.id !== undefined) {  
        acts.getUnitysByNumber($s.book.id, numberunity, function(ru){
          $s.unity = ru.data.result; 
          if($s.unity === false){ 
            //us.irAnimFullColor('404','blue');
            alert("Enlace incorrecto.");
          }else{
            var pages_number = $s.unity.end_page - $s.unity.start_page;  
            var pdfpath = '../../../lib/media/content/books/'+$s.book.code+'/unidad' + $s.unity.number + '.pdf';  
            $s.getResourcesByUnity();
            $s.real_pg = pages_number + 2;
            $s.initBook(pdfpath, pages_number);
          }
        })
      }
      else{
        alert("Enlace incorrecto");
      }
    })  
  }

  $s.initBook = function(pdfpath, pages_number){
    var real_pg = pages_number + 2;

    var html_end_demo = '<div class="back_demo"><img src="' + gss.path_bookcontent + $s.book.code+'/back_demo.jpg" />'+
                          '<div class="text_end_demo">'+gss.text_end_demo+' <br><br>'+
                            '<a class="btn btn-ebio" target="_blank" href="'+gss.link_pos+'">'+gss.text_link_pos+'</a>'+
                            '<a class="btn btn-ebio" target="_blank" href="'+gss.link_pe+'">'+gss.text_link_pe+'</a>'+
                          '</div>'+
                        '</div>';
    timeout(function(){ 
      $('#container').FlipBook({ 
        pdf: pdfpath,
        pages: real_pg,   
        controlsProps: {
          actions: {
            cmdBackward: {
              code: 37,
            },
            cmdForward: {
              code: 39
            },
            cmdSinglePage: {
              activeForMobile: true
            }
          } 
        },   
        propertiesCallback: function(props) { 
          props.renderInactivePagesOnMobile = true; 
          props.preloadPages = (isMobile.any) ? 2 : 5; 
          props.sheet.startVelocity = 1; 
          props.sheet.cornerDeviation = 0;
          props.sheet.flexibleCorner = 0.5; 
          props.sheet.flexibility = 0;
          props.sheet.flexibility.bending = 1;
          props.cssLayersLoader = function(n, clb) {// n - page number   
            clb([{
              css: '',
              html: $s.displayButtonsActivitys(n),
              js: function (jContainer) { // jContainer - jQuery element that contains HTML Layer content
                //console.log('init');
                return { // set of callbacks 
                  show: function() { 
                    if(n == 0){
                      var iframe = $('iframe').contents();    
                      iframe.find(".inpPage").focus().blur();
                    }  
                  },
                  shown: function() { 
                    $s.eventosB(n);
                  }
                };
              }
            }]);
          }; 
          return props;
        },
        template: {
          html: 'app/templates/view.html',
          styles: [
            'app/css/white-book-view.css'
          ], 
          script: 'app/js/default-book-view.js',
          sounds: {
            startFlip: 'app/sounds/start-flip.mp3',
            endFlip: 'app/sounds/end-flip.mp3'
          }
        },
        ready: function(){ 
          $s.book_loaded = true;
          $("body").addClass("pe");  
          var iframe = $('iframe').contents();    
          iframe.find("body")[0].classList.add("pe");
        }
      });  
    }.bind($s)) 
  }

  $s.eventosB = function(n){
    page = n + ( parseInt($s.unity.start_page) - 3 );  
    var iframe = document.getElementsByTagName("iframe")[0];   
    var doci = iframe.contentWindow.document; 
    var buttonsA = doci.getElementsByClassName("btn-activitys-"+page); 
    if(buttonsA.length > 0){
      [].forEach.call(buttonsA, theButton => { 
        theButton.addEventListener('click', () => { $s.showActivity(page, theButton); } )
      });
    }   
  }

  $s.changePage = function(pag){ 
    $s.checkActivity(pag);
  }

  $s.getResourcesByUnity = function(){
    acts.getResourcesByUnity($s.unity.id, function(r){
      $s.activitys = r.data.result; 
      
      //console.log($s.activitysByPage);

      var cont = 0;   
      $s.activitysByPage[0] = [];
      $s.activitysByPage[1] = [];
      for(i = parseInt($s.unity.start_page); i <= parseInt($s.unity.end_page) ; i++ ){
        $s.activitysByPage[i] = [];
      } 

      angular.forEach($s.activitys, function(value, key) { 
        $s.activitysByPage[parseInt(value.page)].push(value); 
      }) 
      
      if($s.activitys.length == 0) 
        us.toast("Esta unidad no posee actividades asociadas",'i');
    })
  }  
  $s.evaluando = false;
 
  $s.displayButtonsActivitys = function(page){   
      //document.getElementById("blink_resources").style.opacity = 0;
   /* if($s.lastCheck != page){
      $s.lastCheck = page;

      if(!$s.evaluando){*/
        $s.evaluando = true;
        page = parseInt(page) + ( parseInt($s.unity.start_page) - 3 );
        $s.page_read = page; 


        if (page % 2 != 0){
          document.getElementById("blink_resources_r").style.opacity = 0; 
        }else{
          document.getElementById("blink_resources_l").style.opacity = 0; 
        }

        var htmlButton = '';
        if( Array.isArray($s.activitysByPage[page]) ){
          if( $s.activitysByPage[page].length > 0 ){    
              if (page % 2 != 0){ 
                document.getElementById("blink_resources_r").style.opacity = 1; 
              }else{
                document.getElementById("blink_resources_l").style.opacity = 1; 
              }

            //document.getElementById("blink_resources_l").style.opacity = 1; 
            angular.forEach($s.activitysByPage[page], function(activity, key) {  
              var dataButton = activity; 
              var b_display = 'position:absolute; left: ' + dataButton.button_left + '%; top: ' + dataButton.button_top + '%; opacity:1;';
              var b_class = $s.colors[dataButton.button_color].class;  
              var b_icon = '<i class="'+dataButton.button_icon+'"></i>';

              if( $("#ba_"+dataButton.id).length == 0 )
                htmlButton+='<button id="ba_'+dataButton.id+'" page="'+page+'" type="'+dataButton.type+'" code="'+dataButton.code+'" ida="'+dataButton.id+'" title="'+dataButton.name+'" class="btn btn-activitys btn-activitys-'+page+' '+b_class+'" style="'+b_display+'"">'+ b_icon + dataButton.button_title+'</button>';
            
            });   
            var fondoBack = '<div class="fondoBack"></div>';
            return fondoBack + htmlButton;   
          } 
        }   
  }

  $s.showResourcesAviables = function(){ 
    var iframe = document.getElementsByTagName("iframe")[0];   
    var doci = iframe.contentWindow.document; 
    var fondoBack = doci.querySelector('.fondoBack');  

    fondoBack.style.opacity = 1;
    setTimeout(function(){
      fondoBack.style.opacity = 0;
    }, 1000);
  }

  $s.init_activity = function(page){
    $(".ml4, .ml4 span").css("opacity", 1);
    timeout(function(){ 
      if(parseInt($s.activityOpen.time_band) == 1){ 
        $s.activityProccess = 0.5;
        $s.animationStartTime();
      }else{
        $s.pageActivityOpen = page;  
        $s.activityProccess = 1; 
        $s.times++;
        $s.timerRunning = false; 
      } 
    })
  }

  $s.showActivity = function(a,b){ 
    page = parseInt(b.getAttribute("page"));
    ida = parseInt(b.getAttribute("ida")); 
    type = parseInt(b.getAttribute("type"));
    code = b.getAttribute("code"); 
    $s.activitysByPage[page]
    //$s.getFormActivity(); 
    angular.forEach($s.activitysByPage[page], function(resource, key) {
      if(resource.id == ida){
        $s.activityOpen = resource; 
        if(type == 2){
          us.irNewTab( gss.link_pe + '/actividad/' + ida + '/' + code );
        }else if(type == 1){
          $s.getFormActivity(resource);
          $s.init_activity(page);
        }else if(type == 3 || type == 4 || type == 5){
          $s.showResource(resource); 
        } 
      }
    });
  } 

  $s.showResource = function(resource){
    $s.resourceOpen = resource; 
    timeout(function(){
      $("#resourceModal").modal("show");
    }) 
  }

  $s.getFormActivity = function(activity){   
    $s.templates = {
      image: function(fieldData) {
        return {
          field: '<span id="'+fieldData.name+'">',
          onRender: function() {
            if(fieldData.value != '' && fieldData.value !== undefined){
              var extension = $s.getFileExtension(fieldData.value);
              $("#"+fieldData.name).append('<div class="d-flex justify-content-center"><div><a id="link-'+fieldData.name+'" href="' + gss.path_pecontent_upload_activity + fieldData.name + '.' + extension + '" target="_blank"><img class="big-preview" src="'+ gss.path_pecontent_upload_activity + fieldData.name + '.' + extension + '" alt="'+fieldData.name+'" /></a></div></div>');
            }
          }
        };
      },
      uploader: function(fieldData) {
        return {
          field: '<span id="'+fieldData.name+'">',
          onRender: function() {
            if(fieldData.value != '' && fieldData.value !== undefined){
              var extension = $s.getFileExtension(fieldData.value);
              $("#"+fieldData.name).append('<div class="d-flex justify-content-center"><div><a id="link-'+fieldData.name+'" class="btn btn-ebio br-2" href="' + gss.path_pecontent_upload_activity + fieldData.name + '.' + extension + '" download>'+gss.download+'</a></div></div>');
            }
          }
        };
      },
      konva: function(fieldData) {
        return {
          field: '<div id="'+fieldData.name+'">',
          js: '../lib/konva/konva.min.js',
          onRender: function() {  
            var konvaCode = new window.konvaCode;
            konvaCode.adapt(fieldData.name); 
            $("#"+fieldData.name).append(konvaCode.build());
            konvaCode.onRender();
          }
        };
      }
    };

    $("#activityModal").modal("show");
    acts.getFormActivity(activity, function(r){  
      var arrayActivity = r.data.result;
      var position = 0;
      arrayActivity.forEach(function(element) {
        if(element.type == 'konva'){
           window.konvasData[element.name] = element.value;
           arrayActivity[position].value = '';
        }
        position++;
      });
      $s.activityJson = arrayActivity;   

        $('.fb-render').formRender({
          dataType: 'json',
          formData: $s.activityJson, 
          disableInjectedStyle: true,
          templates: $s.templates,
          notify: { 
            success: function(message) {
              $(".fb-render").children(".rendered-form").removeClass("rendered-form");
              angular.forEach($s.activityJson, function(value, key) {  
                name = value.name; 
                if( name.startsWith("file") ){
                  input = document.getElementById(name);
                  input.addEventListener('change', (e) => {  
                    $s.uploadFileActivity(e);
                  } )
                }
              })
            }
          }
        });  
    })
  }

  $s.uploadFileActivity = function(e){
    nameField = e.target.id;
    if( document.getElementById('msj-'+ nameField) === null || document.getElementById('msj-'+ nameField) === undefined ){
      var arearesult = document.createElement("div");
      arearesult.setAttribute('id', 'msj-'+ nameField );
      arearesult.classList.add("w-100");
      arearesult.classList.add("text-center"); 
      document.querySelector('.field-' + nameField).append(arearesult); 
    } 
 
   
    var pathUpload = gss.API + "/resource/activity/upload"; 

    var input = e.target;
    var files = e.target.files || e.dataTransfer.files;
    var areamsj = document.getElementById('msj-'+ nameField);
    areamsj.innerHTML = 'Subiendo ...';
    var formdata = new FormData();
    formdata.append('file', files[0]);
    formdata.append('nameField', nameField);
    var ajax = new XMLHttpRequest();
    ajax.responseType = 'json';
    ajax.addEventListener("load", completeUpload, false);
    ajax.addEventListener("error", errorHandler, false);
    ajax.open("POST", pathUpload);
    ajax.send(formdata);

    function completeUpload(event) {
      var resp = event.target.response;
      var msj = areamsj;
      if(resp.response){
        msj.innerHTML = '<span class="text-primary">Arcvhivo subido</div>';  
      }else{
        msj.innerHTML = '<span class="text-danger">Error subiendo archivo</div>';
      }
    }  

    function errorHandler(event) {
     console.log('error');
    }
  }

  $s.animationStartTime = function(page){ 
    $("#activityModal .modal-content").addClass('changeColorBlue'); 

    $s.activityOpen.timeSeconds = moment.duration($s.activityOpen.time).asSeconds();
    $s.activityOpen.timeMinutes = moment.duration($s.activityOpen.time).asMinutes();
    $s.activityOpen.timeHours = moment.duration($s.activityOpen.time).asHours();    
    if($s.activityOpen.timeHours > 1){
      $s.activityOpen.msjTime = $s.activityOpen.timeHours + ' ' + gss.hours;
      totalmh = ($s.activityOpen.timeHours * 60);
      if( ($s.activityOpen.timeMinutes - totalmh) > 1 ){
        difmh = $s.activityOpen.timeMinutes - totalmh;
        $s.activityOpen.msjTime+= gss.and + ' ' + difmh + ' ' + gss.minutes;
      }
    }else if($s.activityOpen.timeHours == 1){
      $s.activityOpen.msjTime = $s.activityOpen.timeHours + ' ' + gss.hour;
    }else{
      if($s.activityOpen.timeMinutes >= 1){
        $s.activityOpen.msjTime = $s.activityOpen.timeMinutes + ' ' + gss.minutes;
      }else{
        $s.activityOpen.msjTime = $s.activityOpen.timeSeconds + ' ' + gss.seconds;
      }
     
    }  

    var ml4 = {};
    ml4.opacityIn = [0,1];
    ml4.scaleIn = [0.2, 1];
    ml4.scaleOut = 3;
    ml4.durationIn = 500;
    ml4.durationOut = 1000;
    ml4.delay = 500;

     anime.timeline({loop: false})
      .add({
        targets: '.ml4 .letters-1',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn
      }).add({
        targets: '.ml4 .letters-2',
        opacity: ml4.opacityIn,
        scale: ml4.scaleIn,
        duration: ml4.durationIn
      }).add({
        targets: '.ml4 .letters-3',
        opacity: 1,
        scale: 1
      }); 
  }

  $s.acceptTimer = function(){ 
    $("#activityModal .modal-content").addClass('changeColorWhite'); 
    $sectorTimer = angular.element( document.querySelector( '#timewrapper' ) ); 
    $sectorTimer.append($s.timerHTML($s.activityOpen.timeSeconds));
    compile($sectorTimer.contents())($s);
    $s.$broadcast('timer-start');
    $s.timerRunning = true;
    $s.pageActivityOpen = page;  
    $s.activityProccess = 1;  
    $s.times++;
    $s.timerRunning = true;
  }


  $s.timerHTML = function(seconds){
    return `<timer countdown="${seconds}" interval="1000" auto-start="false"> 
            <div class="c100 p{{  progressBar | number:0 }} small">
              <span>{{ minutes }}{{':'}}{{ seconds }}{{ " s"}}</span>
              <br /><i class="far fa-clock"></i></i>
              <div class="slice">
                <div class="bar"></div>
                <div class="fill"></div>
              </div>
            </div> 
          '</timer>`;
  }

  $s.getDataQuestions = function(){ 

    $s.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
    //var $dataForm =  $("#form_" + side).serializeArray(); 
    var idta = '';  
    var vacio = false;

    /*for (var i = 0; i < tinymce.editors.length; i++) {
      var editorInstance = tinymce.editors[i];
      alert(editorInstance.getContent());
    }*/ 
    

    angular.forEach($s.activityJson, function(value, key) {   
      name = value.name;
      type = value.type;
      if( type == "textarea" ){ 
        idta = $("#"+value.name);   
        if( tinymce.get(value.name) === null ){
          value.value = $("#"+value.name).val();
        }else{
          value.value = tinymce.get(value.name).getContent();
        } 
        $s.dataFormFinal.push(value);
        if(value.value === undefined || value.value == ""){
          vacio = true;
        }
      } else if( type == "text" || type == "select" || type == "check" || type == "autocomplete" || type == "input" || type == "number" || type ==  "date" ){ 
          value.value = $("#"+value.name).val();
          $s.dataFormFinal.push(value);
          if(value.value === undefined || value.value == ""){
            vacio = true;
          }  
      } else if( type == "radio-group" ){ 
        var checkedRadioBtnList= new Array();

        var radioElement = document.getElementsByName(value.name);
        value.value = "";
          for(i=0; i<radioElement.length;i++){   
            if(radioElement[i].checked){      
              //console.log(radioElement);
              var selector = 'label[for=' + radioElement[i].id + ']';
              var label = document.querySelector(selector);
              value.value = label.innerHTML;
              $s.dataFormFinal.push(value);
              if(value.value === undefined || value.value == ""){
                vacio = true;
              }
            }    
          }  
            
      }else if( type == "file" ){  
          var extension = $s.getFileExtension( $("#"+value.name).val() );
          value.value = gss.path_pecontent_upload_activity + value.name + '.' + extension;
          $s.dataFormFinal.push(value);
          if(value.value === undefined || value.value == ""){
            vacio = true;
          }
      } else if( type == "image" || type == "uploader" ){  
          var path = document.getElementById('link-' + value.name ).getAttribute('href'); 
          value.value = path;
          $s.dataFormFinal.push(value);
          if(value.value === undefined || value.value == ""){
            vacio = true;
          }
      } else if( type == "konva" ){  
          var jsonkonva = window.konvaStore['knv-' + value.name + '-preview']; 
          value.value = jsonkonva.toJSON(); 
          value.path = gss.path_pecontent_activity_question + value.name + '.png'; 
          var image = jsonkonva.toImage({ 
            callback: function(img) { 
              var imgsrc = img.getAttribute('src');
              value.img = imgsrc; 
            }
          });
          $s.dataFormFinal.push(value);  
      } 
    });       

    console.log($s.dataFormFinal);
 
    if(vacio == true){
      us.toast("Debe responder a todas las preguntas para enviar la actividad","i");
    }else{
      $s.step2Activity = true;
      $s.stopTime();
      $s.data_send.student_name = $s.sesdata.user.name;
      $s.data_send.student_mail = $s.sesdata.user.mail;
      $s.activityProccess = 2;
      $(".mail_teacher").focus();
      //console.log($s.dataFormFinal); 
    } 
  } 

  $s.getGrades = function(){
    acts.getGrades(function(r){
      $s.grades = r.data.result; 
    })
  } 

  $s.getByIdFind = function(array_search, id){
    return array_search.find(x => x.id === id);
  }

  $s.sendTask = function(){ 
    //get ss
    var gdarray = $s.getByIdFind($s.grades, $s.book.id_grade); 
    $s.activityProccess = 3;
    $s.showLoadSAQ();
    $s.data_send.student_name = $s.sesdata.user.name;
    $s.data_send.student_mail = $s.sesdata.user.mail;
    $s.data_send.dataForm = $s.dataFormFinal;  
    $s.data_send.activity = $s.activityOpen;
    $s.data_send.activity.times =  $s.times;
    $s.data_send.book = $s.book;
    $s.data_send.unity = $s.unity;
    $s.data_send.studystage_id = gdarray.id_studystage; 
    $("#activityModal .modal-content").addClass('changeColorBlue'); 
    acts.saveActivityQuestion($s.data_send, function(r){
      if(r.data.result.saveJson){ 
        $s.activityProccess = 4;
        timeout(function(){ 
          $("#sectorLoadSAQ .letters").html(gss.sended_activity);
        },1500); 
      }
    })
  }

  $s.$on('timer-tick', function (event, args){
    timeout(function() {
        if (args.millis == 1000) {
            $s.activityProccess = 5;
            $s.showAnimationTimeOver();
            $s.stopTime();
        };
      });  
  });

  $s.stopTime = function(){
    $s.timerRunning = false; 
    $s.$broadcast('timer-stop');
    $(".timewrapper").html(""); 
  }
  $s.closeModalActivity = function(){
    $("#sectorLoadSAQ .letters").html(gss.sending_activity);
    $("#activityModal .modal-content").removeClass('changeColorBlue');  
    $s.activityProccess = 0;
    $s.step2Activity = false;
    $s.activityJson = {};
    /*page = parseInt($s.activityOpen.page); 
    if (page % 2 == 0)
      page++; 
    //console.log(page);
    $s.checkActivity(page);*/
    $s.activityOpen = {};
    $('.fb-render').empty();
    $("#activityModal").modal('hide');
    $(".timewrapper").html("");
  }

   $s.repeatActivity = function(){ 
    $s.activityProccess = 1;
    $("#sectorLoadSAQ .letters").html(gss.sending_activity);
    $("#activityModal .modal-content").removeClass('changeColorBlue');  
    $s.step2Activity = false;
    $s.activityJson = {};  
    $('.fb-render').empty();
    $s.getFormActivity($s.activitysByPage[page][0]);
    $s.init_activity(page); 
  }

  $s.showLoadSAQ = function(){   
    $(".data_send").hide(); 
    $('.ml11 .letters').each(function(){
      $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
    });

    anime.timeline({loop: true})
      .add({
        targets: '.ml11 .line',
        scaleY: [0,1],
        opacity: [0.5,1],
        easing: "easeOutExpo",
        duration: 700
      })
      .add({
        targets: '.ml11 .line',
        translateX: [0,$(".ml11 .letters").width()],
        easing: "easeOutExpo",
        duration: 700,
        delay: 100
      }).add({
        targets: '.ml11 .letter',
        opacity: [0,1],
        easing: "easeOutExpo",
        duration: 600,
        offset: '-=775',
        delay: function(el, i) {
          return 34 * (i+1)
        }
      }).add({
        targets: '.ml11',
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 1000
      });
  } 

  $s.showAnimationTimeOver = function(){
    $(".modal-content-activity").addClass('changeColorBlue');
    $('.ml12').each(function(){
      $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
    });

    anime.timeline({loop: true})
      .add({
        targets: '.ml12 .letter',
        translateX: [40,0],
        translateZ: 0,
        opacity: [0,1],
        easing: "easeOutExpo",
        duration: 1200,
        delay: function(el, i) {
          return 500 + 30 * i;
        }
      }).add({
        targets: '.ml12 .letter',
        translateX: [0,-30],
        opacity: [1,0],
        easing: "easeInExpo",
        duration: 1100,
        delay: function(el, i) {
          return 100 + 30 * i;
        }
      });
  } 


  $s.espacioAzulado = function(){
    $("body").addClass("htmlWelcome").append('<div id="stars"></div><div id="stars2"></div><div id="stars3"></div>') 
  }

  $s.esferasAzules  = function(){
    // Some random colors
    const colors = ["#00b1eb", "#00b1eb", "#00b1eb", "#00b1eb", "#00b1eb"];  
    const numBalls = 50;
    const balls = [];

    for (let i = 0; i < numBalls; i++) {
      let ball = document.createElement("div");
      ball.classList.add("ball");
      ball.style.background = colors[Math.floor(Math.random() * colors.length)];
      ball.style.left = `${Math.floor(Math.random() * 100)}vw`;
      ball.style.top = `${Math.floor(Math.random() * 100)}vh`;
      ball.style.transform = `scale(${Math.random()})`;
      ball.style.width = `${Math.random()}em`;
      ball.style.height = ball.style.width;
      
      balls.push(ball);
      //document.body.append(ball);
      $("#viewBook").append(ball);
    }

    // Keyframes
    balls.forEach((el, i, ra) => {
      let to = {
        x: Math.random() * (i % 2 === 0 ? -11 : 11),
        y: Math.random() * 12
      };

      let anim = el.animate(
        [
          { transform: "translate(0, 0)" },
          { transform: `translate(${to.x}rem, ${to.y}rem)` }
        ],
        {
          duration: (Math.random() + 1) * 2000, // random duration
          direction: "alternate",
          fill: "both",
          iterations: Infinity,
          easing: "ease-in-out"
        }
      );
    });
  }

  $s.getFileExtension = function(filename){
    return filename.split('.').pop();
  }

  $s.getFileName = function(filename){
    var arrf = filename.split('.');
    arrf.splice(-1,1);
    return arrf.join('');
  }

  $s.moreInfoUpload = function(){
    us.toast( gss.msj_full_info_upload ,"i");
  }

  $s.removeFileTemp = function(index){
    $s.picFiles.splice(index, 1);
  }

  $s.isImage = function(filename){
    var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    if(!allowedExtensions.exec(filename)){
        return false;
    }else{
        return true;
    }
  }

  $s.isVideo = function(filename){
    var allowedExtensions = /(\.mp4|\.mkv|\.avi|\.3gp|\.wmv)$/i;
    if(!allowedExtensions.exec(filename)){
        return false;
    }else{
        return true;
    }
  }

  $s.isAudio = function(filename){
    var allowedExtensions = /(\.mp3|\.wav|\.ogg|\.aac)$/i;
    if(!allowedExtensions.exec(filename)){
        return false;
    }else{
        return true;
    }
  }


}]);