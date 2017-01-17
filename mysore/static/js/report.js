(function () {
    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider.state('private.report', {
                url: '/report',
                templateUrl: '/download-reports',
                resolve: {
                    hotelId: function (UIContext) {
                        return UIContext.getHotelId();
                    }
                },
                controller: (function ($scope, $state, hotelId, $http) {
                    $scope.$on('hotelChanged', function () {
                        $state.reload();
                    });

                    $scope.monthly_report_url = '/hotel/reports/monthly/online/' + hotelId
                    $scope.hotel_id = hotelId;
                })
            });
        });

})();