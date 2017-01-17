(function () {
    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider.state('private.pricereport', {
                url: '/price-report',
                templateUrl: '/price-update-report',
                resolve: {
                    hotelId: function (UIContext) {
                        return UIContext.getHotelId();
                    },
                    rooms: function ($http, hotelId) {
                        return $http.get('/hotel/viewrooms?hotel_id=' + hotelId);
                    },
                    rates: function ($http, hotelId,rooms) {
                        return $http.get('/hotel/rateMappedPlans?hotel_id=' + hotelId + '&room_id=' + rooms.data[0].id);
                    }
                },
                controller: (function ($http, $scope, $state, hotelId,rooms,rates) {
                    $scope.$on('hotelChanged', function () {
                        $state.reload();
                    });
                    $scope.hotel_id = hotelId;
                    $scope.rooms = rooms.data;
                    $scope.rates = rates.data;

                    $scope.room = -1;
                    $scope.rate = -1;

                    $scope.type = 'booking';


                    //Datepicker

                    $scope.today = function () {
                        $scope.dt = new Date();
                    };
                    $scope.today();

                    //  Customization

                    function dateOptions() {
                        return {
                            maxDate: new Date(2020, 5, 22),
                            startingDay: 1
                        }
                    }

                    $scope.dateOptions1 = dateOptions();
                    $scope.dateOptions2 = dateOptions();

                    $scope.setMinDate = function () {
                        if ($scope.endDate !== undefined) {
                            if ($scope.endDate < $scope.startDate) {
                                $scope.endDate = '';
                            }
                        }
                        $scope.dateOptions2.minDate = angular.copy($scope.startDate);
                        $scope.dateOptions2.initDate = angular.copy($scope.startDate);

                        $scope.open2();
                    };

                    $scope.open1 = function () {
                        $scope.popup1.opened = true;
                    };

                    $scope.open2 = function () {
                        $scope.popup2.opened = true;
                    };

                    $scope.setDate = function (year, month, day) {
                        $scope.startDate = new Date(year, month, day);
                        $scope.endDate = new Date(year, month, day);
                    };

                    $scope.formats = ['dd MMM yyyy', 'yyyy-MM-dd', 'dd.MM.yyyy', 'shortDate'];
                    $scope.format = $scope.formats[1];

                    $scope.popup1 = {opened: false};
                    $scope.popup2 = {opened: false};

                    // END DATEPICKER

                    $scope.searchPriceReport = function(){

                        var start_date = moment($scope.startDate).format("YYYY-MM-DD");
                        var end_date = moment($scope.endDate).format("YYYY-MM-DD");
                        var type = $scope.type;
                        var room = $scope.room;

                        $http.get('/hotel/priceUpdateReport?hotel_id='+hotelId+'&start_date='+start_date+'&end_date='+end_date+'&type='+type+'&room='+room).then(function(data){
                            $scope.data = data.data
                        });
                    }


                })
            });
        });

})();