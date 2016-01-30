"use strict";
angular.module('maw')
    .component('mawList', {
        templateUrl: 'issues/list.html',
        controller: ['issueRepository', '$location', function (issueRepository, $location) {
            var that = this;

            this.goToAddForm = goToAddForm;
            this.goToIssue = goToIssue;

            issueRepository.getAllIssues()
                .then(function (issues) {
                    that.issues = issues;
                });

            function goToAddForm () {
                $location.url('/new-issue')
            }

            function goToIssue (issue) {
                console.log(issue);
                $location.url('/issues/'+issue.$id);
            }
        }]
    })
    .component('mawIssueCard', {
        templateUrl: 'issues/issue-card.html',
        bindings: {
            issue: '='
        }
    })
    .component('mawIssue', {
        templateUrl: 'issues/issue.html',
        controller: ['userService', 'issueRepository', '$routeParams', function (userService, issueRepository, $routeParams) {
            var that = this;

            this.issue = {};
            this.isAuthor = false;
            this.isLaborant = false;

            this.done = done;
            this.started = started;

            fetchIssue();

            function fetchIssue () {
                userService.isLogged()
                    .then(function (isLogged) {
                        if(isLogged) {
                            return issueRepository.getIssue($routeParams.id);
                        } else {
                            return {};
                        }
                    })
                    .then(function (issue) {
                        console.log(issue);
                        that.issue = issue;
                        checkIfAuthor();
                        checkIfLaborant();
                    });
            }

            function checkIfAuthor () {
                userService.getUser()
                    .then(function (user) {
                        that.isAuthor = (user.name == that.issue.author);
                    });
            }

            function checkIfLaborant () {
                userService.isLaborant()
                    .then(function (isLaborant) {
                        that.isLaborant = isLaborant;
                    });
            }

            function done () {
                that.issue.done = true;

                updateIssue();
            }

            function started () {
                that.issue.started = true;

                updateIssue();
            }

            function updateIssue () {
                issueRepository.updateIssue(that.issue);
            }
        }]
    })
    .component('mawForm', {
        templateUrl: 'issues/form.html',
        controller: ['issueRepository', function (issueRepository) {
            var that = this;

            this.rooms = ['308','309','406','409','412','510'];
            this.newIssue = {};

            this.addIssue = addIssue;

            function addIssue () {
                console.log('sending');
                that.newIssue.time = new Date().getTime();
                issueRepository.addIssue(that.newIssue)
                    .then(function () {
                        that.newIssue = {};
                    })
                    .then();
            }

        }]
    })
    .service('issueRepository', ['$firebaseArray', '$firebaseObject', 'firebaseFactory','$location', function ($firebaseArray, $firebaseObject, firebaseFactory,$location) {
        var issuesRef = firebaseFactory(''),
            issuesArray = $firebaseArray(issuesRef);

        this.getAllIssues = getAllIssues;
        this.addIssue = addIssue;
        this.getIssue = getIssue;

        function getAllIssues () {
            return issuesArray.$loaded();
        }

        function addIssue (issue) {
            console.log("issue " + JSON.stringify(issue));
            //$location.url('/issues/');

            return issuesArray.$add(issue)
                .then(function(issuesRef){

                    $location.url('/issues/'+issuesRef.key());
                });
        }

        function getIssue (issueId) {
            var firebase = firebaseFactory(issueId),
                obj = $firebaseObject(firebase);

            return obj.$loaded();
        }

        function updateIssue (issue) {
            var firebase = firebaseFactory(issue.$id),
                obj = $firebaseObject(firebase);

            return obj.$loaded(function (data) {
                Object.assign(data, issue);

                return data.$save();
            });
        }
    }]);
