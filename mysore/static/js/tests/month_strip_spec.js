describe('Month Strip Controller', function () {
    beforeEach(module('knights'));

    var ctrl, myScope,
        today = new Date();

    today.setHours(0, 0, 0, 0);

    var currentDate = [today],
        testDate = [new Date(2016, 5, 13)],
        monthStripDataService = {},
        uiContextService = {
            getDates: function () {
                return [new Date()];
            },
            getHotelId: function () {
                return 1;
            }
        };

    beforeEach(module(function ($provide) {
        $provide.value('UIContext', uiContextService);
    }));

    beforeEach(inject(function ($controller, $rootScope, $q, $filter) {
        monthStripDataService.get = function () {
            var deferred = $q.defer();
            deferred.resolve(function () {
                return [new Date()];
            });
            return deferred.promise;
        };

        uiContextService.changeDates = function (testDate) {
            dates = testDate;
            $rootScope.$broadcast('dateChanged', testDate);
        }

        myScope = $rootScope.$new(true);
        ctrl = $controller('MonthStrip', {
            $scope: myScope
        });

        var dates = _.map(_.range(1, 31), function (x) {
            var date = new  Date(2016, 5, x);
            return {
                wkDay: date.getDay(),
                day: date.getDate(),
                //date: moment(date).format('YYYY-MM-DD[T]HH:mm:ss.SSS')+"Z",
                date: date,
                isSelected: false
            };
        });

        wk1 = ['', '', ''].concat(_.take(dates, 4));
        wk2 = _.take(_.drop(dates, 4), 7);
        wk3 = _.take(_.drop(dates, 11), 7);
        wk4 = _.take(_.drop(dates, 18), 7);
        wk5 = _.take(_.drop(dates, 25), 7);
        myScope.weekNum = [wk1, wk2, wk3, wk4, wk5];

        myScope.weekNumCopy = angular.copy(myScope.weekNum);

        myScope.weeks = _.map(moment.weekdaysMin(), function (label) {
            return {label: label, checked: false}
        });

        weekDayDates = _.map(_.range(0,7), function(wkDay) {return _.filter(dates, function(dt) { return dt.wkDay == wkDay;}) });
        
    }));

    var wk1, wk2, wk3, wk4, wk5, weekDayDates;

    describe('Month Strip Functionality', function () {
        it('selects multiple weeks', function () {
            myScope.weekNum[0].selected = true;
            myScope.weekNum[3].selected = true;
            myScope.wkSelection();
            expect(myScope.disableWkDay).toBe(true);
             
            expect(_.every(_.drop(wk1,3), function(o) { return o.isMultiSelected  == true; })).toBe(true);
            expect(_.every(wk2, function(o) { return o.isMultiSelected  == false; })).toBe(true);
            expect(_.every(wk3, function(o) { return o.isMultiSelected  == false; })).toBe(true);
            expect(_.every(wk4, function(o) { return o.isMultiSelected  == true; })).toBe(true);
            expect(_.every(wk5, function(o) { return o.isMultiSelected  == false; })).toBe(true);
        });
        
        it('selects multiple weekdays', function () {
            myScope.weeks[3].selected = true;
            myScope.wkDaySelection();
            expect(myScope.disableWeekRow).toBe(true);
             
            expect(_.every(_.drop(weekDayDates[0],1), function(o) { return o.isMultiSelected  == false; })).toBe(true);
            expect(_.every(_.drop(weekDayDates[1],1), function(o) { return o.isMultiSelected  == false; })).toBe(true);
            expect(_.every(_.drop(weekDayDates[2],1), function(o) { return o.isMultiSelected  == false; })).toBe(true);
            expect(_.every(weekDayDates[3], function(o) { return o.isMultiSelected  == true; })).toBe(true);
            expect(_.every(weekDayDates[4], function(o) { return o.isMultiSelected  == false; })).toBe(true);
            expect(_.every(weekDayDates[5], function(o) { return o.isMultiSelected  == false; })).toBe(true);
            expect(_.every(weekDayDates[6], function(o) { return o.isMultiSelected  == false; })).toBe(true);
        });
        
        it('Apply Multiple Dates - Week Selection', function () {

            myScope.weekNum[1].selected = true;
            myScope.weekNum[3].selected = true;

            myScope.wkSelection();
            expect(myScope.disableWkDay).toBe(true);

            _.every(_.drop(wk1,3), function(o) { return o.isMultiSelected  == false; });
            _.every(wk2, function(o) { return o.isMultiSelected  == true; });
            _.every(wk3, function(o) { return o.isMultiSelected  == false; });
            _.every(wk4, function(o) { return o.isMultiSelected  == true; });
            _.every(wk5, function(o) { return o.isMultiSelected  == false; });

            myScope.applyMultipleDates();

            expect(myScope.multipleDates).toBe(true);
        });

        it('Apply Multiple Dates - WeekDays Selection', function () {
            
            myScope.weeks[3].selected = true;
            
            myScope.wkDaySelection();
            expect(myScope.disableWeekRow).toBe(true);
             
            _.every(_.drop(weekDayDates[0],1), function(o) { return o.isMultiSelected  == false; });
            _.every(_.drop(weekDayDates[1],1), function(o) { return o.isMultiSelected  == false; });
            _.every(_.drop(weekDayDates[2],1), function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[3], function(o) { return o.isMultiSelected  == true; });
            _.every(weekDayDates[4], function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[5], function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[6], function(o) { return o.isMultiSelected  == false; });

            myScope.applyMultipleDates();

            expect(myScope.multipleDates).toBe(true);

        });

        it('Reset Multiple Dates - Week Selection', function () {
            
            myScope.weekNum[1].selected = true;
            myScope.weekNum[3].selected = true;

            myScope.wkSelection();
            expect(myScope.disableWkDay).toBe(true);

            _.every(_.drop(wk1,3), function(o) { return o.isMultiSelected  == false; });
            _.every(wk2, function(o) { return o.isMultiSelected  == true; });
            _.every(wk3, function(o) { return o.isMultiSelected  == false; });
            _.every(wk4, function(o) { return o.isMultiSelected  == true; });
            _.every(wk5, function(o) { return o.isMultiSelected  == false; });

            myScope.applyMultipleDates();
            myScope.resetMultiDates();

            expect(myScope.multipleDates).toBe(false);

        });

        it('Reset Multiple Dates - WeekDays Selection', function () {
            
            myScope.weeks[3].selected = true;
            
            myScope.wkDaySelection();
            expect(myScope.disableWeekRow).toBe(true);
             
            _.every(_.drop(weekDayDates[0],1), function(o) { return o.isMultiSelected  == false; });
            _.every(_.drop(weekDayDates[1],1), function(o) { return o.isMultiSelected  == false; });
            _.every(_.drop(weekDayDates[2],1), function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[3], function(o) { return o.isMultiSelected  == true; });
            _.every(weekDayDates[4], function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[5], function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[6], function(o) { return o.isMultiSelected  == false; });

            myScope.applyMultipleDates();
            myScope.resetMultiDates();

            expect(myScope.multipleDates).toBe(false);

        });

        it('Cancel Multiple Dates - Week Selection', function () {
            
            myScope.weekNum[1].selected = true;
            myScope.weekNum[3].selected = true;

            myScope.wkSelection();
            expect(myScope.disableWkDay).toBe(true);

            _.every(_.drop(wk1,3), function(o) { return o.isMultiSelected  == false; });
            _.every(wk2, function(o) { return o.isMultiSelected  == true; });
            _.every(wk3, function(o) { return o.isMultiSelected  == false; });
            _.every(wk4, function(o) { return o.isMultiSelected  == true; });
            _.every(wk5, function(o) { return o.isMultiSelected  == false; });

            myScope.resetMultiDates();
            myScope.cancelMultiDates();

            expect(myScope.mdpstatus.isopen).toBe(false);
            expect(myScope.multipleDates).toBe(false);

        });

        it('Cancel Multiple Dates - WeekDays Selection', function () {
            
            myScope.weeks[3].selected = true;
            
            myScope.wkDaySelection();
            expect(myScope.disableWeekRow).toBe(true);
             
            _.every(_.drop(weekDayDates[0],1), function(o) { return o.isMultiSelected  == false; });
            _.every(_.drop(weekDayDates[1],1), function(o) { return o.isMultiSelected  == false; });
            _.every(_.drop(weekDayDates[2],1), function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[3], function(o) { return o.isMultiSelected  == true; });
            _.every(weekDayDates[4], function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[5], function(o) { return o.isMultiSelected  == false; });
            _.every(weekDayDates[6], function(o) { return o.isMultiSelected  == false; });

            myScope.resetMultiDates();
            myScope.cancelMultiDates();

            expect(myScope.mdpstatus.isopen).toBe(false);
            expect(myScope.multipleDates).toBe(false);

        });

        it('should select todays date', function () {
            spyOn(myScope, 'selToday').and.callThrough();
            spyOn(ctrl, 'render').and.callThrough();
            myScope.selToday();
            expect(myScope.selToday).toHaveBeenCalled();
            expect(ctrl.render).toHaveBeenCalled();
            expect(myScope.daysOfMonth[moment().date() - 1].isToday).toBe(true);
        });
        it('should update the month strip for the given month', function () {
            var currentMonth = {
                    index: moment().month(),
                    isCurrent: false,
                    name: "Feb"
                },
                febMonth = {
                    index: 1,
                    isCurrent: false,
                    name: "Feb"
                };
            spyOn(myScope, 'changeMonth').and.callThrough();
            myScope.changeMonth(febMonth);
            expect(myScope.changeMonth).toHaveBeenCalled();
        });
    });
});
