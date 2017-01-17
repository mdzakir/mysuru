(function () {
    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider.state('private.import', {
                url: '/import',
                templateUrl: '/import-bookings',
                resolve: {
                    hotelId: function (UIContext) {
                        return UIContext.getHotelId();
                    }
                },
                controller: (function ($scope, $state, hotelId, $http) {
                    $scope.$on('hotelChanged', function () {
                        $state.reload();
                    });
                })
            });
        });

})();