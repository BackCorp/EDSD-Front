'use strict';

angular.module('App.agent', ['ngRoute', 'ngCookies', 'ngSanitize', 'smart-table'])

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
    $scope.dt1;
    $scope.today = function() {
        $scope.dt1 = new Date();
        $scope.dt2 = new Date();
    };

    $scope.clear1 = function() {
      $scope.dt1 = null;
    };
    $scope.clear2 = function() {
      $scope.dt2 = null;
    };

    $scope.inlineOptions = {
      customClass: getDayClass,
      minDate: new Date(),
      showWeeks: true
    };

    $scope.dateOptions = {
      // dateDisabled: ,
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
        $scope.dt1 = new Date(year, month, day);
    };
    $scope.setDate = function(year, month, day) {
        $scope.dt2 = new Date(year, month, day);
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

    /* -------- Primes Form ---------- */
    $scope.gradeOrCategoriesPrimes = ["A1","A2","B1","B2"];
    $scope.classeGradeOrCatPrimes = ["Classe 1","Classe 2","Classe exceptionnelle"];
    $scope.groupeIndicesPrimes = [
        {groupe: "I", classe: "Egal ou superieur a 870"},
        {groupe: "II", classe: "Egal ou superieur a 530 et inferieur a 870"},
        {groupe: "III", classe: "Egal ou superieur a 196 et inferieur a 530"},
        {groupe: "IV", classe: "Indice inferieur a 196"}];

    $scope.classeIndicesPrimes = [];

    $scope.areAllFieldsSelected = function() {
        return false;
    };

    $scope.primesGrade={};
    $scope.primesIndices={};

    $scope.checkDates = function() {

    }

    $scope.setGroupeAndClasse = function(indicesPrimes) {
        $scope.primesIndices.classe = indicesPrimes.classe;
        $scope.primesIndices.groupe = indicesPrimes.groupe;
    }

    $scope.processEdsd = function() {
        $scope.primesIndices.startDate = $scope.primesGrade.startDate;
        $scope.primesIndices.endDate = $scope.primesGrade.endDate;
        console.log($scope.primesIndices);
        $http({
            method: 'POST',
            url: 'http://localhost:8080/api/edsd/primes/',
            data: {
                primesGrade: $scope.primesGrade,
                primesIndices: $scope.primesIndices,
                requesterAccountNumber: $scope.requester.accountNumber
            }
        }).then(
            function(resp) {
                console.log(resp);
            }, function(resp) {
                console.log(resp);
            }
        );
    };

    $scope.onDateChange = function(startDate) {

    };

}])

.controller('MyEdsdCtrl', ['$scope', function($scope) {
    var firstnames = ['Laurent', 'Blandine', 'Olivier', 'Max'];
    var lastnames = ['Renard', 'Faivre', 'Frere', 'Eponge'];
    var dates = ['1987-05-21', '1987-04-25', '1955-08-27', '1966-06-06'];
    var id = 1;

    function generateRandomItem(id) {

        var firstname = firstnames[Math.floor(Math.random() * 3)];
        var lastname = lastnames[Math.floor(Math.random() * 3)];
        var birthdate = dates[Math.floor(Math.random() * 3)];
        var balance = Math.floor(Math.random() * 2000);

        return {
            id: id,
            firstName: firstname,
            lastName: lastname,
            birthDate: new Date(birthdate),
            balance: balance
        }
    }

    $scope.rowCollection = [];

    for (id; id < 5; id++) {
        $scope.rowCollection.push(generateRandomItem(id));
    }

    //add to the real data holder
    $scope.addRandomItem = function addRandomItem() {
        $scope.rowCollection.push(generateRandomItem(id));
        id++;
    };

    //remove to the real data holder
    $scope.removeItem = function removeItem(row) {
        var index = $scope.rowCollection.indexOf(row);
        if (index !== -1) {
            $scope.rowCollection.splice(index, 1);
        }
    }
}])

.directive('typeaheadFindRequester', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/typeahead-find-requester.html'
    }
})

.directive('primes', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/primes.html'
    }
})

.directive('rappelsSalaires', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/rappels-salaires.html'
    }
});
