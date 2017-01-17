describe('Change Metrics in Month Strip Controller', function () {
    beforeEach(module('knights'));

    var ctrl, myScope;

    var uiContextService = {
            getDates: function () {
                return [new Date()];
            },
            getHotelId: function () {
                return '57557ce27159cc4c3e432619';
            }
        };

    beforeEach(module(function ($provide) {
        $provide.value('UIContext', uiContextService);
    }));

    beforeEach(inject(function ($controller, $rootScope, $q, $filter) {
        uiContextService.changeDates = function (testDate) {
            dates = testDate;
            $rootScope.$broadcast('dateChanged', testDate);
        }
        myScope = $rootScope.$new(true);
        ctrl = $controller('MonthMetricsController', {
            $scope: myScope
        });
    }));

    describe('Month Strip Functionality', function () {

        //myScope.changeMetric('ADR');

        xit('Changes Metrics on the Month Strip', function () {

            myScope.currentMetric = 'ADR';

            myScope.changeMetric('ADR');

        });
    });
});
