"use strict";
angular.module('maw', ['firebase', 'ngRoute', 'ngMaterial'])
    .controller('MainCtrl', ['$location', 'userService', '$scope', function ($location, userService, $scope) {
        var that = this;

        this.isLogged = false;

        refreshLoggedState();

        this.goToList = function () {
            $location.url('/issues');
        };

        this.logOut = function () {
            userService.logOut()
                .then(function () {
                    $location.url('/login');
                })
                .then(refreshLoggedState);
        };

        $scope.$on('$routeChangeStart', function () {
            refreshLoggedState()
                .then(function () {
                    if(!that.isLogged) {
                        $location.url('/login');
                    }
                })
        });

        function refreshLoggedState () {
            return userService.isLogged()
                .then(function (isLogged) {
                    that.isLogged = isLogged;
                });
        }
    }])
    .factory('firebaseFactory', [function () {
        return function firebaseFactory (link) {
            return new Firebase('https://laborant.firebaseio.com/projekt/' + link);
        };
    }]);

