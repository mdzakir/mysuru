(function() {
    angular.module('knights')
        .config(function($stateProvider) {
            $stateProvider
                .state('private.rules.reorder-promotion', {
                    url: '/reorder_promotion',
                    templateUrl: '/pricing-rules/reorder-promotion',
                    resolve: {
                        rules: function($http, User) {
                            return $http.get('/hotel/viewrule', {
                                params: {
                                    hotel_id: User.getHotelID()
                                }
                            }).then(function(response) {
                                return response.data.promotional_prices;
                            });
                        }
                    },
                    controller: function($scope, ngDialog, $state, rooms, rules, hotelId, $http, WalkThrough, ReorderPromotionPricingRule, UserSettings, User) {
                        hotelId = User.getHotelID();

                        $scope.$on('hotelChanged', function(evt, context) {
                            //$state.reload();
                            $state.go('.', {}, {
                                reload: 'private.rules.reorder-promotion'
                            });
                            populateRules(hotelId)
                        });

                        UserSettings.get_hotel_currency_code(User.getHotelID()).then(function (data) {
                            $scope.currency_class = data.data;
                        });

                        $scope.rulesdata = rules;
                        $scope.rooms_data = rooms.data;

                        $scope.room_map = {}
                        _.each($scope.rooms_data, function(r) {
                            $scope.room_map[r.id] = r.name
                        })

                        //Enable and disable reordering rules
                        $scope.reorderEnabled = false;
                        $scope.enableReorder = function(){
                            $scope.reorderEnabled = !$scope.reorderEnabled;
                        }

                        $scope.info_occ_reorder = WalkThrough.status('drag_rules_key');

                        $scope.closeRulesOverlay = function() {
                            WalkThrough.set('drag_rules_key', false);
                            $scope.info_occ_reorder = false;
                        }

                        $scope.populateRules = function(hotelId) {
                            $http.get('/hotel/viewrule', {
                                    params: {
                                        hotel_id: hotelId
                                    }
                                })
                                .success(function(response) {
                                    $scope.rulesdata = response.promotional_prices;
                                    $scope.config_sort(response.promotional_prices);
                                });
                        }

                        $scope.populateRules(hotelId);

                        $scope.paramsPromoRulesReorder = [];

                        $scope.config_sort = function(data) {
                            $scope.rulesdata = data;

                            var x = 0,
                                rules = $scope.rulesdata;

                            rulesEmpty = _.every(rules, function(r) {
                                return r.status == 'DELETED';
                            });

                            var rulesStatus_0_1 = _.filter(rules, function(r) {
                                return r.status == '1' || r.status == '0';
                            });

                            if ($scope.rulesdata === undefined || rulesEmpty) {
                                $scope.NoRules = true;
                                $scope.toggleButton = false;
                            } else {

                                $scope.NoRules = false;
                                
                                if(rulesStatus_0_1.length > 1 ){
                                    $scope.toggleButton = true;
                                }else{
                                    $scope.toggleButton = false;    
                                }

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
                                        };

                                        $scope.paramsPromoRulesReorder = _.map($scope.rulesdata, function(rule) {
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

                        }

                        $scope.updatePromoOrder = function() {
                            if($scope.paramsPromoRulesReorder.length !== 0){
                                ReorderPromotionPricingRule.ruleorder($scope.paramsPromoRulesReorder, function(){
                                    $state.go('.', {}, {
                                        reload: 'private.rules.reorder-promotion'
                                    });
                                });
                            }
                        };

                        $scope.cancelPromoRulesReorder = function(){
                            $scope.paramsPromoRulesReorder = [];
                            toggleRules();
                            $scope.reorderEnabled = !$scope.reorderEnabled;
                            $state.go('.', {}, {
                                reload: 'private.rules.reorder-promotion'
                            });
                        }

                        $scope.room_length = function(rule) {
                            try {
                                var firstRoom = rule.hotel_occupancies[Object.keys(rule.rooms)[0]];
                                return firstRoom.prices.length
                            }
                            catch(err) {
                            }
                        };

                        $scope.updateStatus = function(rule) {
                            var params = {
                                "hotel_id": hotelId,
                                "id": rule.local_id,
                                "rule_type": 'promo',
                                "status": rule.status
                            };
                            ReorderPromotionPricingRule.rulestatus(params, function(){
                                $state.go('.', {}, {
                                    reload: 'private.rules.reorder-promotion'
                                });
                            });
                        }

                        $scope.addDeltaAndPrice = function(price, delta){
                            return Number(price) + Number(delta);
                        }

                        //EDIT RULE
                        $scope.editRule = function(rule) {
                            $state.go('private.rules.create-promotion', {'ruleId':rule.local_id});
                        };

                        //DELETE RULE
                        $scope.deleteRule = function(rule) {
                            var params = {
                                "hotel_id": hotelId,
                                "id": rule.local_id,
                                "rule_type": 'promo',
                                "status": "DELETED"
                            }

                            ngDialog.openConfirm({
                                template: 'deleteRuleTemplate',
                                className: 'ngdialog-theme-default'
                            }).then(function() {
                                $http.post('/hotel/updatestatus/', angular.toJson(params, true)).then(function() {
                                    $state.go('.', {}, {
                                        reload: 'private.rules.reorder-promotion'
                                    });
                                });

                            }, function() {

                            });
                        };

                    }
                });
        })

})();
