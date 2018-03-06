'use strict';

angular.module('App.admin', ['ngRoute', 'ngCookies', 'ngSanitize'])

.config(['$routeProvider', function($routeProvider, $location, storageService) {
    $routeProvider.when('/admin', {
        resolve: {
            check: function($location, $cookies, storageService) {
                if(!storageService.getSession('hasLoggedIn')) {
                    $location.path("/login");
                } else {
                    storageService.setSession('previousRoute', '/admin');
                }
            },
        },
        templateUrl: 'admin-view/admin.html',
        controller: 'AdminCtrl'
    }).otherwise({redirectTo: '/login'});
}])

.controller('AdminCtrl', function($scope, $location, $cookies, storageService) {
    $scope.logout = function() {
        storageService.setSession('hasLoggedIn', false);
        $cookies.remove('XSRF-TOKEN');
        $location.path("/login");
    };
//    console.log("First Name: " + userService.getName().firstName);
    $scope.firstName = storageService.getSession('firstName');
    $scope.lastName = storageService.getSession('lastName');
    $scope.adminTemplate = 'admin-view/templates/admin-dashboard.html';
    $scope.change = function(template){
        $scope.adminTemplate = "admin-view/templates/" + template;
    }
});
