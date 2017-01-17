(function () {
    angular.module('segChartCtrl', [])
        .controller('segChartController', function ($scope, SegmentChart, UIContext, User, $filter) {

            var self = this;
            var currency_symbol = User.getHotelCurrency();

            self.getSegments = function(compareWith) {
                SegmentChart.get(UIContext.getDates(), UIContext.getHotelId(), compareWith)
                    .then(function (response) {
                        self.compareWith = compareWith;
                        self.data = response.data;
                        self.renderSegChart(response.data, $scope);
                    });
            };

            self.getSegments();

            $scope.$on('comparisonChanged', function (evt, compareWith, context) {
                if(context == 'segmentation') {
                    self.getSegments(compareWith);
                }
            });

            self.scopeInit = function (data) {
                // waiting for the server to response in order
                // $scope.metricLabels = Object.keys(data.data);
                $scope.metricLabels = ['rooms', 'adr', 'revpar', 'revenue'];
                $scope.currentMetric = $scope.metricLabels[0];
                $scope.currentSegment = 'Summary';

                $scope.changeMetric = function (met) {
                    $scope.currentMetric = met;
                    $scope.redrawChart($scope.currentSegment);
                };

                $scope.isBetter = function (val) {
                    return val > 0;
                };

                $scope.isWorse = function (val) {
                    return val <= 0;
                };

                $scope.incOrDec = function (val) {
                    if (val <= 0) {
                        return "decreased";
                    } else {
                        return "increased";
                    }
                };
            };

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

            self.reformatData = function (data, metric, segment) {
                if(!angular.isDefined(self.compareWith)) {
                    self.compareWith = 'last_year';
                }

                var name = generateText(self.compareWith);
                var holiday = data.meta.holiday != null && self.compareWith=='last_year'? data.meta.holiday : null;

                previous_date = moment(data.meta['previous_dates'][0]).format("DD MMM Y");
                previous_data_label = name[0] + " (" + (holiday==null?previous_date: (moment(previous_date).format("ddd")+" - " + holiday))+ ")";

                current_date = moment(data.meta['current_dates'][0]).format("DD MMM Y");
                current_date_label = name[1] + " (" + (holiday==null? current_date : (moment(current_date).format("ddd")+" - " + holiday))+ ")";

                values = data.data;

                if(!angular.isDefined(values['renamed'])) {
                    for(var stat in values) {
                        stat = values[stat];
                        for(var key in stat) {
                            stat[key]['data'][previous_data_label] = stat[key]['data']['previous'];
                            delete stat[key]['data']['previous'];
                            stat[key]['data'][current_date_label] = stat[key]['data']['current'];
                            delete stat[key]['data']['current'];
                        }
                    }
                }

                values['renamed'] = true;

                if (data.data[metric][segment].alerts) {
                    $scope.alerts = data.data[metric][segment].alerts;
                    $scope.overallVariance = $scope.alerts[0];

                    $scope.better = $scope.overallVariance.condition == 'higher';
                    $scope.worse = !$scope.better;
                }

                var dataSet = data.data[metric][segment].data;
                self.categories = data.data[metric][segment].categories;
                var yearSet = [];

                for (var year in dataSet) {
                    var dataSetCopy = dataSet[year].slice();
                    dataSetCopy.unshift(year);
                    yearSet.push(dataSetCopy);
                }
                return yearSet;
            };
            
            self.checkData = function(data) {
                // Here we are checking only rooms data, if this is
                // empty rest other tabs would have no data
                var keys = Object.keys(data.data.rooms.Summary.data);
                var isEmpty = function(year) {
                    return _.every(data.data.rooms.Summary.data[year], function (d) { return d <= 0; });
                };
                $scope.noData = isEmpty(keys[0]) && isEmpty(keys[1]);

                var noDataProvided = data.data.data_provided;
                $scope.noDataProvided = noDataProvided;
            };

            self.renderSegChart = function (data, $scope) {

                self.checkData(data, '2016');
                self.scopeInit(data);
                self.categories = data.meta.segments;
                self.plotChart('#segChart', data, self.categories);
            };

            $scope.redrawChart = function (segment) {
                self.chart.load({
                    columns: self.reformatData(self.data, $scope.currentMetric, segment),
                    categories: self.categories
                });
            };

            self.plotChart = function(bindto, data, categories) {
               self.chart = c3.generate({
                    bindto: bindto,
                    data: {
                        columns: self.reformatData(data, $scope.currentMetric, $scope.currentSegment),
                        type: 'bar'
                    },
                    color: {
                        pattern: ['#01BAEF', '#0B4F6C']
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
                    }

                });
            };

        });

})();

