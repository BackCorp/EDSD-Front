'use strict';

angular.module('App.login', ['ngRoute','ngCookies', 'ngSanitize'])

.config(['$routeProvider', function($routeProvider, $location, storageService) {

    $routeProvider.when('/login', {
        resolve: {
            check: function($location, storageService) {
                if(storageService.getSession('hasLoggedIn')) {
                    $location.path(storageService.getSession("previousRoute"));
                }
            },
        },
        templateUrl: 'login-view/login.html',
        controller: 'LoginCtrl'
    });
}])

.controller('LoginCtrl', function($scope, $location, $http, headerService, storageService, userService) {

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
                    if(response.principal.roles.some(role => {
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
                    $scope.loginFailed = true;
                }
            );
        }
    }
});
