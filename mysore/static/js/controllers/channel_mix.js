(function () {
    angular.module('knights')
        .controller('channelMix', function($scope, UIContext, SegmentChart, User, $filter, $sce){
            var self = this;
            var previous_date, previous_date_label, current_date, current_date_label, categories;

            $scope.metricLabels = ['rooms', 'adr', 'revpar', 'revenue'];
            $scope.currentMetric = $scope.metricLabels[0];
            var currency_symbol = $sce.trustAsHtml(User.getHotelCurrency());

            $scope.changeMetric = function (met) {
                $scope.currentMetric = met;
                self.redrawChart();
            };

            self.reformatData = function (data, metric) {
                if(!angular.isDefined(self.compareWith)) {
                    self.compareWith = 'last_year';
                }

                var name = generateText(self.compareWith);
                var holiday = data.meta.holiday != null && self.compareWith == 'last_year'? data.meta.holiday : null;
                previous_date = moment(data.meta.previous_dates[0]).format("DD MMM Y");
                previous_date_label = name[0] + " (" + (holiday==null? previous_date : (moment(previous_date).format("ddd")+" - " + holiday)) + ")" ;
                current_date = moment(data.meta.current_dates[0]).format("DD MMM Y");
                current_date_label = name[1] + " (" + (holiday==null? current_date : (moment(current_date).format("ddd")+" - " + holiday))+ ")";

                values = data.data;

                if(!angular.isDefined(values['renamed'])) {
                    for(var stat in values) {
                        stat = values[stat];
                        stat['data'][previous_date_label] = stat['data']['previous'];
                        delete stat['data']['previous'];
                        stat['data'][current_date_label] = stat['data']['current'];
                        delete stat['data']['current'];
                    }
                }

                values['renamed'] = true;

                if (data.data[metric].alerts) {
                    $scope.alerts = data.data[metric].alerts;
                    $scope.overallVariance = $scope.alerts[0];

                    $scope.better = $scope.overallVariance.condition == 'higher';
                    $scope.worse = !$scope.better;
                }

                var dataSet = data.data[metric].data;

                self.categories = data.data[metric].categories;
                categories = self.categories;
                var yearSet = [];

                for (var year in dataSet) {
                    var dataSetCopy = dataSet[year].slice();
                    dataSetCopy.unshift(year);
                    yearSet.push(dataSetCopy);
                }
                return yearSet;
            };

            self.plotChart = function (bindTo,  data) {
                self.chart = c3.generate({
                    bindto: bindTo,
                    data: {
                        columns: self.reformatData(data, $scope.currentMetric),
                        type: 'bar'
                    },
                    color: {
                        pattern: ['#01BAEF', '#0B4F6C']
                    },
                    tooltip: {
                        format: {
                            value: function (x) {
                                if ($scope.currentMetric === 'rooms') {
                                    return $filter('number')(x, 0);
                                } else {
                                    return currency_symbol +  $filter('number')(x, 0);
                                }
                            }
                        }
                    },
                    axis: {
                        x: {
                            type: 'category',
                            categories: categories,
                            tick: {
                                multiline: true
                            },
                            height: 60
                        },
                        y: {
                            padding: {
                                bottom: 0
                            },
                            tick: {
                                format: function(x){
                                    if ($scope.currentMetric === 'rooms') {
                                        return $filter('number')(x, 0);
                                    } else {
                                        return currency_symbol +  $filter('number')(x, 0);
                                    }
                                }
                            }
                        }
                    }
                });
            };

            self.generateDates = function (today, length) {
                var output = [];
                for (var i = 0; i < length; i++) {
                    output.push(moment(today).add(i, 'days'));
                }
                output.unshift('x');
                return output;
            };

            self.checkData = function(data) {
                // Here we are checking only rooms data, if this is
                // empty rest other tabs would have no data
                var isEmpty = function(year) {
                    return _.every(data.data.rooms.data[year], function (d) { return d <= 0; });
                };
                $scope.noData = isEmpty('current') && isEmpty('previous');
                $scope.noDataProvided = data.data_provided;
                
            };

            self.updateCurve = function (dates, compareWith) {
                SegmentChart.getMix(dates, UIContext.getHotelId(), compareWith)
                    .then(function (response) {
                        self.compareWith = compareWith;
                        self.data = response.data;
                        self.checkData(self.data);
                        self.plotChart('#channel-mix', self.data);
                    });
            };

            self.redrawChart = function () {
                self.chart.load({
                    columns: self.reformatData(self.data, $scope.currentMetric),
                    categories: self.categories
                });
            };

            self.updateCurve(UIContext.getDates());

            $scope.$on('comparisonChanged', function (evt, compareWith, context) {
                if(context == 'channel_mix') {
                    self.updateCurve(UIContext.getDates(), compareWith);
                }
            });

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
})();

