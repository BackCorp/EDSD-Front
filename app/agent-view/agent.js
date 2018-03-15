'use strict';

angular.module('App.agent', ['ngRoute', 'ngCookies', 'ngSanitize'])

.config(['$routeProvider', function($routeProvider, $location, storageService) {
    $routeProvider.when('/agent', {
        resolve: {
            check: function($location, $cookies, storageService) {
                if(!storageService.getSession('hasLoggedIn')) {
                    $location.path("/login");
                } else {
                    storageService.setSession('previousRoute', '/agent');
                }
            },
        },
        templateUrl: 'agent-view/agent.html',
        controller: 'AgentCtrl'
    }).otherwise({redirectTo: '/login'});
}])

.controller('AgentCtrl', ['$scope','$location','$cookies','$http','headerService','storageService','requesterService',
    function($scope, $location, $cookies, $http, headerService, storageService, requesterService) {

    $scope.logout = function() {
        storageService.clear();
        $cookies.remove('XSRF-TOKEN');
        $location.path("/login");
    };

    $scope.firstName = storageService.getSession('firstName');
    $scope.lastName = storageService.getSession('lastName');
    $scope.agentTemplate = 'agent-view/templates/process-edsd.html';
    $scope.change = function(template){
        $scope.agentTemplate = "agent-view/templates/" + template;
    };

    $scope.asyncSearch = undefined;
    $scope.selected = undefined;

    $scope.modelOptions = {
        debounce: {
            default: 500,
            blur: 500
        },
        getterSetter: false
    };

    $scope.getRequesters = function(search) {
        headerService.setAuthHeader(storageService.getSession('session'));
        return $http({
            method: 'GET',
            url: 'http://localhost:8080/api/requesters/search/' + search
        }).then(
            function(response) {
                console.log(response)
                return response.data.map(function(item){
                    item.name = item.firstName +" "+ item.lastName
                    return item;
                });
            },
            function(error) {

            }
        );
    };

    $scope.onRequesterSelect = function($item, $model, $label, $event) {
        $scope.selected = true;
        $scope.requester = $model;
        // $scope.showRole = roleSection($model);
    }



    //-------------- Date --------------//
    $scope.today = function() {
      $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function() {
      $scope.dt = null;
    };

    $scope.inlineOptions = {
      customClass: getDayClass,
      minDate: new Date(),
      showWeeks: true
    };

    $scope.dateOptions = {
      dateDisabled: disabled,
      formatYear: 'yy',
      maxDate: new Date(2020, 5, 22),
      minDate: new Date(),
      startingDay: 1
    };

    // Disable weekend selection
    function disabled(data) {
      var date = data.date,
        mode = data.mode;
      return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
    }

    $scope.toggleMin = function() {
      $scope.inlineOptions.minDate = $scope.inlineOptions.minDate ? null : new Date();
      $scope.dateOptions.minDate = $scope.inlineOptions.minDate;
    };

    $scope.toggleMin();

    $scope.open1 = function() {
      $scope.popup1.opened = true;
    };

    $scope.open2 = function() {
      $scope.popup2.opened = true;
    };

    $scope.setDate = function(year, month, day) {
      $scope.dt = new Date(year, month, day);
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];

    $scope.popup1 = {
      opened: false
    };

    $scope.popup2 = {
      opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

    function getDayClass(data) {
        var date = data.date,
        mode = data.mode;
        if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0,0,0,0);

        for (var i = 0; i < $scope.events.length; i++) {
            var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }

      return '';
    }


}])

.directive('typeaheadFindRequester', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/typeahead-find-requester.html'
    }
});
