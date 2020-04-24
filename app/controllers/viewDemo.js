app.controller('viewDemoController', ['$scope', 'globalSettingsService', 'utilService', '$timeout', 'activityService', function ($s, gss, us, timeout, acts) {
  $s.gss = gss;
  $s.us = us;

  $s.book = {};
  $s.unity = {};
  $s.book_loaded = false;
  $s.unityDemo = 1;
  $s.sumaPageAdd = 4; //portada + indice (2paginas) + ultima pagina.

  $s.init_controller = function () {
    //$s.esferasAzules();
    //$s.espacioAzulado();
    var code = us.getPartUrl(2);
    var name = us.getPartUrl(3);
    console.log(us.getPartUrl(3));
    var numberunity = (us.getPartUrl(3) === undefined) ? 1 : us.getPartUrl(3);
    $s.getBookAndUnity(code, numberunity);
    $s.sumaPageAdd

  }

  $s.getBookAndUnity = function (code, numberunity) {
    console.log(code);
    console.log(numberunity);
    acts.getBookByCode(code, function (rb) {
      $s.book = rb.data.result;
      if ($s.book.id !== undefined) {
        acts.getUnitysByNumber($s.book.id, numberunity, function (ru) {
          $s.unity = ru.data.result;
          if ($s.unity.id !== undefined) {
            var pages_number = $s.unity.end_page - $s.unity.start_page;
            var pdfpath = '../../../lib/media/content/books/' + $s.book.code + '/unidad' + $s.unity.number + '.pdf';
            $s.initBook(pdfpath, pages_number);
          } else {
            us.irAnimFullColor('404', 'blue');
          }
        })
      } else {
        alert("Enlace incorrecto");
      }
    })
  }

  $s.initBook = function (pdfpath, pages_number) {
    var real_pg = pages_number + $s.sumaPageAdd;

    var html_end_demo = '<div class="back_demo"><img src="' + gss.path_bookcontent + $s.book.code + '/back_demo.jpg" />' +
      '<div class="text_end_demo">' + gss.text_end_demo + ' <br><br>' +
      '<a class="btn btn-ebio" target="_blank" href="' + gss.link_pos + '">' + gss.text_link_pos + '</a>' +
      '<a class="btn btn-ebio" target="_blank" href="' + gss.link_pe + '">' + gss.text_link_pe + '</a>' +
      '</div>' +
      '</div>';
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
          props.cssLayersLoader = function (n, clb) { // n - page number 
            //alert(n + " " + real_pg);
            if (n == real_pg) {
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
            } else if (n == 0) {
              clb([{
                js: function (jContainer) {
                  return {
                    show: function () {
                      var iframe = $('iframe').contents();
                      iframe.find(".inpPage").focus().blur();
                    }
                  }
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
        }
      });
    }.bind($s))
  }

  $s.changePage = function (pag) {

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

}]);