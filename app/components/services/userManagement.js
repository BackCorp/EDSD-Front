'use strict';
angular.module('services.userManagement', [
    'ngResource'
])
.factory('userService', userService)
.factory('agentService', agentService);

function userService($resource) {
    var service = {};
    var username;
    var name = {};
    var currentUser;
    var isLoggedIn = false;
    var password;
    service.setName = function(firstName, lastName) {
        name.firstName = firstName;
        name.lastName = lastName;
    }
    service.getName = function() {
        return name;
    }
    service.authUser = function() {
        return $resource("http://localhost:8080/api/login/:currentUser");
    }
    service.setCurrentUser = function(user) {
        currentUser = user;
    }
    service.getCurrentUser = function() {
        return currentUser;
    }
    service.setUsername = function(name) {
        username = name;
    }
    service.getUsername = function() {
        return username;
    }
    service.setFormPassword = function(password) {
        password = password;
    }
    service.getFormPassword = function() {
        return password;
    }
    service.getLoginState = function() {
        return isLoggedIn;
    }
    service.logThisUserIn = function() {
        isLoggedIn = true;
    }
    service.logOutUser = function() {
        isLoggedIn = false;
    }
    return service;
}

function agentService($resource) {
    var service = {};
    service.getAgent = function() {
        return $resource('http://localhost:8080/api/agents/:username', {username: '@username'},{
            update: {
                method: 'PUT'
            }
        });
    };
    service.resetPassword = function() {
        return $resource('http://localhost:8080/api/agents/reset/:username', {username: '@username'},{
            update: {
                method: 'PUT'
            }
        });
    };
    return service;
}

// function requesterService($resource) {
//     var service = {};
//     service.getRequesters = function() {
//         return $resource('http://localhost:8080/api/requesters');
//     }
//     return service;
// }
