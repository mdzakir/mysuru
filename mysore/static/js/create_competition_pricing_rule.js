//create_pricing_rule.js

(function () {

    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider
                .state('private.rules.create-competition', {
                    url: '/create-competition/:ruleId',
                    templateUrl: '/pricing-rules/create-competition',
                    resolve: {
                        hotelId: function (UIContext) {
                            return UIContext.getHotelId();
                        },
                        rule: function ($stateParams, CompetitionRule, hotelId) {
                            if (Number($stateParams.ruleId)) {
                                return CompetitionRule.get(hotelId, $stateParams.ruleId);
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
                        },
                        // competitors: function ($http, hotelId) {
                        //     return $http.get('/goldeneye/api/getcompetitors?hotel_id=' + hotelId);
                        // }
                    },
                    controller: 'createCompetitionPricingRule'
                });

        })

        .factory('CompetitionPricingRule', function ($http, eventsTracker) {
            return {
                save: function (params, isCreate, callback) {
                    var post_url = isCreate ? '/hotel/createcompetitionrule/' : '/hotel/editcompetitionrule/';
                    eventsTracker.logEvent('createoreditcompetitionRule');
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                }
            }
        })
        .factory('Holidays', function ($http) {
            return {
                getHoliday: function (start, end) {
                    var url = '/holidays/holidayList?start_date='+start+'&end_date='+end+"&country=India";
                    return $http.get(url)
                        .then(function (response) {
                            var holidayData = [];
                            for (var i=0; i<response.data.length;i++) {
                                var holiday = {
                                    date:response.data[i][0],
                                    name:response.data[i][1].name
                                }
                                holidayData.push(holiday);
                            }
                            return holidayData;
                        });
                }
            }
        })
        .controller('createCompetitionPricingRule', function ($scope, rooms, hotelId, Competition, $state, rule, CompetitionPricingRule, $sce, WalkThrough, User, UserSettings, rates, occupancies, ngDialog, Holidays) {
            $scope.$on('contextChanged', function () {
                $state.go('.', {}, {reload: 'private.rules.create-competition'});
            });
            UserSettings.get_hotel_currency_code(User.getHotelID()).then(function (data) {
                $scope.currency_class = data.data;
            });

            var default_rate_plans = [];
            var default_room_prices = [];
            var default_occupancies = [];
            var default_extras = [];


            $scope.rule = rule;

            $scope.hotelOccupancy = rooms.data[0].hotel_capacity;

            var isCreateRule = _.isEmpty($scope.rule);

            $scope.partitionInfo = WalkThrough.status('partition_info_key');

            $scope.rate_plans = rates.data;
            $scope.occupancies = occupancies.data;
            $scope.room_prices = rooms.data;

            $scope.changeRoomPrice = function (index) {
                if (index === 0) {
                    $scope.partitionPriceMaxValue = $scope.room_prices[0].delta_price;
                }
            };

            $scope.changeOccSlabType = function (type) {
                if (type != null) {
                    _.map($scope.partitions, function (p) {
                        p.price = '';
                        return p;
                    });

                    if (type == 'Fixed') {
                        $scope.partitionPriceMinLength = 2;
                        $scope.partitionPriceMaxLength = 6;
                        $scope.partitionPriceMinValue = -100000;
                        $scope.partitionPriceMaxValue = 100000
                    }
                    if (type == 'Percentage') {
                        $scope.partitionPriceMinLength = 1;
                        $scope.partitionPriceMaxLength = 2;
                        $scope.partitionPriceMinValue = -99;
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
            })

            Competition.ge_kt_mapping(hotelId).then(function (data) {
                    $scope.ge_kt_mapping = data.data.ge_mapping
                });


            $scope.selectAll = function () {
                _.forEach($scope.week, function (d) {
                    d.checked = 1;
                });
                $scope.holidaySelectedDOW = $scope.holidayList
            };

            $scope.clearAll = function () {
                _.forEach($scope.week, function (d) {
                    d.checked = 0;
                });
                $scope.holidaySelectedDOW = []
            };

            $scope.dowCheck = function(){
                var dowSelected = [], selectedWeekHoliday = [];

                _.map($scope.week, function (day) {
                    if(day.checked) dowSelected.push(day.name);
                });

                _.forEach($scope.holidayList, function (holiday) {
                    if(dowSelected.indexOf(moment(holiday.date).format("ddd").toString()) > -1){
                        selectedWeekHoliday.push(holiday)
                    }
                });
                $scope.holidaySelectedDOW = selectedWeekHoliday;
            }

            $scope.weekDays = function () {
                _.forEach($scope.week, function (d) {
                    d.checked = (d.name == 'Sat' || d.name == 'Sun') ? 0 : 1;
                });
                $scope.dowCheck();
            };

            $scope.weekEnds = function () {
                _.forEach($scope.week, function (d) {
                    d.checked = (d.name == 'Sat' || d.name == 'Sun') ? 1 : 0;
                });
                $scope.dowCheck();
            };

            $scope.rangeOfDates = function(){
                Holidays.getHoliday(moment($scope.rule.date_range.start.$date).format("YYYY MMMM DD"), moment($scope.rule.date_range.end.$date).format("YYYY MMMM DD")).then(function(holiday){
                    $scope.holidayList = holiday;
                    _.map($scope.holidayList, function(h){
                      h.date = moment(h.date).format("DD MMM YYYY");
                      return h;
                    });

                    $scope.dowCheck();

                });
            };

            default_rate_plans = angular.copy($scope.rate_plans);
            default_room_prices = angular.copy($scope.room_prices);
            default_occupancies = angular.copy($scope.occupancies);
            default_extras = angular.copy($scope.extras);

            // CREATE RULE
            if (isCreateRule) {
                Competition.get_otas(hotelId).then(function (data) {
                    $scope.otas = _.map(data.data, function (d) {
                        return {
                            name: d,
                            checked: 1
                        }
                    });
                });
                Competition.get_competitor(hotelId).then(function (data) {
                    $scope.competitors = _(data.data).forEach(function (d) {
                        d.checked = 0;
                    });
                });
                $scope.ruleType = 'single';
                $scope.rate_plans = rates.data
                $scope.occSlabType = 'Percentage';
                $scope.changeOccSlabType($scope.occSlabType);

                $scope.roomDiffValidation = _.some($scope.copiedRoomsDeltaDiff, function (room) {
                    return angular.isUndefined(room.delta_price);
                });
                $scope.rateplanDiffValidation = _.some($scope.copiedRateplansDeltaDiff, function (rateplan) {
                    return angular.isUndefined(rateplan.delta_price);
                });
                $scope.occupancyDiffValidation = _.some($scope.copiedOccupanciesDeltaDiff, function (occupancy) {
                    return angular.isUndefined(occupancy.price);
                });

            } else {

                var competitors = [];

                // UNCHECKED ALL COMPETITORS
                Competition.get_competitor(hotelId).then(function (data) {
                    competitors = _(data.data).forEach(function (d) {
                        d.checked = 0;
                    });

                    for (var i = 0; i < $scope.rule.competitors.length; i++) {
                        for (var j = 0; j < competitors.length; j++) {
                            if ($scope.rule.competitors[i] == competitors[j].id) {
                                competitors[j].checked = 1;
                            }
                        }
                    }
                    $scope.competitors = competitors;
                });


                var otas = [];
                Competition.get_otas(hotelId).then(function (data) {
                    debugger;
                    otas = _.map(data.data, function (d) {
                        return {
                            name: d,
                            checked: 0
                        }
                    });

                    for (var i = 0; i < $scope.rule.otas.length; i++) {
                        for (var j = 0; j < otas.length; j++) {
                            if ($scope.rule.otas[i] == otas[j].name) {
                                otas[j].checked = 1;
                            }
                        }
                    }
                    $scope.otas = otas;

                });

                $scope.occSlabType = $scope.rule.value_type;
                $scope.changeOccSlabType($scope.occSlabType);

                angular.forEach($scope.room_prices, function (r) {
                    r.delta_price = Number($scope.rule.room_price[r.id]);
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

                $scope.roomDiffValidation = _.some($scope.copiedRoomsDeltaDiff, function (room) {
                    return angular.isUndefined(room.delta_price);
                });
                $scope.rateplanDiffValidation = _.some($scope.copiedRateplansDeltaDiff, function (rateplan) {
                    return angular.isUndefined(rateplan.delta_price);
                });
                $scope.occupancyDiffValidation = _.some($scope.copiedOccupanciesDeltaDiff, function (occupancy) {
                    return angular.isUndefined(occupancy.price);
                });

                $scope.closeAddPartitionInfo = function () {
                    WalkThrough.set('partition_info_key', false);
                    $scope.partitionInfo = false;
                }

                $scope.rangeOfDates();

            }

            $scope.roomDiffChanged = function () {
                $scope.roomDiffValidation = _.some($scope.copiedRoomsDeltaDiff, function (room) {
                    return angular.isUndefined(room.delta_price);
                });
            };

            $scope.ratePlanDiffChanged = function () {
                $scope.rateplanDiffValidation = _.some($scope.copiedRateplansDeltaDiff, function (rateplan) {
                    return angular.isUndefined(rateplan.delta_price);
                });
            };

            $scope.occupancyDiffChanged = function () {
                $scope.occupancyDiffValidation = _.some($scope.copiedOccupanciesDeltaDiff, function (occupancy) {
                    return angular.isUndefined(occupancy.price);
                });
            };

            //Datepicker

            $scope.today = function () {
                $scope.dt = new Date();
            };
            $scope.today();

            //  Customization

            var dp_today = new Date();
            var lastDayOfMonth = new Date(dp_today.getFullYear(), dp_today.getMonth() + 12, 0);

            function dateOptions() {
                return {
                    maxDate: lastDayOfMonth,
                    minDate: new Date(),
                    startingDay: 1
                }
            }

            $scope.dateOptions1 = dateOptions();
            $scope.dateOptions2 = dateOptions();

            $scope.setMinDate = function () {
                if ($scope.rule.date_range.end !== undefined) {
                    if ($scope.rule.date_range.end.$date < $scope.rule.date_range.start.$date) {
                        $scope.rule.date_range.end.$date = '';
                    }
                }
                $scope.dateOptions2.minDate = angular.copy($scope.rule.date_range.start.$date);
                $scope.dateOptions2.initDate = angular.copy($scope.rule.date_range.start.$date);

                $scope.open2();
            };

            $scope.open1 = function () {
                $scope.popup1.opened = true;
            };

            $scope.open2 = function () {
                $scope.popup2.opened = true;
            };

            $scope.setDate = function (year, month, day) {
                $scope.rule.date_range.start.$date = new Date(year, month, day);
                $scope.rule.date_range.end.$date = new Date(year, month, day);
            };

            $scope.formats = ['dd MMM yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
            $scope.format = $scope.formats[0];

            $scope.popup1 = {opened: false};
            $scope.popup2 = {opened: false};

            $scope.week = [
                {name: 'Mon', checked: 0},
                {name: 'Tue', checked: 0},
                {name: 'Wed', checked: 0},
                {name: 'Thu', checked: 0},
                {name: 'Fri', checked: 0},
                {name: 'Sat', checked: 0},
                {name: 'Sun', checked: 0},
            ];

            // For validation : To check if at least one checkbox is checked.
            $scope.daysCheckRequired = function () {
                return !$scope.week.some(function (days) {
                    return days.checked;
                });
            };

            if (!isCreateRule) {
                angular.forEach($scope.week, function (value, key) {
                    value.checked = $scope.rule.days[key];
                });
            }
            $scope.ruleType = 'competition';

            $scope.hideInfo = true;
            $scope.hideInfoTooltip = function () {
                $scope.hideInfo = false;
            };

            //Info Messages as HTML Template
            $scope.occupancySliderInfo = $sce.trustAsHtml('<ul><li><i class="fa fa-check"></i> <span class="tooltip-checklist">Create price buckets based on hotel occupancy for your base category room.</span></li><li><i class="fa fa-check"></i> <span class="tooltip-checklist">Prices for higher room categories will be computed using differentials.</span></li><li><i class="fa fa-check"></i> <span class="tooltip-checklist">Price should be a minimum 3 digit number</span></li>');

            $scope.competitorsCheckRequired = function () {
                if ($scope.competitors !== undefined) {
                    $scope.competitorsUndefined = false;
                    return !$scope.competitors.some(function (comp) {
                        return comp.checked;
                    });
                } else {
                    $scope.competitorsUndefined = true;
                }
            };

            $scope.otasCheckRequired = function () {
                if ($scope.otas !== undefined) {
                    $scope.otasUndefined = false;
                    return !$scope.otas.some(function (ota) {
                        return ota.checked;
                    });
                } else {
                    $scope.otasUndefined = true;
                }
            };

            // END DATEPCIKER

            $scope.rooms = rooms.data;
            $scope.base_room = null;

            $scope.rooms.forEach(function (room) {
                room.price = 0;

                room_id = room.id + '';

                room.delta = _.isEmpty($scope.rule) ? 0 : $scope.rule.rooms[room_id]['prices'][0].delta;
                if (room.is_base) {
                    $scope.base_room = room
                    $scope.base_room_id = room.id;
                }
            });

            $scope.base_room.price = _.isEmpty($scope.rule) ? 0 : $scope.rule.rooms[$scope.base_room_id]['prices'][0].price;

            // SELECT DESELECT COMPETITORS

            $scope.selectAllComps = function () {
                _.forEach($scope.competitors, function (d) {
                    d.checked = 1;
                });
            };

            $scope.clearAllComps = function () {
                _.forEach($scope.competitors, function (d) {
                    d.checked = 0;
                });
            };

            $scope.selectAllOtas = function () {
                _.forEach($scope.otas, function (d) {
                    d.checked = 1;
                });
            };

            $scope.clearAllOtas = function () {
                _.forEach($scope.otas, function (d) {
                    d.checked = 0;
                });
            };

            $scope.addDeltaPrice = function (delta) {
                return parseInt($scope.base_room.price) + parseInt(delta);
            };

            function minOccupancy() {
                var min = $scope.partitions[0];
                for (var i = 0; i < $scope.partitions.length; i++) {
                    if (min.occupancy > $scope.partitions[i].occupancy) {
                        min = $scope.partitions[i];
                    }
                }
                return min;
            }

            $scope.changeRoomPrice = function () {
                var min = minOccupancy();
                if ($scope.base_room.price != min.price) {
                    $scope.base_room.price = parseInt(min.price);
                }
            };

            $scope.openPricingDifferentialsModal = function () {
                ngDialog.open({
                    template: 'pricingDifferentialModal',
                    width: 800,
                    className: 'ngdialog-theme-default pricing-differentials-modal',
                    scope: $scope,
                    closeByEscape: false,
                    closeByDocument: false,
                    closeByNavigation: true,
                    preCloseCallback: function () {
                        //$scope.resetPricingDifferentials();
                    }
                });
            };

            $scope.copiedRoomsDeltaDiff = angular.copy($scope.room_prices);
            $scope.copiedRateplansDeltaDiff = angular.copy($scope.rate_plans);
            $scope.copiedOccupanciesDeltaDiff = angular.copy($scope.occupancies);
            $scope.copiedExtras = angular.copy($scope.extras);

            $scope.room_pricesTemp = angular.copy($scope.copiedRoomsDeltaDiff);
            $scope.rate_plansTemp = angular.copy($scope.copiedRateplansDeltaDiff);
            $scope.occupanciesTemp = angular.copy($scope.copiedOccupanciesDeltaDiff);
            $scope.extrasTemp = angular.copy($scope.copiedExtras);

            $scope.resetPricingDifferentialsTemp = function () {
                // DEFAULT VALUES OF DIFFERENTIALS & EXTRAS

                angular.copy($scope.room_pricesTemp, $scope.copiedRoomsDeltaDiff);
                angular.copy($scope.rate_plansTemp, $scope.copiedRateplansDeltaDiff);
                angular.copy($scope.occupanciesTemp, $scope.copiedOccupanciesDeltaDiff);
                angular.copy($scope.extrasTemp, $scope.copiedExtras);

                ngDialog.close();
            };

            $scope.resetPricingDifferentials = function () {

                // DEFAULT VALUES OF DIFFERENTIALS & EXTRAS

                $scope.copiedRoomsDeltaDiff = angular.copy(default_room_prices);
                $scope.copiedRateplansDeltaDiff = angular.copy(default_rate_plans);
                $scope.copiedOccupanciesDeltaDiff = angular.copy(default_occupancies);
                $scope.copiedExtras = angular.copy(default_extras);

                $scope.roomDiffChanged();
                $scope.ratePlanDiffChanged();
                $scope.occupancyDiffChanged();
            };
            $scope.savePricingDifferentials = function () {
                $scope.room_pricesTemp = angular.copy($scope.copiedRoomsDeltaDiff);
                $scope.rate_plansTemp = angular.copy($scope.copiedRateplansDeltaDiff);
                $scope.occupanciesTemp = angular.copy($scope.copiedOccupanciesDeltaDiff);
                $scope.extrasTemp = angular.copy($scope.copiedExtras);

                ngDialog.close();
            };

            // $scope.resetPricingDifferentials();

            $scope.partitions = [];
            if (_.isEmpty($scope.rule)) {
                $scope.partitions.push(new Partition('', $scope.hotelOccupancy, 100, 100, false));
            } else {
                $scope.hideInfo = false;
                angular.forEach($scope.rule.rooms[$scope.base_room_id]['prices'], function (price) {
                    $scope.partitions.push(new Partition(price.price, price.noofrooms, price.offset, price.occupancy, true))
                });
            }
            $scope.partitions[$scope.partitions.length - 1].readonly = true;
            // START PARTITION SLIDER

            $scope.showPercentTooltip = false;

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
                var left = index == 0 ? null : partitions[index - 1];
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

            // END PARTITION SLIDER

            function getCompetitor(competitors) {
                return competitors.checked ? competitors : null;
            }

            function getotas(otas) {
                return otas.checked ? otas.name : null;
            }

            function getCompetitornames(competitors) {
                return competitors.checked ? competitors.name : null;
            }

            $scope.submitRule = function () {

                var getDays = _.map($scope.week, 'checked');
                params = {
                    "rule_id": _.isEmpty($scope.rule) ? " " : $scope.rule.local_id,
                    "hotel_id": hotelId,
                    "ratePlans": $scope.copiedRateplansDeltaDiff,
                    "occupancies": $scope.copiedOccupanciesDeltaDiff.concat($scope.copiedExtras),
                    "roomPrices": $scope.copiedRoomsDeltaDiff,
                    "value_type": $scope.occSlabType,
                    "otas": _.map($scope.otas, getotas),
                    "competitors": _.map($scope.competitors, getCompetitor),
                    "competitor_names": _.map($scope.competitors, getCompetitornames),
                    "competitorPrices": $scope.competitors_prices,
                    "rule": [{
                        "priority": 0,
                        "name": $scope.rule.name,
                        "description": $scope.rule.description,
                        "status": "1",
                        "period": {
                            "start": moment($scope.rule.date_range.start.$date).format("YYYY-MM-DD"),
                            "end": moment($scope.rule.date_range.end.$date).format("YYYY-MM-DD"),
                            "days": getDays
                        },
                        "competition_prices": $scope.partitions,
                        "rooms": $scope.rooms,
                        "ruleType": $scope.ruleType,


                    }]
                };
                CompetitionPricingRule.save(params, isCreateRule, function () {
                    $state.go('private.rules.view', {'tab': 'competition'});
                });
            };
        });


})();
