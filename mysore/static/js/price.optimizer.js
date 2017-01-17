(function () {
    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider.state('private.optimizer', {
                url: '/optimizer',
                templateUrl: '/optimizer/templates/price-optimizer',
                resolve: {
                    hotelId: function (UIContext) {
                        return UIContext.getHotelId();
                    },
                    rooms: function ($http, hotelId) {
                        return $http.get('/hotel/viewrooms?hotel_id=' + hotelId);
                    },
                    roomId: function (rooms) {
                        return rooms.data[0].id;
                    },
                    rates: function ($http, hotelId, roomId) {
                        return $http.get('/hotel/rateMappedPlans?hotel_id=' + hotelId + '&room_id=' + roomId);
                    },

                    rpId: function (rates) {
                        return rates.data[0].id;
                    },
                    rpIdList: function (rates) {
                        var rateList = []
                        _.map(rates.data, function (rate) {
                            rateList.push(rate.id);
                        });
                        return rateList;
                    },
                    optimizerData: function (PriceOptimizer, hotelId, roomId, rpIdList) {
                        return PriceOptimizer.get(hotelId, roomId, rpIdList);
                    },
                    occupancy: function ($http, hotelId, roomId, rpId) {
                        return $http.get('/hotel/occupancyByRP?hotel_id=' + hotelId + '&room_id=' + roomId + '&rate_id=' + rpId);
                    }
                },
                controllerAs: 'optimizer',
                controller: 'Optimizer'
            });
        });

    angular.module('priceOptimizer', [])
        .controller('Optimizer', function ($scope, $state, User, hotelId, $http, optimizerData, PriceOptimizer, UserSettings, ngDialog, $window, rooms, rates, occupancy, roomId, rpId, rpIdList) {
            $scope.hotelId = hotelId;
            $scope.rooms = rooms.data;
            $scope.ratePlans = rates.data;
            $scope.occupancyList = occupancy.data;
            $scope.rate_plan = $scope.ratePlans[0].id;

            UserSettings.get_hotel_rate_type(User.getHotelID()).then(function (data) {
                if (data.data == 1) {
                    $scope.rate_type = "Sell inclusive"
                } else {
                    $scope.rate_type = "Sell"
                }
            });

            //room Changed event
            $scope.roomChanged = function (r) {
                $scope.optimizerLoading = true;
                $scope.room = r;
                var rateList = []
                $http.get('/hotel/rateMappedPlans?hotel_id=' + hotelId + '&room_id=' + $scope.room).then(function (d) {
                    $scope.ratePlans = d.data;
                    $scope.rate_plan = $scope.ratePlans[0].id
                    $scope.rpChanged($scope.rate_plan)
                    _.map(d.data, function (rate) {
                        rateList.push(rate.id);
                    });
                }).then(function (opt) {
                    self.data = $scope.optimizerData[r]
                    User.setRoomID([r, false])
                    generateTable();
                    $scope.optimizerLoading = false;
                    $scope.checkCards = false;

                })
                $scope.daysSelected = [];
                $scope.daysSelectedForOverride = [];

            };

            //checking the optimizer reload (publish/refresh button reload)
            if (User.getRoomID() != null) {
                if (User.getRoomID()[1] == true) {
                    $scope.selected_room_id = User.getRoomID()[0];
                    User.setRoomID([$scope.selected_room_id, false]);
                    $scope.roomChanged($scope.selected_room_id)
                } else {
                    $scope.selected_room_id = 1
                    User.setRoomID([$scope.selected_room_id, false]);
                }
            } else {
                $scope.selected_room_id = 1
                User.setRoomID([$scope.selected_room_id, false]);
            }
            $scope.room = $scope.selected_room_id

            $scope.legendsList = [
                {
                    name: 'Pending',
                    class: 'toBeOptimizedLegend' //'#eee'
                },
                {
                    name: 'Optimized',
                    class: 'optimizedLegend' //'#C6F3C6'
                },
                {
                    name: 'Overridden',
                    class: 'overriddenLegend'  //'#F1DEC4'
                },
                {
                    name: 'Queued',
                    class: 'queuedLegend' //'#eee'
                },
                {
                    name: 'Cannot Optimize',
                    class: 'pastDateLegend' //'#eee'
                }
            ]

            var self = this;
            $scope.optimizerData = optimizerData.data
            self.data = optimizerData.data[$scope.selected_room_id];

            UserSettings.get_hotel_currency_code(User.getHotelID()).then(function (data) {
                $scope.currency_class = data.data;
            });

            function reloadView() {
                $state.go('.', {}, {reload: 'private.optimizer'});
                $scope.optimizerLoading = true;
            }

            $scope.$on('contextChanged', function () {
                reloadView();
            });


            // DATES & MONTH
            var today = new Date();
            var count = today.getMonth();
            today.setHours(0, 0, 0, 0);
            $scope.currDate = moment(today).format("x");
            var months = [];

            while (count < today.getMonth() + 12) {
                months.push(moment().month(count++).format("MMM Y"));
            }

            $scope.monthList = months;

            // DEFAULT OCCUPANCY LIST BASED ON SELECTED ROOM AND RATEPLAN
            $scope.occupancyList = _.map($scope.occupancyList, function (occ) {
                return {id: occ.id, name: occ.name, occ_check: false}
            });
            $scope.occupancyList[0].occ_check = true;
            $scope.occupancy = $scope.occupancyList[0].id;

            self.data = _.map(self.data, function (d) {
                if (!_.isEmpty(d.prices)) {
                    d.recPrice = d.prices[$scope.rate_plan][$scope.occupancy];
                    d.overRiddenPrice = d.prices[$scope.rate_plan][$scope.occupancy];
                    return d;
                }
                return d;
            });

            function generateTable() {

                var year = PriceOptimizer.currentYear();
                var month = PriceOptimizer.currentMonth() - 1;

                var startDate = moment([year, month]);
                var endDate = moment(startDate).endOf('month');
                var dates = [];
                var weeksetOffset = [];

                var monthStartDate = new Date(startDate);
                var monthStartWeekday = monthStartDate.getDay();
                var monthOffset = (monthStartWeekday + 6) % 7;

                if (monthOffset - 1 < 6) {
                    for (var m = monthOffset - 1; m >= 0; m--) {
                        weeksetOffset.push('&nbsp;');
                    }
                }

                self.data = _.map(self.data, function (d) {
                    var d_date = new Date(d.date);
                    (d_date).setHours(0, 0, 0, 0);
                    d.date2 = parseInt(moment(d.date).format("DD"));
                    d.dayinFormatx = parseInt(moment(d_date).format("x"));

                    d.hotel_occupancy = Math.round(d.hotel_occupancy);

                    if (d.dayinFormatx < $scope.currDate) {
                        d.cannotOptimizeReason = 'Cannot optimize since this is a past date ';
                    } else if (!d.recommendation && (d.dayinFormatx >= $scope.currDate) && d.hotel_occupancy < 100) {
                        d.cannotOptimizeReason = 'Cannot optimize since there is no rule created ';
                    } else if ((d.dayinFormatx >= $scope.currDate) && d.hotel_occupancy > 99) {
                        d.cannotOptimizeReason = 'Cannot optimize since occupancy is 100% ';
                    } else if (d.recommendation && (d.dayinFormatx >= $scope.currDate) && d.hotel_occupancy < 100) {
                        d.cannotOptimizeReason = 'Occupancy - ' + d.hotel_occupancy + '% ';
                    }

                    d.changed = false;
                    return d;
                });

                self.allDates = chunk(weeksetOffset.concat(self.data));

            }

            $scope.changeRule = function (day, rule) {
                $scope.ruleApplied = rule.name;
                day.applied_rule_type = rule.type;
                day.applied_rule = rule.id;
                feedToChangeRuleFn(day, rule.type);
            }

            function feedToChangeRuleFn(day, rule_type) {
                var ruleChangedDates = _.map(self.allDates, function (week) {
                    _.map(week, function (d) {
                        if (d != '&nbsp;' && d.date == day.date) {
                            if (rule_type == 'promo') {
                                d.changedRule = rule_type;
                                d.changed = true;
                                day.overRiddenPrice = d.promo[$scope.rate_plan][$scope.occupancy];
                                if (day.discount_type == 'Percentage') {

                                    $scope.slashedPrice = Math.round((((d.promo[$scope.rate_plan][$scope.occupancy] * 100) / (100 - d.discount_price)) / 100)) * 100
                                } else {
                                    $scope.slashedPrice = d.promo[$scope.rate_plan][$scope.occupancy] + d.discount_price
                                }
                            } else if (rule_type == 'occupancy') {
                                d.changedRule = rule_type;
                                $scope.slashedPrice = null;
                                d.changed = true;
                                day.overRiddenPrice = d.occupancy[$scope.rate_plan][$scope.occupancy];
                            } else if (rule_type == 'competition') {
                                d.changedRule = rule_type;
                                $scope.slashedPrice = null;
                                d.changed = true;
                                day.overRiddenPrice = d.competition[$scope.rate_plan][$scope.occupancy];
                            }
                            return d;
                        }
                    });
                    return week;
                });

                self.allDates = ruleChangedDates;
            }

            function chunk(arr) {
                var newArr = [];
                for (var i = 0; i < arr.length; i += 7) {
                    newArr.push(arr.slice(i, i + 7));
                }
                return newArr;
            }

            generateTable();

            $scope.showOverriddenButton = false;

            self.removeOverride = function (day) {
                var datesForOverridden = _.map(getSelectedDays(), function (d) {
                    return d.date;
                });
                feedToChangeRuleFn(day, day.applied_rule_type);
                var feedToReset = {
                    hotel_id: User.getHotelID(),
                    date: datesForOverridden
                }
                PriceOptimizer.reset(feedToReset).then(function () {
                    reloadView()
                })
            };

            function areAllSelectedCardsOverridden() {
                var flatDates = _.without(_.flatten(self.allDates), '&nbsp;');

                _.remove(flatDates, function (day) {
                    return day.recommendation == false;
                });

                return _.every(flatDates, ['dateSelected', true]);
            }

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


            $scope.rpChanged = function (r) {
                $scope.rate_plan = r;
                $http.get('/hotel/occupancyByRP?hotel_id=' + hotelId + '&room_id=' + $scope.room + '&rate_id=' + $scope.rate_plan).then(function (d) {
                    $scope.occupancyList = d.data;

                    $scope.selectOccupancy($scope.occupancyList[0]);

                    $scope.occupancyList = _.map($scope.occupancyList, function (occ) {
                        return {id: occ.id, name: occ.name, occ_check: false}
                    });

                    $scope.occupancyList[0].occ_check = true;
                    $scope.occupancy = $scope.occupancyList[0].id
                    if ($scope.daysSelected.length == 1) {
                        pushSelectedDates($scope.daysSelected[0], $scope.rate_plan, $scope.occupancy);
                    }

                    generateTable();
                    if ($scope.daysSelected.length == 1) {
                        feedToChangeRuleFn($scope.daysSelected[0], $scope.daysSelected[0].changedRule);
                    }

                });
            };

            $scope.selectOccupancy = function (occ) {
                $scope.occupancy = occ;
                var occBasedPrices = _.map(self.allDates, function (week) {
                    _.map(week, function (d) {
                        if (d != '&nbsp;') {
                            d.recPrice = d.prices[$scope.rate_plan][$scope.occupancy];
                            d.overRiddenPrice = d.prices[$scope.rate_plan][$scope.occupancy];
                            return d;
                        }
                    });
                    return week;
                });

                self.allDates = occBasedPrices;

                if ($scope.daysSelected.length == 1) {
                    pushSelectedDates($scope.daysSelected[0], $scope.rate_plan, $scope.occupancy);
                    feedToChangeRuleFn($scope.daysSelected[0], $scope.daysSelected[0].changedRule);
                }

            };

            // GET MIN MAX RATE OF THE HOTEL
            PriceOptimizer.get_hotel_min_max_rate($scope.hotelId).then(function (data) {
                $scope.hoteldata = data.data;
            });

            $scope.daysSelected = [];

            self.selectDates = function (day) {
                day = day || {};
                day.dateSelected = !day.dateSelected;

                _.remove($scope.daysSelected, function (day) {
                    return day.dateSelected == false;
                });

                pushSelectedDates(day, $scope.rate_plan, $scope.occupancy);

                if ($scope.daysSelected.length && $scope.hoteldata.can_publish) {
                    $scope.showPublish = true;
                } else {
                    $scope.showPublish = false;
                }

                $scope.checkCards = allChecked();
            }

            self.cancelSave = function (day, hotelId) {

                if ($scope.daysSelected.length == 1) {
                    day = day || {};
                    day.dateSelected = !day.dateSelected;

                    _.remove($scope.daysSelected, function (day) {
                        return day.dateSelected == false;
                    });
                } else {
                    reloadView();
                }


            }

            function pushSelectedDates(day, rate_plan, occ_key) {
                if (day.dateSelected) {

                    var flatDates = _.without(_.flatten(self.allDates), '&nbsp;');
                    var daySelectedExists = _.find($scope.daysSelected, function (d) {
                        return day.dayinFormatx === d.dayinFormatx;
                    });

                    if (!daySelectedExists) {
                        $scope.daysSelected.push(day);
                        $scope.day = day;
                    }

                    if (!day.changed) {
                        $scope.ruleApplied = day.applied_rule_name;
                    }
                    $scope.ruleAppliedList = day.applied_rule_type_list;

                    $scope.rule_types = _.map(day.applied_rule_type_list, function (r) {
                        return r.rule_type;
                    });

                    $scope.card_rule_types = $scope.rule_types.join(' ');

                    $scope.slashedPrice = null;
                    if (day.applied_rule_type == 'promo') {
                        if (day.discount_type == 'Percentage') {
                            $scope.slashedPrice = Math.round((day.prices[rate_plan][occ_key] * 100) / (100 - day.discount_price) / 100) * 100
                        } else {
                            $scope.slashedPrice = day.prices[rate_plan][occ_key] + day.discount_price

                        }
                    }

                }

                // SHOW / HIDE OVERRIDDEN BUTTON

                var areAllOverRidden = _.filter(getSelectedDays(), function (d) {
                    return d.override == false;
                });

                console.log(areAllOverRidden.length);

                if (areAllOverRidden.length <= 0) {
                    $scope.showOverriddenButton = true;
                } else {
                    $scope.showOverriddenButton = false;
                }


            }

            function getSelectedDays() {
                return _.map(_.filter(_.without(_.flatten(self.allDates), '&nbsp;'), 'dateSelected'));
            }

            function getSelectedData() {
                var datewise = [], getFeedToPublish;

                _.map(getSelectedDays(), function (d) {
                    var feedToPublish = []
                    _($scope.optimizerData).forEach(function (roomType, room_id) {
                        _.filter(roomType, function (roomTypeDate) {
                            if (roomTypeDate.date == d.date) {
                                var dateData = {};
                                dateData['date'] = roomTypeDate['date'];
                                if (roomTypeDate['changedRule']) {
                                    var rule_type = roomTypeDate['changedRule'];
                                    if (rule_type == 'occupancy') {
                                        dateData['prices'] = roomTypeDate[rule_type]
                                    }
                                    else if (roomTypeDate['changedRule'] == 'promo') {
                                        dateData['prices'] = roomTypeDate[rule_type]
                                    }
                                    else if (roomTypeDate['changedRule'] == 'competition') {
                                        dateData['prices'] = roomTypeDate[rule_type]
                                    }
                                } else {
                                    dateData['prices'] = roomTypeDate['prices']
                                }
                                dateData['occupancy_price'] = roomTypeDate['occupancy'];
                                dateData['promo'] = roomTypeDate['promo'];
                                dateData['competition'] = roomTypeDate['competition'];
                                dateData['occupancy'] = roomTypeDate['hotel_occupancy'];
                                dateData['holiday'] = roomTypeDate['holiday'];
                                dateData['room_id'] = room_id;
                                dateData['hotel_id'] = hotelId;
                                dateData['applied_rule'] = d.applied_rule_name;
                                dateData['is_override'] = d.override;
                                dateData['min_price'] = $scope.hoteldata.min_price;
                                dateData['max_price'] = $scope.hoteldata.max_price;
                                dateData['rule_type'] = d.applied_rule_type;
                                dateData['user_id'] = User.getEmail();
                                feedToPublish.push(dateData)
                            }
                        });

                    });
                    datewise.push(feedToPublish)
                });
                return datewise;
            }

            function allUnchecked() {
                var flatDates = _.without(_.flatten(self.allDates), '&nbsp;');
                return _.every(flatDates, ['dateSelected', false]);
            }

            function allChecked() {
                var flatDates = _.without(_.flatten(self.allDates), '&nbsp;');

                _.remove(flatDates, function (day) {
                    return day.recommendation == false;
                });

                return _.every(flatDates, ['dateSelected', true]);
            }

            // This function selects all days of current month
            self.selectAll = function () {
                _.remove($scope.daysSelected, function (day) {
                    return day.dateSelected == false || day.dateSelected;
                });
                _(self.allDates).forEach(function (week) {
                    _(week).forEach(function (day) {
                        if (day != '&nbsp;' && day.queued == false && day.recommendation && !(day.dayinFormatx < $scope.currDate) && day.hotel_occupancy < 100) {
                            day.dateSelected = $scope.checkCards;
                            pushSelectedDates(day, $scope.rate_plan, $scope.occupancy);
                        }
                    });
                });

                if ($scope.daysSelected.length > 0 && $scope.hoteldata.can_publish) {
                    $scope.showPublish = true;
                } else {
                    $scope.showPublish = false;
                }

            };

            $scope.showOccupancyLevel = false;
            self.toggleOccupancyLevel = function () {
                $scope.showOccupancyLevel = !$scope.showOccupancyLevel;
            };

            // This function saves the overridden
            // prices to server

            $scope.reason = '';
            $scope.specificReason = '';

            self.save = function (obj, hotelId) {

                var datesFeedToSave = [];
                datesFeedToSave = _.map($scope.daysSelected, function (ds) {
                    return {
                        date: ds.date,
                        ruleId: ds.applied_rule,
                        ruleType: ds.changed ? ds.changedRule : ds.applied_rule_type,
                        ruleName: $scope.ruleApplied
                    }
                });

                var newObj = {};
                newObj.hotel_id = hotelId;

                newObj.dates = datesFeedToSave;

                newObj.room = $scope.room;
                newObj.ratePlan = $scope.rate_plan;
                newObj.occ_key = $scope.occupancy;
                newObj.recPrice = obj.recPrice;
                newObj.overRiddenPrice = parseInt(obj.overRiddenPrice);
                newObj.reason = obj.reason || $scope.reason;
                newObj.comment = obj.specificReason || $scope.specificReason;

                PriceOptimizer.save(hotelId, newObj).then(function (response) {
                    if (!response) {
                        console.log("error on saving");
                    }
                    if (response.status === 200) {
                        generateTable();
                        reloadView();
                        //$scope.showPublish = showPublish();
                    }
                });
            };

            // This function publishes the current month's
            // recommended and overridden prices to channe  l manager
            self.publishData = function () {
                var selectedDates = getSelectedData();
                User.setRoomID([User.getRoomID()[0], true]);
                $scope.optimizerLoading = true;
                PriceOptimizer.publish(hotelId, selectedDates).then(function (response) {
                    $state.go('.', {}, {reload: 'private.optimizer'})
                });
            };

            self.refreshData = function () {
                var selectedDates = getSelectedData();
                reloadView();
            };

            // This function regenerates the cards of
            // current month after saving the overrides

            self.noRules = self.data.length === 0;

            self.weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

            // This function generates the number of blank days
            // to be printed in the first week before the 1st day of month
            self._generateOffset = function (startDate) {
                var output = [];
                // var currentMonth = moment().month() == startDate.month() && moment().year() == startDate.year();
                // var monthStartDate = currentMonth ? new Date() : new Date(startDate);
                var monthStartDate = new Date(startDate);
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

            function isLastMonth(date) {
                return date.format('M,Y') == moment().add(12, 'month').format('M,Y');
            }

            function isCurrentMonth(date) {
                return date.format('M,Y') == moment().format('M,Y');
            }

            self.refreshPrices = function () {
                reloadView();
            };

            self.firstMonth = parseInt(PriceOptimizer.currentMonth());
            self.isCurrentMonth = isCurrentMonth(PriceOptimizer.month);
            self.isLastMonth = isLastMonth(PriceOptimizer.month);
            self.currentYear = PriceOptimizer.currentYear();
            self.currentMonth = moment().month(PriceOptimizer.currentMonth() - 1).format('MMM')

            /*$scope.showPublish = showPublish();*/
            $scope.checkCards = false;

            self.nextMonth = function () {
                PriceOptimizer.month = PriceOptimizer.month.add(1, 'month');
                $scope.optimizerLoading = true;
                reloadView();
            };
            self.prevMonth = function () {
                PriceOptimizer.month = PriceOptimizer.month.subtract(1, 'month');
                reloadView();
            };

            self.changeMonth = function (month) {
                PriceOptimizer.month = moment(month);
                reloadView();
            };

            $scope.changePrice = true;
            $scope.cancelChangePrice = false;
            self.changePrice = function (day) {
                $scope.overriding = true;
                $scope.changePrice = false;
                $scope.cancelChangePrice = true;
            }

            self.cancelChangePrice = function (day) {
                $scope.overriding = false;
                $scope.changePrice = true;
                $scope.cancelChangePrice = false;
                day.overRiddenPrice = day.recPrice || '';
            }

            $scope.overRiding = function (day) {
                $scope.overriding = true;
                $scope.disableSave = false;
                if (parseInt(day.overRiddenPrice) == '' || parseInt(day.overRiddenPrice) < parseInt($scope.hoteldata.min_price) ||
                    parseInt(day.overRiddenPrice) > parseInt($scope.hoteldata.max_price) || parseInt(day.recPrice) == parseInt(day.overRiddenPrice)) {
                    $scope.disableSave = true;
                    return;
                }
            }

        });

})();
