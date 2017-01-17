(function () {
    angular.module('knights')
        .directive('popupRuleWidget', function () {
            return {
                templateUrl: '/static/js/directives/popup-rule/popupRuleWidget.html',
                restrict: 'AE'
            }
        })
})();
