'use strict';

angular.module('App', [
  'ngRoute',
  'ngCookies',
  'ngAnimate',
  'ngSanitize',
  'ui.bootstrap',
  'services',
  'App.login',
  'App.admin',
  'App.agent'
])

.config(['$locationProvider', '$routeProvider', '$httpProvider',
    function($locationProvider, $routeProvider, $httpProvider) {
    $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
    $locationProvider.hashPrefix('!');
    $routeProvider.otherwise({redirectTo: '/login'});
}])

.service('headerService', function($http) {
    this.setAuthHeader = function(auth) {
        $http.defaults.headers.common['Authorization'] = 'Basic ' + auth;
    }
})

.service('writtenNumberService', function() {
    this.getWrittenNumber = function(number, lang) {
        return writtenNumber(number, {lang: lang});
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
}])

.directive('primesEdsdDirective', function() {
    return {
        restrict: 'E',
        templateUrl: 'components/commons/directives/primes-edsd-directive.html'
    }
})
.directive('nonLogementEdsdDirective', function() {
    return {
        restrict: 'E',
        templateUrl: 'components/commons/directives/non-logement-edsd-directive.html'
    }
})
.directive('rappelsSalairesEdsdDirective', function() {
    return {
        restrict: 'E',
        templateUrl: 'components/commons/directives/rappels-salaires-edsd-directive.html'
    }
})

.controller('EdsdDetailsCtrl', ['$scope','$uibModalInstance', 'items', function($scope, $uibModalInstance, items) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };
    $scope.selectedItem = items;
    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };
}])

.directive("compareTo", function() {
    return {
        require: "ngModel",
        scope: {
            otherModelValue: "=compareTo"
        },
        link: function(scope, element, attributes, ngModel) {
            ngModel.$validators.compareTo = function(modelValue) {
                return modelValue == scope.otherModelValue;
            };
            scope.$watch("otherModelValue", function() {
                ngModel.$validate();
            });
        }
    };
});
