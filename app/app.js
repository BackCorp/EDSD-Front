'use strict';

angular.module('App', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',
  'ngSanitize',
  'base64',
  'ui.bootstrap',
  'services',
  'App.login',
  'App.admin',
  'App.agent'
])

.config(['$locationProvider', '$routeProvider', '$httpProvider',
    function($locationProvider, $routeProvider, $httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    //$httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({redirectTo: '/login'});
}])

.service('headerService', function($http) {
    var service = {};
    this.setAuthHeader = function(auth) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + auth;
    }
})

.factory('storageService',['$window', function($window){
    return {
        setLocal: function( key, value ){
            try{
                if( $window.Storage ){
                    $window.localStorage.setItem(key, $window.JSON.stringify(value));
                    return true;
                } else {
                    return false;
                }
            } catch( error ){
                console.error( error, error.message );
            }
        },
        getLocal: function( key ){
            try{
                if( $window.Storage ){
                    return $window.JSON.parse( $window.localStorage.getItem( key ) );
                } else {
                    return false;
                }
            } catch( error ){
                console.error( error, error.message );
            }
        },
        removeLocal: function( key ) {
            $window.localStorage.removeItem(key);
        },
        setSession: function( key, value ){
            try{
                if( $window.Storage ){
                    $window.sessionStorage.setItem( key, $window.JSON.stringify(value) );
                    return true;
                } else {
                    return false;
                }
            } catch( error ){
                console.error( error, error.message );
            }
        },
        getSession: function( key ){
            try{
                if( $window.Storage ){
                    return $window.JSON.parse( $window.sessionStorage.getItem( key ) );
                } else {
                    return false;
                }
            } catch( error ){
                console.error( error, error.message );
            }
        },
        removeSession: function( key ) {
            $window.sessionStorage.removeItem(key);
        },
        clear: function(){
            try{
                $window.sessionStorage.clear();
                $window.localStorage.clear();
            } catch( error ){
                console.error( error, error.message );
            }
        }
    }
}]);
