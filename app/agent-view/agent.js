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

.controller('AgentCtrl', ['$scope','$location','$cookies','$http','$sce','$templateCache','$timeout',
    '$window','$uibModal','headerService','storageService','primesDataService','writtenNumberService',
    function($scope, $location, $cookies, $http, $sce, $templateCache,$timeout,$window,$uibModal,
        headerService, storageService, primesDataService, writtenNumberService) {

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
    $scope.rappelsSalaires={};
    $scope.print={};
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
            url: 'https://edsd2.herokuapp.com/api/requesters/search/' + search
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

    $scope.processEdsd = function() {
        if($scope.edsdModules.primes) {
            $scope.primesIndices.startDate = $scope.date.startDate;
            $scope.primesIndices.endDate = $scope.date.endDate;
            $scope.primesGrade.endDate = $scope.date.endDate;
            $scope.primesGrade.startDate = $scope.date.startDate;
        }
        if($scope.edsdModules.nonLogement) {
            $scope.nonLogement.startDate = $scope.date.startDate;
            $scope.nonLogement.endDate = $scope.date.endDate;
        }
        if($scope.edsdModules.rappelsSalaires) {
            $scope.rappelsSalaires.startDate = $scope.date.startDate;
            $scope.rappelsSalaires.endDate = $scope.date.endDate;
        }
        $scope.print = setEdsdPrint();
        $scope.change("primes-edsd-print.html");
    };

    $scope.cancelEdsdProcess = function() {
        $scope.edsdModules.retenues = false;
        $scope.primes.message = false;
        $scope.change("process-edsd.html");
    };

    // $scope.primes = {};
    // $scope.primes.message = null;

    $scope.getWrittenNumber = function(number, lang) {
        if(number < 0) {
            return "Moins " + writtenNumberService.getWrittenNumber($scope.round(Math.abs(number)), lang);
        }
        return writtenNumberService.getWrittenNumber($scope.round(number), lang);
    };

    $scope.round = function(number) {
        return Math.round(number);
    };

    $scope.bindSalaires = function(salaires) {
        $scope.nonLogement.salaireDeBase = salaires;
        $scope.rappelsSalaires.salaireDeBase = salaires;
    };

    /*--------- Calculations for Edsd preprint ---------*/
    function getNumberOfDays(startDate, endDate) {
        return (endDate - startDate + 1)/(24*3600000);
    }

    function setEdsdPrint() {
        var obj =  {
            startDate: $scope.date.startDate,
            endDate: $scope.date.endDate,
            period: $scope.round(($scope.date.endDate - $scope.date.startDate + 1)/(24*3600000)),
        };
        if($scope.edsdModules.primes) {
            obj.primes = {
                techniciteMontant: $scope.primesGrade.montant || 0,
                publicSanteMontant: $scope.primesIndices.indemnites[0].montant || 0,
                astreinteSanteMontant: $scope.primesIndices.indemnites[1].montant || 0,
                taxTP: ($scope.primesGrade.montant + $scope.primesIndices.indemnites[0].montant + $scope.primesIndices.indemnites[1].montant)*(5.28/100) || 0,
                afterTax: function() { return (this.taxTP/(5.28/100)) * (1 - 5.28/100) || 0 }
            };
        }
        if($scope.edsdModules.nonLogement) {
            obj.nonLogement = { montant: $scope.nonLogement.salaireDeBase };
        }
        if($scope.edsdModules.retenues) {
            obj.retenues = { montant: $scope.retenues.montant };
        }
        if($scope.edsdModules.rappelsSalaires) {
            obj.rappelsSalaires = { montant: $scope.rappelsSalaires.salaireDeBase };
        }
        return obj;
    }

    $scope.imprimer = function () {
        headerService.setAuthHeader(storageService.getSession('session'));
        $http({
            method: 'POST',
            url: 'https://edsd2.herokuapp.com/api/edsd',
            data: {
                primesGrade: ($scope.edsdModules.primes) ? $scope.primesGrade : null,
                primesIndices: ($scope.edsdModules.primes) ? $scope.primesIndices : null,
                nonLogement: ($scope.edsdModules.nonLogement) ? $scope.nonLogement : null,
                rappelsSalaires: ($scope.edsdModules.rappelsSalaires) ? $scope.rappelsSalaires : null,
                retenues: ($scope.edsdModules.retenues) ? $scope.retenues.montant : 0.0,
                requesterAccountNumber: $scope.requester.accountNumber
            }
        }).then(
            function(resp) {
                console.log(resp);
                $scope.edsdModules.print = "Your EDSD has been successfully processed.";
                $scope.edsdModules.error = false;
                $window.print();
                $timeout( function(){
                    $scope.primesGrade={};
                    $scope.primesIndices={};
                    $scope.nonLogement={};
                    $scope.rappelsSalaires={}
                    $scope.retenues={};
                    $scope.requester={};
                    $scope.edsdModules={};
                    $scope.selected = false;
                    $scope.change('process-edsd.html');
                }, 8000 );
            }, function(resp) {
                console.log(resp);
                $scope.edsdModules.error = resp.data.body;
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
    $scope.getNonLogementEdsds = edsdService.getNonLogementEdsd().query(function(nonLogement) {
        console.log(nonLogement);
    });
    $scope.getRappelsSalairesEdsds = edsdService.getRappelsSalairesEdsd().query(function(rappelsSalaires) {
        console.log(rappelsSalaires);
    });

    $scope.showDetails = function($event, edsd, template) {
        $event.preventDefault();
        var modalInstance = $uibModal.open({
            animation: true,
            templateUrl: template,
            controller: 'EdsdDetailsCtrl',
            backdrop: 'static',
            size: 'lg',
            resolve: {
                items: function () {
                    return edsd;
                }
            }
        });
    };

    $scope.createdByField = false;
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
