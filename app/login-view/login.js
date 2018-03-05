'use strict';

angular.module('App.login', ['ngRoute','ngCookies', 'ngSanitize'])

.config(['$routeProvider', function($routeProvider, $location, $cookies, userService) {

    $routeProvider.when('/login', {
        resolve: {
            check: function($location, $cookies) {
                if(userService.getLoginState()) {
                    $location.path($cookies.get("previousRoute"));
                }
            },
        },
        templateUrl: 'login-view/login.html',
        controller: 'LoginCtrl'
    });
}])

.controller('LoginCtrl', function($scope, $location, $cookies, $http, userService) {
    $scope.login = function() {
        userService.logThisUserIn().get({currentUser: 'user'}).then(
            function(response){
                console.log(response);
                // LoginService.logInUser();
                // LoginService.setName($scope.username );
                // $scope.name = LoginService.getName();
                // $cookies.put('isLoggedIn', true);
                // $location.path('/admin');
           },
           function(response){
             // console.log(response);
             // LoginService.logOutUser();
             // $scope.loginFailed = true;
           }
        );
    }
});
