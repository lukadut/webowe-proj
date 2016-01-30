"use strict";
angular.module('maw')
    .component('mawLogin', {
        templateUrl: 'user/login.html',
        controller: ['userService', '$location', function (userService, $location) {
            var that = this;

            this.isLogged = false;
            this.username = '';

            this.login = login;

            userService.isLogged()
                .then(function (isLogged) {
                    if(isLogged) {
                        goToList();
                    }
                });

            function login () {
                userService.login(that.username)
                    .then(goToList);
            }

            function goToList () {
                $location.url('/issues');
            }
        }]
    })
    .service('userService', ['$window', '$q', function ($window, $q) {
        var that = this,
            currentUserPromise = $q.resolve(null);

        this.laborantUser = 'LABORANT';
        this.plainUser = 'PLAIN';

        this.login = login;
        this.logOut = logOut;
        this.getUser = getUser;
        this.isLogged = isLogged;
        this.isLaborant = isLaborant;
        this.isPlain = isPlain;

        fetchUser();

        function login (username) {
            return $q.resolve(username)
                .then(function (username) {
                    var userType = null;
                    if(~username.indexOf('laborant')) {
                        userType = that.laborantUser;
                    } else {
                        userType = that.plainUser;
                    }

                    return {name: username, type: userType};
                })
                .then(function (user) {
                    currentUserPromise = $q.resolve(user);
                    return user;
                })
                .then(saveUser);
        }

        function logOut () {
            return $q.resolve(null)
                .then(function (user) {
                    console.log("logout user " + user);
                    currentUserPromise = $q.resolve(user);
                    sessionStorage.removeItem("maw-user");
                    //return saveUser(user);
                });
        }

        function saveUser (user) {
            return $q.resolve($window.sessionStorage.setItem('maw-user', user.name));
        }

        function getUser () {
            return currentUserPromise;
        }

        function fetchUser () {
            return login($window.sessionStorage.getItem('maw-user'))
                .then(getUser);
        }

        function isLogged () {
            return getUser().then(function (user) {
                return user != null;
            });
        }

        function isLaborant () {
            return getUser()
                .then(function (user) {
                    return user.type == that.laborantUser;
                });
        }

        function isPlain () {
            return getUser()
                .then(function (user) {
                    return user.type == that.plainUser;
                });
        }
    }]);
