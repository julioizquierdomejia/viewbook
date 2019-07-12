var env = {};
if(window){ Object.assign(env, window.__env); }

app = angular.module('view_ebio', ['ngRoute','ngAnimate','toastr','timer','videosharing-embed']);

app.constant('__env', env);

app.run(function($rootScope, $location, $log, utilService){
	$rootScope.$on('$locationChangeSuccess', function (event, toState, toParams) {
        $rootScope.rootFolder = $("base").attr("href");// "/ebiolibros.com"; 
    });
});

             
app.config(['$routeProvider', '$locationProvider', '$httpProvider', function($route, $lp, $httpProvider) {  
    $route.when('/demo/:bookcode/:bookname', { 
    	templateUrl: 'app/pages/viewDemo.html',  
    	controller: 'viewDemoController'
    }).when('/pe/:bookcode/:numberunity/:class_code', { 
    	templateUrl: 'app/pages/viewPe.html',  
    	controller: 'viewPeController'
    }).when('/404', { 
    	templateUrl: 'app/pages/404.html'
    }).otherwise({ redirectTo:'/404' }); 
    $lp.html5Mode(true);    
}]);  

app.filter("trust", ['$sce', function($sce) {
  return function(htmlCode){
    return $sce.trustAsHtml(htmlCode);
  }
}]);


