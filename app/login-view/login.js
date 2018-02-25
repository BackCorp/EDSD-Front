'use strict';

angular.module('App.login', ['ngRoute','ngCookies'])

.config(['$routeProvider', function($routeProvider, $location, $cookies) {
    $routeProvider.when('/login', {
        resolve: {
            check: function($location, $cookies) {
                console.log("login: " + $cookies.get('isLoggedIn'))
                if($cookies.get('isLoggedIn')) {
                    //$location.path("/login");
                    $location.path($cookies.get("previousRoute"));
                }
            },
        },
        templateUrl: 'login-view/login.html',
        controller: 'LoginCtrl'
    });
}])

.controller('LoginCtrl', function($scope, $location, $cookies, LoginService) {
    $scope.login = function() {
        if($scope.username === 'admin' && $scope.password === 'admin') {
            LoginService.logInUser();
            LoginService.setName($scope.username );
            $scope.name = LoginService.getName();
            $cookies.put('isLoggedIn', true);
            $location.path('/admin');
        } else {
            LoginService.logOutUser();
            $scope.loginFailed = true;
        }
    }
});
