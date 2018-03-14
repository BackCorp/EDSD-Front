'use strict';

angular.module('App.agent', ['ngRoute', 'ngCookies', 'ngSanitize'])

.config(['$routeProvider', function($routeProvider, $location, storageService) {
    $routeProvider.when('/agent', {
        resolve: {
            check: function($location, $cookies, storageService) {
                if(!storageService.getSession('hasLoggedIn')) {
                    $location.path("/login");
                } else {
                    storageService.setSession('previousRoute', '/agent');
                }
            },
        },
        templateUrl: 'agent-view/agent.html',
        controller: 'AgentCtrl'
    }).otherwise({redirectTo: '/login'});
}])

.controller('AgentCtrl', ['$scope','$location','$cookies','$http','headerService','storageService','agentService',
    function($scope, $location, $cookies, $http, headerService, storageService, agentService) {

    $scope.logout = function() {
        storageService.clear();
        $cookies.remove('XSRF-TOKEN');
        $location.path("/login");
    };

    $scope.firstName = storageService.getSession('firstName');
    $scope.lastName = storageService.getSession('lastName');
    $scope.agentTemplate = 'agent-view/templates/process-edsd.html';
    $scope.change = function(template){
        $scope.agentTemplate = "agent-view/templates/" + template;
    };

    $scope.getUsers = function() {
        return [];
    };

}])

.directive('typeaheadFindUser', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/typeahead-find-user.html'
    }
});
