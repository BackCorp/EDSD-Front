'use strict';

angular.module('App.admin', ['ngRoute', 'ngCookies'])

.config(['$routeProvider', function($routeProvider, $location, $cookies, LoginService) {
    $routeProvider.when('/admin', {
        resolve: {
            check: function($location, $cookies, LoginService) {
                console.log("Admin: " + $cookies.get('isLoggedIn'))
                if(!$cookies.get('isLoggedIn')) {
                    $location.path("/login");
                } else {
                    $cookies.put('previousRoute', '/admin');
                }
            },
        },
        templateUrl: 'admin-view/admin.html',
        controller: 'AdminCtrl'
    }).otherwise({redirectTo: '/'});
}])

.controller('AdminCtrl', function($scope, $location, $cookies, LoginService) {
    $scope.logout = function() {
        LoginService.logOutUser();
        $cookies.put('isLoggedIn', false);
        $cookies.remove('isLoggedIn');
        $cookies.remove('previousRoute');
        $location.path("/login");
    };
    $scope.name = LoginService.getName();
});
