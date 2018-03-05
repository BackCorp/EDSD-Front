angular.module('services.userManagement', [
    'ngResource'
]).factory('userService', userService);

function userService() {
    var username;
    var currentUser;
    var isLoggedIn = false;
    function logThisUserIn() {
        $resource("http://localhost:8080/api/login/:currentUser");
    }
    function setCurrentUser(user) {
        currentUser = user;
    };
    function getCurrentUser() {
        return currentUser;
    };
    function getLogInState() {
        return isLoggedIn;
    };
    function logThisUserIn() {
        loggedIn = true;
    };
    function logOutUser = function() {
        isLoggedIn = false;
    }
}
