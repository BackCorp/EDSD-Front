'use strict';

angular.module('App.admin', ['ngRoute', 'ngCookies', 'ngSanitize', 'ngMessages'])

.config(['$routeProvider', function($routeProvider, $location, $window, storageService) {
    $routeProvider.when('/admin', {
        resolve: {
            check: function($location, $cookies, storageService, $window) {
                if(!storageService.getSession('hasLoggedIn') ||
                (storageService.getSession('hasLoggedIn') && storageService.getSession('role')!=="ADMIN")) {
                    $window.document.body.style.background = '';
                    $location.path("/login");
                } else {
                    $window.document.body.style.background = '#303C4C';
                    storageService.setSession('previousRoute', '/admin');
                }
            },
        },
        templateUrl: 'admin-view/admin.html',
        controller: 'AdminCtrl'
    }).otherwise({redirectTo: '/login'});
}])

.controller('AdminCtrl', function($scope, $location, $cookies, $window, $http, $timeout, $interval, $uibModal,
    headerService, storageService, agentService, edsdService) {

    $scope.clicked = {};
    $scope.showClick = function(data) {
        $scope.clicked = data;
    };

    $scope.logout = function() {
        storageService.clear();
        $window.document.body.style.background = '';
        $location.path("/login");
    };

    $scope.firstName = storageService.getSession('firstName');
    $scope.lastName = storageService.getSession('lastName');
    $scope.adminTemplate = 'admin-view/templates/admin-dashboard.html';
    $scope.change = function(template){
        $scope.adminTemplate = "admin-view/templates/" + template;
    };

    $scope.asyncSearch;
    $scope.selected;
    $scope.selectedDisabled;
    $scope.agent;
    $scope.disabledAgent;
    $scope.showRole;
    $scope.createdByField = true;
    $scope.resetPassword={};
    $scope.seconds = 4000;
    $scope.error = {};
    $scope.success={};
    $scope.agents;
    $scope.toggle={section1: true};
    $scope.charts={};
    $scope.charts.edsd={};
    $scope.charts.edsd.donutPoints=[];
    $scope.charts.edsd.donutColumns=[];
    $scope.charts.users={};
    $scope.charts.users.donutPoints=[];
    $scope.charts.users.donutColumns=[];
    $scope.charts.perform={};
    $scope.charts.perform.datax={"id":"x"};
    $scope.charts.perform.datapoints=[];
    $scope.charts.perform.datacolumns = [
        {"id": "primes", "type": "bar", "name": "Primes"},
        {"id": "nonLogements", "type": "bar", "name": "Non Logements"},
        {"id": "rappelsSalaires", "type": "bar", "name": "Rappels Salaires"}
    ];

    $scope.charts.users.formatDonut = function formatDonut(value, ratio, id) {
        return d3.format('A')(value);
    };
    $scope.charts.edsd.formatDonut = function formatDonut(value, ratio, id) {
        return d3.format('E')(value);
    };

    $scope.getAgents = function (search) {
        headerService.setAuthHeader(storageService.getSession('session'));
        return $http({
            method: 'GET',
            url: 'https://edsd2.herokuapp.com/api/agents/search/'+search
        }).then(
            function(response) {
                console.log(response.data);
                return response.data.map(function(item) {
                    item.name = item.firstName +" "+ item.lastName;
                    return item;
                });
            },
            function(error) {

            }
        );
    };
    $scope.getDisabledAgents = function (search) {
        headerService.setAuthHeader(storageService.getSession('session'));
        return $http({
            method: 'GET',
            url: 'https://edsd2.herokuapp.com/api/agents/disabled/search/'+search
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
    };

    function roleSection(model) {
        return {
            section: function() {
                return model.roles.every(function(item) {
                    return item.role !== "ADMIN";
                });
            },
            checkRadioButton: function() {
                return model.roles.some(function(item) {
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
        if(!model.roles.some(function(role) {
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
            ag.active = model.active;
            ag.$update(function(updated) {
                $scope.success.message = true;
                $timeout(function(){
                    $scope.disabledAgent = updated;
                    $scope.disabledSelected = false;
                    $scope.success.message = false;
                }, 5000);
            });
        });
    };

    $scope.deactivateAgent = function(model) {
        headerService.setAuthHeader(storageService.getSession('session'));
        var ag = agentService.getAgent().get({username: model.username}, function(ag) {
            console.log(ag);
            ag.active = model.active;
            ag.$update(function(updated) {
                $scope.success.message = true;
                $timeout(function(){
                    $scope.agent = updated;
                    $scope.selected = false;
                    $scope.success.message = false;
                }, 5000);
            });
        });
    };

    $scope.getAllAgents = function() {
        headerService.setAuthHeader(storageService.getSession('session'));
        agentService.getAgent().query(function(allags) {
            $scope.charts.perform.datapoints=[];
            $scope.allAgents = allags;
            console.log(allags);
            allags.forEach(function(agent) {
                $scope.charts.perform.datapoints.push({
                    "x": agent.firstName+" "+agent.lastName,
                    "primes": agent.primesEdsd.length,
                    "nonLogements": agent.nonLogementEdsd.length,
                    "rappelsSalaires": agent.rappelsSalairesEdsd.length
                });
            });
        });
    };

    headerService.setAuthHeader(storageService.getSession('session'));
    $http.get("https://edsd2.herokuapp.com/api/admin/stats").then(
        function(response) {
            $scope.charts.edsd.donutPoints = [
                {primes: response.data.primesEdsdCount},
                {nonLogemnents: response.data.nonLogementEdsdCount},
                {rappelsSalaires: response.data.rappelsSalairesEdsdCount}
            ];
            $scope.charts.edsd.donutColumns = [
                {"id":"primes", "type":"donut", "name":"Primes"},
                {"id":"nonLogemnents","type":"donut","name":"Non logements"},
                {"id":"rappelsSalaires","type":"donut","name":"Rappels Salaires"}
            ];
            $scope.charts.users.donutPoints = [
                {disabledAgents: response.data.disabledAgentCount},
                {enabledAgents: response.data.enabledAgentCount}
            ];
            $scope.charts.users.donutColumns = [
                {"id":"disabledAgents", "type":"donut", "name":"Agents non actifs","color":"#d62728"},
                {"id":"enabledAgents","type":"donut","name":"Agents actifs","color":"#2CA02C"}
            ];
            console.log(response.data);
        },
        function(response) {
            console.log(response);
        }
    );

    $scope.getAllPrimesEdsds = function() {
        edsdService.getAllPrimesEdsds().query(function(allPrimes) {
            $scope.getPrimesEdsds = allPrimes;
            console.log(allPrimes);
        });
    };
    $scope.getAllNonLogementEdsds = function() {
        edsdService.getAllNonLogementEdsds().query(function(allNonLogementEdsds) {
            $scope.getNonLogementEdsds = allNonLogementEdsds;
            console.log(allNonLogementEdsds);
        });
    };
    $scope.getAllRappelsSalairesEdsds = function() {
        edsdService.getAllRappelsSalairesEdsds().query(function(allRappelsSalairesEdsds) {
            $scope.getRappelsSalairesEdsds = allRappelsSalairesEdsds;
            console.log(allRappelsSalairesEdsds);
        });
    };
    $scope.passwordReset = function(model) {
        headerService.setAuthHeader(storageService.getSession('session'));
        var ag = agentService.resetPassword().get({username: model.username}, function(ag) {
            console.log(ag);
            ag.password = $scope.resetPassword.password;
            ag.$update(function(updated) {
                $scope.success.message = true;
                $interval(function() {
                    $scope.seconds-=1000;
                }, 1000);
                $timeout(function(){
                    $scope.agent = updated;
                    $scope.selected = false;
                    $scope.success.message = false;
                    $scope.resetPassword={};
                }, 5000);
            });
        });
    }

    $scope.showDetails = function($event, edsd, template) {
        $event.preventDefault();
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: template,
            controller: 'EdsdDetailsCtrl',
            backdrop: 'static',
            size: 'lg',
            resolve: {
                items: function () {
                    return edsd;
                }
            }
        });
    };

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
