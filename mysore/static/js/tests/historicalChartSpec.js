describe('Booking Curve (Historical) Chart Controller', function () {
    beforeEach(function () {
        angular.module('chartsSettings', []);
        module('bookingCurveCtrl');
    });

    var ctrl, myScope,
        historicalService = {
            data: [{date: "2014-05-05", values: [1,2,3,4]}, {date: "2015-05-05", values: [1,2,3,4]}]
        },
        userProfile = {
            getCompareWith: function () {
               return 'last_year';
            }
        },
        noData = {},
        uiContextService = {
            getDates: function () {
                return ['12-3-20160'];
            },
            getHotelId: function () {
                return 1;
            }
        };

    beforeEach(module(function ($provide) {
        $provide.value('UIContext', uiContextService);
        $provide.value('BookingCurve', historicalService);
        $provide.value('UserProfile', userProfile);
    }));

    beforeEach(inject(function ($controller, $rootScope, $q) {
        historicalService.getHistorical = function () {
            var deferred = $q.defer();
            deferred.resolve(function() {
                return [{date: "2015-05-05", values: [1,2,3,4]}];
            });
            return deferred.promise;
        };

        userProfile.setCompareWith = function (compareWith, context) {
            $rootScope.$broadcast('comparisonChanged', compareWith, context);
        };
        rootScope = $rootScope;
        myScope = $rootScope.$new(true);
        ctrl = $controller('BookingCurveController', {
            $scope: myScope
        });
        ctrl.plotChart = function () {
            return true;
        };
    }));

    describe('Updating charts according to comparison selected', function () {
        beforeEach(function () {
            spyOn(ctrl, 'updateCurve').and.callThrough();
            spyOn(historicalService, 'getHistorical').and.callFake(function () {
                return {
                    then: function (response) {
                        response.data = historicalService;
                        return response(response);
                    }
                };
            });
            spyOn(ctrl, 'renderCurve').and.callThrough();
        });

        it('should update the chart to last year', function() {
            userProfile.setCompareWith('last_year', 'historical');
            expect(ctrl.updateCurve).toHaveBeenCalledWith('last_year');
            expect(historicalService.getHistorical)
                .toHaveBeenCalledWith(uiContextService.getDates()[0], uiContextService.getHotelId(), 'last_year');
            expect(ctrl.renderCurve).toHaveBeenCalled();

            userProfile.setCompareWith('last_month', 'segmented');
            expect(ctrl.updateCurve).not.toHaveBeenCalledWith('last_month');
        });

        it('should update the chart to last month', function() {
            userProfile.setCompareWith('last_month', 'historical');
            expect(ctrl.updateCurve).toHaveBeenCalledWith('last_month');
            expect(historicalService.getHistorical)
                .toHaveBeenCalledWith(uiContextService.getDates()[0], uiContextService.getHotelId(), 'last_month');
            expect(ctrl.renderCurve).toHaveBeenCalled();

            userProfile.setCompareWith('last_week', 'segmented');
            expect(ctrl.updateCurve).not.toHaveBeenCalledWith('last_week');
        });

        it('should update the chart to last week', function() {
            userProfile.setCompareWith('last_week', 'historical');
            expect(ctrl.updateCurve).toHaveBeenCalledWith('last_week');
            expect(historicalService.getHistorical)
                .toHaveBeenCalledWith(uiContextService.getDates()[0], uiContextService.getHotelId(), 'last_week');
            expect(ctrl.renderCurve).toHaveBeenCalled();

            userProfile.setCompareWith('last_month', 'segmented');
            expect(ctrl.updateCurve).not.toHaveBeenCalledWith('last_month');
        });

        it('should update the chart to custom weeks', function() {
            userProfile.setCompareWith(9, 'historical');
            expect(ctrl.updateCurve).toHaveBeenCalledWith(9);
            expect(historicalService.getHistorical)
                .toHaveBeenCalledWith(uiContextService.getDates()[0], uiContextService.getHotelId(), 9);
            expect(ctrl.renderCurve).toHaveBeenCalled();

            userProfile.setCompareWith(10, 'segmented');
            expect(ctrl.updateCurve).not.toHaveBeenCalledWith(10);
        });
    });

    describe('Data checks', function(){
        it('should say noData when data is unavailable', function () {
            noData.data = [{date: "2014-05-05", values: [0,0,0,0]}, {date: "2015-05-05", values: [0,0,0,0]}];
            ctrl.checkData(noData);
            expect(myScope.noData).toBe(true);

            historicalService.data = [{date: "2014-05-05", values: [1,2,3,4]}, {date: "2015-05-05", values: [1,2,3,4]}];
            ctrl.checkData(historicalService);
            expect(myScope.noData).toBe(false);
        });
        it('should reformat the data to the required format', function () {
            historicalService.data = [{date: "2014-05-05", values: [1,2,3,4]}, {date: "2015-05-05", values: [1,2,3,4]}];
            var formattedData = ctrl.reformatData(historicalService, userProfile.getCompareWith());
            expect(formattedData).toEqual([ [ 'Last year (5th May 2014)', 1, 2, 3, 4 ], [ 'Current year (5th May 2015)', 1, 2, 3, 4 ] ]);
        });
    });

    describe('Alerts', function () {

        it('should show alerts if available', function () {
            historicalService.meta = {
                status: "success",
                variance: {
                    absolute: -85,
                    percentage: -1
                }
            };
            ctrl.setAlerts(historicalService);
            expect(myScope.alerts).toEqual({
                absolute: -85,
                percentage: -1
            });
        });

        it('should say better if variance is positive', function () {
            historicalService.meta = {
                status: "success",
                variance: {
                    absolute: 85,
                    percentage: 1
                }
            };
            ctrl.setAlerts(historicalService);
            expect(myScope.better).toBe(true);
            expect(myScope.worse).toBe(false);
        });

        it('should say worse if variance is negative', function () {
            historicalService.meta = {
                status: "success",
                variance: {
                    absolute: -85,
                    percentage: -1
                }
            };
            ctrl.setAlerts(historicalService);
            expect(myScope.worse).toBe(true);
            expect(myScope.better).toBe(false);
        });

        it('should say "Alerts Unavailable" if no alerts', function () {
            ctrl.setAlerts(noData);
            expect(myScope.alerts).not.toBeDefined();
        });
    });

});