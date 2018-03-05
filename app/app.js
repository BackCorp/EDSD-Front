'use strict';

angular.module('App', [
  'ngRoute',
  'ngCookies',
  'ngSanitize',
  'base64',
  'App.login',
  'App.admin',
  'App.agent'
])

.config(['$locationProvider', '$routeProvider', '$httpProvider', '$base64',
    function($locationProvider, $routeProvider, $httpProvider, $base64) {
    //$httpProvider.defaults.headers.common['Authorization'] = 'Basic ' + login + ':' +    "padmin";
    var auth = $base64.encode("admin:padmin");
    $httpProvider.defaults.headers.common['Authorization'] = 'Basic ' + btoa("agent" + ":" + "pagent");
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

    $locationProvider.hashPrefix('!');
    $routeProvider

    // .when({'/logout',
    //     templateUrl: 'login-view/login.html',
    //     controller: 'LoginCtrl'
    // })

    .otherwise({redirectTo: '/login'});
}]);
