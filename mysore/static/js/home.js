(function () {
    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider
                .state('private.home', {
                    templateUrl: '/dashboard/base',
                    abstract: true,
                    controller: function($scope, $state){
                        $scope.$on('contextChanged', function () {
                            $state.go('.', {}, {reload: 'private.home.metrics'});
                        })
                    }
                })
                .state('private.home.metrics', {
                    url: '/home',
                    templateUrl: '/dashboard/components',
                    resolve: {
                        hotelId: function(UIContext) {
                           return UIContext.getHotelId();
                        },
                        date: function (UIContext) {
                            return UIContext.getDates();
                        },
                        metricsData: function (hotelId, date, Metrics) {
                            return Metrics.get(date, hotelId);
                        }
                    },
                    controller: 'MetricsController'
                })
        });
})();