(function () {
    angular.module('knights')
        .directive('manageRulesWidget', function () {
            return {
                templateUrl: '/static/js/directives/manage-rules/manageRulesWidget.html',
                restrict: 'AE'
            }
        })
})();
