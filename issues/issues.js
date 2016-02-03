"use strict";
angular.module('maw')
    .component('mawList', {
        templateUrl: 'issues/list.html',
        controller: ['issueRepository', '$location', function (issueRepository, $location) {
            var that = this;

            this.goToAddForm = goToAddForm;
            this.goToIssue = goToIssue;
            this.goToTop = goToTop;

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
            function goToTop(){
                
                    $("body").animate({scrollTop: 0}, "fast");
                
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
        controller: ['issueRepository', '$location', 'rooms', 'userService', function (issueRepository, $location, rooms, userService) {
            var that = this;

            this.rooms = rooms;
            this.newIssue = {};
            this.selectedRoom = selectedRoom;
            this.test = test;

            this.addIssue = addIssue;

            function test(room){
                console.log("test " + room.$error);
            }

            function selectedRoom(a){
                console.log("wybrane " + a);
            }

            function addIssue () {
                that.newIssue.time = new Date().getTime();
                userService.getUser()
                    .then(function (user) {
                        that.newIssue.author = user.name;
                        return issueRepository.addIssue(that.newIssue);
                    })
                    .then(function (addedIssue) {
                        that.newIssue = {};
                        $location.url('/issues/'+addedIssue.key());
                    });
            }

        }]
    })
    .value('rooms', ['308','309','406','409','412','510'])
    .service('issueRepository', ['$firebaseArray', '$firebaseObject', 'firebaseFactory', function ($firebaseArray, $firebaseObject, firebaseFactory) {
        var issuesRef = firebaseFactory(''),
            issuesArray = $firebaseArray(issuesRef);

        this.getAllIssues = getAllIssues;
        this.addIssue = addIssue;
        this.getIssue = getIssue;
        this.addCommentForIssue = addCommentForIssue;
        this.updateIssue = updateIssue;

        function getAllIssues () {
            return issuesArray.$loaded();
        }

        function addIssue (issue) {
            return issuesArray.$add(issue);
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

        function addCommentForIssue (issue, comment) {
            var firebase = firebaseFactory(issue.$id),
                obj = $firebaseObject(firebase);

            return obj.$loaded(function (data) {
                data.comments = data.comments || [];
                data.comments.push(comment);

                return data.$save();
            })
            .then(function () {
                return obj;
            });
        }
    }]);
