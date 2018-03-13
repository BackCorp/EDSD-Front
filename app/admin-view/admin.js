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

.controller('AdminCtrl', function($scope, $location, $cookies, $http, $interval, headerService, storageService, agentService) {
    $scope.logout = function() {
        storageService.clear();
        $cookies.remove('XSRF-TOKEN');
        $location.path("/login");
    };

    $scope.firstName = storageService.getSession('firstName');
    $scope.lastName = storageService.getSession('lastName');
    $scope.adminTemplate = 'admin-view/templates/admin-dashboard.html';
    $scope.change = function(template){
        $scope.adminTemplate = "admin-view/templates/" + template;
    };

    $scope.asyncSearch = undefined;
    $scope.selected = undefined;
    $scope.agent = undefined;
    $scope.showRole = undefined;
    $scope.error = {};
    $scope.agents;

    // function checkStorage(search) {
    //     var results = storageService.getLocal("agents");
    //     return results.filter(result => {
    //         return result.name.toLowerCase().search(search)>=0 ||
    //         result.username.toLowerCase().search(search)>=0;
    //     });
    // }

    $scope.getAgents = function (search) {
        headerService.setAuthHeader(storageService.getSession('session'));
        return $http({
            method: 'GET',
            url: 'http://localhost:8080/api/agents/search/'+search
        }).then(function(response) {
            console.log(response.data);
            return response.data.map(function(item) {
                return {
                    id: item.userId,
                    name: item.firstName +" "+ item.lastName,
                    username: item.username,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    middleName: item.midName,
                    email: item.email,
                    roles: item.roles,
                    active: ((item.active)? "Enabled" : "Disabled")
                };
            });
        });
    };

    $scope.modelOptions = {
        debounce: {
            default: 500,
            blur: 500
        },
        getterSetter: false
    };

    $scope.onSelect = function($item, $model, $label, $event) {
        $scope.selected = true;
        $scope.agent = $model;
        $scope.showRole = roleSection($model);
        console.log($scope.asyncSearch);
    };

    function roleSection(model) {
        return {
            section: function() {
                return model.roles.every(item => {
                    return item.role !== "ADMIN";
                });
            },
            checkRadioButton: function() {
                return model.roles.some(item => {
                    return item.role === "AGENT";
                });
            },
            disableButton: function() {
                return this.checkRadioButton();
            }
        };
    }

    $scope.createAgent = function(model) {
        headerService.setAuthHeader(storageService.getSession('session'));
        if(!model.roles.some(role => {
            return role.role === "AGENT";
        })) {
            $scope.ag = agentService.getAgent().get({username: model.username}, function() {
                $scope.ag.roles = [{ roles: "AGENT" }];
                $scope.ag.$update(function(updated) {
                    $scope.agent = updated;
                    $scope.showRole = roleSection($scope.agent);
                });
            });
        } else {
            $scope.error.createagent = model.name +" has the AGENT role already";
        }
    };

    $scope.editAgent = function(model) {
        headerService.setAuthHeader(storageService.getSession('session'));
        console.log(model);
        $scope.ag = agentService.getAgent().get({username: model.username}, function() {
            $scope.ag.email = model.email;
            $scope.ag.firstName = model.firstName;
            $scope.ag.lastName = model.lastName;
            $scope.ag.midName = model.middleName;
            $scope.ag.$update(function(updated) {
                console.log("Edited")
                console.log(updated);
                $scope.agent = updated;
            });
        });
    }
})

.directive('typeaheadDirective', function() {
    return {
        restrict: 'E',
        templateUrl: 'admin-view/directives/typeahead-directive.html'
    }
});
