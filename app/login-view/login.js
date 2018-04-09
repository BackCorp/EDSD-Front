'use strict';

angular.module('App.login', ['ngRoute','ngCookies', 'ngSanitize'])

.config(['$routeProvider', function($routeProvider, $location, $window, torageService) {

    $routeProvider.when('/login', {
        resolve: {
            check: function($location, storageService, $window) {
                if(storageService.getSession('hasLoggedIn')) {
                    $location.path(storageService.getSession("previousRoute"));
                } else {
                    var theme = $window.document.getElementById("login-theme");
                    if(theme) { theme.href="lib/vendor/bootstrap4/css/bootstrap4.min.css"; }
                }
            },
        },
        templateUrl: 'login-view/landing-page.html',
        controller: 'LoginCtrl'
    });
}])

.controller('LoginCtrl', function($scope, $location, $http, $window, headerService,
    storageService, userService) {

    $scope.login={};
    $scope.login.theme = true;


    $scope.login = function() {
        if($scope.username && $scope.password) {
            storageService.clear();
            storageService.setSession('session', btoa($scope.username+":"+$scope.password));
            headerService.setAuthHeader(storageService.getSession('session'));
            storageService.setSession('username', $scope.username);

            userService.authUser().get({currentUser: 'user'}).$promise.then(
                function(response){
                    console.log(response);
                    storageService.setSession('hasLoggedIn', true);
                    storageService.setSession('firstName', response.principal.firstName);
                    storageService.setSession('lastName', response.principal.lastName);
                    $scope.login.failed = false;
                    // $window.document.styleSheets[0].disabled = true;
                    // console.log($window.document.getElementById("login-theme"));
                    $window.document.getElementById("login-theme").href="lib/vendor/bootstrap/css/bootstrap.min.css";
                    // $("link[href*='bootstrap4.min.css']").remove();
                    if(response.principal.roles.some(function(role) {
                        return role.role === "ADMIN";
                    })) {
                        $location.path('/admin');
                        storageService.setSession('role', "ADMIN");
                    } else {
                        $location.path('/agent');
                        console.log(response.principal);
                        storageService.removeSession('role');
                    }
                },
                function(response){
                    storageService.setSession('hasLoggedIn', false);
                    $scope.login.failed = true;
                }
            );
        }
    }
});
