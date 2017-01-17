(function() {
    angular.module('bookingCurveCtrl', ['chartsSettings'])
        .controller('BookingCurveController', function($scope, $filter, UIContext, BookingCurve, UserProfile, User, $sce) {

            var self = this;
            self.data = {};

            $scope.curveLabels = ['default', 'adr', 'segmented'];
            $scope.currentCurve = $scope.curveLabels[0];
            var currency_symbol = User.getHotelCurrency();
            $scope.noData = {};
            $scope.noDataProvided = {};
            self.updateCurve = function(compareWith) {
                if (UIContext.getDates().length != 1) return;
                var date = UIContext.getDates()[0];
                var hotel_id = UIContext.getHotelId();
                BookingCurve.getHistorical(date, hotel_id, compareWith).then(function(response) {
                    self.data.default = response.data;
                    self.renderCurve(self.data.default, 'default', date, compareWith);
                });
                BookingCurve.getAdr(date, hotel_id, compareWith).then(function (response) {
                    self.data.adr = response.data;
                    self.renderCurve(self.data.adr, 'adr', date, compareWith);
                });
                BookingCurve.getSegmented(date, hotel_id).then(function (response) {
                    self.data.segmented = response.data;
                    self.renderCurve(self.data.segmented, 'segmented', date);
                });
            };

            self.updateCurve(UserProfile.getCompareWith());

            $scope.$on('comparisonChanged', function (evt, compareWith, context) {
                if(context === 'historical') {
                    self.updateCurve(compareWith);    
                }                
            });

            function generateText(value) {
                var output = [];
                if (isNaN(value)) {
                    var t = value.split("_");
                    output.push(_.capitalize(t[0]) + " " + t[1]);
                    output.push("Current " + t[1]);
                } else {
                    output.push(value + " weeks ago");
                    output.push('Current week');
                }
                return output;
            }

            self.renderCurve = function(data, curve, selectedDate, compareWith) {
                self.checkData(data, curve);
                // self.setAlerts(data);
                self.plotChart('#' + curve + 'Curve', selectedDate, data, curve, compareWith);
            };

            self.checkData = function(data, curve) {
                if (curve !== 'segmented') {
                    var isEmpty = function(year) {
                        return _.every(data.data[year].values, function(d) { return d <= 0;});
                    };
                    $scope.noData[curve] = isEmpty(0) && isEmpty(1) ;
                    $scope.noDataProvided[curve] = data.data_provided ;

                } else {
                    $scope.noData[curve] = _.every(data.data.total, function (d) { return d <= 0; });
                    $scope.noDataProvided[curve] = data.data_provided;
                }
            };

            self.setAlerts = function(data) {
                if (data.meta) {
                    $scope.alerts = data.meta.variance;
                    $scope.message = data.meta;
                    $scope.better = data.meta.variance.absolute > 0;
                    $scope.worse = data.meta.variance.absolute < 0;
                }
            };

            self.reformatData = function(data, curve, compareWith) {
                var output = [];
                if(curve !== 'segmented') {
                    var name = generateText(compareWith) ;
                    _.forEach(data.data, function(value, key) {

                        value.values.unshift(name[key] + " (" +  (data.data[1]['holiday'] == null || data.data[0]['holiday'] == null? moment(value.date).format("DD MMM Y"): (moment(value.date).format("ddd")+" - " +data.data[1]['holiday']))+ ")");
                        // add 0 to historical data
                        if (curve === 'default') value.values.push(0);
                        output.push(value.values);
                    });
                } else {
                    var segs = _.omit(data.data, ['total', '']);
                    var total = _.pick(data.data, 'total');
                    _.forEach(segs, function (value, key) {
                        value.unshift(key);
                        output.push(value);
                    });
                    total.total.unshift('Total');
                    output.push(total.total);
                }
                return output;
            };


            $scope.changeCurve = function (curve) {
                $scope.currentCurve = curve;
            };

            self.plotChart = function(bindTo, date, data, curve, compareWith) {
                var obj = {
                    bindto: bindTo,
                    data: {
                        columns: self.reformatData(data, curve, compareWith),
                        order: 'asc'
                    },
                    tooltip: {
                        format: {
                            title: function(x) {
                                return moment(date).subtract(x, 'days').format("DD MMM YYYY (ddd)");
                            },
                            value: function (x) {
                                if (curve === 'adr') {
                                    return currency_symbol + $filter('number')(Math.round(x));
                                } else {
                                    return $filter('number')(Math.round(x));
                                }
                            }
                        }
                    },
                    axis: {
                        x: {
                            label: {
                                text: 'Days Before Arrival',
                                position: 'outer-right'
                            },
                            padding: {
                                left: 0
                            }
                        },
                        y: {
                            label: {
                                text: curve === 'adr' ? 'ADR' : 'Rooms Sold',
                                position: 'outer-top'
                            },
                            padding: {
                                bottom: 0
                            },
                            tick: {
                                format: function(x){
                                    if (curve === 'adr') {
                                        return currency_symbol + $filter('number')(x);
                                    } else {
                                        return $filter('number')(x);
                                    }
                                }
                            }
                        }
                    },
                    point: {
                        show: false,
                        focus: {
                            expand: {
                                enabled: true
                            }
                        }
                    }

                };
                if (curve !== 'segmented') {
                    obj.color = { pattern: ['#01BAEF', '#0B4F6C'] }
                }
                self.chart = c3.generate(obj);
            };
        });
})();
