'use strict';
angular.module('services.userManagement', [
    'ngResource'
])
.factory('userService', userService)
.factory('agentService', agentService);

function userService($resource) {
    var service = {};
    service.authUser = function() {
        return $resource("https://edsd2.herokuapp.com/api/login/:currentUser");
    }
    return service;
}

function agentService($resource) {
    var service = {};
    service.getAgent = function() {
        return $resource('https://edsd2.herokuapp.com/api/agents/:username', {username: '@username'},{
            update: {
                method: 'PUT'
            }
        });
    };
    service.resetPassword = function() {
        return $resource('https://edsd2.herokuapp.com/api/agents/reset/:username', {username: '@username'},{
            update: {
                method: 'PUT'
            }
        });
    };
    return service;
}
