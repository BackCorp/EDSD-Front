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

.controller('AgentCtrl', ['$scope','$location','$cookies','$http','$sce','$templateCache','$uibModal',
    'headerService','storageService','requesterService','primesDataService','writtenNumberService',
    function($scope, $location, $cookies, $http, $sce, $templateCache, $uibModal,
        headerService, storageService, requesterService, primesDataService, writtenNumberService) {

    $scope.logout = function() {
        storageService.clear();
        $cookies.remove('XSRF-TOKEN');
        $location.path("/login");
    };

    $scope.firstName = storageService.getSession('firstName');
    $scope.lastName = storageService.getSession('lastName');
    $scope.username = storageService.getSession('username');
    $scope.agentTemplate = 'agent-view/templates/process-edsd.html';
    $scope.change = function(template){
        $scope.agentTemplate = "agent-view/templates/" + template;
    };

    $scope.asyncSearch = undefined;
    $scope.selected = undefined;
    $scope.edsdModules={};
    $scope.primesGrade={};
    $scope.primesIndices={};
    $scope.nonLogement={};
    $scope.retenues={};
    $scope.retenues.montants=[];
    $scope.date={};

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
    $scope.primesLieesAuGrade = primesDataService.getPrimesLieesAuGrade();
    $scope.primesLieesAuxIndices = primesDataService.getPrimesLieesAuxIndices();

    $scope.areAllFieldsSelected = function() {
        return false;
    };

    $scope.checkDates = function() {

    }

    $scope.setPrimesAndIndices = function(primesGrade, primesIndices, selectedPrimesGrade) {
        $scope.primesGrade = primesGrade;
        $scope.primesIndices = primesIndices;
        $scope.primesGrade.grade = selectedPrimesGrade;
    }

    $scope.processEdsd = function($event, primesGrade) {
        $scope.primesIndices.startDate = $scope.date.startDate;
        $scope.primesGrade.startDate = $scope.date.startDate;
        $scope.primesIndices.endDate = $scope.date.endDate;
        $scope.primesGrade.endDate = $scope.date.endDate;

        $scope.change("primes-edsd-print.html");
    };

    $scope.cancelEdsdProcess = function() {
        $scope.change("process-edsd.html");
    }

    $scope.primes = {};
    $scope.primes.message = null;

    $scope.getWrittenNumber = function(number, lang) {
        return writtenNumberService.getWrittenNumber($scope.round(number), lang);
    }

    $scope.round = function(number) {
        return Math.round(number);
    }

    /*--------- Calculations for Edsd preprint ---------*/
    function getNumberOfDays(startDate, endDate) {
        return (endDate - startDate + 1)/(24*3600000);
    }
    // function



    $scope.confirm = function () {
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
                if(resp.data) {
                    console.log(resp);
                    $scope.change("process-edsd.html");
                    $scope.primesGrade={};
                    $scope.primesIndices={};
                    $scope.requester={};
                    $scope.selected = false;
                } else {
                    $scope.primes.message = "The current requester has been processed already."
                }
            }, function(resp) {
                console.log(resp);
            }
        );
    };

}])

.controller('MyEdsdCtrl', ['$scope', '$http', '$log', '$uibModal', 'edsdService', 'headerService', 'storageService',
    function($scope, $http, $log, $uibModal, edsdService, headerService, storageService) {

    headerService.setAuthHeader(storageService.getSession('session'));
    $scope.getPrimesEdsds = edsdService.getPrimesEdsd().query(function(primesEdsd) {
        console.log(primesEdsd);
    });

    $scope.showDetails = function($event, prime) {
        $event.preventDefault();
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: 'modal-primes-content.html',
            controller: 'PrimesEdsdDetailsCtrl',
            backdrop: 'static',
            size: 'lg',
            resolve: {
                items: function () {
                    return prime;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            // $scope.selectedPrime = selectedItem;
            // $log.info(selectedItem);
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

}])

.controller('PrimesEdsdDetailsCtrl', ['$scope','$uibModalInstance', 'items', function($scope, $uibModalInstance, items) {
    $scope.ok = function () {
        $uibModalInstance.close();
    };

    $scope.selectedPrime = items;

    $scope.cancel = function () {
        $uibModalInstance.dismiss();
    };
}])

.directive('typeaheadFindRequester', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/typeahead-find-requester.html'
    }
})

.directive('datePicker', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/date-picker.html'
    }
})


.directive('primes', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/primes.html'
    }
})
.directive('nonLogement', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/non-logement.html'
    }
})
.directive('retenues', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/retenues.html'
    }
})

.directive('rappelsSalaires', function() {
    return {
        restrict: 'E',
        templateUrl: 'agent-view/directives/rappels-salaires.html'
    }
});
