(function () {
    angular.module('knights')
        .directive('compareWidget', function () {
            return {
                templateUrl: '/static/js/directives/compareWidget.html',
                restrict: 'AE',
                link: function ($scope, $element, $attrs) {
                    $scope.context = $attrs.context;
                }
            }
        })
})();