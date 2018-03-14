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
    $scope.selectedDisabled = undefined;
    $scope.agent = undefined;
    $scope.disabledAgent;
    $scope.showRole = undefined;
    $scope.error = {};
    $scope.agents;

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
                    midName: item.midName,
                    email: item.email,
                    roles: item.roles,
                    active: item.active
                };
            });
        });
    };
    $scope.getDisabledAgents = function (search) {
        headerService.setAuthHeader(storageService.getSession('session'));
        return $http({
            method: 'GET',
            url: 'http://localhost:8080/api/agents/disabled/search/'+search
        }).then(function(response) {
            console.log(response.data);
            return response.data.map(function(item) {
                return {
                    id: item.userId,
                    name: item.firstName +" "+ item.lastName,
                    username: item.username,
                    firstName: item.firstName,
                    lastName: item.lastName,
                    midName: item.midName,
                    email: item.email,
                    roles: item.roles,
                    active: item.active
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
    };
    $scope.onDisabledSelect = function($item, $model, $label, $event) {
        $scope.disabledSelected = true;
        $scope.disabledAgent = $model;
        // $scope.showRole = roleSection($model);
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
    };

    $scope.setDisabledActive = function(enabled) {
        $scope.disabledAgent.active = enabled;
    };
    $scope.setActiveDisabled = function(enabled) {
        $scope.agent.active = !enabled;
    };

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
        $scope.ag = agentService.getAgent().get({username: model.username}, function() {
            $scope.ag.email = model.email;
            $scope.ag.firstName = model.firstName;
            $scope.ag.lastName = model.lastName;
            $scope.ag.midName = model.midName;
            $scope.ag.$update(function(updated) {
                console.log(updated);
                $scope.agent = updated;
            });
        });
    };

    $scope.activateAgent = function(model) {
        headerService.setAuthHeader(storageService.getSession('session'));
        var ag = agentService.getAgent().get({username: model.username}, function(ag) {
            console.log(ag);
            ag.active = model.active;
            ag.$update(function(updated) {
                console.log("acivated")
                console.log(updated);
                $scope.disabledAgent = updated;
                $scope.disabledSelected = false;
            });
        });
    };

    $scope.deactivateAgent = function(model) {
        headerService.setAuthHeader(storageService.getSession('session'));
        var ag = agentService.getAgent().get({username: model.username}, function(ag) {
            console.log(ag);
            ag.active = model.active;
            ag.$update(function(updated) {
                console.log("deacivated")
                console.log(updated);
                $scope.agent = updated;
                $scope.selected = false;
            });
        });
    };

    $scope.getAllAgents = function() {
        headerService.setAuthHeader(storageService.getSession('session'));
        agentService.getAgent().query(function(allags) {
            $scope.allAgents = allags;
        });
    };

    headerService.setAuthHeader(storageService.getSession('session'));
    $http.get("http://localhost:8080/api/stats").then(
        function(response){
            $scope.stats = response.data;
            console.log($scope.stats);
        },
        function(response) {
            console.log(response);
        }
    );
})

.directive('typeaheadDirective', function() {
    return {
        restrict: 'E',
        templateUrl: 'admin-view/directives/typeahead-directive.html'
    }
})

.directive('typeaheadDirectiveDisabled', function() {
    return {
        restrict: 'E',
        templateUrl: 'admin-view/directives/typeahead-directive-disabled.html'
    }
});
