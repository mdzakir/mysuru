(function() {
    angular.module('knights',
        [   'ngAnimate',
            'ui.bootstrap',
            'ngSanitize',
            'ui.router',
            'ui.sortable',
            'ngDialog',
            'ui.select',
            'ngProgress',
            'angular-cache',
            'ng.deviceDetector',
            'bookingCurveCtrl',
            'segChartCtrl',
            'priceChartCtrl',
            'priceCalendar',
            'priceOptimizer'
        ])


    .directive('ngEnter', function() {
        return function(scope, element, attrs) {
            element.bind("keydown keypress", function(event) {
                if (event.which === 13) {
                    scope.$apply(function() {
                        scope.$eval(attrs.ngEnter);
                    });

                    event.preventDefault();
                }
            });
        };
    })

    .constant('_', window._)
        .run(function($rootScope) {
            $rootScope._ = window._;
        })

    .config(['$interpolateProvider', function($interpolateProvider) {
        $interpolateProvider.startSymbol('{[{').endSymbol('}]}');
    }])

    .filter('percentage', ['$filter', function($filter) {
        return function(input, decimal) {
            return $filter('number')(Math.abs(input * 100), decimal) + '%';
        };
    }])

    .filter('trim', function() {
        return function(value, wordwise, max, tail) {
            if (!value) return '';

            max = parseInt(max, 10);
            if (!max) return value;
            if (value.length <= max) return value;

            value = value.substr(0, max);
            if (wordwise) {
                var lastspace = value.lastIndexOf(' ');
                if (lastspace != -1) {
                    //Also remove . and , so its gives a cleaner result.
                    if (value.charAt(lastspace - 1) == '.' || value.charAt(lastspace - 1) == ',') {
                        lastspace = lastspace - 1;
                    }
                    value = value.substr(0, lastspace);
                }
            }

            return value + (tail || ' …');
        };
    })

    .constant('startState', 'private.home.metrics')
        .config(function($urlRouterProvider, startState) {
            $urlRouterProvider.otherwise(function($injector) {
                var state = $injector.get('$state');
                state.go(startState);
            });
        })
        .run(function($rootScope, $state, UIContext, startState, eventsTracker) {
            $rootScope.$on('userLoggedIn', function() {
                $state.go(startState);
            });
            $rootScope.$on('userLoggedOut', function() {
                UIContext.reset();
                $state.go('login');
            });
            $rootScope.$on('authenticationRequired', function() {
                UIContext.reset();
                $state.go('login');
            });
            $rootScope.$on('$stateChangeError', function(event, toState, toParams, fromState, fromParams, error) {
                console.log(error);
            });
            $rootScope.$on('$stateChangeStart',
                function(event, toState, toParams, fromState, fromParams) {
                    switch (toState.name) {
                        case 'private.home.metrics':
                            eventsTracker.logEvent('tab_click', { 'tab': 'Dashboard' });
                            break;
                        case 'private.rules.view':
                            eventsTracker.logEvent('tab_click', { 'tab': 'Pricing' });
                            break;
                        case 'private.import':
                            eventsTracker.logEvent('tab_click', { 'tab': 'Import' });
                            break;
                        case 'private.optimizer':
                            eventsTracker.logEvent('tab_click', { 'tab': 'Optimizer' });
                            break;
                         case 'private.report':
                            eventsTracker.logEvent('tab_click', { 'tab': 'Report' });
                            break;
                    }
                });
        })
        .controller('HomeCtrl', function($scope) {
            $scope.status = {
                isopen: false
            };

            $scope.toggleDropdown = function($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };

            $scope.appendToEl = angular.element(document.querySelector('#dropdown-long-content'));
        });

})();
