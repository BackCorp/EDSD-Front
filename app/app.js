'use strict';

angular.module('App', [
  'ngRoute',
  'ngCookies',
  'ngSanitize',
  'base64',
  'services',
  'App.login',
  'App.admin',
  'App.agent'
])

.config(['$locationProvider', '$routeProvider', '$httpProvider',
    function($locationProvider, $routeProvider, $httpProvider) {

    //$httpProvider.defaults.headers.common['Authorization'] = 'Basic ' + btoa('admin' + ":" + 'padmin');
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    $httpProvider.defaults.headers.common["X-Requested-With"] = 'XMLHttpRequest';

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
        }
    }
}]);
