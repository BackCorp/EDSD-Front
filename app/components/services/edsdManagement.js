'use strict';

angular.module('services.edsdManagement', [
    'ngResource'
])
.service('primesDataService', function() {
    this.getPrimesLieesAuGrade = function() {
        return [
            {
                grade: 'A1',
                classes: [
                    {classe: 'Classe 1',indemnite:'Technicite',montant: 12500},
                    {classe: 'Classe 2',indemnite:'Technicite',montant: 10000},
                    {classe: 'Classe exceptionnelle',indemnite:'Technicite',montant: 25000},
                ]
            },
            {
                grade: 'A2',
                classes: [
                    {classe: 'Classe 1',indemnite:'Technicite',montant: 15000},
                    {classe: 'Classe 2',indemnite:'Technicite',montant: 12500},
                    {classe: 'Classe exceptionnelle',indemnite:'Technicite',montant: 30000},
                    {classe: 'Hors echelle',indemnite:'Technicite',montant: 30000},
                ]
            },
            {
                grade: 'B1',
                classes: [
                    {classe: 'Classe 1',indemnite:'Technicite',montant: 6000},
                    {classe: 'Classe 2',indemnite:'Technicite',montant: 5000},
                    {classe: 'Classe exceptionnelle',indemnite:'Technicite',montant: 10000}
                ]
            },
            {
                grade: 'B2',
                classes: [
                    {classe: 'Classe 1',indemnite:'Technicite',montant: 10000},
                    {classe: 'Classe 2',indemnite:'Technicite',montant: 6000},
                    {classe: 'Classe exceptionnelle',indemnite:'Technicite',montant: 18000}
                ]
            }
        ];
    };
    this.getPrimesLieesAuxIndices = function() {
        return [
            {
                classe: "Indice inferieur a 196",
                groupe: 'IV',
                indemnites:[{name: 'Sante Publique', montant: 10000},{name: 'Astreinte', montant: 6000}]
            },
            {
                classe: "Egal ou superieur a 196 et inferieur a 530",
                groupe: 'III',
                indemnites:[{name: 'Sante Publique', montant: 15000},{name: 'Astreinte', montant: 8000}],
            },
            {
                classe: "Egal ou superieur a 530 et inferieur a 870",
                groupe: 'II',
                indemnites:[{name: 'Sante Publique', montant: 21000},{name: 'Astreinte', montant: 10000}],
            },
            {
                classe: "Egal ou superieur a 870",
                groupe: 'I',
                indemnites:[{name: 'Sante Publique', montant: 30000},{name: 'Astreinte', montant: 12000}],
            }
        ];
    }
})

.factory('edsdService', edsdService);

function edsdService($resource) {
    var service = {};
    service.getPrimesEdsd = function() {
        return $resource('http://localhost:8080/api/edsd/primes');
    }
    service.getNonLogementEdsd = function() {
        return $resource('http://localhost:8080/api/edsd/nonLogements');
    }
    service.getRappelsSalairesEdsd = function() {
        return $resource('http://localhost:8080/api/edsd/rappelsSalaires');
    }
    service.getAllPrimesEdsds = function() {
        return $resource('http://localhost:8080/api/agents/primes');
    }
    service.getAllNonLogementEdsds = function() {
        return $resource('http://localhost:8080/api/agents/nonLogements');
    }
    service.getAllRappelsSalairesEdsds = function() {
        return $resource('http://localhost:8080/api/agents/rappelsSalaires');
    }
    return service;
}
