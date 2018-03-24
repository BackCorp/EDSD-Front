'use strict';

angular.module('services.edsdManagement', [
    'ngResource'
])
.factory('edsdService', edsdService);

function edsdService($resource) {
    var service = {};
    service.getPrimesEdsd = function() {
        return $resource('http://localhost:8080/api/edsd/primes');
    }
    return service;
}
