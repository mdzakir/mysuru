(function () {
    angular.module('priceChartCtrl', [])
        .controller('priceChartController', ['$scope', 'PriceCurve', 'UIContext', 'User', '$http', '$filter',
            function ($scope, PriceCurve, UIContext, User, $http, $filter) {
                var self = this;
                $scope.options = ['default', 'competitors'];
                $scope.currentOption = $scope.options[0];
                $scope.changeOption = function (option) {
                    $scope.currentOption = option;
                    self.redrawChart(option);
                };
                currency_symbol = User.getHotelCurrency();

                self.getPriceData = function () {
                    if(UIContext.getDates().length != 1) return;
                    var date = UIContext.getFirstDay();
                    PriceCurve.get(date, UIContext.getHotelId())
                        .then(function (response) {
                            self.data = response.data;
                            self.renderPriceCurve(self.data, $scope, date, $scope.currentOption);
                        });
                };

                $scope.loading = true;
                self.getPriceData();

                self.renderPriceCurve = function (data, $scope, date, option) {
                    if (data) {
                        $scope.loading = false;
                    }
                    self.checkData(data);
                    self.setAlerts(data);
                    self.reformatData(data, date, option);
                    self.plotChart('#priceChart', data, date, self.getMyHotel(data), option);

                };

                self.checkData = function (data) {
                    $scope.noData = data.data.rateplans.length === 0;
                };

                self.generateDates = function (today, length) {
                    var output = [];
                    for (var i = 0; i < length; i++) {
                        output.push(moment(today).add(i, 'days'));
                    }
                    output.unshift('x');
                    return output;
                };

                self.reformatData = function (data, date, option) {
                    var dataSet = _.sortBy(data.data.rateplans, function (o) {
                        return o.check_in;
                    });
                    dataSet = _.groupBy(dataSet, 'hotel_name');
                    var groupSet = [];
                    for (var hotel in dataSet) {
                        var hotelSet = _.map(dataSet[hotel], 'total');
                        hotelSet.unshift(hotel);
                        groupSet.push(hotelSet);
                    }

                    if(groupSet[0][0] === 'Compset Average'){
                       $scope.noData = true; 
                    } else {
                        groupSet[0][0] = 'My Hotel';

                        if (option === 'competitors') {
                            groupSet.splice(1,1);
                            groupSet.push(self.generateDates(date, moment(date).daysInMonth()));
                            return groupSet;
                        } else if (option === 'default') {
                            var group = _.take(groupSet, 2);
                            group.push(self.generateDates(date, moment(date).daysInMonth()));
                            return group;
                        }

                    }
                };

                function getHeads(data) {
                    var output = [];
                    _(data).forEach(function(value){
                        output.push(value[0]);
                    });
                    return output;
                }

                self.redrawChart = function (option) {
                    var data = self.reformatData(self.data, UIContext.getFirstDay(), option);
                    var removeData = getHeads(self.prevData);
                    self.chart.load({
                        columns: data,
                        unload: removeData
                    });
                    self.prevData = data;
                };

                self.plotChart = function (bindto, data, date, myHotel, option) {
                    var formattedData = self.reformatData(data, date, option);
                    self.prevData = formattedData;
                    self.chart = c3.generate({
                        bindto: bindto,
                        data: {
                            x: 'x',
                            xFormat: '%Y',
                            columns: formattedData,
                            order: 'asc',
                            type: 'spline',
                            types: {
                                "Compset Average": 'area'
                            }
                        },

                        color: {
                            // pattern: ['#1f77b4', '#2ca02c', '#e377c2', '#7f7f7f', '#bcbd22', '#d62728', '#9467bd',  '#8c564b', '#ff7f0e', '#17becf']
                            pattern: ['#0B4F6C', '#01BAEF', '#d35400', '#2980b9', '#27ae60', '#f1c40f', '#8e44ad', '#35C1A6', '#c0392b', '#f39c12', '#2c3e50']
                        },
                        tooltip: {
                            contents: function (d, titleFormat, valueFormat, color) {
                                var checkin = moment(d[0].x).format("YYYYMMDD");
                                var variance = self.getItem(checkin, myHotel, 'variance', data);

                                var output = '<table class="c3-tooltip"><tbody><tr><th colspan="2">';
                                output += moment(date).add(d[0].index, 'days').format("DD MMM YYYY (ddd)") + '</th></tr>';
                                for (var i = 0; i < d.length; i++) {
                                    //  My Hotels price
                                    if (d[i].name == myHotel) {
                                        // Indicate sold out rates
                                        if (self.getItem(checkin, myHotel, 'sold_out', data)) {
                                            output += '<tr><td class="name">';
                                            output += '<span style="background-color:' + color(d[i].name) + '"></span>' + d[i].name + '</td>';
                                            output += '<td class="value">' + "NA" + '</td></tr>';
                                        } else {
                                            // Show with variance
                                            if (variance !== undefined) {
                                                output += '<tr height="40"><td class="name">';
                                                output += '<span style="background-color:' + color(d[i].name) + '"></span>' + d[i].name + '</td>';
                                                output += '<td class="value">' + currency_symbol + $filter('number')(d[i].value, 0) + '<br>';
                                                output += '<span class="absolute" style="color:' + self.getColor(variance.absolute) + '">';
                                                output += '(' + self.toPer(variance.percentage) + ') ' + self.toVal(variance.absolute) + '</span>';
                                                output += ' <span class="variance-text">' + self.getLevel(variance.percentage) + ' comp avg</span></td></tr>';
                                            } else {
                                                // without variance
                                                output += '<tr><td class="name">';
                                                output += '<span style="background-color:' + color(d[i].name) + '"></span>' + d[i].name + '</td>';
                                                output += '<td class="value">' + currency_symbol + $filter('number')(d[i].value, 0) + '</td></tr>';
                                            }
                                        }
                                    // Competitors prices
                                    } else {
                                        output += '<tr><td class="name">';
                                        output += '<span style="background-color:' + color(d[i].name) + '"></span>' + d[i].name + '</td>';
                                        // Handle sold outs
                                        if (self.getItem(checkin, d[i].name, 'sold_out', data)) {
                                            output += '<td class="value">' + "NA" + '</td></tr>';
                                        // Print the prices
                                        } else {
                                            output += '<td class="value">' + currency_symbol + $filter('number')(d[i].value, 0) + '</td></tr>';
                                        }
                                    }
                                }
                                return output + "</tbody></table>";
                            }
                        },
                        axis: {
                            x: {
                                type: 'timeseries',
                                localtime: false,
                                tick: {
                                    culling: {
                                        max: 5
                                    },
                                    format: '%d-%m'
                                },
                                label: {
                                    text: 'Dates',
                                    position: 'outer-right'
                                }
                            },
                            y: {
                                tick: {
                                    format: function(x){ 
                                        return currency_symbol + $filter('number')(x, 0); 
                                    }
                                },
                                label: {
                                    text: 'Prices',
                                    position: 'outer-top'
                                }
                            }
                        }

                    });
                };

                self.setAlerts = function (data) {
                    $scope.alerts = data.data.alerts[0];
                    $scope.better = $scope.alerts.condition == 'higher';
                    $scope.worse = !$scope.better;
                };

                $scope.getLevel = function (condition) {
                    if (condition == 'higher') {
                        return 'above';
                    } else if (condition == 'lower') {
                        return 'below';
                    }
                };

                self.getItem = function (checkin, id, item, data) {
                    var obj = _.find(data.data.rateplans, {
                        'check_in': checkin,
                        'hotel_name': id
                    });
                    if (obj && obj[item]) {
                        return obj[item];
                    }
                };

                self.getMyHotel = function (data) {
                    var obj = _.find(data.data.rateplans, 'variance');
                    if (obj) {
                        return obj.hotel_name;
                    }
                };

                self.toPer = function (num) {
                    return Math.abs(Math.round(num * 100)) + '%';
                };

                self.getColor = function (num) {
                    if ((num * 100) <= 0) {
                        return 'red';
                    } else {
                        return 'green';
                    }
                };

                self.getLevel = function (num) {
                    if ((num * 100) <= 0) {
                        return 'below';
                    } else {
                        return 'above';
                    }
                };

                self.toVal = function (num) {
                    if ((num * 100) > 0) {
                        return '+' + Math.round(num).toLocaleString();
                    } else {
                        return Math.round(num).toLocaleString();
                    }
                };
            }]);

}) ();