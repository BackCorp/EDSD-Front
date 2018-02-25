'use strict';

angular.module('App', [
  'ngRoute',
  'ngCookies',
  'App.login',
  'App.admin',
  'App.agent'
])

.config(['$locationProvider', '$routeProvider', function($locationProvider, $routeProvider) {
  $locationProvider.hashPrefix('!');

  $routeProvider
  .otherwise({redirectTo: '/'});
}])

.service('LoginService', function() {
    var username;
    var loggedIn = false;
    this.setName = function(name) {
        username = name;
    };
    this.getName = function() {
        return username;
    };
    this.getLogInState = function() {
        return loggedIn;
    };
    this.logInUser = function() {
        loggedIn = true;
    };
    this.logOutUser = function() {
        loggedIn = false;
    }
});
