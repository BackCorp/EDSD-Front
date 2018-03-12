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
        //storageService.clear();
        // $cookies.remove('XSRF-TOKEN');
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

    $scope.getAgent = function (search) {
        headerService.setAuthHeader(storageService.getSession('session'));
        return $http({
            method: 'GET',
            url: 'http://localhost:8080/api/agents/search/'+search
        }).then(function(response) {
            return response.data.map(function(item) {
                return {
                    id: item.userId,
                    name: item.firstName +" "+ item.lastName,
                    username: item.username,
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
            console.log("Agent created");
            $scope.ag = agentService.getAgents().get({username: model.username}, function() {
                var id = $scope.ag.roles.length;
                $scope.ag.roles.push({id: ++id, role: "AGENT"});
                console.log($scope.ag);
                $scope.ag.$update(function(up) {
                    console.log(up);
                });
            });
        } else {
            $scope.error.createagent = model.name +" has the AGENT role already";
        }
    };
});
