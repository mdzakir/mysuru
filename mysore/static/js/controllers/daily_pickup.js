(function () {
    angular.module('knights')
        .controller('dailyPickup', function ($scope, UIContext ,BookingCurve) {
            var self = this;
            var date = UIContext.getDates()[0];
            var month = [date.getFullYear(), date.getMonth()];

            $scope.options = [
                { name: '1 Day', value: '1_day_pickup'},
                { name: '7 Day', value: '7_day_pickup'},
                { name: '14 Day', value: '14_day_pickup'},
                { name: '30 Day', value: '30_day_pickup'}
            ];

            $scope.changeOption = function (option) {
                $scope.currentOption = option;
                redrawChart(option);
            };

            self.updateCurve = function (date) {
                BookingCurve.getPickup(UIContext.getHotelId(), date.getMonth(), date.getFullYear())
                    .then(function (response) {
                        reformatData(response.data);
                        self.plotChart('#daily-pickup');
                    });
            };

            self.plotChart = function (bindTo) {
               self.chart = c3.generate({
                    bindto: bindTo,
                    data: {
                        x: 'x',
                        // xFormat: '%Y',
                        columns: $scope.currentOption.data,
                        type: 'bar'
                    },
                    tooltip: {
                        format: {
                            title: function (x) {
                                return moment(x - 1).format("DD MMM YYYY (ddd)");
                            }
                        }
                    },
                    color: {
                        pattern: ['#0B4F6C']
                    },
                    axis: {
                        x: {
                            type: 'timeseries',
                            localtime: false,
                            tick: {
                                format: '%d-%m'
                            },
                            label: {
                                text: 'Dates',
                                position: 'outer-right'
                            }
                        },
                        y: {
                            label: {
                                text: 'Rooms',
                                position: 'outer-top'
                            },
                            padding: {
                                bottom: 0
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
                    },
                    legend: {
                        show: false,
                        item: {
                            onclick: function () { return true; }
                        }
                    }
                });
            };

            self.checkData = function (data) {
                $scope.noData = (_.without(data[0], null)).length === 1;
            };

            function generateDates(today, length) {
                var output = [];
                for (var i = 1; i < length; i++) {
                    output.push(moment(today).add(i, 'days'));
                }
                output.unshift('x');
                return output;
            }

            function reformatData(data) {
                var dates = generateDates(month, moment(month).daysInMonth() + 1);
                var set;

                _($scope.options).forEach(function (option) {
                    set = data[option.value];
                    set.unshift('Rooms');
                    option.data = [set, dates];
                });

                $scope.currentOption = $scope.options[0];
                self.checkData($scope.currentOption.data);
            }

            function redrawChart (option) {
                $scope.currentOption = option;
                self.checkData($scope.currentOption.data);
                self.chart.load({
                    columns: $scope.currentOption.data
                });
            }

            self.updateCurve(date);
        })
})();