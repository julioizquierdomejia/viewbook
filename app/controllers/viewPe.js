window.konvasData = [];
window.draggData = [];

app.controller('viewPeController', ['$scope', 'globalSettingsService', 'utilService', '$timeout', 'activityService', '$compile', 'sessionService', 'peConfigService', 'learningService', 'peDataService', function ($s, gss, us, timeout, acts, compile, ses, pcs, lns, pds) {
  $s.gss = gss;
  $s.us = us;

  $s.book = {};
  $s.unity = {};
  $s.book_loaded = false;
  $s.unityDemo = 1;
  $s.activitys = [];
  $s.activityView = [];
  $s.activitysByPage = [];
  $s.page_read = 0;
  $s.real_pg = 0;
  $s.displayActive = [];

  $s.activityOpen = {};
  $s.resourceOpen = {};
  $s.step2Activity = false;
  $s.data_send = {};
  $s.dataFormFinal = [];
  1
  $s.pageActivityOpen = 0;
  $s.activityProccess = 0;
  $s.timerRunning = false;
  $s.times = 0;
  $s.lastCheck = 0;
  $s.sesdata = {};
  $s.isJoined = false;
  $s.class_info = [];
  $s.noLoad = false;
  $s.class_code = 'base';
  $s.averageData = {
    'class': 'navbar-light bg-light',
    'class_color': 'text-dark',
    'icon': 'fa-clock',
    'text': ''
  };
  $s.questions_head = [];
  $s.questions_detail = [];
  $s.evaluation_log = [];
  $s.scores_letters = [];
  $s.evaluation_rage = [];
  $s.user_type = '';
  $s.amb = 'basepe';

  $s.modeOpen = 1;

  $s.colors = gss.activity_buttons_colors;
  $s.colors_style_head = gss.activity_head_style;

  $s.init_controller = function () {
    //$s.esferasAzules();
    //$s.espacioAzulado();   

    var code = us.getPartUrl(2);
    var numberunity = us.getPartUrl(3);
    //var amb = us.getPartUrl(4); 
    $s.class_code = us.getPartUrl(4);

    ses.check(function (datau) {
      $s.sesdata = datau;
      //console.log(datau);
      $s.amb = $s.sesdata.user.amb;
      //console.log($s.sesdata.user.amb);
      $s.user_type = $s.sesdata.id_type;
      ses.getJoinStatus($s.class_code, function (r) {
        if (r.data.response) {
          if (r.data.result.joined == '1')
            $s.isJoined = true;
          else
            $s.isJoined = false;
        } else {
          $s.linkWrong('getJoinStatus');
        }
        $s.getBookAndUnity(code, numberunity);
        $s.getImgsHead();
        $s.getGrades();
      })
    });
    $(document).on('focusin', function (e) {
      if ($(e.target).closest(".mce-window").length) {
        e.stopImmediatePropagation();
      }
    });

    $s.getScoredLetters();
    $s.getEvaluationRange();
  }

  $s.getDataClass = function () {
    if ($s.isJoined) {
      lns.getClassByCodeAlumn($s.class_code, function (r) {
        $s.class_info = r.data.result;
      })
    }
  }

  $s.hhmmss = function (secs) {
    console.log(secs);

    function pad(num) {
      return ("0" + num).slice(-2);
    }

    var minutes = Math.floor(secs / 60);
    secs = secs % 60;
    var hours = Math.floor(minutes / 60)
    minutes = minutes % 60;
    return pad(hours) + ":" + pad(minutes) + ":" + pad(secs);
  }

  $s.getImgsHead = function () {
    pcs.getImgsHead(function (rhi) {
      $s.listImgHead = rhi.data.result;
    })
  }

  $s.getBookAndUnity = function (code, numberunity) {
    console.log(code);
    acts.getBookByCode(code, function (rb) {
      $s.book = rb.data.result;
      $s.generateLink($s.book.id);
      $s.getDataClass();
      //console.log($s.book.id);
      if ($s.book.id !== undefined) {
        acts.getUnitysByNumber($s.book.id, numberunity, function (ru) {
          $s.unity = ru.data.result;
          //console.log($s.unity);
          if ($s.unity === false) {
            //us.irAnimFullColor('404','blue');
            $s.linkWrong('getUnitysByNumber');
          } else {
            var pages_number = $s.unity.end_page - $s.unity.start_page;
            var pdfpath = '../../../../lib/media/content/books/' + $s.book.code + '/unidad' + $s.unity.number + '.pdf';
            $s.getResourcesByUnity();
            $s.real_pg = pages_number + 2;
            if (!$s.noLoad) {
              $s.initBook(pdfpath, pages_number);
            }
          }
        })
      } else {
        $s.linkWrong('book');
      }
    })
  }

  $s.linkWrong = function (message) {
    $s.noLoad = true;
    us.toast(gss.link_bad + " " + message, 'i');
  }

  $s.generateLink = function (id_book) {
    var link = 'libros/';
    pds.generateTree(id_book, function (r) {
      $s.linkbook = link + '' + r.data.result.link;
    })
  }

  $s.initBook = function (pdfpath, pages_number) {
    var real_pg = pages_number + 2;
    var link_book = gss.link_pe + '/' + $s.linkbook + '/' + $s.amb + '/' + $s.class_code;

    var link_class = (parseInt($s.user_type) == 1) ? gss.url_alumn : gss.url_teacher;
    link_class = gss.link_pe + '/' + link_class + '/clase/' + $s.amb + '/' + $s.class_code;

    var html_end_demo = '<div class="back_demo"><img src="' + gss.path_bookcontent + $s.book.code + '/back_demo.jpg" />' +
      '<div class="text_end_demo display-4">' + gss.text_end_unity + ' <br><br>' +
      '<a class="btn btn-ebio" target="_blank" href="' + link_book + '">' + gss.unity_change + '</a>' +
      '<a class="btn btn-ebio" target="_blank" href="' + link_class + '">' + gss.go_to_class + '</a>' +
      '</div>' +
      '</div>';
    console.log('Entrando linea 175');
    timeout(function () {

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
        propertiesCallback: function (props) {
          props.renderInactivePagesOnMobile = true;
          props.preloadPages = (isMobile.any) ? 2 : 5;
          props.sheet.startVelocity = 1;
          props.sheet.cornerDeviation = 0;
          props.sheet.flexibleCorner = 0.5;
          props.sheet.flexibility = 0;
          props.sheet.flexibility.bending = 1;
          props.cssLayersLoader = function (n, clb) { // n - page number   
            if (n == real_pg + 2) {
              clb([{
                html: html_end_demo,
                js: function (jContainer) {
                  return {
                    show: function () {
                      $s.changePage(n);
                    }
                  };
                }
              }]);
            } else {
              clb([{
                css: '',
                html: $s.displayButtonsActivitys(n),
                js: function (jContainer) { // jContainer - jQuery element that contains HTML Layer content
                  //console.log('init');
                  return { // set of callbacks 
                    show: function () {
                      if (n == 0) {
                        var iframe = $('iframe').contents();
                        iframe.find(".inpPage").focus().blur();
                      }
                    },
                    shown: function () {
                      $s.eventosB(n);
                    }
                  };
                }
              }]);
            }
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
        ready: function () {
          $s.book_loaded = true;
          $("body").addClass("pe");
          var iframe = $('iframe').contents();
          iframe.find("body")[0].classList.add("pe");
        }
      });
    }.bind($s))
  }

  $s.eventosB = function (n) {
    page = n + (parseInt($s.unity.start_page) - 3);
    var iframe = document.getElementsByTagName("iframe")[0];
    var doci = iframe.contentWindow.document;
    var buttonsA = doci.getElementsByClassName("btn-activitys-" + page);
    var statusev = 0;
    if (buttonsA.length > 0) {
      [].forEach.call(buttonsA, theButton => {
        statusev = parseInt(theButton.getAttribute("estatus_evaluate"));
        console.log(statusev);
        if (parseInt(theButton.getAttribute("type")) == 10) {
          typeEvent = parseInt(theButton.getAttribute("eventTrigger"));
          if (typeEvent == 1) {
            theButton.addEventListener('mouseover', () => {
              $s.playTTS(page, theButton);
            })
          } else {
            theButton.addEventListener('click', () => {
              $s.playTTS(page, theButton);
            })
          }
        } else if (parseInt(theButton.getAttribute("type")) == 11) {
          typeEvent = parseInt(theButton.getAttribute("eventTrigger"));
          if (typeEvent == 1) {
            theButton.addEventListener('mouseover', () => {
              $s.playAudioOver(page, theButton);
            })
          } else {
            theButton.addEventListener('click', () => {
              $s.playAudioOver(page, theButton);
            })
          }
        } else {
          if (statusev == 0) {
            console.log('Entrando');
            theButton.addEventListener('click', () => {
              $s.showActivity(page, theButton);
            })
          } else {
            theButton.addEventListener('click', () => {
              $s.showActivityMade(page, theButton, statusev);
            })
          }
        }
      });
    }
  }

  $s.isPlayingTTS = false;
  window.theSynth;
  window.utterThis;

  $s.playTTS = function (page, button) {
    window.theSynth = window.speechSynthesis || window.webkitSpeechSynthesis;
    page = parseInt(button.getAttribute("page"));
    ida = parseInt(button.getAttribute("ida"));

    $s.stopAudioPlaying();

    angular.forEach($s.activitysByPage[page], function (resource, key) {
      if (resource.id == ida) {
        console.log('Entrando 321');
        $s.resourceTTS = resource;
        window.theSynth.cancel();
        window.utterThis = new SpeechSynthesisUtterance($s.resourceTTS.text_extra);
        window.utterThis.addEventListener('start', function (event) {
          $s.isPlayingTTS = true;
          $s.ledAudioPlaying();
        });
        window.utterThis.addEventListener('end', function (event) {
          $s.isPlayingTTS = false;
          $s.stopAudioPlaying();
        });
        window.theSynth.speak(window.utterThis);
      }
    })
  }

  $s.playAudioOver = function (page, button) {
    page = parseInt(button.getAttribute("page"));
    ida = parseInt(button.getAttribute("ida"));
    var context = new AudioContext();
    var theBuffer;

    function playAudioUrl(audioBuffer) {
      window.playingAudioOver = context.createBufferSource();
      playingAudioOver.buffer = audioBuffer;
      playingAudioOver.connect(context.destination);
      playingAudioOver.start();
      playingAudioOver.onended = function () {
        $s.stopAudioPlaying();
      };
    }

    $s.stopAudioPlaying();

    angular.forEach($s.activitysByPage[page], function (resource, key) {
      if (resource.id == ida) {
        $s.resourceAudioOver = resource;
        console.log($s.resourceAudioOver);
        URL = gss.path_pecontent_upload + $s.resourceAudioOver.files[0].folder + '/' + $s.resourceAudioOver.files[0].filename;
        window.fetch(URL)
          .then(response => response.arrayBuffer())
          .then(arrayBuffer => context.decodeAudioData(arrayBuffer))
          .then(audioBuffer => {
            theBuffer = audioBuffer;
            playAudioUrl(theBuffer);
            $s.ledAudioPlaying();
          });
      }
    })
  }

  $s.ledAudioPlaying = function () {
    document.getElementById("playingAudioLed").style.opacity = 1;
  }

  $s.stopAudioPlaying = function () {
    document.getElementById("playingAudioLed").style.opacity = 0;
    if (window.theSynth !== undefined) {
      window.theSynth.cancel();
    }
    if (window.playingAudioOver !== undefined) {
      window.playingAudioOver.stop();
    }
  }


  $s.changePage = function (pag) {
    $s.checkActivity(pag);
  }

  $s.getResourcesByUnity = function () {
    acts.getResourcesByUnity($s.unity.id, $s.class_code, function (r) {
      $s.activitys = r.data.result;

      console.log($s.activitysByPage);

      var cont = 0;
      $s.activitysByPage[0] = [];
      $s.activitysByPage[1] = [];
      for (i = parseInt($s.unity.start_page); i <= parseInt($s.unity.end_page); i++) {
        $s.activitysByPage[i] = [];
      }

      angular.forEach($s.activitys, function (value, key) {
        $s.activitysByPage[parseInt(value.page)].push(value);
      })

      if ($s.activitys.length == 0)
        us.toast("Esta unidad no posee actividades asociadas", 'i');
    })
  }




  $s.evaluando = false;

  $s.displayButtonsActivitys = function (page) {

    //document.getElementById("blink_resources").style.opacity = 0;
    /* if($s.lastCheck != page){
      $s.lastCheck = page;  
 

      if(!$s.evaluando){*/

    var iframe = document.getElementsByTagName("iframe")[0];
    var doci = iframe.contentWindow.document;
    doci.querySelectorAll('.pdfLoaded').forEach(function (a) {
      a.remove()
    })
    doci.querySelectorAll('.btnClosePDFLoaded').forEach(function (a) {
      a.remove()
    })

    let checkEO = page % 2;
    var fbu = '';
    if (page % 2 != 0) {
      //document.getElementById("blink_resources_r").style.opacity = 0; 
      fbu = 'left';
    } else {
      //document.getElementById("blink_resources_l").style.opacity = 0;
      fbu = 'right';
    }

    $s.evaluando = true;
    page = parseInt(page) + (parseInt($s.unity.start_page) - 3);
    $s.page_read = page;
    var fondoBack = '<div class="fondoBack fondoBack-' + page + ' ' + fbu + '" page="' + page + '" book="' + $s.book.id + '" code="' + $s.book.code + '" ></div>';
    var htmlButton = '';

    if (Array.isArray($s.activitysByPage[page])) {
      if ($s.activitysByPage[page].length > 0) {
        //console.log($s.activitysByPage[page]);
        //document.getElementById("blink_resources_l").style.opacity = 1; 
        angular.forEach($s.activitysByPage[page], function (activity, key) {
          var dataButton = activity;
          console.log(activity);
          //console.log(dataButton.type);
          if (doci.getElementById('ba_' + activity.id) !== null) {
            var element = doci.getElementById('ba_' + activity.id);
            element.parentNode.removeChild(element);
          }

          if (parseInt(dataButton.type) == 10) {
            var b_display = 'position:absolute; left: ' + dataButton.button_left + '%; top: ' + dataButton.button_top + '%; opacity:1; width: ' + dataButton.width + '%; height: ' + dataButton.height + '%; ';
            if ($("#ba_" + dataButton.id).length == 0)
              htmlButton += '<div id="ba_' + dataButton.id + '" page="' + page + '" eventTrigger="' + dataButton.value + '" type="' + dataButton.type + '" code="' + dataButton.code + '" ida="' + dataButton.id + '" class="areaTTS btn-activitys-' + page + ' " style="' + b_display + '""></div>';

          } else if (parseInt(dataButton.type) == 11) {
            var b_display = 'position:absolute; left: ' + dataButton.button_left + '%; top: ' + dataButton.button_top + '%; opacity:1; width: ' + dataButton.width + '%; height: ' + dataButton.height + '%; ';

            if ($("#ba_" + dataButton.id).length == 0)
              htmlButton += '<div id="ba_' + dataButton.id + '" page="' + page + '" eventTrigger="' + dataButton.value + '" type="' + dataButton.type + '" code="' + dataButton.code + '" ida="' + dataButton.id + '" class="areaTTS btn-activitys-' + page + ' " style="' + b_display + '""></div>';

          } else {
            console.log(dataButton);
            if (dataButton.link_book == 1) {
              //console.log('Entrando 478');
              var b_display = 'position:absolute; left: ' + dataButton.button_left + '%; top: ' + dataButton.button_top + '%; opacity:1;';
              var b_class = $s.colors[dataButton.button_color].class;
              var b_icon = '<i class="' + dataButton.button_icon + '"></i>';

              console.log($("#ba_" + dataButton.id).length);

              if ($("#ba_" + dataButton.id).length == 0)
                htmlButton += '<button id="ba_' + dataButton.id + '" page="' + page + '" estatus_evaluate="' + dataButton.estatus_evaluate + '" type="' + dataButton.type + '" code="' + dataButton.code + '" ida="' + dataButton.id + '" title="' + dataButton.name + '" class="btn btn-activitys btn-activitys-' + page + ' ' + b_class + '" style="' + b_display + '"">' + b_icon + dataButton.button_title + '</button>';

            }
          }

          console.log(page, htmlButton);

        });
      }
    }

    //console.log(htmlButton);

    return fondoBack + htmlButton;
  }

  $s.updateButtonActivity = function (activity) {
    console.log('Entrando 505');
    var iframe = document.getElementsByTagName("iframe")[0];
    var doci = iframe.contentWindow.document;

    var htmlButton = '';
    var dataButton = activity;

    var element = doci.getElementById('ba_' + activity.id);
    var contenedor = element.parentNode;
    element.parentNode.removeChild(element);


    var b_display = 'position:absolute; left: ' + dataButton.button_left + '%; top: ' + dataButton.button_top + '%; opacity:1;';
    var b_class = $s.colors[dataButton.button_color].class;
    var b_icon = '<i class="' + dataButton.button_icon + '"></i>';

    var theButton = doci.createElement("button");
    theButton.setAttribute("id", "ba_" + dataButton.id);
    theButton.setAttribute("page", dataButton.page);
    theButton.setAttribute("estatus_evaluate", dataButton.estatus_evaluate);
    theButton.setAttribute("type", dataButton.type);
    theButton.setAttribute("code", dataButton.code);
    theButton.setAttribute("ida", dataButton.id);
    theButton.setAttribute("title", dataButton.name);
    theButton.setAttribute("class", "btn btn-activitys btn-activitys-" + dataButton.page + " " + b_class);
    theButton.setAttribute("style", b_display);
    theButton.innerHTML = b_icon + dataButton.button_title;
    console.log(dataButton);

    if (dataButton.estatus_evaluate == '0') {
      theButton.addEventListener('click', () => {
        console.log(dataButton.page);
        $s.showActivity(dataButton.page, theButton);
      })
    } else {
      theButton.addEventListener('click', () => {
        $s.showActivityMade(dataButton.page, theButton, dataButton.estatus_evaluate);
      })
    }

    contenedor.appendChild(theButton);
  }

  $s.getByIdFind = function (array_search, id) {
    return (array_search !== undefined && array_search !== null && id !== undefined) ? array_search.find(x => x.id === id) : {};
  }

  $s.showResourcesAviables = function () {
    var iframe = document.getElementsByTagName("iframe")[0];
    var doci = iframe.contentWindow.document;
    var fondoBack = doci.querySelector('.fondoBack');

    fondoBack.style.opacity = 1;
    setTimeout(function () {
      fondoBack.style.opacity = 0;
    }, 1000);
  }

  $s.init_activity = function (page) {
    $s.times = 0;
    $(".ml4, .ml4 span").css("opacity", 1);
    timeout(function () {
      if (parseInt($s.activityOpen.time_band) == 1) {
        $s.activityProccess = 0.5;
        $s.animationStartTime();
      } else {
        $s.pageActivityOpen = page;
        $s.activityProccess = 1;
        $s.times++;
        $s.timerRunning = false;
      }
    })
  }

  $s.dataActivityTemp = {
    'page': 0,
    'key': 0
  };
  $s.showActivity = function (pag, button) {
    console.log('Entrando linea 583');
    page = parseInt(button.getAttribute("page"));
    ida = parseInt(button.getAttribute("ida"));
    type = parseInt(button.getAttribute("type"));
    code = button.getAttribute("code");
    //console.log(page);
    console.log(ida);
    //console.log(type);
    //console.log(code);
    console.log($s.activitysByPage[page]);
    //$s.getFormActivity();
    angular.forEach($s.activitysByPage[page], function (resource, key) {
      console.log(resource);
      if (resource.id == ida) {
        console.log('Entrando linea 597');
        $s.activityOpen = resource;
        if (type == 2) {
          us.irNewTab(gss.link_pe + '/actividad' + '/' + $s.amb + '/' + $s.class_code + '/' + ida + '/' + code);
          console.log(gss.link_pe + '/actividad' + '/' + $s.amb + '/' + $s.class_code + '/' + ida + '/' + code);
        } else if (type == 1) {
          $s.dataActivityTemp = {
            'page': page,
            'key': key
          };
          $s.getFormActivity(resource);
          $s.init_activity(page);
        } else if (type == 3 || type == 4 || type == 5 || type == 6 || type == 7 || type == 8) {
          $s.showResource(resource);
        }
      }
    });
  }

  $s.showActivityMade = function (pag, button, estatusev) {
    page = parseInt(button.getAttribute("page"));
    ida = parseInt(button.getAttribute("ida"));
    type = parseInt(button.getAttribute("type"));
    code = button.getAttribute("code");

    //$s.getFormActivity(); 
    angular.forEach($s.activitysByPage[page], function (resource, key) {
      if (resource.id == ida) {
        $s.initActivityView(resource);
      }
    });
  }

  $s.initActivityView = function (resource) {
    /// timeout(function(){
    // $("#activityView").modal("show");
    $("#activityView").addClass("modal fade d-flex").removeClass("d-none");
    $("#activityView").modal('show');
    $('#activityView').on('shown.bs.modal', function (event) {
      $s.getFormActivityView(resource);
      $s.activityView = resource;

      if ($s.activityView.estatus_evaluate == '0' || $s.activityView.estatus_evaluate == '1') {
        $s.averageData.class = 'wait';
        $s.averageData.class_color = 'text-dark';
        $s.averageData.icon = 'fa-clock';
        $s.averageData.text = '';
      } else if ($s.activityView.estatus_evaluate == '2') {
        $s.averageData.icon = 'fa-check';
        var score = Math.round($s.activityView.score);
        $s.averageData.text = $s.translateScore(score).text;
        //console.log(score, $s.activityView.id_calification_type); 
        //console.log($s.translateScore(score));
        if ($s.activityView.id_calification_type == '1') {
          if (parseInt(score) == 1) {
            $s.averageData.class = 'deficient';
            $s.averageData.class_color = 'text-danger';
          } else if (parseInt(score) == 2) {
            $s.averageData.class = 'regular';
            $s.averageData.class_color = 'text-orange';
          } else if (parseInt(score) == 3) {
            $s.averageData.class = 'good';
            $s.averageData.class_color = 'text-info';
          } else if (parseInt(score) == 4) {
            $s.averageData.class = 'excelent';
            $s.averageData.class_color = 'text-success';
          }
        } else if ($s.activityView.id_calification_type == '2') {
          if (parseInt(score) < 10) {
            $s.averageData.class = 'deficient';
            $s.averageData.class_color = 'text-danger';
          } else if (parseInt(score) > 10 && parseInt(score) < 14) {
            $s.averageData.class = 'regular';
            $s.averageData.class_color = 'text-orange';
          } else if (parseInt(score) > 13 && parseInt(score) < 18) {
            $s.averageData.class = 'good';
            $s.averageData.class_color = 'text-info';
          } else {
            $s.averageData.class = 'excelent';
            $s.averageData.class_color = 'text-success';
          }
        }
      }
      $s.$apply();
    })
    $('#activityView').on('hide.bs.modal', function (event) {
      $("#activityView").removeClass("modal fade d-flex").addClass("d-none");
    })
    //})
  }

  $s.showResource = function (resource) {
    console.log('Entrando 682');
    $s.resourceOpen = resource;
    timeout(function () {
      $("#resourceModal").addClass("modal fade d-flex").removeClass("d-none");
      $("#resourceModal").modal('show');

      //console.log(resource); 

      $('#resourceModal').modal().on('shown.bs.modal', function (e) {
        //console.log(resource);

        $s.stopAudioPlaying();

        if ($s.resourceOpen.type == "6") {
          var coverAudioModal = '';
          var audioModal = '';
          console.log($s.resourceOpen);
          if ($s.isAudio($s.resourceOpen.files[0].filename)) {
            coverAudioModal = gss.path_pecontent_upload + $s.resourceOpen.files[1].folder + '/' + $s.resourceOpen.files[1].filename;
            audioModal = gss.path_pecontent_upload + $s.resourceOpen.files[0].folder + '/' + $s.resourceOpen.files[0].filename;
          } else {
            coverAudioModal = gss.path_pecontent_upload + $s.resourceOpen.files[0].folder + '/' + $s.resourceOpen.files[0].filename;
            audioModal = gss.path_pecontent_upload + $s.resourceOpen.files[1].folder + '/' + $s.resourceOpen.files[1].filename;
          }
          document.getElementById("coverPreviewUploadModal").setAttribute('src', coverAudioModal);
          aud = document.getElementById("audioPreviewUploadModal");
          aud.setAttribute('src', audioModal);
          $s.playAudio();
          aud.ontimeupdate = function () {
            $('.progressAudio').css('width', aud.currentTime / aud.duration * 100 + '%')
          }
        }

        if ($s.resourceOpen.type == "7") {
          var videoModal = gss.path_pecontent_upload + $s.resourceOpen.files[0].folder + '/' + $s.resourceOpen.files[0].filename;
          document.getElementById("videoPreviewUploadModal").setAttribute('src', videoModal);
          document.getElementById("videoPreviewUploadModal").play();
        }

      })


      $('#resourceModal').on('hide.bs.modal', function (event) {
        $("#resourceModal").removeClass("modal fade d-flex").addClass("d-none");
        if ($s.resourceOpen.type == "6") {
          document.getElementById("audioPreviewUploadModal").pause();
        }
        if ($s.resourceOpen.type == "7") {
          document.getElementById("videoPreviewUploadModal").pause();
        }
        if ($s.resourceOpen.type == "10") {
          alert("Off TTS");
        }

      })

    })
  }

  $s.playAudio = function () {
    document.getElementById('audioPreviewUploadModal').play();
    document.getElementById('btnPlayAudio').style.display = 'none';
    document.getElementById('btnPauseAudio').style.display = 'block';
  }

  $s.pauseAudio = function () {
    document.getElementById('audioPreviewUploadModal').pause();
    document.getElementById('btnPauseAudio').style.display = 'none';
    document.getElementById('btnPlayAudio').style.display = 'block';
  }

  $s.getFormActivity = function (activity) {
    console.log('Entrando');
    //$("#activityModal").modal("show");
    $("#activityModal").addClass("modal fade d-flex").removeClass("d-none");
    $("#activityModal").modal('show');

    $("#activityModal").on('shown.bs.modal', function (event) {
      timeout(function () {
        $s.user_type = $s.sesdata.id_type;
      })
    })

    $('#activityModal').on('hide.bs.modal', function (event) {
      $("#activityModal").removeClass("modal fade d-flex").addClass("d-none");
    })


    acts.getFormActivity(activity, function (r) {
      $s.modeOpen = 1;
      var arrayActivity = r.data.result;
      var position = 0;
      arrayActivity.forEach(function (element) {
        if (element.type == 'konva') {
          window.konvasData[element.name] = element.value;
          arrayActivity[position].value = '';
        } else if (element.type == 'dragg') {
          window.draggData[element.name] = element.value;
          arrayActivity[position].value = '';
        }
        if (element.puntaje === undefined)
          arrayActivity[position].puntaje = 0;
      });
      $s.activityJson = arrayActivity;

      $('.fb-render').formRender({
        dataType: 'json',
        formData: $s.activityJson,
        disableInjectedStyle: true,
        templates: $s.templates,
        notify: {
          success: function (message) {
            $('.fb-render').children(".rendered-form").removeClass("rendered-form");
            angular.forEach($s.activityJson, function (value, key) {
              name = value.name;
              if (name.startsWith("file")) {
                input = document.getElementById(name);
                input.addEventListener('change', (e) => {
                  $s.uploadFileActivity(e);
                })
              }
            })
          }
        }
      });
    })
  }

  $s.getFormActivityView = function (activity) {
    acts.getFormActivityQuestion(activity.id, activity.question_id + '_' + activity.question_code, function (r) {
      var arrayActivity = r.data.result;
      $s.modeOpen = 2;
      var position = 0;
      arrayActivity.forEach(function (element) {
        if (element.type == 'dragg') {
          window.draggData[element.name] = element.value;
          arrayActivity[position].value = '';
        }
      });
      $s.activityForm = arrayActivity;
      //console.log($s.activityForm);
      $('.form-render-view').empty();
      $('.form-render-view').formRender({
        dataType: 'json',
        formData: $s.activityForm,
        disableInjectedStyle: true,
        templates: $s.templates,
        notify: {
          success: function (message) {
            $(".form-render-view").children(".rendered-form").removeClass("rendered-form");
            $s.renderEvaluationForm(activity.question_id + '_' + activity.question_code);
          }
        }
      });
    })
  }

  $s.renderEvaluationForm = function (question_code) {
    acts.getActivityQuestion(question_code, function (r) {
      //console.log(r.data.response);
      if (r.data.response) {
        $s.questions_head = r.data.result.head;
        $s.questions_detail = r.data.result.detail;
        /*if($s.questions_head.status == 2){ 
          acts.getActivityQuestionLog(question_code, function(r){
            $s.evaluation_log = r.data.result;
            var translateScore;
            angular.forEach($s.evaluation_log, function(value, key) { 
              translateScore = $s.translateScore($s.evaluation_log[key].score);
              $s.evaluation_log[key].scoredLetterCode = translateScore.code;
              $s.evaluation_log[key].scoredLetterText = translateScore.text;
              $s.evaluation_log[key].scoredRound = Math.round($s.evaluation_log[key].score);
            })
          })
        }*/
        var types_render_special = gss.types_render_special;
        angular.forEach($s.activityForm, function (field, key) {
          if (types_render_special.indexOf(field.type) >= 0) {
            if (field.type == 'file') {
              var linkFile = document.createElement("a");
              linkFile.setAttribute("href", field.value);
              linkFile.innerHTML = gss.download + ' ' + gss.file;
              linkFile.setAttribute("download", "download");
              linkFile.setAttribute("class", "btn btn-ebio br-1 m-1");
              var theelement = document.getElementById(field.name);
              theelement.style.display = 'none';
              theelement.parentNode.insertBefore(linkFile, theelement);
            }
          }

        })

        angular.forEach($s.questions_detail, function (value, key) {
          rmDiv = document.querySelector('.code_' + value.code);
          if (rmDiv !== null)
            rmDiv.remove();

          var temp = undefined;
          if (value.type == 'checkbox-group' || value.type == 'radio-group') {
            var theelement = (value.type == 'checkbox-group') ? document.getElementsByName(value.code + '[]') : document.getElementsByName(value.code);
            for (i = 0; i < theelement.length; i++) {
              document.getElementById(value.code + '-' + i).disabled = true;
              var contcg = document.getElementsByClassName('field-' + value.code)[0];
              temp = contcg.getElementsByClassName(value.type)[0];
            }
          } else if (value.type == 'textarea') {
            if (tinymce.get(value.code) === null) {
              document.getElementById(value.code).disabled = true;
            } else {
              tinymce.get(value.code).setMode('readonly');
            }
            temp = document.getElementById(value.code);
          } else {
            document.getElementById(value.code).disabled = true;
            temp = document.getElementById(value.code);
          }


          newNode = $s.templateEvaluateNode(value);
          referenceNode = temp;
          $s.insertAfter(newNode.node, referenceNode, function () {
            $s.setStyleNavEvaluate(value.code, newNode.id_select, newNode.score);
          });
        });
      } else {
        $s.linkWrong('getActivityQuestion');
      }
    })
  }

  $s.insertAfter = function (newNode, referenceNode, event) {
    referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
    event();
  }

  $s.templateEvaluateNode = function (field) {
    id = field.id;
    code = field.code;
    comment = field.comment;
    score = field.score;
    score = Math.round(score);

    var divk = document.createElement("div");
    divk.setAttribute('id', `ev-${code}`);
    divk.setAttribute('class', 'nav-evaluate-detail code_' + code);

    if ($s.activityView.id_calification_type == '1') {
      id_select = field.id_score_letter;
    } else {
      id_select = $s.calcRangeEvaluation.id;
    }

    if (id_select === null)
      id_select = 0;

    divk.appendChild($s.createIconSelect(code, id_select));
    divk.appendChild($s.createDivScoreLetter(id, score, id_select));

    if ($s.activityView.id_calification_type == '2') {
      divk.appendChild($s.createDivScoreNum(id, code, score));
    }

    divk.appendChild($s.createLabelNoteInput(comment));
    divk.appendChild($s.createNoteInput(comment));
    return {
      node: divk,
      id_select: id_select,
      score: score
    };
  }

  $s.createIconSelect = function (code, id_select) {
    var iconEv = document.createElement("i");
    iconEv.setAttribute("id", "ie-" + code);
    iconEv.setAttribute("class", "iconEvaluate text-white mx-2 fas");

    if (id_select == 0) {
      iconEv.classList.add("fa-clock");
      iconEv.classList.remove("fa-check");
    } else {
      iconEv.classList.remove("fa-clock");
      iconEv.classList.add("fa-check");
    }
    return iconEv;
  }

  $s.createDivScoreLetter = function (id, score, id_select) {
    var sectorLetter = document.createElement("span");
    sectorLetter.setAttribute("class", "px-2");

    if (id_select == 0) {
      sectorLetter.innerHTML = gss.in_wait;
    } else {
      sectorLetter.innerHTML = $s.translateScore(score).text;
    }
    return sectorLetter;
  }

  $s.createDivScoreNum = function (id, score, id_select) {
    var sectorScoreNum = document.createElement("span");
    sectorScoreNum.setAttribute("class", "px-2");

    if (id_select == 0) {
      sectorLetter.innerHTML = '';
    } else {
      sectorLetter.innerHTML = score + ' ' + gss.pts;
    }
    return sectorScoreNum;
  }

  $s.createLabelNoteInput = function (comment) {
    var commentLabel = document.createElement("label");
    commentLabel.setAttribute("class", "font-italic ml-2");
    commentLabel.innerHTML = (comment !== null && comment != "") ? gss.comment + ':' : '';
    return commentLabel;
  }

  $s.createNoteInput = function (value) {
    value = (value !== null) ? value : '';
    var spanComment = document.createElement("span");
    spanComment.setAttribute("id", "ne-" + code);
    spanComment.setAttribute("class", "noteEvaluate mx-1");
    spanComment.innerHTML = value;
    return spanComment;
  }

  $s.setStyleNavEvaluate = function (code, id_select, score) {
    var iconEv = document.getElementById("ie-" + code);
    var nav = document.getElementById("ev-" + code);

    if (id_select == 0) {
      iconEv.classList.add("fa-clock");
      iconEv.classList.remove("fa-check");
      nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} wait `);
    } else {
      iconEv.classList.remove("fa-clock");
      iconEv.classList.add("fa-check");

      if ($s.activityView.id_calification_type == '1') {
        if (parseInt(score) == 1) {
          nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} deficient`);
        } else if (parseInt(score) == 2) {
          nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} regular`);
        } else if (parseInt(score) == 3) {
          nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} good`);
        } else {
          nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} excelent`);
        }
      } else {
        $s.setNumberSelectScored(score);
        if (parseInt(score) < 10) {
          nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} deficient`);
        } else if (parseInt(score) > 10 && parseInt(score) < 14) {
          nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} regular`);
        } else if (parseInt(score) > 13 && parseInt(score) < 18) {
          nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} good`);
        } else {
          nav.setAttribute('class', `nav-evaluate nav-evaluate-detail code_${code} excelent`);
        }
      }
    }
  }


  $s.uploadFileActivity = function (e) {
    nameField = e.target.id;
    if (document.getElementById('msj-' + nameField) === null || document.getElementById('msj-' + nameField) === undefined) {
      var arearesult = document.createElement("div");
      arearesult.setAttribute('id', 'msj-' + nameField);
      arearesult.classList.add("w-100");
      arearesult.classList.add("text-center");
      document.querySelector('.field-' + nameField).append(arearesult);
    }

    var pathUpload = '../../apibeta/public/resource/activity/upload';

    var input = e.target;
    var files = e.target.files || e.dataTransfer.files;

    var areamsj = document.getElementById('msj-' + nameField);
    areamsj.innerHTML = gss.msg_upload_process;

    function completeUpload(event) {
      var resp = event.target.response;

    }

    $s.getBase64(files[0]).then(
      function (data64) {
        var data = {
          file: data64,
          activity: $s.activityOpen,
          filename: files[0].name,
          nameField: nameField
        };
        acts.attachFileActivityStudent(data, function (r) {
          var msj = areamsj;
          if (r.data.response) {
            msj.innerHTML = '<span class="text-primary">' + gss.msg_upload_success + '</div>';
          } else {
            msj.innerHTML = '<span class="text-danger">' + gss.msg_upload_error + '</div>';
          }
        })
      }
    );
  }

  $s.getBase64 = function (file) {
    return new Promise(function (resolve, reject) {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }



  $s.getJsonDragg = function (name) {
    return window.draggData[name];
  }


  $s.animationStartTime = function (page) {
    $("#activityModal .modal-content").addClass('changeColorBlue');

    $s.activityOpen.timeSeconds = moment.duration($s.activityOpen.time).asSeconds();
    $s.activityOpen.timeMinutes = moment.duration($s.activityOpen.time).asMinutes();
    $s.activityOpen.timeHours = moment.duration($s.activityOpen.time).asHours();
    if ($s.activityOpen.timeHours > 1) {
      $s.activityOpen.msjTime = $s.activityOpen.timeHours + ' ' + gss.hours;
      totalmh = ($s.activityOpen.timeHours * 60);
      if (($s.activityOpen.timeMinutes - totalmh) > 1) {
        difmh = $s.activityOpen.timeMinutes - totalmh;
        $s.activityOpen.msjTime += gss.and + ' ' + difmh + ' ' + gss.minutes;
      }
    } else if ($s.activityOpen.timeHours == 1) {
      $s.activityOpen.msjTime = $s.activityOpen.timeHours + ' ' + gss.hour;
    } else {
      if ($s.activityOpen.timeMinutes >= 1) {
        $s.activityOpen.msjTime = $s.activityOpen.timeMinutes + ' ' + gss.minutes;
      } else {
        $s.activityOpen.msjTime = $s.activityOpen.timeSeconds + ' ' + gss.seconds;
      }

    }

    var ml4 = {};
    ml4.opacityIn = [0, 1];
    ml4.scaleIn = [0.2, 1];
    ml4.scaleOut = 3;
    ml4.durationIn = 500;
    ml4.durationOut = 1000;
    ml4.delay = 500;

    anime.timeline({
        loop: false
      })
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

  $s.acceptTimer = function () {
    $("#activityModal .modal-content").addClass('changeColorWhite');
    $sectorTimer = angular.element(document.querySelector('#timewrapper'));
    $sectorTimer.append($s.timerHTML($s.activityOpen.timeSeconds));
    compile($sectorTimer.contents())($s);
    $s.$broadcast('timer-start');
    $s.timerRunning = true;
    $s.pageActivityOpen = page;
    $s.activityProccess = 1;
    $s.times++;
    $s.timerRunning = true;
  }


  $s.timerHTML = function (seconds) {
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

  $s.getDataQuestions = function () {

    $s.emailFormat = /^[a-z]+[a-z0-9._]+@[a-z]+\.[a-z.]{2,5}$/;
    //var $dataForm =  $("#form_" + side).serializeArray(); 
    var idta = '';
    var vacio = false;

    /*for (var i = 0; i < tinymce.editors.length; i++) {
      var editorInstance = tinymce.editors[i];
      alert(editorInstance.getContent());
    }*/
    $s.dataFormFinal = [];

    angular.forEach($s.activityJson, function (value, key) {
      //console.log(value);
      name = value.name;
      type = value.type;
      if (type == "textarea") {
        idta = $("#" + value.name);
        if (tinymce.get(value.name) === null) {
          value.value = $("#" + value.name).val();
        } else {
          value.value = tinymce.get(value.name).getContent();
        }
        $s.dataFormFinal.push(value);
        if (value.value === undefined || value.value == "") {
          vacio = true;
        }
      } else if (type == "text" || type == "select" || type == "check" || type == "autocomplete" || type == "input" || type == "number" || type == "date") {
        value.value = $("#" + value.name).val();
        $s.dataFormFinal.push(value);
        if (value.value === undefined || value.value == "") {
          vacio = true;
        }
      } else if (type == "radio-group") {
        var checkedRadioBtnList = new Array();
        var radioElement = document.getElementsByName(value.name);
        var values = new Array(); //ACA 
        value.value = "";
        for (i = 0; i < radioElement.length; i++) {
          var selector = 'label[for=' + radioElement[i].id + ']';
          var label = document.querySelector(selector);
          var valueTemp = document.getElementById(value.name + '-' + i);

          if (radioElement[i].checked) {
            values.push({
              label: label.innerHTML,
              value: (radioElement[i].value == 'on') ? 'opcin-' + i : radioElement[i].value,
              'selected': true,
              'index': i + 1
            })
            value.value = label.innerHTML;
            if (value.value === undefined || value.value == "") {
              vacio = true;
            }
          } else {
            values.push({
              label: label.innerHTML,
              value: (radioElement[i].value == 'on') ? 'opcin-' + i : radioElement[i].value,
              'selected': false,
              'index': i + 1
            })
          }
        }
        value.values = values;
        $s.dataFormFinal.push(value);

      } else if (type == "checkbox-group") {
        var checkedRadioBtnList = new Array();
        var values = new Array(); //ACA 
        var radioElement = document.getElementsByName(value.name + '[]');
        value.value = "";
        for (i = 0; i < radioElement.length; i++) {
          var selector = 'label[for=' + radioElement[i].id + ']';
          var label = document.querySelector(selector);
          var valueTemp = document.getElementById(value.name + '-' + i);

          if (radioElement[i].checked) {
            values.push({
              label: label.innerHTML,
              value: (valueTemp.value == 'on') ? 'opcin-' + i : valueTemp.value,
              'selected': true,
              'index': i + 1
            })
            value.value = label.innerHTML;
            if (value.value === undefined || value.value == "") {
              vacio = true;
            }
          } else {
            values.push({
              label: label.innerHTML,
              value: (valueTemp.value == 'on') ? 'opcin-' + i : valueTemp.value,
              'selected': false,
              'index': i + 1
            })
          }
        }
        value.values = values;
        $s.dataFormFinal.push(value);
      } else if (type == "file") {
        var extension = $s.getFileExtension($("#" + value.name).val());
        value.value = gss.path_pecontent_upload_activity + value.name + '.' + extension;
        $s.dataFormFinal.push(value);
        if (value.value === undefined || value.value == "") {
          vacio = true;
        }
      } else if (type == "image" || type == "uploader") {
        var path = document.getElementById('link-' + value.name).getAttribute('href');
        value.value = path;
        $s.dataFormFinal.push(value);
        if (value.value === undefined || value.value == "") {
          vacio = true;
        }
      } else if (type == "konva") {
        var jsonkonva = window.konvaStore['knv-' + value.name + '-preview'];
        value.value = jsonkonva.toJSON();
        value.path = gss.path_pecontent_activity_question + value.name + '.png';
        var image = jsonkonva.toImage({
          callback: function (img) {
            var imgsrc = img.getAttribute('src');
            value.img = imgsrc;
          }
        });
        $s.dataFormFinal.push(value);
      } else if (type == "dragg") {
        var data = window.draggData[value.name];
        //value.value_correct = data;
        value.value = $s.generateJsonDragg(value.name);
        $s.dataFormFinal.push(value);
      } else {
        $s.dataFormFinal.push(value);
      }
    });

    if (vacio == true) {
      us.toast("Debe responder a todas las preguntas para enviar la actividad", "i");
    } else {
      $s.step2Activity = true;
      $s.stopTime();
      $s.data_send.student_name = $s.sesdata.first_name + ' ' + $s.sesdata.last_name;
      $s.data_send.teacher_mail = ($s.sesdata.email_teacher !== null || $s.sesdata.email_teacher !== undefined) ? $s.sesdata.email_teacher : '';
      $s.data_send.student_mail = $s.sesdata.email;
      $s.activityProccess = 2;
      $(".mail_teacher").focus();
      //console.log($s.dataFormFinal); 
    }
  }

  $s.generateJsonDragg = function (name) {
    var theleft = document.querySelectorAll(`.dic-${name}-left`);
    var numLeft = theleft.length;
    var theright = document.querySelectorAll(`.dic-${name}-right`);
    var numRight = theright.length;

    var jsondragg_left = [],
      jsondragg_right = [],
      jsondragg = [];
    var contitem = 0;
    [].forEach.call(theleft, function (item) {
      var nitem = item.getAttribute('nitem');
      var texto = document.getElementById(`tx-${name}-left-${nitem}`).outerText;
      var nameimg = ($s.isImage($s.getFileExtension(document.getElementById(`img_left-${name}-${nitem}`).getAttribute('name')))) ? document.getElementById(`img_left-${name}-${nitem}`).getAttribute('name') : '';
      var img = (nameimg != '' || nameimg !== undefined) ? gss.path_pecontent_upload_activity + nameimg : false;
      jsondragg_left.push({
        'item': contitem,
        'nitem': nitem,
        'text': texto,
        'img': img
      });
      contitem++;
    });
    contitem = 0;
    [].forEach.call(theright, function (item) {
      var nitem = item.getAttribute('nitem');
      var texto = document.getElementById(`tx-${name}-right-${nitem}`).outerText;
      var nameimg = ($s.isImage($s.getFileExtension(document.getElementById(`img_right-${name}-${nitem}`).getAttribute('name')))) ? document.getElementById(`img_right-${name}-${nitem}`).getAttribute('name') : '';
      var img = (nameimg != '' || nameimg !== undefined) ? gss.path_pecontent_upload_activity + nameimg : false;
      jsondragg_right.push({
        'item': contitem,
        'nitem': nitem,
        'text': texto,
        'img': img
      });
      contitem++;
    });

    jsondragg.push({
      left: jsondragg_left,
      right: jsondragg_right
    });
    return jsondragg;
  }

  $s.getGrades = function () {
    acts.getGrades(function (r) {
      $s.grades = r.data.result;
    })
  }


  $s.sendTask = function () {
    //get ss
    var gdarray = $s.getByIdFind($s.grades, $s.book.id_grade);
    $s.activityProccess = 3;
    $s.showLoadSAQ();
    $s.data_send.student_name = $s.sesdata.first_name + ' ' + $.sesdata.last_name;
    $s.data_send.student_mail = $s.sesdata.email;
    $s.data_send.dataForm = $s.dataFormFinal;
    $s.data_send.activity = $s.activityOpen;
    $s.data_send.activity.times = $s.times;
    $s.data_send.book = $s.book;
    $s.data_send.unity = $s.unity;
    $s.data_send.studystage_id = gdarray.id_studystage;
    $("#activityModal .modal-content").addClass('changeColorBlue');
    acts.saveActivityQuestionOpen($s.data_send, function (r) {
      if (r.data.result.saveJson) {
        $s.activityProccess = 4;

        timeout(function () {
          $("#sectorLoadSAQ .letters").html(gss.sended_activity);
        }, 1500);
      }
    })
  }

  $s.sendTaskJoin = function () {
    $("div.mce-tinymce-inline").css({
      'display': 'none !important'
    });
    $s.activityProccess = 3;
    $s.showLoadSAQ();
    $s.data_send.class = $s.class_info;
    $s.data_send.dataForm = $s.dataFormFinal;
    $s.data_send.activity = $s.activityOpen;
    $s.data_send.activity.times = $s.times;
    $("#activityModal .modal-content").addClass('changeColorBlue');
    acts.saveActivityQuestion($s.data_send, function (r) {
      if (r.data.result.saveJson) {
        $s.data_send.activity.question_id = r.data.result.id;
        $s.data_send.activity.question_code = r.data.result.code;
        $s.data_send.activity.estatus_evaluate = '1';
        $s.updateButtonActivity($s.data_send.activity);
        $s.activityProccess = 4;
        timeout(function () {
          $("#sectorLoadSAQ .letters").html(gss.sended_activity);
        }, 1500);
      }
    })
  }

  $s.$on('timer-tick', function (event, args) {
    timeout(function () {
      if (args.millis == 1000) {
        $s.activityProccess = 5;
        $s.showAnimationTimeOver();
        $s.stopTime();
      };
    });
  });

  $s.stopTime = function () {
    $s.timerRunning = false;
    $s.$broadcast('timer-stop');
    $(".timewrapper").html("");
  }
  $s.closeModalActivity = function () {
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

  $s.repeatActivity = function () {
    $s.activityProccess = 1;
    $("#sectorLoadSAQ .letters").html(gss.sending_activity);
    $("#activityModal .modal-content").removeClass('changeColorBlue');
    $s.step2Activity = false;
    $s.activityJson = {};
    $('.fb-render').empty();
    $s.getFormActivity($s.activitysByPage[page][0]);
    $s.init_activity(page);
  }

  $s.showLoadSAQ = function () {
    $(".data_send").hide();
    $('.ml11 .letters').each(function () {
      $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
    });

    anime.timeline({
        loop: true
      })
      .add({
        targets: '.ml11 .line',
        scaleY: [0, 1],
        opacity: [0.5, 1],
        easing: "easeOutExpo",
        duration: 700
      })
      .add({
        targets: '.ml11 .line',
        translateX: [0, $(".ml11 .letters").width()],
        easing: "easeOutExpo",
        duration: 700,
        delay: 100
      }).add({
        targets: '.ml11 .letter',
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 600,
        offset: '-=775',
        delay: function (el, i) {
          return 34 * (i + 1)
        }
      }).add({
        targets: '.ml11',
        opacity: 0,
        duration: 1000,
        easing: "easeOutExpo",
        delay: 1000
      });
  }

  $s.showAnimationTimeOver = function () {
    $(".modal-content-activity").addClass('changeColorBlue');
    $('.ml12').each(function () {
      $(this).html($(this).text().replace(/([^\x00-\x80]|\w)/g, "<span class='letter'>$&</span>"));
    });

    anime.timeline({
        loop: true
      })
      .add({
        targets: '.ml12 .letter',
        translateX: [40, 0],
        translateZ: 0,
        opacity: [0, 1],
        easing: "easeOutExpo",
        duration: 1200,
        delay: function (el, i) {
          return 500 + 30 * i;
        }
      }).add({
        targets: '.ml12 .letter',
        translateX: [0, -30],
        opacity: [1, 0],
        easing: "easeInExpo",
        duration: 1100,
        delay: function (el, i) {
          return 100 + 30 * i;
        }
      });
  }


  $s.espacioAzulado = function () {
    $("body").addClass("htmlWelcome").append('<div id="stars"></div><div id="stars2"></div><div id="stars3"></div>')
  }

  $s.esferasAzules = function () {
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
        [{
            transform: "translate(0, 0)"
          },
          {
            transform: `translate(${to.x}rem, ${to.y}rem)`
          }
        ], {
          duration: (Math.random() + 1) * 2000, // random duration
          direction: "alternate",
          fill: "both",
          iterations: Infinity,
          easing: "ease-in-out"
        }
      );
    });
  }

  $s.getFileExtension = function (filename) {
    return (filename != null && filename !== undefined && filename != false && filename != '') ? filename.split('.').pop() : false;
  }

  $s.getFileName = function (filename) {
    var arrf = filename.split('.');
    arrf.splice(-1, 1);
    return arrf.join('');
  }

  $s.moreInfoUpload = function () {
    us.toast(gss.msj_full_info_upload, "i");
  }

  $s.removeFileTemp = function (index) {
    $s.picFiles.splice(index, 1);
  }

  $s.isImage = function (filename) {
    var allowedExtensions = /(\.jpg|\.jpeg|\.png|\.gif)$/i;
    if (!allowedExtensions.exec(filename)) {
      return false;
    } else {
      return true;
    }
  }

  $s.isVideo = function (filename) {
    var allowedExtensions = /(\.mp4)$/i;
    if (!allowedExtensions.exec(filename)) {
      return false;
    } else {
      return true;
    }
  }

  $s.isAudio = function (filename) {
    var allowedExtensions = /(\.mp3)$/i;
    if (!allowedExtensions.exec(filename)) {
      return false;
    } else {
      return true;
    }
  }

  $s.imageExists = function (image_url) {
    if ($s.isImage($s.getFileExtension(image_url))) {
      var http = new XMLHttpRequest();
      http.open('HEAD', image_url, false);
      http.send();
      console.log(http);
      return http.status != 404;
    } else {
      return false;
    }
  }


  window.loadPagePDF = function (book, code, page) {

    if (page >= 8) {
      //console.log(book, code, page);  
      var pathpdf = gss.path_pecontent_pdf + code + '/' + page + '.pdf' + '#toolbar=0&navpanes=0&scrollbar=0&view=fitH';
      var iframe = document.getElementsByTagName("iframe")[0];
      var doci = iframe.contentWindow.document;
      var fondoBack = doci.querySelector('.fondoBack-' + page);
      fondoBack.innerHTML = '<embed src="' + pathpdf + '" type="application/pdf" width="100%" height="105%" id="pdfLoaded-' + page + '" class="pdfLoaded" /><button class="btnClosePDFLoaded btn btn-danger bmd-btn-icon active" page="' + page + '" id="closePdfLoaded-' + page + '"><i class="far fa-eye fa-lg"></i></button>';
      fondoBack.style.opacity = 1;

      var theEmbed = doci.getElementById('closePdfLoaded-' + page);
      theEmbed.addEventListener("click", (e) => {
        var theel = e.target.parentElement;
        if (e.target.tagName == "I") {
          theel = e.target.parentElement.parentElement;
        }
        var pagePdf = e.target.getAttribute('page');
        theel.style.opacity = 0;
        theel.innerHTML = "";
      })
    }
  }

  $s.getScoredLetters = function () {
    lns.getScoredLetters(function (r) {
      $s.scores_letters = r.data.result;
    })
  }

  $s.getEvaluationRange = function () {
    lns.getEvaluationRange(function (r) {
      $s.evaluation_rage = r.data.result;
    })
  }

  $s.translateScore = function (score) {
    var data = {
      'code': '',
      'text': '',
      'id': 0
    };
    angular.forEach($s.scores_letters, function (value, key) {
      if (parseInt(value.value) == parseInt(score)) {
        data = {
          'code': value.code,
          'text': value.name,
          'id': value.id
        }
        return;
      }
    });
    return data;
  }

  $s.templates = {
    image: function (fieldData) {
      return {
        field: '<span id="' + fieldData.name + '">',
        onRender: function () {
          if (fieldData.value != '' && fieldData.value !== undefined) {
            var extension = $s.getFileExtension(fieldData.value);
            $("#" + fieldData.name).append('<div class="d-flex justify-content-center"><div><a id="link-' + fieldData.name + '" href="' + gss.path_pecontent_upload_activity + fieldData.name + '.' + extension + '" target="_blank"><img class="big-preview" src="' + gss.path_pecontent_upload_activity + fieldData.name + '.' + extension + '" alt="' + fieldData.name + '" /></a></div></div>');
          }
        }
      };
    },
    uploader: function (fieldData) {
      return {
        field: '<span id="' + fieldData.name + '">',
        onRender: function () {
          if (fieldData.value != '' && fieldData.value !== undefined) {
            var extension = $s.getFileExtension(fieldData.value);
            $("#" + fieldData.name).append('<div class="d-flex justify-content-center"><div><a id="link-' + fieldData.name + '" class="btn btn-ebio br-2" href="' + gss.path_pecontent_upload_activity + fieldData.name + '.' + extension + '" download>' + gss.download + '</a></div></div>');
          }
        }
      };
    },
    konva: function (fieldData) {
      return {
        field: '<div id="' + fieldData.name + '">',
        js: '../lib/konva/konva.min.js',
        onRender: function () {
          var konvaCode = new window.konvaCode;
          konvaCode.adapt(fieldData.name);
          $("#" + fieldData.name).append(konvaCode.build());
          konvaCode.onRender();
        }
      };
    },
    dragg: function (fieldData) {
      console.log(fieldData);
      return {
        field: '<div id="' + fieldData.name + '">',
        onRender: function () {
          var json_actual = $s.getJsonDragg(fieldData.name);

          console.log(json_actual);

          var name = fieldData.name;


          $("#" + fieldData.name).append('<div id="acd-' + name + '"><div class="container-fluid"><div class="row"><div class="left col-5"></div><div class="union col-2 d-flex align-content-around flex-wrap"></div><div class="right col-5"></div></div></div></div>');
          var arrayLeft = json_actual[0].left;
          var arrayRight = json_actual[0].right;

          if ($s.modeOpen == 1) {
            arrayLeft = us.shuffleArray(arrayLeft);
            arrayRight = us.shuffleArray(arrayRight);
          }


          arrayLeft.forEach(function (item, index, arr) {
            var theimgLeft = arrayLeft[index].img;
            var nitem_left = arrayLeft[index].item;
            if (theimgLeft != '' && theimgLeft !== null && theimgLeft !== false && theimgLeft !== undefined && $s.imageExists(theimgLeft)) {
              theimgLeft = `<img src="${theimgLeft}" class="img-fluid" id="img_left-${name}-${nitem_left}" />`;
            } else {
              theimgLeft = `<img id="img_left-${name}-${nitem_left}" style="display: none" />`;
            }
            var theimgRight = arrayRight[index].img;
            var nitem_right = arrayRight[index].item;
            if (theimgRight != '' && theimgRight !== null && theimgRight !== false && theimgRight !== undefined && $s.imageExists(theimgRight)) {
              theimgRight = `<img src="${theimgRight}" class="img-fluid" id="img_right-${name}-${nitem_right}" />`;
            } else {
              theimgRight = `<img id="img_right-${name}-${nitem_right}" style="display: none" />`;
            }
            $("#acd-" + fieldData.name + " .left").append(`<span class="itd col-12  d-flex justify-content-center flex-wrap dic-${name}-left" nitem="${nitem_left}">
                                                      <div class="col-5 itemJoinFinal">
                                                          <div class="w-100 text text-center my-1" id="tx-${name}-left-${nitem_left}" text="${arrayLeft[index].text}">
                                                            ${arrayLeft[index].text}
                                                          </div>
                                                          <div class="w-100 d-flex items-d-flex align-items-center justify-content-center">
                                                            ${theimgLeft}
                                                          </div>
                                                      </div>
                                                      </span>`);
            $("#acd-" + fieldData.name + " .union").append(`<div class="col-12 d-flex items-d-flex align-items-center justify-content-center itemJoinFinal">
                                                          <div class='w-100'>
                                                            <i class="fas fa-caret-left float-left fa-2x"></i>
                                                            <div class="linea w-100"></div>
                                                            <i class="fas fa-caret-right float-right fa-2x"></i>
                                                          </div>
                                                      </div>
                                                     `);
            $("#acd-" + fieldData.name + " .right").append(`<span class="col-12  d-flex justify-content-center flex-wrap dic-${name}-right" nitem="${nitem_right}">
                                                      <div class="col-5 itemJoinFinal">
                                                          <div class="w-100 text text-center my-1" id="tx-${name}-right-${nitem_right}" text="${arrayRight[index].text}">
                                                            ${arrayRight[index].text}
                                                          </div>
                                                          <div class="w-100 d-flex items-d-flex align-items-center justify-content-center">
                                                            ${theimgRight}
                                                          </div>
                                                      </div>
                                                  </span>`);
          })

          if ($s.modeOpen == 1) {
            $("#acd-" + fieldData.name + " .left").sortable({
              placeholder: "inDragg",
              axis: "y"
            });

            $("#acd-" + fieldData.name + " .right").sortable({
              placeholder: "inDragg",
              axis: "y"
            });
          }
        }
      };
    }
  };

}]);