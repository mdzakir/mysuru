(function () {
    var app = angular.module('knights');

    var weekdays = [
        {day: 'Su', isWeekend: true},
        {day: 'Mo', isWeekend: false},
        {day: 'Tu', isWeekend: false},
        {day: 'We', isWeekend: false},
        {day: 'Th', isWeekend: false},
        {day: 'Fr', isWeekend: false},
        {day: 'Sa', isWeekend: false}
    ];

    var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    app.controller('MonthStrip', function ($scope, $rootScope, UIContext,HolidayList) {

        var self = this;

        var currDates ;
        var currDate ;

        function updateCurrentDates(dates) {
            currDates = dates;
            currDate = dates[0];
        }

        $scope.holidayList = null
        self.render = function(dates) {

            updateCurrentDates(dates);
            highlightSelectedDates(dates);
            dates = _.map(dates, function (dt) {
                dt = new Date(dt);
                dt.setHours(0, 0, 0, 0);
                return dt
            });

            if(dates.length>1){
                $rootScope.multipleDates = true;
            }

            if(dates.length == 1){
                $scope.singleDate = dates;
                $scope.singleDateHolidayFormat = moment($scope.singleDate[0]).format("YYYY-MM-DD").toString();
                $scope.firstHolidayforSelectedDate = $scope.holidayList != null && $scope.holidayList[$scope.singleDateHolidayFormat] != null ? $scope.holidayList[$scope.singleDateHolidayFormat].name.split(',')[0]:"";
            }
            //if(dates.length == 1){
                updateDays(dates);
            //}

            UIContext.changeDates(dates);
        };

        self.render(UIContext.getDates());

        var chosenYear = currDate.getFullYear();

        $scope.status = {isopen: false};
        $scope.metricsdd = {isopen: false};
        

        $scope.chosenYear = function () {
            return chosenYear;
        };
        $scope.currYear = function () {
            return currDate.getFullYear();
        };
        $scope.currDay = function () {
            return currDate.getDate()
        };
        $scope.currMonth = function () {
            return monthNames[currDate.getMonth()];
        };

        $scope.addYear = function () {
            chosenYear++;
        };

        $scope.subtractYear = function () {
            chosenYear--;
        };

        $scope.selToday = function () {
            self.render([new Date()]);
            var today = new Date();
            var monthIndex = today.getMonth();
            highlightSelectedMonth(monthIndex);
        };

        $scope.datesSelected = function (dts) {
            $rootScope.multipleDates = false;
            self.render(dts);
        };

        $scope.months = _.map(_.range(0, 12), function (i) {
            return {
                index: i,
                name: monthNames[i],
                isCurrent: currDate.getMonth() == i
            }
        });

        $scope.changeMonth = function (month) {
            highlightSelectedMonth(month.index);
            newDate = dateForSelectedYearMonth(currDate, month.index, chosenYear);
            updateCurrentDates([newDate]);
            self.render([currDate]);
            UIContext.changeDates([currDate]);
            $scope.status.isopen = !$scope.status.isopen;

            $scope.metrics = $scope.metrics || [];
            $scope.metrics.length=0;
        };


        function highlightSelectedMonth(index) {
            _.forEach($scope.months, function (month) {
                month.isCurrent = month.index == index;
            })
        }

        function dateForSelectedYearMonth(dt, month, year) {
            var newLastDay = daysInMonth(year, month);
            var newDay = Math.min(newLastDay, dt.getDate());
            return new Date(year, month, newDay)
        }

        function updateDays(selectedDates) {
            var date = selectedDates[0];
            var year = date.getFullYear();
            var month = date.getMonth();
            var numDays = daysInMonth(year, month);
            var dates = _.map(_.range(1, numDays + 1), function (d) {
                return new Date(year, month, d);
            });
            HolidayList.getHoliday(dates).then(function(holiday){
                $scope.holidayList = holiday;

                $scope.daysOfMonth = _.map(dates, function (dt) {
                    var today = new Date();
                    today.setHours(0, 0, 0, 0);
                    var currentUIDate = moment(dt).format("YYYY-MM-DD").toString()
                    return {
                        wk: weekdays[dt.getDay()].day,
                        weekend: weekdays[dt.getDay()].isWeekend,
                        day: dt.getDate(),
                        date: dt,
                        isToday: dt.getTime() == today.getTime(),
                        holiday: $scope.holidayList != null && $scope.holidayList[currentUIDate] ? $scope.holidayList[currentUIDate].name:'',
                        isSelected: _.some(selectedDates, function (d) {
                            return d.getTime() == dt.getTime();
                        })
                    };
                });

                getCurrentMonthWeeks(year, month);
            });

            

        }


        function highlightSelectedDates(dts) {
            _.forEach($scope.daysOfMonth, function (rec) {
                rec.isSelected = _.some(dts, function(dt) {return dt.getTime() == rec.date.getTime(); });
            });
        }


        /** Start For Multiple Dates Selection **/

        //POPULATE WEEKS

        // This function turns first day of the week
        // from sunday (default) to monday
        function mondayBased(defaultDay) {
            return  (defaultDay + 6) % 7;
        }

        function getCurrentMonthWeeks(year,month) {

            var emptyCells = [];
            var defaultDay = (new Date(year, month, 1)).getDay();
            var dayIndex = mondayBased(defaultDay);
            while (dayIndex > 0) {
                emptyCells.push(' ');
                dayIndex--;
            }

            var st = 0, end = 7;
            var weekDays = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

            $scope.weeks = _.map(weekDays, function (label) {
                return {label: label, checked: false}
            });

            if(emptyCells){
                $scope.paddedDaysOfMonth = emptyCells.concat($scope.daysOfMonth);
            } else {
                $scope.paddedDaysOfMonth = $scope.daysOfMonth;
            }

            $scope.weekNum = [];

            for (var i = 0; i <= (Math.ceil($scope.paddedDaysOfMonth.length / 7) - 1); i++) {
                $scope.weekNum[i] = $scope.paddedDaysOfMonth.slice(st, end);
                st = st + 7;
                end = end + 7;
            }
        }

        //getCurrentMonthWeeks();

        $scope.mdpstatus = {
            isopen: false
        }

        // Full Week Selection

        $scope.disableApply = true;

        $scope.wkSelection = function () {

            $scope.disableWkDay = false;
            $scope.disableApply = true;

            angular.forEach($scope.weekNum, function (rangeOfDates) {

                if (rangeOfDates.selected) {
                    $scope.disableWkDay = true;
                    $scope.disableApply = false;
                }

                rangeOfDates.forEach(function (rangeOfDate) {
                    return rangeOfDate.isMultiSelected = rangeOfDates.selected ? true : false;
                });
            });
        };

        // Week Days Selection
        $scope.wkDaySelection = function () {

            $scope.disableWeekRow = false;
            $scope.disableApply = true;

            angular.forEach($scope.weeks, function (wkDay, index) {
                var selected = wkDay.selected;
                if (selected) {
                    $scope.disableWeekRow = true;
                    $scope.disableApply = false;
                }
                var sameDaysOfWeek = _.map($scope.weekNum, function (week) {
                    return week[index];
                });

                angular.forEach(sameDaysOfWeek, function (day) {
                    if (day) {
                        day.isMultiSelected = selected ? true : false;
                    }
                });
            });

        };

        $scope.applyMultipleDates = function () {

            $rootScope.multipleDates = true;

            $scope.weekNumCopy = angular.copy($scope.weekNum);

            var dateRangeSelection = [];
            $scope.weekNumCopy.forEach(function (wkN) {
                dateRangeSelection.push.apply(dateRangeSelection, wkN);
            });

            var selectedValues = _.filter(dateRangeSelection, function (dateRange) {
                return dateRange.isMultiSelected;
            });


            var selectedDates = _.map(selectedValues, function (obj) {
                return obj.date;
            });
            $scope.mdpstatus.isopen = !$scope.mdpstatus.isopen;
            self.render(selectedDates);

            $scope.singleDate = $scope.singleDate;

        };

        function CancelAndResetMultiDates() {

            $scope.disableWeekRow = false;

            angular.forEach($scope.weeks, function (wkDay, index) {
                var selected = wkDay.selected = false;
                if (selected) {
                    $scope.disableWeekRow = true;
                }
                var sameDaysOfWeek = _.map($scope.weekNum, function (week) {
                    return week[index];
                });
                angular.forEach(sameDaysOfWeek, function (day) {
                    if (day) {
                        day.isSelected = selected;
                    }
                });
            });

            $scope.disableWkDay = false;
            angular.forEach($scope.weekNum, function (rangeOfDates) {
                var selected = rangeOfDates.selected = false;
                if (rangeOfDates.selected) {
                    rangeOfDates.forEach(function (rangeOfDate) {
                        return rangeOfDate.isSelected = true;
                    });
                    $scope.disableWkDay = true;
                } else {
                    rangeOfDates.forEach(function (rangeOfDate) {
                        return rangeOfDate.isSelected = false;
                    });
                }
            });

            var todayDate = new Date().setHours(0, 0, 0, 0);

            if($scope.singleDate){
                $scope.singleDateTime0 = ($scope.singleDate[0]).setHours(0, 0, 0, 0);
            } else {
                $scope.selToday();
            }

            if ($scope.singleDateTime0 == todayDate) {
                $scope.selToday();
            } else {
                $scope.datesSelected($scope.singleDate);
            }

            $rootScope.multipleDates = false;
        }

        $scope.resetMultiDates = function () {
            CancelAndResetMultiDates();
        };

        $scope.cancelMultiDates = function () {
            CancelAndResetMultiDates();
            $scope.mdpstatus.isopen = false;
        };


        /** End Start For Multiple Dates Selection **/

    });

    app.controller('MonthMetricsController', function ($scope, UIContext, MonthMetrics,$filter) {

        $scope.currDates = UIContext.getDates();
        $scope.currHotelId = UIContext.getHotelId();
        $scope.currDate = $scope.currDates[0];

        $scope.metricsName = ['Occupancy', 'ADR', 'RevPAR', 'Revenue', 'Rooms (OTB)', 'Rooms (Forecast)'];
        $scope.currentMetric = $scope.metricsName[0];

        $scope.changeMetric = function (met) {
            $scope.currentMetric = met;
            updateMetric($scope.currHotelId, $scope.currDate, $scope.currentMetric);
        };

        //$scope.changeMetric('Occupancy');

        updateMetric($scope.currHotelId, $scope.currDate, $scope.currentMetric);

        $scope.$on('contextChanged', function (event, context) {
            var newHotelId = context.getHotelId();
            var newDates = context.getDates();
            if (shouldUpdate(newHotelId, newDates[0], $scope.currDate)) {
                updateMetric(newHotelId, newDates[0], $scope.currentMetric);
            }
            $scope.currHotelId = newHotelId;
            $scope.currDates = newDates;
            $scope.currDate = $scope.currDates[0];
        });

        function shouldUpdate(hotelId, newDate, prevDate) {
            return $scope.currHotelId != hotelId || prevDate.getMonth() != newDate.getMonth() || prevDate.getFullYear() != newDate.getFullYear();
        }

        function applyDecimals(base, value){
            if(value < base) return $filter('number')(Math.round(value));
            var decimals = Math.max(0,1- Math.floor(Math.log10(value/base)));
            var result = $filter('number')((value/base).toFixed(decimals));
            return result;
        }

        function formatCurrency(value) {
            if ( value >= Math.pow(10, 9) && value <= Number(Array(12).join(9)) ) {
                var resKPI = applyDecimals( Math.pow(10, 9), value );
                return resKPI + 'B';
            }
            if ( value >= Math.pow(10, 8) && value <= Number(Array(11).join(9)) ) {
                return (value / 1000000000).toFixed(1).replace(/\.0$/, '') + 'B';
            }
            else if (value >= Math.pow(10, 6) && value <= Number(Array(8).join(9)) ) {
                var resKPI = applyDecimals( Math.pow(10, 6), value );
                return resKPI + 'M';
            }
            else if (value >= Math.pow(10, 3) && value <= Number(Array(7).join(9)) ) {
                var resKPI = applyDecimals( Math.pow(10, 3), value );
                return resKPI + 'K';
            } else {
                return Math.round(value);
            }
        }

        var metricsMap = {
            Occupancy: function(metric) { return Math.round(metric.occupancy) + '%'},
            ADR: function(metric) { return metric.adr >= 0 ? formatCurrency(metric.adr):'NA';},
            RevPAR: function(metric) { return metric.revpar >= 0 ? formatCurrency(metric.revpar):'NA';},
            Revenue: function(metric) { return metric.revenue >= 0 ? formatCurrency(metric.revenue):'NA';},
            'Rooms (OTB)': function(metric) { return metric.rooms;},
            'Rooms (Forecast)': function(metric) { return metric.forecast == null ? '-' : Math.round(metric.forecast); }
        };
        

        function updateMetric(hotelId, date, metricName) {
            MonthMetrics.getFor(hotelId, date.getFullYear(), date.getMonth())
                .then(function (metrics) {
                    var today_date = new Date();
                    today_date.setDate(today_date.getDate()-1);

                    var new_metrics = _.map(metrics, function (metric) {
                        if ($scope.currentMetric == 'Rooms (Forecast)') {
                            var metric_date = new Date(metric.date);
                            if (metric_date >= today_date) {
                                return {
                                    metricsMap: metricsMap[metricName](metric),
                                    holidayList: metric.holiday
                                }
                            } else {
                                return {
                                    metricsMap: '-',
                                    holidayList: metric.holiday
                                }
                            }

                        } else {
                            return {
                                metricsMap: metricsMap[metricName](metric),
                                holidayList: metric.holiday
                            }
                        }
                    });
                    $scope.metrics = $scope.metrics || [];
                    $scope.metrics.length=0;
                    angular.forEach(new_metrics, function(metric){
                        if ($scope.currentMetric == 'Occupancy') {
                            var metric_percentage = parseFloat((metric.metricsMap).split('%')[0]);
                            $scope.metrics.push({
                                "metric": metric_percentage,
                                "weekend": weekdays[date.getDay()].isWeekend
                            });
                        } else {
                            $scope.metrics.push({
                                "metric": metric.metricsMap,
                                "weekend": weekdays[date.getDay()].isWeekend
                            });
                        }
                    });


                });
        }

        var show_color = false;
        $scope.occ_color = function (value) {
            if (show_color) {
                if ($scope.currentMetric == 'Occupancy') {
                    if (0 <= value && value <= 30) {
                        return {"background-color": "#F16767", "color": "white"};
                    } else if (30 < value && value <= 80) {
                        return {"background-color": "#F9CA68", "color": "white"};
                    } else {
                        return {"background-color": "#43D17D", "color": "white"};
                    }
                } else {
                    return {"background-color": "transparent"};
                }
            } else {
                return {"background-color": "transparent"};
            }
        };

        $scope.show_occ_colors = function () {
            if (show_color) {
                show_color = false;
            } else {
                show_color =true;
            }
        };

        $scope.occ_btn_color = function () {
            if (show_color) {
                var myEl = angular.element( document.querySelector( '#occ_color_btn' ) );
                myEl.removeClass('fa-rotate-180');
                return {"color": "#31C3D9"};
            } else {
                var myEl = angular.element( document.querySelector( '#occ_color_btn' ) );
                myEl.addClass('fa-rotate-180');
                return {"color": "#9e9e9e"};
            }
        }

    });



    app.factory('MonthMetrics', function ($http) {
        return {
            getFor: function (hotel_id, year, month) {
                var url = '/hotel/' + hotel_id + '/metrics/' + year + '/' + (month + 1);
                return $http.get(url)
                    .then(function (response) {
                        return response.data;
                    });
            }
        }
    });

    app.factory('HolidayList', function ($http) {
        return {
            getHoliday: function (dates) {
                var start = moment(dates[0]).format("YYYY MMMM DD").toString()
                var end = moment(dates[dates.length-1]).format("YYYY MMMM DD").toString()
                var url = '/holidays/holiday?start_date='+start+'&end_date='+end+"&country=India";
                return $http.get(url)
                    .then(function (response) {
                        return response.data;
                    });
            }
        }
    });



    function daysInMonth(year, month) {
        return new Date(year, month + 1, 0).getDate();
    }


})();
