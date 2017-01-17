(function() {
    angular.module('knights')
        .config(function($stateProvider) {
            $stateProvider
                .state('private.rules.reorder-occupancy', {
                    url: '/reorder_occupancy',
                    templateUrl: '/pricing-rules/reorder-occupancy',
                    resolve: {
                        hotelId: function(UIContext) {
                            return UIContext.getHotelId();
                        },
                        rules: function($http, hotelId) {
                            return $http.get('/hotel/viewrule', {
                                params: {
                                    hotel_id: hotelId
                                }
                            }).then(function(response) {
                                return response.data.occupancy_prices;
                            });
                        },
                        rooms: function($http, hotelId) {
                            return $http.get('/hotel/viewrooms?hotel_id=' + hotelId);
                        }
                    },
                    controller: 'reorderPricingRule'
                });
        })
        .controller('reorderPricingRule', function($scope, ngDialog, $state, rooms, UserSettings, User, rules, hotelId, $http, WalkThrough, ReorderOccupancyPricingRule) {
            $scope.$on('hotelChanged', function(evt, context) {
                $state.go('.', {}, {
                    reload: 'private.rules.reorder-occupancy'
                });
                $scope.populateRules(hotelId);
            });

            // SET CURRENCY CLASS
            UserSettings.get_hotel_currency_code(User.getHotelID()).then(function(data) {
                $scope.currency_class = data.data;
            });

            $scope.rulesdata = rules;
            $scope.rooms_data = rooms.data;

            $scope.base_room = _.filter($scope.rooms_data, {'is_base': true});

            $scope.base_room_order = $scope.base_room[0].id;

            //Enable and disable reordering rules
            $scope.reorderEnabled = false;
            $scope.enableReorder = function(){
                $scope.reorderEnabled = !$scope.reorderEnabled;
            };

            $scope.info_occ_reorder = WalkThrough.status('drag_rules_key');

            $scope.closeRulesOverlay = function() {
                WalkThrough.set('drag_rules_key', false);
                $scope.info_occ_reorder = false;
            };

            $scope.populateRules = function(hotelId) {
                $http
                    .get('/hotel/viewrule', { params: {hotel_id: hotelId} })
                    .success(function(response) {
                        $scope.rulesdata = response.occupancy_prices;
                        $scope.config_sort(response.occupancy_prices);
                    });
            };

            $scope.populateRules(hotelId);

            $scope.paramsOccRulesReorder = [];

            $scope.config_sort = function(data) {
                $scope.rulesdata = data;

                var x = 0;

                var rulesEmpty = _.every($scope.rulesdata, function(r) {
                    return r.status == 'DELETED';
                });

                var rulesStatus_0_1 = _.filter($scope.rulesdata, function(r) {
                    return r.status == '1' || r.status == '0';
                });

                if ($scope.rulesdata === undefined || rulesEmpty) {
                    $scope.NoRules = true;
                    $scope.toggleButton = false;
                } else {

                    $scope.NoRules = false;

                    $scope.toggleButton = rulesStatus_0_1.length > 1 ? true : false;

                    $scope.rulesdata.sort(function(a, b) {
                        return a.i > b.i;
                    });
                    $scope.sortableOptions = {
                        handle: '> .lr-header > .myHandle',
                        update: function(e, ui) {
                        },
                        axis: 'y',
                        stop: function(e, ui) {

                            var noOfRules = $scope.rulesdata.length;
                            for (var index in $scope.rulesdata) {
                                $scope.rulesdata[index].i = noOfRules;
                                noOfRules--;
                            }

                            $scope.paramsOccRulesReorder = _.map($scope.rulesdata, function(rule) {
                                return {
                                    "id": rule.local_id,
                                    "name":rule.name,
                                    "status":rule.status,
                                    "priority": rule.i,
                                    "hotel_id": hotelId
                                };
                            });
                        }
                    };
                }

            };

            $scope.updateOccOrder = function() {
                if($scope.paramsOccRulesReorder.length !== 0){
                    ReorderOccupancyPricingRule.ruleorder($scope.paramsOccRulesReorder, function(){
                        $state.go('.', {}, {
                            reload: 'private.rules.reorder-occupancy'
                        });
                    });
                }
            };

            $scope.cancelOccRulesReorder = function(){
                $scope.paramsOccRulesReorder = [];
                toggleRules();
                $scope.reorderEnabled = !$scope.reorderEnabled;
                $state.go('.', {}, {
                    reload: 'private.rules.reorder-occupancy'
                });
            };

            $scope.updateStatus = function(rule) {
                var params = {
                    "hotel_id": hotelId,
                    "id": rule.local_id,
                    "rule_type": 'occu',
                    "status": rule.status
                };

                ReorderOccupancyPricingRule.rulestatus(params, function(){
                    $state.go('.', {}, {
                        reload: 'private.rules.reorder-occupancy'
                    });
                });
            };

            $scope.addDeltaAndPrice = function(price, delta){
                return Number(price) + Number(delta);
            }

            //EDIT RULE
            $scope.editRule = function(rule) {
                $state.go('private.rules.create', { 'ruleId': rule.local_id });
            };

            //DELETE RULE
            $scope.deleteRule = function(rule) {
                var params = {
                    "hotel_id": hotelId,
                    "id": rule.local_id,
                    "status": "DELETED"
                };

                ngDialog.openConfirm({
                    template: 'deleteRuleTemplate',
                    className: 'ngdialog-theme-default'
                }).then(function() {
                        
                    ReorderOccupancyPricingRule.del(params, function(){
                        $state.go('.', {}, {
                            reload: 'private.rules.reorder-occupancy'
                        });
                    });

                });
            };

        });

})();
