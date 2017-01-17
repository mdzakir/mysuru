(function () {

    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider
                .state('private.rules.create-promotion', {
                    url: '/create-promotion/:ruleId',
                    templateUrl: '/pricing-rules/create-promotion',
                    resolve: {
                        hotelId: function (UIContext) {
                            return UIContext.getHotelId();
                        },
                        rule: function ($stateParams, PromotionRule, hotelId) {
                            if (Number($stateParams.ruleId)) {
                                return PromotionRule.get(hotelId, $stateParams.ruleId);
                            }
                            return {};
                        },
                        rooms: function ($http, hotelId) {
                            return $http.get('/hotel/viewrooms?hotel_id=' + hotelId);
                        },
                        rates: function ($http, hotelId) {
                            return $http.get('/hotel/ratePlans?hotel_id=' + hotelId);
                        },
                        occupancies: function ($http, hotelId) {
                            return $http.get('/hotel/occupancies?hotel_id=' + hotelId);
                        }

                    },
                    controllerAs: 'create-promotion',
                    controller: function ($scope, $rootScope, rooms, hotelId, $http, $state, rule, PromotionPricingRule, $sce, rates, occupancies, ngDialog, User, UserSettings) {

                        $scope.$on('contextChanged', function () {
                            $state.go('.', {}, {reload: 'private.rules.create-promotion'});
                        });

                        UserSettings.get_hotel_currency_code(User.getHotelID()).then(function (data) {
                            $scope.currency_class = data.data;
                        });

                        $scope.rule = rule;
                        var isCreateRule = _.isEmpty($scope.rule);

                        $scope.$on('contextChanged', function () {
                            $state.go('.', {}, {reload: 'private.rules.create-promotion'});
                        });
                        $scope.rule = rule;
                        var isCreateRule = _.isEmpty($scope.rule);

                        $scope.hotelOccupancy = rooms.data[0].hotel_capacity;

                        $scope.days = {start: '', end: '', single: ''};

                        $scope.checkStart = function () {
                            if ($scope.days.start > $scope.days.end) {
                                $scope.days.end = $scope.days.start + 1;
                            }
                        };

                        $scope.checkEnd = function () {
                            if ($scope.days.start > $scope.days.end) {
                                $scope.days.start = $scope.days.end - 1;
                            }
                        };

                        $scope.pricingAccordianStatus = {
                            rooms: false,
                            rp_occ: false,
                        };

                        $scope.changeRoomPrice = function (index) {
                            if (index === 0) {
                                $scope.partitionPriceMaxValue = $scope.room_prices[0].room_delta_price;
                            }
                        }

                        $scope.changeOccSlabType = function (type) {
                            if (type != null) {
                                _.map($scope.partitions, function (p) {
                                    p.price = '';
                                    return p;
                                });

                                if (type == 'Fixed') {
                                    $scope.partitionPriceMinLength = 2;
                                    $scope.partitionPriceMaxLength = 6;
                                    $scope.partitionPriceMinValue = 0;
                                    $scope.partitionPriceMaxValue = 1000000
                                }
                                if (type == 'Percentage') {
                                    $scope.partitionPriceMinLength = 1;
                                    $scope.partitionPriceMaxLength = 2;
                                    $scope.partitionPriceMinValue = 0;
                                    $scope.partitionPriceMaxValue = 99;
                                }
                            }
                        };
                        $scope.extras = [];
                        $scope.occupancies = [];
                        angular.forEach(occupancies.data, function (occupancy) {
                            if (occupancy.name.toUpperCase().startsWith("EXTRA")) {
                                $scope.extras.push(occupancy)
                            } else {
                                $scope.occupancies.push(occupancy)
                            }
                        });

                        // adding checked value
                        if (isCreateRule) {

                            $scope.ruleType = 'single';
                            $scope.rooms = _(rooms.data).forEach(function (d) {
                                d.checked = false;
                            });

                            $scope.room_base_prices = _.map(rooms.data, function (d) {
                                return {
                                    'id': d.id,
                                    'name': d.name,
                                    'is_base':d.is_base,
                                    'room_base_price': d.base_price
                                };
                            });

                            $scope.rate_plans = rates.data;
                            
                            $scope.occSlabType = 'Percentage';
                            $scope.changeOccSlabType($scope.occSlabType);

                            baseRatesAndDifferentials();
                            
                            $scope.roomBaseRatesValidation = _.some($scope.copiedRoomsBaseRates, function(room){
                                return angular.isUndefined(room.room_base_price) || room.room_base_price == '';
                            });
                            $scope.rateplanDiffValidation = _.some($scope.copiedRateplansDeltaDiff, function(rateplan){
                                return angular.isUndefined(rateplan.delta_price);
                            });
                            $scope.occupancyDiffValidation = _.some($scope.copiedOccupanciesDeltaDiff, function(occupancy){
                                return angular.isUndefined(occupancy.price);
                            });

                        } else {
                            $scope.occSlabType = $scope.rule.discount_type;
                            $scope.changeOccSlabType($scope.occSlabType);

                            $scope.days.start = $scope.rule.start_time;
                            $scope.days.end = $scope.rule.end_time;

                            $scope.room_base_prices = _.map(rooms.data, function (r) {
                                return {
                                    'id': r.id,
                                    'name': r.name,
                                    'is_base':r.is_base,
                                    'room_base_price': Number($scope.rule.room_price[r.id])
                                };
                            });

                            $scope.roomBaseRatesValidation = _.some($scope.copiedRoomsBaseRates, function(room){
                                return angular.isUndefined(room.delta_price);
                            });

                            $scope.rate_plans = rates.data;
                            $scope.room_prices = rooms.data;

                            var default_rate_plans = angular.copy(rates.data);
                            var default_room_prices = angular.copy(rooms.data);
                            var default_occupancies = angular.copy($scope.occupancies);
                            var default_extras = angular.copy($scope.extras);
                            

                            angular.forEach($scope.room_prices, function (r) {
                                r.delta_price = Number($scope.rule.room_price[r.id]) - Number($scope.rule.room_price[1]);
                            });

                            angular.forEach($scope.rate_plans, function (r) {
                                r.delta_price = Number($scope.rule.rate_plan_price[r.id]);
                            });

                            angular.forEach($scope.occupancies, function (r) {
                                r.price = Number($scope.rule.occupancy_price[r.id]);
                            });
                            angular.forEach($scope.extras, function (e) {
                                e.price = Number($scope.rule.occupancy_price[e.id]);
                            });
                            
                            baseRatesAndDifferentials();

                            if ($scope.rule.rule_type == undefined) {
                                $scope.ruleType = $scope.rule.start_time === $scope.rule.end_time ? 'single' : 'multiple';
                            } else {
                                $scope.ruleType = $scope.rule.rule_type;
                            }


                            for (var i = 0; i < $scope.rule.rooms.length; i++) {
                                for (var j = 0; j < rooms.data.length; j++) {
                                    if ($scope.rule.rooms[i] == rooms.data[j].id) {
                                        rooms.data[j].checked = true;
                                    }
                                }
                            }

                            $scope.rooms = rooms.data;

                            $scope.roomTypeDiffValidation = _.some($scope.room_delta_prices, function(room){
                                return angular.isUndefined(room.delta_price);
                            });

                            $scope.rateplanDiffValidation = _.some($scope.copiedRateplansDeltaDiff, function(rateplan){
                                return angular.isUndefined(rateplan.delta_price);
                            });
                            $scope.occupancyDiffValidation = _.some($scope.copiedOccupanciesDeltaDiff, function(occupancy){
                                return angular.isUndefined(occupancy.price);
                            });
                        }

                        $scope.selectAll = function () {
                            _.forEach($scope.rooms, function (d) {
                                d.checked = true;
                            });
                        };

                        $scope.clearAll = function () {
                            _.forEach($scope.rooms, function (d) {
                                d.checked = false;
                            });
                        };

                        $scope.roomsCheckRequired = function () {
                            return !$scope.rooms.some(function (rooms) {
                                return rooms.checked;
                            });
                        };

                        $scope.openBaseRatesModal = function () {
                            ngDialog.open({
                                template: 'baseRatesModal',
                                width: 800,
                                className: isCreateRule ? "ngdialog-theme-default base-rates-modal create":"ngdialog-theme-default base-rates-modal",
                                scope: $scope,
                                closeByEscape : false,
                                closeByDocument : false,
                                closeByNavigation : true,
                                appendTo : '.pricing-base-wrapper',
                                preCloseCallback : function(){
                                    //$scope.resetBaseRates();
                                }
                            });
                        };

                        $scope.openPricingDifferentialsModal = function () {
                            ngDialog.open({
                                template: 'pricingDifferentialModal',
                                width: 800,
                                className: 'ngdialog-theme-default pricing-differentials-modal',
                                scope: $scope,
                                closeByEscape : false,
                                closeByDocument : false,
                                closeByNavigation : true,
                                appendTo : '.pricing-diff-wrapper',
                                preCloseCallback : function(){
                                    //$scope.resetPricingDifferentials();
                                }
                            });
                        };

                        function baseRatesAndDifferentials(){

                            $scope.baseRoomRateChanged = function(){
                                $scope.roomBaseRatesValidation = _.some($scope.copiedRoomsBaseRates, function(room){
                                    return room.room_base_price == undefined || room.room_base_price == '' || room.room_base_price <= 0;
                                });
                            };

                            $scope.ratePlanDiffChanged = function(){
                                $scope.rateplanDiffValidation = _.some($scope.copiedRateplansDeltaDiff, function(rateplan){
                                    return angular.isUndefined(rateplan.delta_price);
                                });
                            };

                            $scope.occupancyDiffChanged = function(){
                                $scope.occupancyDiffValidation = _.some($scope.copiedOccupanciesDeltaDiff, function(occupancy){
                                    return angular.isUndefined(occupancy.price);
                                });
                            };

                            $scope.copiedRoomsBaseRates = angular.copy($scope.room_base_prices);
                            $scope.room_base_pricesTemp = angular.copy($scope.copiedRoomsBaseRates);

                            $scope.resetBaseRatesTemp = function(){
                                $scope.copiedRoomsBaseRates = angular.copy($scope.room_base_pricesTemp);
                                ngDialog.close();
                            };

                            $scope.resetBaseRates = function () {
                                $scope.copiedRoomsBaseRates = angular.copy($scope.room_base_prices);
                                $scope.baseRoomRateChanged();
                            };
                            $scope.saveBaseRates = function () {
                                $scope.room_base_pricesTemp = angular.copy($scope.copiedRoomsBaseRates);

                                $scope.room_delta_prices = _.map($scope.copiedRoomsBaseRates, function (b) {
                                    return {
                                        'id': b.id,
                                        'name': b.name,
                                        'is_base': b.is_base,
                                        'delta_price': Number(b.room_base_price) - Number($scope.copiedRoomsBaseRates[0].room_base_price)
                                    }
                                });
                                $scope.copiedRoomsDeltaDiff = angular.copy($scope.room_delta_prices);

                                ngDialog.close();
                            };


                            $scope.resetBaseRates();

                            $scope.room_delta_prices = _.map($scope.copiedRoomsBaseRates, function (b) {
                                return {
                                    'id': b.id,
                                    'name': b.name,
                                    'is_base': b.is_base,
                                    'delta_price': Number(b.room_base_price) - Number($scope.copiedRoomsBaseRates[0].room_base_price)
                                }
                            });

                            $scope.copiedRoomsDeltaDiff = angular.copy($scope.room_delta_prices);
                            $scope.copiedRateplansDeltaDiff = angular.copy($scope.rate_plans);
                            $scope.copiedOccupanciesDeltaDiff = angular.copy($scope.occupancies);
                            $scope.copiedExtras = angular.copy($scope.extras);

                            $scope.room_delta_pricesTemp = angular.copy($scope.copiedRoomsDeltaDiff);
                            $scope.rate_plansTemp = angular.copy($scope.copiedRateplansDeltaDiff);
                            $scope.occupanciesTemp = angular.copy($scope.copiedOccupanciesDeltaDiff);
                            $scope.extrasTemp = angular.copy($scope.copiedExtras);

                            $scope.resetPricingDifferentialsTemp = function(){
                                // DEFAULT VALUES OF DIFFERENTIALS & EXTRAS

                                angular.copy($scope.room_delta_pricesTemp, $scope.copiedRoomsDeltaDiff);
                                angular.copy($scope.rate_plansTemp, $scope.copiedRateplansDeltaDiff);
                                angular.copy($scope.occupanciesTemp, $scope.copiedOccupanciesDeltaDiff);
                                angular.copy($scope.extrasTemp, $scope.copiedExtras);

                                ngDialog.close();
                            };

                            $scope.resetPricingDifferentials = function(){
                                // DEFAULT VALUES OF DIFFERENTIALS & EXTRAS

                                $scope.copiedRoomsDeltaDiff = angular.copy(default_room_prices);
                                $scope.copiedRateplansDeltaDiff = angular.copy(default_rate_plans);
                                $scope.copiedOccupanciesDeltaDiff = angular.copy(default_occupancies);
                                $scope.copiedExtras = angular.copy(default_extras);
                                $scope.ratePlanDiffChanged();
                                $scope.occupancyDiffChanged();
                            };
                            $scope.savePricingDifferentials = function () {
                                $scope.room_delta_pricesTemp = angular.copy($scope.copiedRoomsDeltaDiff);
                                $scope.rate_plansTemp = angular.copy($scope.copiedRateplansDeltaDiff);
                                $scope.occupanciesTemp = angular.copy($scope.copiedOccupanciesDeltaDiff);
                                $scope.extrasTemp = angular.copy($scope.copiedExtras);
                                ngDialog.close();
                            };
                            // $scope.resetPricingDifferentials();
                        }

                        // getting prices in edit case
                        $scope.partitions = [];
                        if (isCreateRule) {
                            $scope.partitions.push(new Partition(0, $scope.hotelOccupancy, 100, 100));
                        } else {
                            angular.forEach($scope.rule.hotel_occupancies[0]['prices'], function (price) {
                                $scope.partitions.push(new Partition(price.price, price.noofrooms, price.offset, price.occupancy));
                            });
                        }
                        $scope.partitions[$scope.partitions.length - 1].readonly = true;

                        //Info Messages as HTML Template
                        $scope.occupancySliderInfo = $sce.trustAsHtml('<ul><li>Create discount buckets based on hotel occupancy for your base category room. </li><li>Discount should be 99% max.</li>');

                        // START PARTITION SLIDER


                        $scope.splitPart = function (index) {
                            var part = $scope.partitions[index];
                            if (part.isValidSplit()) {
                                var other = part.split();
                                $scope.partitions.splice(index, 0, other);
                            }
                        };

                        $scope.updatePercent = function (index) {
                            var partitions = $scope.partitions;
                            var part = partitions[index];
                            var left = index === 0 ? null : partitions[index - 1];
                            var right = index != partitions.length - 1 ? partitions[index + 1] : null;
                            part.updateOffset(left, right);
                        };

                        $scope.removePart = function (index) {
                            var partitions = $scope.partitions;
                            if (partitions.length == 1) {
                                return;
                            }
                            var part = partitions[index];
                            var otherIndex = index == partitions.length - 1 ? index - 1 : index + 1;
                            var other = partitions[otherIndex];
                            part.lendTo(other);
                            $scope.partitions.splice(index, 1);

                            $scope.changeRoomPrice();
                        };

                        function allFalse(obj) {
                            for (var i in obj) {
                                if (obj[i] === true) return false;
                            }
                            return true;
                        }

                        // Validation ends

                        function getRooms(rooms) {
                            return rooms.checked ? rooms.id : null;
                        }

                        $scope.submitRule = function () {
                            var params = {
                                "hotel_id": hotelId,
                                "rule_id": _.isEmpty($scope.rule) ? " " : $scope.rule.local_id,
                                "name": $scope.rule.name,
                                "description": $scope.rule.description,
                                "status": "1",
                                "start": $scope.ruleType === 'multiple' ? $scope.days.start : $scope.days.start,
                                "end": $scope.ruleType === 'multiple' ? $scope.days.end : $scope.days.start,
                                "promotional_pricing": $scope.partitions,
                                "rooms": _.map($scope.rooms, getRooms),
                                "ruleType": $scope.ruleType,
                                "roomBasePrices": $scope.copiedRoomsBaseRates,
                                "ratePlans": $scope.copiedRateplansDeltaDiff,
                                "occupancies": $scope.copiedOccupanciesDeltaDiff.concat($scope.copiedExtras),
                                "roomDeltaPrices": $scope.copiedRoomsDeltaDiff,
                                "discount_type": $scope.occSlabType

                            };

                            var post_url = isCreateRule ? '/hotel/createpromorule/' : '/hotel/editpromorule/';

                            PromotionPricingRule.save(params, isCreateRule, function () {
                                $state.go('private.rules.view', {'tab':'promotion'});
                            });

                        };

                    }
                });
        })
        .factory('PromotionPricingRule', function ($http, eventsTracker) {
            return {
                save: function (params, isCreate, callback) {
                    eventsTracker.logEvent('createoreditPromoRule');
                    var post_url = isCreate ? '/hotel/createpromorule/' : '/hotel/editpromorule/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                }
            }
        });
})();
