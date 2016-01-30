"use strict";
angular.module('maw')
    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider
            .when('/issues/:id', {
                template: '<maw-issue></maw-issue>'
            })
            .when('/issues', {
                template: '<maw-list></maw-list>'
            })
            .when('/new-issue', {
                template: '<maw-form></maw-form>'
            })
            .when('/login', {
                template: '<maw-login></maw-login>'
            })
            .otherwise('/login');
    }])
    .config(['$mdIconProvider', function ($mdIconProvider) {
        $mdIconProvider.fontSet('mi', 'material-icons');
    }]);
