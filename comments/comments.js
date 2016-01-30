angular.module('maw')
    .component('mawIssueComments', {
        templateUrl: 'comments/comments.html',
        bindings: {
            issue: '='
        },
        controller: ['issueRepository', 'userService', function (issueRepository, userService) {
            var that = this;

            this.newComment = '';

            this.addComment = addComment;

            function addComment () {
                userService.getUser()
                    .then(function (user) {
                        return issueRepository.addCommentForIssue(that.issue, {
                            date: new Date().getTime(),
                            content: that.newComment,
                            author: user.name
                        });
                    })
                    .then(function (updatedIssue) {
                        that.newComment = '';
                        that.issue.comments = updatedIssue.comments;
                    });

            }
        }]
    })
    .component('mawComment', {
        templateUrl: 'comments/comment.html',
        bindings: {
            comment: '='
        },
        controller: function () {
            this.date = new Date(this.comment.date);
        }
    });
