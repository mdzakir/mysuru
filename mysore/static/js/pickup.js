(function() {
    angular.module('knights')
        .factory('DashboardMetrics', function($http, User, UserSettings) {
            return {
                kpiCount : function(settings_name, settings) {
                    UserSettings.setUserSettings(settings_name, settings).then(function() {
                        var config = User.getUserConfig();
                        config[settings_name] = settings;
                        User.setUserConfig(config);
                    });
                },

                getKPIs : function() {
                    var kpi_settings_default =  [{
                        "class": "occupancy"
                    }, {
                        "class": "adr"
                    }, {
                        "class": "revpar"
                    }, {
                        "class": "revenue"
                    }, {
                        "class": "no_shows"
                    }, {
                        "class": "cancelled"
                    }];
                    var config = User.getUserConfig();
                    if(config !== null && angular.isDefined(config['kpi'])) {
                       return config['kpi'];
                    } else {
                        return kpi_settings_default;                        
                    }
                 }
            };
        })
        .controller('MetricsController', function($scope, metricsData, UIContext, $filter, WalkThrough, DashboardMetrics, User) {
            $scope.pickup = metricsData;

            $scope.currency_class = User.getHotelCurrency();
            $scope.currency_iso_code = User.getCurrencyIsoCode();

            $scope.Math = window.Math;
            if ($scope.pickup.data.length === 0) {
                $scope.NoDataMessage = true;
            }

            $scope.hideForMultiDates = UIContext.getDates().length != 1 ? true : false;

            Math.log10 = Math.log10 || function(x) {
                return Math.log(x) / Math.LN10;
            };

            $scope.walk_through_kpis = WalkThrough.status('drag_kpi_key');

            $scope.closeKPIOverlay = function() {
                WalkThrough.set('drag_kpi_key', false);
                $scope.walk_through_kpis = false;
            };

            var metrics = metricsData.metrics;
            function applyDecimals(base, value){
                if(value < base) return $filter('number')(Math.round(value));
                var decimals = Math.max(0,1- Math.floor(Math.log10(value/base)));
                return $filter('number')((value/base).toFixed(decimals));
            }

            $scope.kpiValue = function(value) {
                var resKPI;
                if($scope.currency_iso_code == 'INR'){
                    if ( value >= Math.pow(10, 7) && value <= Number(Array(11).join(9)) ) {
                        resKPI = applyDecimals( Math.pow(10, 7), value );
                        return resKPI + '<span class="kpi-unit-word">Crore</span>';
                    }
                    else if (value >= Math.pow(10, 5) && value <= Number(Array(8).join(9)) ) {
                        resKPI = applyDecimals( Math.pow(10, 5), value );
                        return resKPI + '<span class="kpi-unit-word">Lakh</span>';
                    }
                    else if (value >= Math.pow(10, 3) && value <= Number(Array(7).join(9)) ) {
                        return $filter('number')(Math.round(value.toString().replace(/\.0$/, '')));
                    } else {
                        return Math.round(value.toString().replace(/\.0$/, ''));
                    }    
                } else {
                    if ( value >= Math.pow(10, 9) && value <= Number(Array(13).join(9)) ) {
                        resKPI = applyDecimals( Math.pow(10, 9), value );
                        return resKPI + '<span class="kpi-unit-word">B</span>';
                    }
                    else if (value >= Math.pow(10, 6) && value <= Number(Array(10).join(9)) ) {
                        resKPI = applyDecimals( Math.pow(10, 6), value );
                        return resKPI + '<span class="kpi-unit-word">M</span>';
                    }
                    else if (value >= Math.pow(10, 5) && value <= Number(Array(7).join(9)) ) {
                        resKPI = applyDecimals( Math.pow(10, 3), value );
                        return resKPI + '<span class="kpi-unit-word">K</span>';
                    }
                    else if (value >= Math.pow(10, 3) && value <= Number(Array(6).join(9)) ) {
                        return $filter('number')(Math.round(value.toString().replace(/\.0$/, '')));
                    } else {
                        return Math.round(value.toString().replace(/\.0$/, ''));
                    } 
                }
            };

            $scope.kpiList = [{
                "name": "Occupancy",
                "selected": false,
                "value": metrics.Occupancy * 100,
                "class": "occupancy",
                "currency_class": $scope.currency_class
            }, {
                "name": "ADR",
                "selected": false,
                "value": metrics.ADR >= 0 ? $scope.kpiValue(metrics.ADR):'NA',
                "class": "adr",
                "currency_class": metrics.ADR >= 0 ? $scope.currency_class:''

            }, {
                "name": "RevPAR",
                "selected": false,
                "value": metrics.RevPAR >= 0 ? $scope.kpiValue(metrics.RevPAR): 'NA',
                "class": "revpar",
                "currency_class": metrics.RevPAR >= 0 ? $scope.currency_class : ''
            }, {
                "name": "Revenue",
                "selected": false,
                "value": metrics.Revenue >= 0 ? $scope.kpiValue(metrics.Revenue) : 'NA',
                "class": "revenue",
                "currency_class": metrics.Revenue >=0 ? $scope.currency_class : ''
            }, {
                "name": "No Shows",
                "selected": false,
                "value": $scope.kpiValue(metrics.no_shows),
                "class": "no_shows",
                "currency_class": $scope.currency_class
            }, {
                "name": "Cancelled",
                "selected": false,
                "value": $scope.kpiValue(metrics.cancelled),
                "class": "cancelled",
                "currency_class": $scope.currency_class
            }, {
                "name": "Rooms",
                "selected": false,
                "value": $scope.kpiValue(metrics.Rooms),
                "class": "rooms_otb",
                "currency_class": $scope.currency_class
            },{ 
                "name": "Forecast",
                "selected": false,
                "value": metrics.forecast !== null ? Math.round(metrics.forecast): "-",
                "class": "rooms_forecast",
                "currency_class": $scope.currency_class
            }];

            $scope.savedKPIs = DashboardMetrics.getKPIs();

            var tempKPIs = [];

            for(var i=0;i<$scope.kpiList.length;i++){
                for(var j=0;j<$scope.savedKPIs.length;j++){
                    if($scope.kpiList[i].class == $scope.savedKPIs[j].class){
                        $scope.kpiList[i].selected = true;
                        $scope.kpiList[i].order = j;
                    }
                }
            }

            $scope.kpiList = _.sortBy($scope.kpiList, ['order']);

            $scope.kpiListOnPage = _.filter($scope.kpiList, function(k) { return k.selected; });

            //KPI Sorting on Page Load
            

            /*_.forEach($scope.kpiListOnPage, function(k) {
                delete k['order']
            });*/

            $scope.countKPIs = function() {
                var selectedKPIsCount = _.countBy($scope.kpiList, function(k) { return k.selected; });
                var selectedKPIs = _.filter($scope.kpiList, function(k) { return k.selected; });
                $scope.kpiList = _.sortBy($scope.kpiList, ['order']);
                $scope.kpiListOnPage = _.filter($scope.kpiList, function(k) { return k.selected; });

                $scope.disableKPIs = selectedKPIsCount.true >= 6;
                $scope.requireKPIs = selectedKPIsCount.true === 2;


                var kpi_settings = _.map(selectedKPIs, function (kpi) {
                    return {
                        class: kpi.class
                    };
                });

                DashboardMetrics.kpiCount('kpi', kpi_settings);
            };

            $scope.countKPIs();

            $scope.isDisabled = function (kpi) {
                return $scope.disableKPIs && !kpi.selected || $scope.requireKPIs && kpi.selected;
            };

            $scope.kpiRemove = function(kpi, index) {
                if(!$scope.requireKPIs){
                    var IndexInKPIList = _.findIndex($scope.kpiList, function(k) { return k.class == kpi.class; });
                    var IndexinkPIListOnPage = _.findIndex($scope.kpiListOnPage, function(k) { return k.class == kpi.class; });
                    $scope.kpiList[IndexInKPIList].selected = false;
                    $scope.kpiListOnPage[IndexinkPIListOnPage].selected = false;
                }
                $scope.countKPIs();
            };

            // $scope.countKPIs();

            $scope.kpiList.sort(function(a, b) {
                return a > b;
            });

            $scope.KPISortable = {
                update: function(e, ui) {
                },
                'ui-floating': true,
                stop: function(e, ui) {
                    var sorted = $scope.kpiListOnPage.map(function(i) {
                        return i.class;
                    });
                    var kpi_settings = _.map($scope.kpiListOnPage, function (kpi) {
                        return {
                            class: kpi.class
                        };
                    });
                    DashboardMetrics.kpiCount('kpi', kpi_settings);
                }
            };

            $scope.dynamic = 2;
            $scope.max = 100;

        })
        .factory('Metrics', function($http) {
            return {
                get: function(dates, hotelId) {
                    var params = {
                        hotel_id: hotelId,
                        date: _.map(dates, function(date) {
                            return moment(date).format('YYYY-MM-DD');
                        }),
                        days: [1, 7, 14, 30]
                    };
                    return $http.post('/hotel/pickup', params)
                        .then(function(response) {
                            return response.data;
                        });
                },
                getForMonth: function(month, year, hotelId) {
                    var params = {
                        hotel_id: hotelId,
                        month: month,
                        year: year
                    };
                    return $http.post('/hotel/pickup', params)
                        .then(function(response) {
                            return response.data;
                        });
                }
            };
        });
})();
