(function () {
    angular.module('knights')
        .config(function ($stateProvider) {
            $stateProvider
                .state('private.rules', {
                    url: '/rules',
                    template: "<div ui-view></div>",
                    abstract: true,
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
                        ratePlans: function ($http, hotelId, roomId) {
                            return $http.get('/hotel/rateMappedPlans?hotel_id=' + hotelId + '&room_id=' + roomId);
                        },
                        rpId: function (ratePlans) {
                            return ratePlans.data[0].id;
                        },
                        rpIdList: function (ratePlans) {
                            var rateList = []
                            _.map(ratePlans.data, function (rate) {
                                rateList.push(rate.id);
                            });
                            return rateList;
                        },
                        roomOccupancies: function ($http, hotelId, roomId, rpId) {
                            return $http.get('/hotel/occupancyByRP?hotel_id=' + hotelId + '&room_id=' + roomId + '&rate_id=' + rpId);
                        }
                    },
                })
                .state('private.rules.view', {
                    url: '/view/:tab',
                    templateUrl: '/pricing-rules/view',
                    resolve: {
                        rules: function ($http, hotelId) {
                            return $http.get('/hotel/viewrule', {
                                params: {
                                    hotel_id: hotelId
                                }
                            }).then(function (response) {
                                return response.data;
                            });
                        }
                    },
                    controllerAs: 'viewPrice',
                    controller: 'viewPriceController'
                });
        })
        .factory('HolidaysView', function ($http) {
            return {
                getHoliday: function (start, end) {
                    var url = '/holidays/holiday?start_date=' + start + '&end_date=' + end + "&country=India";
                    return $http.get(url)
                        .then(function (response) {
                            return response.data;
                        });
                }
            }
        });

    angular.module('priceCalendar', [])
        .controller('viewPriceController', function (HolidaysView, hotelId, rules, rooms, $scope, $state, ngDialog, $http, WalkThrough, UserSettings, User, $stateParams, AutoRuleCreation, ratePlans, roomOccupancies, manageRulesService, $sce) {

            // START :::: SIDE PANEL TOGGLE
            if (User.getToggleConfig()) {
                $scope.rules_wrapper_class = "calendar-wrapper col-md-9";
                $scope.rules_container_class = "rules-container col-md-3 collapsedSidebar";
            } else {
                $scope.rules_wrapper_class = "calendar-wrapper col-md-12";
                $scope.rules_container_class = "rules-container col-md-3";
            }

            if (User.getExpandCollapseRulesConfig()) {
                $scope.rulesExpand = {
                    text: 'Collapse',
                    status: true,
                };

            } else {
                $scope.rulesExpand = {
                    text: 'Expand',
                    status: false,
                };

            }
            $scope.$on('contextChanged', function () {
                $state.go('.', {}, {reload: 'private.rules'});
            });
            UserSettings.get_hotel_currency_code(User.getHotelID()).then(function (data) {
                $scope.currency_class = data.data;
            });

            $scope.activeTab = $stateParams.tab;

            $scope.populateRules = function (hotelId, activeTab) {

                if (activeTab == 'occupancy') {
                    $scope.remove_btn = true;

                    var activeAndInactiveRules = _.without(self.rules.occupancy_prices, undefined);

                    addHolidayNamesToAllRules(activeAndInactiveRules);

                    $scope.activeRulesData = _.filter(activeAndInactiveRules, function (rule) {
                        if (rule.status === '1') {
                            $scope.remove_btn = false;
                            rule.type = 'occupancy';
                            return rule;
                        }
                    });
                    $scope.inActiveRulesData = _.filter(activeAndInactiveRules, function (rule) {
                        if (rule.status === '0') {
                            rule.type = 'occupancy';
                            return rule;
                        }
                    });

                    $scope.config_sort($scope.activeRulesData);

                } else if (activeTab == 'promotion') {
                    $scope.remove_btn = true;
                    var activeAndInActiveRules = _.filter(self.rules.promotional_prices, function (rule) {
                        if (rule.status === '1' || rule.status === '0') {
                            return rule;
                        }
                    });


                    var addIsPromoToRules = _.map(activeAndInActiveRules, function (rule) {
                        rule.type = 'promotion';
                        rule.isPromo = true;
                        return rule;
                    });

                    modifyPromoRules(addIsPromoToRules);
                    // addHolidayNamesToAllRules(addIsPromoToRules);

                    $scope.activeRulesData = _.filter(addIsPromoToRules, function (rule) {
                        if (rule.status === '1') {
                            $scope.remove_btn = false;
                            rule.type = 'promotion';
                            return rule;
                        }
                    });
                    $scope.inActiveRulesData = _.filter(addIsPromoToRules, function (rule) {
                        if (rule.status === '0') {
                            rule.type = 'promotion';
                            return rule;
                        }
                    });

                    $scope.config_sort($scope.activeRulesData);

                } else {
                    $scope.remove_btn = true;
                    var activeAndInactiveRules = _.without(self.rules.competition_prices, undefined);

                    addHolidayNamesToAllRules(activeAndInactiveRules);

                    $scope.activeRulesData = _.filter(activeAndInactiveRules, function (rule) {
                        if (rule.status === '1') {
                            $scope.remove_btn = false;
                            rule.type = 'competition';
                            return rule;
                        }
                    });
                    $scope.inActiveRulesData = _.filter(activeAndInactiveRules, function (rule) {
                        if (rule.status === '0') {
                            rule.type = 'competition';
                            return rule;
                        }
                    });

                    $scope.config_sort($scope.activeRulesData);
                }

            };

            function addHolidayNamesToAllRules(rules) {
                _.map(rules, function (rule) {
                    var rule_validity_start = moment(rule.date_range.start.$date).format("YYYY-MM-DD").toString();
                    var rule_validity_end = moment(rule.date_range.end.$date).format("YYYY-MM-DD").toString();
                    rule.holidayNames = [];
                    rule.isHoliday = false;
                    HolidaysView.getHoliday(rule_validity_start, rule_validity_end).then(function (holiday) {
                        rule.holidaysList = holiday;
                        _.map(rule.holidaysList, function (h) {
                            rule.holidayNames.push(h.name);
                            rule.isHoliday = true
                        });
                        rule.holidayNames = rule.holidayNames.join(', ');
                    });
                });
            }

            $scope.paramsOccRulesReorder = [];

            $scope.config_sort = function (data) {
                var rulesForSorting = _.without(data, undefined);

                var x = 0;

                var rulesEmpty = _.every(rulesForSorting, function (r) {
                    return r.status == 'DELETED';
                });

                var rulesStatus_0_1 = _.filter(rulesForSorting, function (r) {
                    return r.status == '1' || r.status == '0';
                });

                if (rulesForSorting === undefined || rulesEmpty) {
                    $scope.NoRules = true;
                    $scope.toggleButton = false;
                } else {

                    $scope.NoRules = false;

                    $scope.toggleButton = rulesStatus_0_1.length > 1 ? true : false;

                    rulesForSorting.sort(function (a, b) {
                        return a.priority > b.priority;
                    });
                    $scope.sortableOptions = {
                        // handle: '> .drag-and-drop',
                        update: function (e, ui) {
                        },
                        axis: 'y',
                        stop: function (e, ui) {

                            var sortableRules = ui.item.sortable.sourceModel;

                            var noOfRules = sortableRules.length;
                            for (var index in sortableRules) {
                                sortableRules[index].i = noOfRules;
                                noOfRules--;
                            }

                            var params = _.map(sortableRules, function (rule) {
                                return {
                                    "id": rule.local_id,
                                    "name": rule.name,
                                    "status": rule.status,
                                    "priority": rule.i,
                                    "hotel_id": hotelId
                                };
                            });

                            if (params.length !== 0) {
                                manageRulesService.ruleorder($stateParams.tab, params, function () {
                                    $state.go('.', {}, {reload: 'private.rules.view'});
                                });
                            }
                        }
                    };
                }

            };

            //Auto rule creation
            $scope.AutoRuleCreation = function (type) {
                var data = [];
                data[0] = type === 'occupancy' ? 'occu' : type === 'promotion' ? 'promo' : 'comp';
                ngDialog.openConfirm({
                    template: 'autoRuleCreationModal',
                    className: 'ngdialog-theme-default autoRuleCreationModal'
                }).then(function (value) {
                    var params = {
                        "hotel_id": User.getHotelID(),
                        "rule_type": data
                    };
                    AutoRuleCreation.create_rules(params, function () {
                        $state.go('.', {}, {reload: 'private.rules'});
                    })

                }, function () {
                    return false;
                });
            };

            // Remove All Rules
            $scope.RemoveAllRules = function (type) {
                var data = [];
                data[0] = type === 'occupancy' ? 'occu' : type === 'promotion' ? 'promo' : 'comp';
                ngDialog.openConfirm({
                    template: 'autoRuleDeletionModal',
                    className: 'ngdialog-theme-default autoRuleDeletionModal'
                }).then(function (value) {
                    var params = {
                        "hotel_id": User.getHotelID(),
                        "rule_type": data
                    };
                    AutoRuleCreation.delete_all_rules(params, function () {
                        $state.go('.', {}, {reload: 'private.rules'});
                    })

                }, function () {
                    return false;
                });
            }


            $scope.SidePanel = function () {
                if (User.getToggleConfig()) {
                    WalkThrough.set('active_rules_toggle', false);
                    User.setToggleConfig(false);
                } else {
                    WalkThrough.set('active_rules_toggle', true);
                    User.setToggleConfig(true);
                }
            };

            $scope.expandCollapseRules = function () {
                if (User.getExpandCollapseRulesConfig()) {
                    WalkThrough.set('toggleRules_expand_collapse', false);
                    User.setExpandCollapseRulesConfig(false);
                    $scope.rulesExpand = {
                        text: 'Expand',
                        status: false,
                    };

                } else {
                    WalkThrough.set('toggleRules_expand_collapse', true);
                    User.setExpandCollapseRulesConfig(true);
                    $scope.rulesExpand = {
                        text: 'Collapse',
                        status: true,
                    };
                }
            };


            // END :::: SIDE PANEL TOGGLE

            // START CREATE RULE TOOLTIP
            $scope.CreateRuleInfo = WalkThrough.status('create_rule_key');
            $scope.closeCreateRuleInfo = function () {
                WalkThrough.set('create_rule_key', false);
                $scope.CreateRuleInfo = false;
            };
            // END CREATE RULE TOOLTIP

            // START SIDE PANEL TOOLTIP
            $scope.SidePanelInfo = WalkThrough.status('side_panel_key');
            $scope.closeSidePanelInfo = function () {
                WalkThrough.set('side_panel_key', false);
                $scope.SidePanelInfo = false;
            };
            // END SIDE PANEL TOOLTIP

            $scope.rooms = rooms;
            $scope.base_room = _.filter($scope.rooms.data, {'is_base': true});
            $scope.base_room_order = $scope.base_room[0].id;

            $scope.ratePlans = ratePlans;
            $scope.roomOccupancies = roomOccupancies;

            var self = this;

            self.init = function (rules) {

                var i;
                if (rules.promotional_prices) {
                    for (i = 0; i < rules.promotional_prices.length; i++) {
                        rules.promotional_prices[i].rooms = _.map(rules.promotional_prices[i].rooms, function (id) {
                            return _.find($scope.rooms.data, function (room) {
                                return id == room.id;
                            });
                        });
                    }
                }
                self.rules = rules.occupancy_prices || rules.promotional_prices || rules.competition_prices ? rules : [];
                self.rules.promotional_prices = self.rules.promotional_prices || [];
                self.rules.occupancy_prices = self.rules.occupancy_prices || [];
                self.rules.competition_prices = self.rules.competition_prices || [];

                // ADDING isComp TO ALL THE COMPETITION RULES
                self.rules.competition_prices = _.map(self.rules.competition_prices, function (c) {
                    c.isComp = true;
                    return c;
                })

                self.activeOccupancyRules = _.filter(self.rules.occupancy_prices, ["status", "1"]);
                self.activeCompetitionRules = _.filter(self.rules.competition_prices, ["status", "1"]);
                self.activePromoRules = _.filter(self.rules.promotional_prices, ["status", "1"]);

                /*** SIDE DOCK RULES LIST : CLICK TO VIEW POPUP ***/

                var allActiveRules = [self.activeOccupancyRules, self.activePromoRules, self.activeCompetitionRules];
                modifyPromoRules(self.activePromoRules);

                $scope.populateRules(hotelId, $stateParams.tab || 'occupancy');

                // ADDING CLASSES FOR EACH RULE OF EACH RULE TYPE (BASED ON THE RULE PRIORITY).

                var activeOR = self.activeOccupancyRules;
                var activeCR = self.activeCompetitionRules;
                var activePR = self.activePromoRules;
                var p, o, r, c;

                for (o = 0; o < activeOR.length; o++) {
                    activeOR[o].class = ['o_rule_' + activeOR[o].priority];
                    activeOR[o].class = activeOR[o].class.join(' ');
                }

                for (p = 0; p < activePR.length; p++) {
                    activePR[p].class = ['p_rule_' + activePR[p].priority];
                    activePR[p].class = activePR[p].class.join(' ');
                }

                for (c = 0; c < activeCR.length; c++) {
                    activeCR[c].class = ['c_rule_' + activeCR[c].priority];
                    activeCR[c].class = activeCR[c].class.join(' ');
                }

                //Overlapping of rules

                for (r = 0; r < allActiveRules.length; r++) {

                    for (i = 0; i < allActiveRules[r].length; i++) {
                        if (allActiveRules[r][i].rule_type == 'single' || allActiveRules[r][i].rule_type == 'multiple') {
                            allActiveRules[r][i].isPromo = true;
                        }
                        else if (allActiveRules[r][i].rule_type == 'competition') {
                            allActiveRules[r][i].isComp = true;
                            allActiveRules[r][i].isPromo = false;
                        }
                        else {
                            allActiveRules[r][i].isComp = false;
                            allActiveRules[r][i].isPromo = false;
                        }

                        allActiveRules[r][i].type = allActiveRules[r][i].isPromo ? 'promo' : allActiveRules[r][i].isComp ? 'competition' : 'occupancy';
                        allActiveRules[r][i].typeLabel = allActiveRules[r][i].isPromo ? 'Promotion Rule' : allActiveRules[r][i].isComp ? 'Competition Rule' : 'Occupancy Rule';

                        var occOverlappingRules = [];
                        for (var y = 0; y < allActiveRules[r].length; y++) {
                            var intersects = _.intersection(getRuleDates(allActiveRules[r][i]), getRuleDates(allActiveRules[r][y]));
                            if (intersects.length > 0 && allActiveRules[r][i].local_id !== allActiveRules[r][y].local_id) {
                                occOverlappingRules.push(allActiveRules[r][y]);
                            } else if (intersects.length > 0 && allActiveRules[r][i].local_id !== allActiveRules[r][y].local_id && allActiveRules[r][i].isPromo && allActiveRules[r][y].isPromo) {
                                occOverlappingRules.push(allActiveRules[r][y]);
                            }
                        }

                        allActiveRules[r][i].overlappingRules = occOverlappingRules;
                    }
                }

                /*** END Side Dock Rules List : Click to View Popup ***/


                // START : HIDE or SHOW RULES TYPES IN "MANAGE RULES" DROPDOWN
                self.occRulesDeleted = _.every(self.rules.occupancy_prices, function (r) {
                    return r.status == 'DELETED';
                });
                self.promoRulesDeleted = _.every(self.rules.promotional_prices, function (r) {
                    return r.status == 'DELETED';
                });
                self.compRulesDeleted = _.every(self.rules.competition_prices, function (r) {
                    return r.status == 'DELETED';
                });
                self.inactiveOcc = _.some(self.rules.occupancy_prices, function (r) {
                    return r.status == '0';
                });
                self.inactivePromo = _.some(self.rules.promotional_prices, function (r) {
                    return r.status == '0';
                });
                self.inactiveComp = _.some(self.rules.competition_prices, function (r) {
                    return r.status == '0';
                });
                self.activeOcc = _.some(self.rules.occupancy_prices, function (ndo) {
                    return ndo.status == '1';
                });
                self.activePromo = _.some(self.rules.promotional_prices, function (ndo) {
                    return ndo.status == '1';
                });
                self.activeComp = _.some(self.rules.competition_prices, function (ndo) {
                    return ndo.status == '1';
                });
                self.noOccRules = self.rules.occupancy_prices.length === 0 || self.occRulesDeleted;
                self.noPromoRules = self.rules.promotional_prices.length === 0 || self.promoRulesDeleted;
                self.noCompRules = self.rules.competition_prices.length === 0 || self.compRulesDeleted;

                self.noRules = self.noOccRules && self.noPromoRules && self.noCompRules;

                /*if ((self.noOccRules && self.noPromoRules && self.noCompRules) || (!self.activeOcc && !self.activePromo && !self.activeComp)) {

                 $scope.rules_wrapper_class = "calendar-wrapper col-md-12";
                 $scope.rules_container_class = "rules-container col-md-3";
                 }*/
                self.activeRules = self.activeOcc || self.activePromo || self.activeComp;
                self.inActiveRules = self.inactiveOcc || self.inactivePromo || self.inactiveComp;

                if (self.noRules) {
                    $scope.manageRules = false;
                    $scope.toggleButton = false;
                }
                if (self.inActiveRules) {
                    $scope.manageRules = true;
                    $scope.toggleButton = false;
                    $scope.reorderOcc = self.activeOcc || self.inactiveOcc ? true : false;
                    $scope.reorderPromo = self.activePromo || self.inactivePromo ? true : false;
                    $scope.reorderComp = self.activeComp || self.inactiveComp ? true : false;
                }
                if (self.activeRules) {
                    $scope.manageRules = true;
                    $scope.toggleButton = true;
                    $scope.reorderOcc = self.activeOcc || self.inactiveOcc ? true : false;
                    $scope.reorderPromo = self.activePromo || self.inactivePromo ? true : false;
                    $scope.reorderComp = self.activeComp || self.inactiveComp ? true : false;
                }

                // END : HIDE or SHOW RULES TYPES IN "MANAGE RULES" DROPDOWN

            };

            self.init(rules);

            self.weekStrip = _generateWeekStrip();
            modifyPromoRules(self.rules.promotional_prices);

            HolidaysView.getHoliday('2016-12-01', '2017-12-31').then(function (holiday) {
                $scope.holidayList = holiday;
                _.map($scope.holidayList, function (h) {
                    h.date = moment(h.date).format("DD MMM YYYY");
                    return h;
                });

                var feedtoRuleSetGenerator = _generateRuleSet($scope.activeRulesData, $scope.rooms.data, $scope.holidayList);

                // TABS TO SHOW CALENDAR BASED ON RULE TYPE

                $scope.showCalendar = function (rule_type) {
                    if (rule_type == 'occupancy') {
                        $state.go('private.rules.view', {'tab': 'occupancy'});
                        self.monthSet = _generateYear(feedtoRuleSetGenerator, $scope.holidayList);
                    } else if (rule_type == 'promotion') {
                        $state.go('private.rules.view', {'tab': 'promotion'});
                        self.monthSet = _generateYear(feedtoRuleSetGenerator, $scope.holidayList);
                    } else if (rule_type == 'competition') {
                        $state.go('private.rules.view', {'tab': 'competition'});
                        self.monthSet = _generateYear(feedtoRuleSetGenerator, $scope.holidayList);
                    }
                }

                $scope.showCalendar($stateParams.tab || 'occupancy');
            });

            self.yearGenerator = _generateYear;

            $scope.status = {
                isopen: false
            };

            $scope.toggleDropdown = function ($event) {
                $event.preventDefault();
                $event.stopPropagation();
                $scope.status.isopen = !$scope.status.isopen;
            };

            $scope.addDeltaPrice = function (base_price, delta) {
                return parseInt(base_price) + parseInt(delta);
            };

            // ACTIVE AND INACTIVE TABS

            $scope.activeRulesTab = function (rule_type) {
                $scope.activeRulesContent = true;
                $scope.inActiveRulesContent = false;
            }

            $scope.inActiveRulesTab = function (rule_type) {
                $scope.inActiveRulesContent = true;
                $scope.activeRulesContent = false;
            }

            $scope.activeRulesTab($scope.activeTab);

            //EDIT RULE
            $scope.editRule = function (rule, type) {
                ngDialog.close();
                if (type == 'occupancy') {
                    $state.go('private.rules.create-occupancy', {'ruleId': rule.local_id});
                } else if (type == 'competition') {
                    $state.go('private.rules.create-competition', {'ruleId': rule.local_id});
                } else {
                    $state.go('private.rules.create-promotion', {'ruleId': rule.local_id});
                }
            };

            //UPDATE STATUS
            $scope.updateStatus = function (rule, status) {
                rule.status = status == '1' ? '0' : '1';
                var params = {
                    "hotel_id": hotelId,
                    "id": rule.local_id,
                    "status": rule.status,
                    "priority": 0
                };

                if (rule.type === 'promotion') params.rule_type = 'promo';

                manageRulesService.rulestatus($stateParams.tab, params, function () {
                    $state.go('.', {}, {
                        reload: 'private.rules.view'
                    });
                });
            };

            //DELETE RULE
            $scope.deleteRule = function (rule, hotel_id) {
                var params = {
                    "hotel_id": rules.hotel.$oid,
                    "id": rule.local_id,
                    "status": "DELETED"
                };

                if (rule.isPromo) params.rule_type = 'promo';
                if (rule.isComp) params.rule_type = 'comp';

                ngDialog.openConfirm({
                    template: 'deleteRuleTemplate',
                    className: 'ngdialog-theme-default',
                    closeByEscape: false,
                    closeByDocument: false,
                    closeByNavigation: true
                }).then(function () {
                    var post_url = $stateParams.tab == 'occupancy' ? '/hotel/updatestatus/' : $stateParams.tab == 'promotion' ? '/hotel/updatestatus/' : '/hotel/updatecompstatus/';
                    $http.post(post_url, angular.toJson(params, true)).then(function () {
                        $state.go('.', {}, {
                            reload: 'private.rules.view'
                        });
                    });
                    ngDialog.close();
                }, function () {

                });
            };

            $scope.openRulesWindow = function (day) {

                /*var primaryRule = '';

                 if(day.content.type == "occupancy"){
                 primaryRule = _.find(self.activeOccupancyRules, function(o){
                 if(day.content.thisRule.local_id == o.local_id){
                 return o;
                 }
                 });
                 }else if(day.content.type == "promo"){
                 primaryRule = _.find(self.activePromoRules, function(o){
                 if(day.content.thisRule.local_id == o.local_id){
                 return o;
                 }
                 });
                 }else{
                 primaryRule = _.find(self.activeCompetitionRules, function(o){
                 if(day.content.thisRule.local_id == o.local_id){
                 return o;
                 }
                 });
                 }

                 $scope.openRulePopup(primaryRule);*/

                $scope.openRulePopup(day.content.thisRule);
            };

            $scope.openRulePopup = function (rule) {
                rule.parent = true;
                $scope.rule = rule;

                $scope.room = $scope.rooms.data[0].id;
                $scope.ratePlan = $scope.ratePlans.data[0].id;
                $scope.roomOccupancy = $scope.roomOccupancies.data[0].id;

                rule.occupancyBar = _occupancyBarGenerator($scope.room, $scope.ratePlan, $scope.roomOccupancy, $scope.rule);

                $scope.rule.overlappingRules = _.map($scope.rule.overlappingRules, function (rule) {
                    rule.parent = false;
                    rule.occupancyBar = _occupancyBarGenerator($scope.room, $scope.ratePlan, $scope.roomOccupancy, rule);
                    return rule;
                });

                ngDialog.open({
                    template: 'openRulesPopup',
                    width: 800,
                    className: 'ngdialog-theme-default open-rules-modal',
                    scope: $scope,
                    closeByEscape: false,
                    closeByDocument: false,
                    closeByNavigation: true
                });
            };

            $scope.closeRulesPopup = function () {
                ngDialog.close();
                $scope.room = '';
            }

            // FILTERS FOR OCCUPANCY SLAB IN POPUP - ROOMS, RATEPLANS, ROOM OCCUPANCIES

            $scope.changeRoom = function (room, rule) {
                $scope.room = room;
                $http.get('/hotel/rateMappedPlans?hotel_id=' + hotelId + '&room_id=' + $scope.room).then(function (d) {
                    $scope.ratePlans.data = d.data;
                    $scope.ratePlan = $scope.ratePlans.data[0].id
                });
                updateOccupancyBar($scope.room, $scope.ratePlan, $scope.roomOccupancy, rule)
            }

            $scope.changeRateplan = function (ratePlan, rule) {
                $scope.ratePlan = ratePlan;
                updateOccupancyBar($scope.room, $scope.ratePlan, $scope.roomOccupancy, rule)
            }

            $scope.changeRoomOcc = function (roomOccupancy, rule) {
                $scope.roomOccupancy = roomOccupancy;
                updateOccupancyBar($scope.room, $scope.ratePlan, $scope.roomOccupancy, rule)
            }

            function updateOccupancyBar(room, ratePlan, roomOccupancy, rule) {
                rule.occupancyBar = _occupancyBarGenerator(room, ratePlan, roomOccupancy, rule);
                rule.overlappingRules = _.map(rule.overlappingRules, function (rule) {
                    rule.parent = false;
                    rule.occupancyBar = _occupancyBarGenerator(room, ratePlan, roomOccupancy, rule);
                    return rule;
                });
            }

            function _occupancyBarGenerator(roomId, ratePlanId, roomOccupancyId, rule) {
                var slabs = rule.type == 'promo' ? rule.hotel_occupancies[0].prices : rule.rooms[$scope.base_room_order].prices;
                var roomOccCode = _.find($scope.roomOccupancies.data, ['id', roomOccupancyId]);
                var allSlabs = [], i = '';

                for (i = 0; i < slabs.length; i++) {
                    var slabData = rule.type == 'promo' ? slabs[i] : slabs[i];

                    if (rule.type == 'occupancy') {
                        var slabPriceWithDeltas = slabData.price + rule.room_price[roomId] +
                            (rule.rate_plan_price[ratePlanId] * roomOccCode.occ_code) +
                            rule.occupancy_price[roomOccupancyId];
                    } else {
                        var slabPriceWithDeltas = slabData.price;
                    }

                    var slabFeed = {
                        offset: slabData.offset,
                        occupancy: slabData.occupancy,
                        noOfRooms: slabData.noofrooms,
                        price: slabPriceWithDeltas,
                        priceType: rule.type == 'promo' ? rule.discount_type : rule.value_type
                    }

                    allSlabs.push(slabFeed);

                }

                return allSlabs;

            }

            $scope.MouseEnterRule = function (ruleContent) {
                if (ruleContent) {

                    $('.hasRule').addClass('hrTransparent');
                    if (ruleContent.type == 'promo') {
                        var classArray = ruleContent.thisRule.class.split(" ");
                        $('.promo.' + classArray[0]).addClass('highlightRule');
                    } else if (ruleContent.type == 'competition') {
                        var classArray = ruleContent.thisRule.class.split(" ");
                        $('.comprule.' + classArray[0]).addClass('highlightRule');
                    } else {
                        var classArray = ruleContent.thisRule.class.split(" ");
                        $('.occrule.' + classArray[0]).addClass('highlightRule');
                        $('.promo.' + classArray[0]).addClass('highlightRule');
                    }
                }
            };

            $scope.MouseLeaveRule = function (ruleContent) {
                if (ruleContent) {

                    $('.hasRule').removeClass('hrTransparent');

                    if (ruleContent.type == 'promo') {
                        var classArray = ruleContent.thisRule.class.split(" ");
                        $('.promo.' + classArray[0]).removeClass('highlightRule');
                    } else if (ruleContent.type == 'competition') {
                        var classArray = ruleContent.thisRule.class.split(" ");
                        $('.comprule.' + classArray[0]).removeClass('highlightRule');
                    } else {
                        var classArray = ruleContent.thisRule.class.split(" ");
                        $('.promo.' + classArray[0]).removeClass('highlightRule');
                        $('.occrule.' + classArray[0]).removeClass('highlightRule');
                    }
                }
            };

            function _generateWeekStrip() {
                var week = [
                    {day: 'M', isWeekend: false},
                    {day: 'T', isWeekend: false},
                    {day: 'W', isWeekend: false},
                    {day: 'T', isWeekend: false},
                    {day: 'F', isWeekend: false},
                    {day: 'S', isWeekend: false},
                    {day: 'S', isWeekend: true}
                ];
                var output = week;
                for (var i = 0; i < 5; i++) {
                    output = _.concat(output, week);
                }
                return _.dropRight(output, 5);
            }

            function _generateOffset(startDate) {
                var output = [];
                var convert = new Date(startDate);
                var weekday = convert.getDay();
                var offset = (weekday + 6) % 7;
                if (offset - 1 < 6) {
                    for (var i = offset - 1; i >= 0; i--) {
                        output.push('');
                    }
                }
                return output;
            }

            // to hack server day is (monday based)
            function uiDay(serverDay) {
                return (serverDay + 6) % 7;
            }

            // add date_range to promotional_prices
            function modifyPromoRules(promo_rules) {
                for (var i = 0; i < promo_rules.length; i++) {
                    promo_rules[i].isPromo = true;
                    promo_rules[i].days = [true, true, true, true, true, true, true];
                    promo_rules[i].date_range = {start: {$date: null}, end: {$date: null}};
                    promo_rules[i].date_range.start.$date = parseInt(moment().add(promo_rules[i].start_time, 'day').format('x'));
                    promo_rules[i].date_range.end.$date = parseInt(moment().add(promo_rules[i].end_time, 'day').format('x'));
                }
            }

            function getRuleDates(op) {
                var eDate = op.date_range.end.$date;
                var sDate = op.date_range.start.$date;

                var applicableDaysOfOverlappingRule = op.days;

                var curr = new Date(sDate), between = [];
                while (curr <= new Date(eDate)) {
                    if (applicableDaysOfOverlappingRule[uiDay(moment(curr).day())]) {
                        between.push(curr.setHours(0, 0, 0, 0));
                    }
                    curr.setDate(curr.getDate() + 1);
                }
                op.dates = between;
                return op.dates;
            }

            function _generateRuleSet(rulesArr, rooms, holidays) {
                roomsdata = rooms;

                var output = {};
                for (var i = 0; i < rulesArr.length; i++) {

                    var applicableDays = rulesArr[i].days;
                    var activeRule = rulesArr[i].status === "1";
                    var endDate = rulesArr[i].date_range.end.$date;
                    var startDate = rulesArr[i].date_range.start.$date;
                    var day = moment(startDate).day();
                    var occOverlappingRules = [];
                    rulesArr[i].type = rulesArr[i].isPromo ? 'promo' : rulesArr[i].isComp ? 'competition' : 'occupancy';
                    rulesArr[i].typeLabel = rulesArr[i].isPromo ? 'Promotion Rule' : rulesArr[i].isComp ? 'Competition Rule' : 'Occupancy Rule';


                    //Overlapping

                    if (activeRule) {

                        for (var y = 0; y < rulesArr.length; y++) {
                            var activeOverlappingRule = rulesArr[y].status === "1";

                            if (activeOverlappingRule && rulesArr[i].local_id !== rulesArr[y].local_id) {
                                var intersects = _.intersection(getRuleDates(rulesArr[i]), getRuleDates(rulesArr[y]));
                                if (intersects.length > 0) {
                                    occOverlappingRules.push(rulesArr[y]);
                                } else if (intersects.length > 0 && rulesArr[i].isPromo && rulesArr[y].isPromo) {
                                    occOverlappingRules.push(rulesArr[y]);
                                }
                            }
                        }
                    }

                    //End Overlapping

                    var getOccupancies = [], k, h;
                    var joinByDash;

                    function feedToOccRange(getOccupancies) {
                        var clone = getOccupancies;
                        var popLast = clone.pop();
                        var plus1 = _.map(clone, function (x) {
                            return x + 1;
                        });
                        var add100 = getOccupancies.concat(100);
                        var add0 = [0].concat(plus1);
                        var finalArrOfGetOccupancies = _.zip(add0, add100);
                        joinByDash = _.map(finalArrOfGetOccupancies, function (finalElement) {
                            return _.join(finalElement, '-');
                        });
                    }

                    if (rulesArr[i].isPromo) {
                        getOccupancies = _.map(rulesArr[i].hotel_occupancies[0].prices, 'occupancy');

                        feedToOccRange(getOccupancies);

                        for (k = 0; k < rulesArr[i].hotel_occupancies[0].prices.length; k++) {
                            for (h = 0; h < joinByDash.length; h++) {
                                if (k == h) rulesArr[i].hotel_occupancies[0].prices[k].occRange = joinByDash[h];
                            }
                        }

                    } else {
                        getOccupancies = _.map(rulesArr[i].rooms[roomsdata[0].id].prices, 'occupancy');

                        feedToOccRange(getOccupancies);

                        for (k = 0; k < rulesArr[i].rooms[roomsdata[0].id].prices.length; k++) {
                            for (h = 0; h < joinByDash.length; h++) {
                                if (k == h) rulesArr[i].rooms[roomsdata[0].id].prices[k].occRange = joinByDash[h];
                            }
                        }
                    }

                    while (moment(startDate).isSameOrBefore(endDate)) {
                        if (applicableDays[uiDay(day)] && activeRule && !output[moment(startDate).format('DD-MM-YYYY')]) {
                            output[moment(startDate).format('DD-MM-YYYY')] = {
                                applicable: true,
                                type: rulesArr[i].isPromo ? 'promo' : rulesArr[i].isComp ? 'competition' : 'occupancy',
                                typeLabel: rulesArr[i].isPromo ? 'Promotion Rule' : rulesArr[i].isComp ? 'Competition Rule' : 'Occupancy Rule',
                                name: $sce.trustAsHtml('<div class="tooltipRulename">' + rulesArr[i].name + '</div>'),
                                priority: rulesArr[i].priority,
                                thisRule: rulesArr[i],
                                date: moment(startDate).format('ddd, MMM D, YYYY'),
                                overridden: occOverlappingRules
                            };
                        }

                        startDate = moment(startDate).add(1, 'day');
                        day = startDate.day();
                    }
                }

                return output;
            }


            function _generateMonthStrip(year, month, ruleSet, holidays) {
                month -= 1;
                var startDate = moment([year, month]);
                var endDate = moment(startDate).endOf('month');
                var dates = _generateOffset(startDate);

                for (var i = 1; i <= parseInt(moment(endDate).format('D')); i++) {
                    var currentDate = moment([year, month, i]);

                    var holidayslist = holidays[moment(currentDate).format('YYYY-MM-DD')] != undefined ? holidays[moment(currentDate).format('YYYY-MM-DD')] : false;
                    var holidaysNameArray = [];
                    if (holidayslist) {
                        holidaysNameArray = (holidayslist.name.toString()).split(',');
                    }

                    if (ruleSet[currentDate.format('DD-MM-YYYY')]) {
                        var holidayNameList = '<ul class="holidays-list-popup hasBorderTop">';
                    } else {
                        var holidayNameList = '<ul class="holidays-list-popup">';
                    }
                    for (h in holidaysNameArray) {
                        holidayNameList += '<li>' + holidaysNameArray[h] + '</li>';
                    }
                    holidayNameList += '</ul>';

                    dates.push({
                        date: i,
                        day: currentDate.format('dd'),
                        holidaysName: holidayslist ? $sce.trustAsHtml(holidayNameList) : '',
                        holiday: holidays[moment(currentDate).format('YYYY-MM-DD')] != undefined ? holidays[moment(currentDate).format('YYYY-MM-DD')] : false,
                        hasRule: ruleSet[currentDate.format('DD-MM-YYYY')] ? ruleSet[currentDate.format('DD-MM-YYYY')].applicable : false,
                        content: ruleSet[currentDate.format('DD-MM-YYYY')] ? ruleSet[currentDate.format('DD-MM-YYYY')] : null,
                        isWeekend: moment([year, month, i]).format('dd') === 'Sa' || moment([year, month, i]).format('dd') === 'Su',
                        lineBelowRuleNameinTooltip: (holidayslist && ruleSet[currentDate.format('DD-MM-YYYY')]) ? true : false
                    });
                }

                return {
                    name: moment(startDate).format("MMM"),
                    dates: dates
                };
            }

            function _generateYear(rules, holidays) {
                var output = [];
                var date = moment();
                for (var i = 0; i <= 11; i++) {
                    output.push(_generateMonthStrip(date.year(), date.month() + 1, rules, holidays));
                    date.add(1, 'month');
                }
                return output;
            }

        });


})();
