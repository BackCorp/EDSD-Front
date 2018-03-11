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

.controller('AdminCtrl', function($scope, $location, $cookies, $http, headerService, storageService, agentService) {
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

    $scope.selected = undefined;

    // $scope.getLocation = function(val) {
    //     //$http.defaults.headers.common["X-Requested-With"] = '';
    //     console.log($http.defaults.headers)
    //     return $http({
    //         method: 'GET',
    //         url: '//maps.googleapis.com/maps/api/geocode/json',
    //         params: {
    //             address: val,
    //             sensor: false
    //         }
    //     }
    // ).then(function(response){
    //     console.log(response);
    //     return response.data.results.map(function(item){
    //             return item.formatted_address;
    //         });
    //     });
    // };

    $scope.agents;
    $scope.getAgents = function(search) {
        headerService.setAuthHeader(storageService.getSession('session'));
        var token = search.trim().toLowerCase();
        if(token.length == 2) {
            return findAgents(token);
        } else if(token.length > 2) {
            return checkStorage(token);
        } else if(token.length < 2) {
            storageService.removeLocal("agents");
        }
    };

    function checkStorage(search) {
        var results = storageService.getLocal("agents");
        return results.filter(result => {
            return result.name.toLowerCase().search(search)>=0 ||
            result.username.toLowerCase().search(search)>=0;
        });
    }

    function findAgents(search) {
        var agents = $http({
            method: 'GET',
            url: 'http://localhost:8080/api/agents/'+search
        });

        agents.then(function(response) {
            console.log(response);
            storageService.setLocal(
                "agents",
                response.data.map(function(item) {
                    return {
                        id: item.userId,
                        name: item.firstName +" "+ item.lastName,
                        username: item.username,
                        active: ((item.active)? "Enabled" : "Disabled")
                    }
                })
            );
        });
        console.log(storageService.getLocal("agents"))
        return storageService.getLocal("agents");
    }

    $scope.modelOptions = {
        debounce: {
        default: 1500,
        blur: 500
        },
        getterSetter: false
    };

});
