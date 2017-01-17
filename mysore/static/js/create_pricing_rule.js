//create_pricing_rule.js

(function () {

    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider
                .state('private.rules.create-occupancy', {
                    url: '/create-occupancy/:ruleId',
                    templateUrl: '/pricing-rules/create-occupancy',
                    resolve: {
                        hotelId: function (UIContext) {
                            return UIContext.getHotelId();
                        },
                        rule: function ($stateParams, OccupancyRule, hotelId) {
                            if (Number($stateParams.ruleId)) {
                                return OccupancyRule.get(hotelId, $stateParams.ruleId);
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
                    controller: 'createPricingRule'
                });

        })

        .factory('OccupancyPricingRule', function ($http, eventsTracker) {
            return {
                save: function (params, isCreate, callback) {
                    var post_url = isCreate ? '/hotel/createrule/' : '/hotel/editrule/';
                    eventsTracker.logEvent('createoreditOccupancyRule');
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
        .controller('createPricingRule', function ($scope, rooms, hotelId, $state, rule, OccupancyPricingRule, $sce, WalkThrough, User, UserSettings, rates, occupancies, ngDialog, Holidays) {
            $scope.$on('contextChanged', function () {
                $state.go('.', {}, {reload: 'private.rules.create'});
            });
            UserSettings.get_hotel_currency_code(User.getHotelID()).then(function (data) {
                $scope.currency_class = data.data;
            });

            $scope.rule = rule;
            $scope.selectedRooms = rooms.data;

            $scope.hotelOccupancy = rooms.data[0].hotel_capacity;

            var isCreateRule = _.isEmpty($scope.rule);

            $scope.partitionInfo = WalkThrough.status('partition_info_key');

            $scope.rate_plans = rates.data;
            $scope.room_prices = rooms.data;

            var default_room_prices = angular.copy(rooms.data);
            var default_rate_plans = angular.copy(rates.data);

            $scope.room_delta_prices = _.map(rooms.data, function(r){
                r.delta_price = Number(r.delta_price);
                return r;
            });

            $scope.extras = [];
            $scope.occupancies = [];
            angular.forEach(occupancies.data, function (occupancy) {
                if (occupancy.name.toUpperCase().startsWith("EXTRA")) {
                    $scope.extras.push(occupancy)
                } else {
                    $scope.occupancies.push(occupancy)
                }
            });

            $scope.roomDiffValidation = _.some($scope.copiedRoomsDeltaDiff, function(room){
                return angular.isUndefined(room.delta_price);
            });
            $scope.rateplanDiffValidation = _.some($scope.copiedRateplansDeltaDiff, function(rateplan){
                return angular.isUndefined(rateplan.delta_price);
            });
            $scope.occupancyDiffValidation = _.some($scope.copiedOccupanciesDeltaDiff, function(occupancy){
                return angular.isUndefined(occupancy.price);
            });

            var selectedWeekHoliday = [];

            $scope.rangeOfDates = function(){
                Holidays.getHoliday(moment($scope.rule.date_range.start.$date).format("YYYY MMMM DD"), moment($scope.rule.date_range.end.$date).format("YYYY MMMM DD")).then(function(holiday){
                    $scope.holidayList = holiday;
                    _.map($scope.holidayList, function(h){
                      h.date = moment(h.date).format("DD MMM YYYY");
                      return h;
                    });

                    $scope.dowCheck();

                });
            }


            if (!isCreateRule) {
                var default_occupancies = angular.copy($scope.occupancies);
                var default_extras = angular.copy($scope.extras);

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

                $scope.roomDiffValidation = _.some($scope.copiedRoomsDeltaDiff, function(room){
                    return angular.isUndefined(room.delta_price);
                });
                $scope.rateplanDiffValidation = _.some($scope.copiedRateplansDeltaDiff, function(rateplan){
                    return angular.isUndefined(rateplan.delta_price);
                });
                $scope.occupancyDiffValidation = _.some($scope.copiedOccupanciesDeltaDiff, function(occupancy){
                    return angular.isUndefined(occupancy.price);
                });

                Holidays.getHoliday(moment($scope.rule.date_range.start.$date).format("YYYY MMMM DD"), moment($scope.rule.date_range.end.$date).format("YYYY MMMM DD")).then(function(holiday){
                    $scope.holidayList = holiday;
                    _.map($scope.holidayList, function(h){
                      h.date = moment(h.date).format("DD MMM YYYY");
                      return h;
                    });
                });
                
                $scope.closeAddPartitionInfo = function () {
                    WalkThrough.set('partition_info_key', false);
                    $scope.partitionInfo = false;
                }

                $scope.rangeOfDates();
                for (var j = 0; j < $scope.selectedRooms.length; j++) {
                    if ($scope.rule.selected_rooms.indexOf($scope.selectedRooms[j].id) > -1) {
                        $scope.selectedRooms[j].checked = true;
                    }
                }
            }

            //Datepicker

            $scope.today = function () {
                $scope.dt = new Date();
            };
            $scope.today();

            //  Customization

            function dateOptions() {
                return {
                    maxDate: new Date(2020, 5, 22),
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

            $scope.selectAllRoom = function () {
                _.forEach($scope.selectedRooms, function (d) {
                    d.checked = true;
                });
            };

            $scope.clearAllRoom = function () {
                _.forEach($scope.selectedRooms, function (d) {
                    d.checked = false;
                });
            };

            $scope.roomsCheckRequired = function () {
                return !$scope.selectedRooms.some(function (rooms) {
                    return rooms.checked;
                });
            };

            
            $scope.hideInfo = true;
            $scope.hideInfoTooltip = function () {
                $scope.hideInfo = false;
            };

            //Info Messages as HTML Template
            $scope.occupancySliderInfo = $sce.trustAsHtml('<ul><li><i class="fa fa-check"></i> <span class="tooltip-checklist">Create price buckets based on hotel occupancy for your base category room.</span></li><li><i class="fa fa-check"></i> <span class="tooltip-checklist">Prices for higher room categories will be computed using differentials.</span></li><li><i class="fa fa-check"></i> <span class="tooltip-checklist">Price should be a minimum 3 digit number</span></li>');

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
                    closeByEscape : false,
                    closeByDocument : false,
                    closeByNavigation : true
                });
            };

            $scope.roomDiffChanged = function(){
                $scope.roomDiffValidation = _.some($scope.copiedRoomsDeltaDiff, function(room){
                    return angular.isUndefined(room.delta_price);
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

                $scope.defaultDifferentials = true;

                $scope.roomDiffChanged();
                $scope.ratePlanDiffChanged();
                $scope.occupancyDiffChanged();
            };
            $scope.savePricingDifferentials = function () {
                $scope.room_delta_pricesTemp = angular.copy($scope.copiedRoomsDeltaDiff);
                $scope.rate_plansTemp = angular.copy($scope.copiedRateplansDeltaDiff);
                $scope.occupanciesTemp = angular.copy($scope.copiedOccupanciesDeltaDiff);
                $scope.extrasTemp = angular.copy($scope.copiedExtras);

                if  (   angular.equals($scope.room_delta_prices, $scope.copiedRoomsDeltaDiff) ||
                        angular.equals($scope.rate_plans, $scope.copiedRateplansDeltaDiff) ||
                        angular.equals($scope.occupancies, $scope.copiedOccupanciesDeltaDiff)
                    ){
                    $scope.defaultDifferentials = true;
                }else{
                    $scope.defaultDifferentials = false;
                }

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

            function getRooms(rooms) {
                return rooms.checked ? rooms.id : null;
            }

            $scope.submitRule = function () {
                var getDays = _.map($scope.week, 'checked');
                params = {
                    "rule_id": _.isEmpty($scope.rule) ? " " : $scope.rule.local_id,
                    "hotel_id": hotelId,
                    "selectedRooms": _.map($scope.selectedRooms, getRooms),
                    "ratePlans": $scope.copiedRateplansDeltaDiff,
                    "occupancies": $scope.copiedOccupanciesDeltaDiff.concat($scope.copiedExtras),
                    "roomPrices": $scope.copiedRoomsDeltaDiff,
                    "defaultDifferentials": $scope.defaultDifferentials,
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
                        "occupancy_pricing": $scope.partitions,
                        "rooms": $scope.rooms
                    }]
                };

                //params.rule[0].period.start = moment(params.rule[0].period.start).format("YYYY-MM-DD");
                // console.log(JSON.stringify(params));
                OccupancyPricingRule.save(params, isCreateRule, function () {
                    $state.go('private.rules.view', {'tab':'occupancy'});
                });
            };
        });


})();
