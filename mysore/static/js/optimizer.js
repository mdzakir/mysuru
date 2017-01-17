    (function() {
    angular.module('knights')
        .config(function($stateProvider) {
            $stateProvider.state('private.optimizer', {
                url: '/optimizer',
                templateUrl: '/price-optimizer',
                resolve: {
                    hotelId: function(UIContext) {
                        return UIContext.getHotelId();
                    },
                    optimizerData: function(PriceOptimizer, hotelId) {
                        return PriceOptimizer.get(hotelId);
                    }
                },
                controllerAs: 'optimizer',
                controller: 'Optimizer'
            });
        });

    angular.module('priceOptimizer', [])
        .controller('Optimizer', function($scope, $state, User, hotelId, $http, optimizerData, PriceOptimizer, UserSettings, ngDialog, $window) {
            $scope.hotelId = hotelId;
            UserSettings.get_hotel_currency_code(User.getHotelID()).then(function (data) {
                $scope.currency_class = data.data;
            });

            function reloadView() {
                $state.go('.', {}, {reload: 'private.optimizer'});
            }
            $scope.$on('contextChanged', function () {
                reloadView();
                // $state.go('.', {}, {reload: 'private.optimizer'});
            });

            var self = this;
            self.data = optimizerData.data;

            self.resetOverride = function (data) {
                if (data.rooms.length > 0) {
                    PriceOptimizer.reset(data);
                }
            };

            // This function initializes the new price
            // input field while opening the popup
            self.initInput = function (room, day) {
                room.reset = false;
                room.inputPrice = room.override ? room.override_price : room.recPrice;
                room.overidden = room.inputPrice;
                self.resetData = {
                    "hotel_id": hotelId,
                    "rooms": [],
                    "date": day.fullDate
                };
            };

            // This function resets the overridden price
            // of the clicked input field
            self.reset = function (room) {
                room.reset = true;
                room.inputPrice = room.recPrice;
                room.overidden = room.recPrice;
                self.resetData.rooms.push({"room_id": room.room_id});
            };

            // This function saves the overridden
            // prices to server
            self.save = function (obj, hotelId) {
                $scope.saving = true;
                obj.unpublished_override = true;
                // resetting override data
                self.resetOverride(self.resetData);

                var newObj = {};
                newObj.date = obj.fullDate;
                newObj.rooms = obj.rooms;
                newObj.reason = obj.reason || '';
                newObj.hotel_id = hotelId;

                PriceOptimizer.save(hotelId, newObj).then(function (response) {
                    if (!response) { console.log("error on saving");}
                    if (response.status === 200) {
                        $scope.saving = false;
                        regenerateMonthSet(obj, self.monthSet);
                        $scope.showPublish = showPublish();
                    }
                });
            };

            // This function publishes the current month's
            // recommended and overridden prices to channel manager
            self.publishData = function(hotelId, month, year) {
                var selectedDates = getSelectedDays();
                $scope.publishing = true;
                PriceOptimizer.publish(hotelId, selectedDates, month, year).then(function (response) {
                    $state.go('.', {}, {reload: 'private.optimizer'})
                });
            };

            // This function regenerates the cards of
            // current month after saving the overrides
            function regenerateMonthSet(obj, monthSet) {
                var resetObj = _.filter(obj.rooms, 'reset');
                _(monthSet.dates).forEach(function (week) {
                    _(week).forEach(function (day) {
                        if (day.fullDate == obj.fullDate) {
                            day.optimized = false;
                            _(day.rooms).forEach(function (room) {
                                // if override
                                if(room.inputPrice !== room.overidden) {
                                    room.override = true;
                                    room.override_price = room.overidden;
                                } else if (resetObj.length) {
                                    // if reset
                                    _(resetObj).forEach(function (reset) {
                                        if(room.$$hashKey === reset.$$hashKey) {
                                            room.override = false;
                                            room.override_price = null;
                                            room.reset = true;
                                        }
                                    });
                                }
                            });
                        }
                    })
                });
            }

            self.noRules = self.data.length === 0;

            self.weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            // This function generates the number of blank days
            // to be printed in the first week before the 1st day of month
            self._generateOffset = function(startDate) {
                var output = [];
                var currentMonth = moment().month() == startDate.month() && moment().year() == startDate.year();
                var monthStartDate = currentMonth ? new Date() : new Date(startDate);
                var monthStartWeekday = monthStartDate.getDay();
                var monthOffset = (monthStartWeekday + 6) % 7;

                if (monthOffset - 1 < 6) {
                    for (var m = monthOffset - 1; m >= 0; m--) {
                        output.push('&nbsp;');
                    }
                }
                return output;
            };

            $scope.user_name = '';

            // This function generates the cards for the
            // given month and year
            self._generateMonthStrip = function(year, month) {
                month -= 1;
                var startDate = moment([year, month]);
                var endDate = moment(startDate).endOf('month');
                var dates = [];
                var weekset = self._generateOffset(startDate);
                var currentItem;

                for (var i = 1; i <= parseInt(moment(endDate).format('D')); i++) {
                    var currentDate = moment([year, month, i]);
                    currentItem = _.find(self.data, ['date', currentDate.format('YYYY-MM-DD')]);

                    if (currentItem && moment([year, month, i]).format('dd') === 'Su') {
                        weekset.push({
                            date: i,
                            checked: false,
                            day: currentDate.format('ddd'),
                            fullDate: currentDate.format('D-MM-Y'),
                            month: currentDate.format('MMM'),
                            year: currentDate.format('Y'),
                            occupancy: Math.round(currentItem.hotel_occupancy),
                            rooms: currentItem.rooms,
                            recommendation: currentItem.recommendation,
                            queued: currentItem.queued || false,
                            optimized: currentItem.optimized,
                            override: currentItem.override,
                            cardStatusMsg: {
                                ready: false,
                                queued: currentItem.queued,
                                optimized: currentItem.optimized
                            },
                            appliedOccupancyRule: angular.isNumber(currentItem.applied_occupancy_rule) ? 'Over-Ridden Rule' : currentItem.applied_occupancy_rule
                        });

                        dates.push(weekset);
                        weekset = [];
                    } else if (currentItem) {
                        weekset.push({
                            date: i,
                            checked: false,
                            fullDate: currentDate.format('D-MM-Y'),
                            day: currentDate.format('ddd'),
                            month: currentDate.format('MMM'),
                            year: currentDate.format('Y'),
                            occupancy: Math.round(currentItem.hotel_occupancy),
                            rooms: currentItem.rooms,
                            recommendation: currentItem.recommendation,
                            queued: currentItem.queued || false,
                            optimized: currentItem.optimized,
                            override: currentItem.override,
                            cardStatusMsg: {
                                ready: false,
                                queued: currentItem.queued,
                                optimized: currentItem.optimized
                            },
                            appliedOccupancyRule: angular.isNumber(currentItem.applied_occupancy_rule) ? 'Over-Ridden Rule' : currentItem.applied_occupancy_rule
                        });
                    }

                }
                dates.push(weekset);

                return {
                    name: moment(startDate).format("MMM"),
                    month: moment(startDate).format("MM"),
                    is_cm_enable: currentItem ? currentItem.isCmEnable : false,
                    all_optimized: _.every(_.without(_.flatten(dates), '&nbsp;'), 'optimized'),
                    no_rules: !(_.some(_.without(_.flatten(dates), '&nbsp;'), 'optimized') || _.some(_.without(_.flatten(dates), '&nbsp;'), 'recommendation')),
                    dates: dates
                };
            };

            function getSelectedDays() {
               return _.map(_.filter(_.without(_.flatten(self.monthSet.dates), '&nbsp;'), 'checked'), 'date');
            }
            function isLastMonth(date) {
                return date.format('M,Y') == moment().add(12, 'month').format('M,Y');
            }
            function isCurrentMonth(date) {
                return date.format('M,Y') == moment().format('M,Y');
            }
            function allUnchecked() {
                var flatDates = _.without(_.flatten(self.monthSet.dates), '&nbsp;');
                return _.every(flatDates, ['checked', false]);
            }
            function allChecked() {
                var flatDates = _.without(_.flatten(self.monthSet.dates), '&nbsp;');
                return _.every(flatDates, ['checked', true]);
            }
            function showPublish() {
                return !self.monthSet.all_optimized && !allUnchecked();
            }

            self.refreshPrices = function () {
                $state.go('.', {}, {reload: 'private.optimizer'});
            }

            // This function selects all days of current month
            self.selectAll = function () {
                $scope.showPublish = $scope.check;
                _(self.monthSet.dates).forEach(function (week) {
                    _(week).forEach(function (day) {

                        if(day != '&nbsp;' && day.queued == false && day.recommendation){
                            day.checked = $scope.check;
                            if(day.checked){
                                day.cardStatusMsg.queued = false;
                                day.cardStatusMsg.optimized = false;
                                day.cardStatusMsg.ready = true;
                            }else{
                                day.cardStatusMsg.queued = day.queued;
                                day.cardStatusMsg.optimized = day.optimized;
                                day.cardStatusMsg.ready = false;
                            }

                        }
                    });
                });
            };

            self.checkCards = function (day) {
                if(day.checked){
                    day.cardStatusMsg.queued = false;
                    day.cardStatusMsg.optimized = false;
                    day.cardStatusMsg.ready = true;
                }else{
                    day.cardStatusMsg.queued = day.queued;
                    day.cardStatusMsg.optimized = day.optimized;
                    day.cardStatusMsg.ready = false;
                }

                $scope.showPublish = !allUnchecked();
                $scope.check = allChecked();
            };
            self.firstMonth = parseInt(PriceOptimizer.currentMonth());
            self.isCurrentMonth = isCurrentMonth(PriceOptimizer.month);
            self.isLastMonth = isLastMonth(PriceOptimizer.month);
            self.currentYear = PriceOptimizer.currentYear();
            self.monthSet = self._generateMonthStrip(PriceOptimizer.currentYear(), PriceOptimizer.currentMonth());
            $scope.showPublish = showPublish();
            $scope.check = false;
            
            self.nextMonth = function() {
                PriceOptimizer.month = PriceOptimizer.month.add(1,'month');
                reloadView();
            };
            self.prevMonth = function() {
                PriceOptimizer.month = PriceOptimizer.month.subtract(1, 'month');
                reloadView();
            };

            $scope.overRiding = function (value) {
                $scope.overriding = true;
                $scope.disableSave = false;
                angular.forEach($scope.day.rooms, function(room){
                    if(room.overidden < $scope.hoteldata.min_price || room.overidden > $scope.hoteldata.max_price) {
                        $scope.disableSave = true;
                        return;
                    }
                });
            }
            // Edit Modal

            $scope.open = function(obj) {
                $scope.disableSave = false;
                $scope.day = obj;

                PriceOptimizer.get_hotel_min_max_rate($scope.hotelId).then(function (data) {
                    $scope.hoteldata = data.data;
                });

                ngDialog.open({
                    template: 'editPrices',
                    scope: $scope,
                    controller: self,
                    controllerAs: 'optimizer'
                 });
            };

        });

})();
