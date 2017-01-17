describe('Pickup Controller', function() {
    beforeEach(module('knights'));

    Math.log10 = Math.log10 || function(x) {
        return Math.log(x) / Math.LN10;
    };

    var ctrl, myScope,
        metricsDataService = {},
        uiContextService = {
            getDates: function() {
                return [new Date()];
            },
            getHotelId: function() {
                return 1;
            }
        };

    beforeEach(module(function($provide) {
        $provide.value('UIContext', uiContextService);
        $provide.value('metricsData', metricsDataService);
    }));

    beforeEach(inject(function($controller, $rootScope, $q, $filter) {

        metricsDataService.get = function() {
            var deferred = $q.defer();
            deferred.resolve(function() {
                return [new Date()];
            });
            return deferred.promise;
        };

        metricsDataService.get = function() {
            var deferred = $q.defer();
            deferred.resolve(function() {
                return [new Date()];
            });
            return deferred.promise;
        };

        metricsDataService.data = [];
        metricsDataService.metrics = {};
        metricsDataService = {
                                "headers": ["1Day", "7Day", "14Day", "30Day", "Occupancy", "ADR", "RevPAR", "Revenue"],
                                "metrics": {
                                    "no_shows": 0,
                                    "ADR": 5500,
                                    "Revenue": 16500,
                                    "cancelled": 0,
                                    "RevPAR": 217.10526315789474,
                                    "Occupancy": 0.039473684210526314,
                                    "name": "metrics"
                                },
                                "channels": ["LA CLASSIC"],
                                "segments": ["LEISURE"],
                                "dates": ["2016-03-17"],
                                "data": [{
                                    "ADR": 5500,
                                    "1Day": 0,
                                    "7Day": 0,
                                    "30Day": 2,
                                    "14Day": 0,
                                    "Occupancy": 0.039473684210526314,
                                    "RevPAR": 217.10526315789474,
                                    "name": "LEISURE",
                                    "Revenue": 16500
                                }, {
                                    "ADR": 5500,
                                    "1Day": 0,
                                    "7Day": 0,
                                    "30Day": 2,
                                    "14Day": 0,
                                    "Occupancy": 0.039473684210526314,
                                    "RevPAR": 217.10526315789474,
                                    "name": "LA CLASSIC",
                                    "Revenue": 16500
                                }]
                            };

        myScope = $rootScope.$new(true);
        ctrl = $controller('MetricsController', {
            $scope: myScope,
            metricsData : metricsDataService,
        });
    }));

    describe('roundToK Function Testing', function() {
        it('Converts the Digits above 1Lac, divides by 1000, suffixes k and inserts comma after every 3 digits', function() {
            expect(myScope.roundToK(1009500)).toEqual('1,009.5k');
        })
    });

    describe('Metrics Data check', function() {
        it('should show Occupancy for the selected date', function() {
            expect(metricsDataService.metrics.Occupancy).toEqual(0.039473684210526314);
        });
        it('should show ADR for the selected date', function() {
            expect(metricsDataService.metrics.ADR).toEqual(5500);
        });
        it('should show RevPAR for the selected date', function() {
            expect(metricsDataService.metrics.RevPAR).toEqual(217.10526315789474);
        });
        it('should show Revenue for the selected date', function() {
            expect(metricsDataService.metrics.Revenue).toEqual(16500);
        });
    });

    describe('Pickup Data check', function() {
        it('should show LEISURE segments row data (1Day, 7Day, 14Day, 30Day Pickup, Occupancy, ADR, RevPAR, Revenue)', function() {
            expect(metricsDataService.data[0]['1Day']).toEqual(0);
            expect(metricsDataService.data[0]['7Day']).toEqual(0);
            expect(metricsDataService.data[0]['14Day']).toEqual(0);
            expect(metricsDataService.data[0]['30Day']).toEqual(2);
            expect(metricsDataService.data[0].Occupancy).toEqual(0.039473684210526314);
            expect(metricsDataService.data[0].ADR).toEqual(5500);
            expect(metricsDataService.data[0].RevPAR).toEqual(217.10526315789474);
            expect(metricsDataService.data[0].Revenue).toEqual(16500);
            expect(metricsDataService.data[0].name).toEqual('LEISURE');
        });
    });

    describe('Add/Remove KPIs', function () {
        var selectedKPIs;
        beforeEach(function () {
            selectedKPIs = _.countBy(myScope.kpiList, function(a) { return a.kpi_selected; });
        });

        it('should display all available KPIs in dropdown', function () {
            var available_kpis = myScope.kpiList.length;

            //console.log(JSON.stringify(selectedKPIs.true));
            expect(myScope.kpiList.length).toEqual(available_kpis);
            expect(myScope.kpiList.length).toEqual(selectedKPIs.true);
        });

        it('should update the selected KPIs count on selecting/unselecting the checkbox', function () {
            myScope.countKPIs();
            expect(selectedKPIs.true).toEqual(6);

            myScope.kpiList[0].kpi_selected = false;
            myScope.countKPIs();
            selectedKPIs = _.countBy(myScope.kpiList, function(a) { return a.kpi_selected; });
            expect(selectedKPIs.true).toEqual(5);
        });

        /*it('should disable other options if max KPIs are selected', function () {
            myScope.countKPIs();
            expect(selectedKPIs.true).toEqual(6);

            var inactiveKPI = _.find(myScope.kpiList, ['kpi_selected', false]);
            expect(myScope.isDisabled(inactiveKPI)).toBeTruthy();
        });*/

        it('should disable the last option if all KPIs are unselected', function () {
            _(myScope.kpiList).forEach(function (kpi) {
                kpi.kpi_selected = false;
            });

            var firstActiveKPI = _.head(myScope.kpiList);
            var lastActiveKPI = _.last(myScope.kpiList);
            firstActiveKPI.kpi_selected = true;
            lastActiveKPI.kpi_selected = true;
            myScope.countKPIs();

            expect(myScope.isDisabled(firstActiveKPI)).toBeTruthy();
            expect(myScope.isDisabled(lastActiveKPI)).toBeTruthy();
        });

        it('should close the KPI Overlay and set Token', function () {
            
            myScope.closeKPIOverlay();

            expect(myScope.hideKPIInfoOverlay).toBeFalsy();
        });

        it('should remove the KPIs on X MARK', function () {
            
            myScope.requireKPIs = true;

            myScope.kpiRemove();

            myScope.kpiList[0].kpi_selected = false;
            myScope.kpiList[1].kpi_selected = false;
            myScope.kpiList[2].kpi_selected = false;
            myScope.kpiList[3].kpi_selected = false;

            myScope.requireKPIs = false;
            expect(myScope.kpiList[1].kpi_selected).toBeFalsy();
        });

    });

});
