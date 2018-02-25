'use strict';

angular.module('App.agent', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/agent', {
    templateUrl: 'agent-view/agent.html',
    controller: 'AgentCtrl'
  });
}])

.controller('AgentCtrl', [function() {

}]);
