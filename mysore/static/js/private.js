(function () {
    angular.module('knights')
        .factory('UIContext', function ($rootScope, $q, UserHotels, User) {
            var dates = [new Date()];
            var hotelId;
            return {
                changeDates: function (dts) {
                    // Hack to make sure we don't fire date changed on page refresh.
                    //if(date.getTime() === dt.getTime()) return;
                    dates = dts;
                    $rootScope.$broadcast('dateChanged', dts);
                    notifyContextChange(this);
                },
                changeHotel: function (hid) {
                    hotelId = hid;
                    $rootScope.$broadcast('hotelChanged', {'hid': hid});
                    notifyContextChange(this);
                },
                getDates: function () {
                    return dates;
                },
                getHotelId: function () {
                    if (hotelId) {
                        return hotelId;
                    } else {
                        var deferred = $q.defer();
                        UserHotels.get().then(function (hotels) {
                            hotelId = User.getHotelID();
                            deferred.resolve(hotelId);
                        });
                        return deferred.promise;
                    }
                },
                getFirstDay: function () {
                    var currentMonth = dates[0].getMonth(),
                        currentYear = dates[0].getFullYear(),
                        firstDay = new Date(Date.UTC(currentYear, currentMonth, 1));
                    return firstDay;
                },
                reset: function () {
                    hotelId = null;
                    UserHotels.reset();
                    dates = [new Date()];
                }
            };

            function notifyContextChange(context) {
                if (dates && hotelId) $rootScope.$broadcast('contextChanged', context);
            }
        })
        .config(function ($stateProvider) {
            $stateProvider
                .state('private', {
                    abstract: true,
                    templateUrl: '/base/private',
                    resolve: {
                        hotels: function (UserHotels) {
                            return UserHotels.get();
                        },
                        hotelId: function (UIContext) {
                            return UIContext.getHotelId();
                        },
                        bookingImports: function (BookingImports, hotelId) {
                            return BookingImports.get(hotelId);
                        }
                    },
                    controller: 'lastImportedTimeController'
                });
        })
        .factory('UserHotels', function ($q, $http) {
            var hotels;
            return {
                get: function () {
                    if (hotels) {
                        return hotels;
                    } else {
                        var deferred = $q.defer();
                        hotels = deferred.promise;
                        $http.get('/user/products')
                            .then(function (response) {
                                hotels = response.data;
                                deferred.resolve(hotels);
                            }, function (error) {
                                hotels = null;
                                deferred.reject(error);
                            });

                        return hotels;
                    }
                },
                reset: function () {
                    hotels = null;
                }
            };
        })
        .controller('lastImportedTimeController', function ($http, $scope, hotels, UIContext, User, bookingImports, BookingImports, deviceDetector, UserSettings, AjaxCalls, ngProgressFactory, $rootScope) {
            $scope.hotels = hotels;
            $scope.hotelId = User.getHotelID();
            $scope.indexOfSelectedHotel = _.findIndex($scope.hotels, function (o) {
                return o.id == $scope.hotelId;
            });
            $scope.selectedHotel = $scope.hotels[$scope.indexOfSelectedHotel];

            $scope.bookingImports = bookingImports.data;

            $scope.$on('bookingsImported', function () {
                BookingImports.get(User.getHotelID()).then(function (res) {
                    $scope.bookingImports = res.data;
                });
            });
            updateUserSettings(User.getHotelID());

            $rootScope.$on('ajaxStarted', function() {
                $scope.progressbar = ngProgressFactory.createInstance();
                $scope.progressbar.start();
            });
            $rootScope.$on('ajaxEnded', function() {
                $scope.progressbar && $scope.progressbar.complete();
            });

            $scope.is_busy = AjaxCalls.is_busy;

            $scope.hotelChanged = function (changedHotelID) {
                updateUserSettings(changedHotelID);
                UIContext.changeHotel(changedHotelID);
                $scope.hotelId = changedHotelID;
                $scope.indexOfSelectedHotel = _.findIndex($scope.hotels, function (o) {
                    return o.id == $scope.hotelId;
                });
                $scope.selectedHotel = $scope.hotels[$scope.indexOfSelectedHotel];
                User.setRoomID([1, false]);
                BookingImports.get(changedHotelID).then(function (res) {
                    $scope.bookingImports = res.data;
                });
            };
            function updateUserSettings(changedHotelID) {
                UserSettings.get_hotel_currency_code(changedHotelID).then(function (data) {
                    User.setHotelID(changedHotelID);
                    User.setHotelConfig(data.data);
                });
                UserSettings.get_currency_iso_code(changedHotelID).then(function (data) {
                    User.setCurrencyIsoCode(data.data);
                });
                UserSettings.get_pms_code(changedHotelID).then(function (data) {
                    User.setPmsConfig(data.data);
                    $scope.importView = User.isPms('is_pms');
                });
                UserSettings.getUserSettings(changedHotelID).then(function (data) {
                    User.setUserConfig(data.data);
                    User.setPricingToggle(data.data);
                });
            }

            $scope.logout = function () {
                User.logout();
            };

            $scope.importView = User.isPms('is_pms');

            $scope.deviceDetector = deviceDetector;

            if ($scope.deviceDetector.browser == 'chrome') {
                $scope.chromeBrowser = true;
            }

            $scope.browserAlert = true;
            $scope.closeBrowserCheckAlert = function () {
                $scope.browserAlert = false;
            };

        });
})();