<!DOCTYPE html>
<html> 
<head>
  <title id="pageTitle">eBiolibros - Visor</title>
  <meta name="viewport" content="user-scalable=no, width=device-width, initial-scale=1, minimum-scale=1, maximum-scale=1">
    <meta charset="utf-8"> 

    <meta http-equiv="Cache-Control" content="no-cache, no-store, must-revalidate" />
    <meta http-equiv="Pragma" content="no-cache" />
    <meta http-equiv="Expires" content="0" /> 
    <base href="/viewbook/">      
    <link rel="stylesheet" href="../lib/mdb/bootstrap-material-design.min.css">
    <link rel="stylesheet" href="../lib/toastr/angular-toastr.min.css"> 
    <link rel="stylesheet" href="https://use.fontawesome.com/releases/v5.1.1/css/all.css" integrity="sha384-O8whS3fhG2OnA5Kas0Y9l3cfpmYjapjI0E4theH4iuMD+pLhbf6JI0jIMfYcK3yZ" crossorigin="anonymous">
    <link rel="stylesheet" type="text/css" media="screen" href="../lib/formbuilder/jquery.rateyo.min.css">
    <link type="text/css" rel="stylesheet" href="app/css/animBall.css"></link> 
    <link type="text/css" rel="stylesheet" href="../lib/circlecss/circle.css"></link> 
    <link type="text/css" rel="stylesheet" href="../lib/formbuilder/css/image.css"></link> 
    <link type="text/css" rel="stylesheet" href="../lib/formbuilder/css/konva.css"></link>
    <link rel="stylesheet" href="../lib/hovercss/hover.min.css">  
    <link rel="stylesheet" type="text/css" href="app/css/base.css">
</head>   
<body ng-app="view_ebio" ng-controller="baseController" ng-init="init_controller()"> 
    <div id="sectorBase" ng-view> 
    </div> 

    <script src="app/js/jquery.min.js"></script>
    <script src="app/js/html2canvas.min.js"></script>
    <script src="app/js/three.min.js"></script>
    <script src="app/js/pdf.min.js"></script>  
    <script src="app/js/flip-book.js"></script> 
    <script type="text/javascript" src="../lib/cryptoJS/aes.min.js"></script> 
    <script type="text/javascript" src="../lib/mdb/popper.js" ></script>
    <script type="text/javascript" src="../lib/mdb/bootstrap-material-design.js"></script>

    <script type="text/javascript" src="../lib/angularjs/angular.min.js"></script>
    <script type="text/javascript" src="../lib/angularjs/angular-route.min.js"></script> 
    <script type="text/javascript" src="../lib/angularjs/angular-sanitize.min.js"></script>  
    <script type="text/javascript" src="../lib/angularjs/angular-animate.min.js"></script>    
    <script type="text/javascript" src="../lib/toastr/angular-toastr.tpls.min.js"></script>
    <script type="text/javascript" src="../lib/angularjs/angular-ismobile.min.js"></script>  
    <script src="https://cdnjs.cloudflare.com/ajax/libs/animejs/2.0.2/anime.min.js"></script>
    <script type="text/javascript" src="../lib/moment/moment.min.js"></script> 
    <script type="text/javascript" src="../lib/moment/moment-with-locales.min.js"></script> 
    <script type="text/javascript" src="../lib/timer/angular-timer.min.js"></script> 
    <script type="text/javascript" src="../lib/timer/humanize-duration.js"></script>  
    <script type="text/javascript" src="../lib/tinymce/tinymce.min.js"></script>
    <script type="text/javascript" src="../lib/tinymce/langs/es.js"></script>

    <script type="text/javascript" src="../lib/formbuilder/form-builder.min.js"></script>
    <script type="text/javascript" src="../lib/formbuilder/form-render.min.js"></script>
    <script type="text/javascript" src="../lib/formbuilder/control_plugins/image.js"></script>
    <script type="text/javascript" src="../lib/formbuilder/control_plugins/konva.js"></script>

    <script type="text/javascript" src="app/app.js"></script>

    <!-- controllers -->
    <script type="text/javascript" src="app/controllers/base.js"></script>
    <script type="text/javascript" src="app/controllers/viewDemo.js"></script> 
    <script type="text/javascript" src="app/controllers/viewPe.js"></script> 

    <script type="text/javascript" src="../adminpe/app/services/peconfig.js"></script>
    <script type="text/javascript" src="../lib/services/sesion.js"></script> 
    <script type="text/javascript" src="../lib/services/localstorage.js"></script>  
    <script type="text/javascript" src="../lib/services/globalSettings.js"></script> 
    <script type="text/javascript" src="../lib/services/activity.js"></script>  
    <script type="text/javascript" src="../lib/services/util.js"></script>    
     
  </body>
</html>
