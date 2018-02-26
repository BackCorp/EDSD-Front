'use strict';

angular.module('App.login', ['ngRoute','ngCookies', 'ngSanitize'])

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

.controller('LoginCtrl', function($scope, $location, $cookies, $http, LoginService) {
    $scope.login = function() {
        // var config = {
        //         headers : {
        //             'Content-Type' : 'application/x-www-form-urlencoded;charset=utf-8'
        //         }
        //     }

        var data = {
            username : "admin",
            password : "padmin"
        }

        $http.get("http://localhost:8080/api/admin/users/admin").then(
           function(response){
             console.log(response);
           },
           function(response){
             console.log(response);
           }
        );



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
