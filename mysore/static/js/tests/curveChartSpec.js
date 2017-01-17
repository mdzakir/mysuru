describe('Booking Curve (Segmented) Chart Controller', function() {
    beforeEach(module('curveChartCtrl'));

    var ctrl, myScope,
        curveService = {
            data: {"segments": ["Group", "Other", "Leisure", "Corporate"], "data": {"Agency": [14, 14, 13, 13, 13, 13, 12, 8, 8, 8, 8, 8, 7, 7, 7, 7, 6, 6, 6, 6, 5, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Tour": [9, 9, 9, 9, 9, 8, 8, 4, 4, 4, 4, 4, 4, 4, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Other": [5, 3, 3, 3, 2, 2, 2, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Walkins": [20, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "OTA": [22, 22, 21, 20, 16, 15, 14, 13, 13, 13, 13, 13, 11, 11, 11, 11, 11, 11, 11, 11, 11, 10, 10, 10, 10, 10, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 8, 7, 7, 7, 5, 5, 5, 4, 4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "total": [99, 79, 75, 73, 68, 64, 61, 51, 51, 50, 50, 49, 46, 46, 43, 43, 39, 39, 39, 38, 36, 34, 32, 29, 29, 29, 27, 27, 26, 25, 25, 25, 23, 23, 23, 23, 23, 23, 22, 22, 21, 19, 19, 19, 18, 18, 18, 18, 18, 18, 17, 16, 16, 16, 16, 14, 14, 13, 13, 13, 13, 13, 11, 10, 9, 9, 8, 8, 8, 7, 7, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0], "Group": [21, 16, 16, 16, 16, 16, 16, 9, 9, 9, 9, 9, 9, 9, 7, 7, 7, 7, 7, 7, 5, 4, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Direct": [34, 34, 32, 31, 30, 28, 27, 26, 26, 25, 25, 24, 24, 24, 24, 24, 21, 21, 21, 20, 20, 20, 19, 19, 19, 19, 19, 19, 18, 17, 17, 17, 15, 15, 15, 15, 15, 15, 15, 15, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 14, 13, 13, 13, 13, 11, 11, 10, 10, 10, 10, 10, 10, 9, 8, 8, 7, 7, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 4, 4, 4, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0], "Leisure": [61, 53, 50, 48, 44, 41, 39, 37, 37, 37, 37, 37, 35, 35, 35, 35, 32, 32, 32, 31, 31, 30, 29, 29, 29, 29, 27, 27, 26, 25, 25, 25, 23, 23, 23, 23, 23, 23, 22, 22, 21, 19, 19, 19, 18, 18, 18, 18, 18, 18, 17, 16, 16, 16, 16, 14, 14, 13, 13, 13, 13, 13, 11, 10, 9, 9, 8, 8, 8, 7, 7, 7, 6, 6, 6, 5, 5, 5, 4, 4, 4, 3, 3, 3, 2, 1, 0, 0, 0, 0, 0], "Corporate": [12, 7, 6, 6, 6, 5, 4, 3, 3, 3, 3, 3, 2, 2, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "date": "2016-01-10", "channels": ["OTA", "Agency", "Tour", "Direct", "Walkins"]},
            formattedData: [["Agency",14,14,13,13,13,13,12,8,8,8,8,8,7,7,7,7,6,6,6,6,5,4,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],["Tour",9,9,9,9,9,8,8,4,4,4,4,4,4,4,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],["Other",5,3,3,3,2,2,2,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],["Walkins",20,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],["Ota",22,22,21,20,16,15,14,13,13,13,13,13,11,11,11,11,11,11,11,11,11,10,10,10,10,10,8,8,8,8,8,8,8,8,8,8,8,8,7,7,7,5,5,5,4,4,4,4,4,4,3,3,3,3,3,3,3,3,3,3,3,3,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],["Group",21,16,16,16,16,16,16,9,9,9,9,9,9,9,7,7,7,7,7,7,5,4,3,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],["Direct",34,34,32,31,30,28,27,26,26,25,25,24,24,24,24,24,21,21,21,20,20,20,19,19,19,19,19,19,18,17,17,17,15,15,15,15,15,15,15,15,14,14,14,14,14,14,14,14,14,14,14,13,13,13,13,11,11,10,10,10,10,10,10,9,8,8,7,7,7,6,6,6,5,5,5,4,4,4,4,4,4,3,3,3,2,1,0,0,0,0,0],["Leisure",61,53,50,48,44,41,39,37,37,37,37,37,35,35,35,35,32,32,32,31,31,30,29,29,29,29,27,27,26,25,25,25,23,23,23,23,23,23,22,22,21,19,19,19,18,18,18,18,18,18,17,16,16,16,16,14,14,13,13,13,13,13,11,10,9,9,8,8,8,7,7,7,6,6,6,5,5,5,4,4,4,3,3,3,2,1,0,0,0,0,0],["Corporate",12,7,6,6,6,5,4,3,3,3,3,3,2,2,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],["Total",99,79,75,73,68,64,61,51,51,50,50,49,46,46,43,43,39,39,39,38,36,34,32,29,29,29,27,27,26,25,25,25,23,23,23,23,23,23,22,22,21,19,19,19,18,18,18,18,18,18,17,16,16,16,16,14,14,13,13,13,13,13,11,10,9,9,8,8,8,7,7,7,6,6,6,5,5,5,4,4,4,3,3,3,2,1,0,0,0,0,0]]
        },
        noData = {
            data: {"segments": [], "data": {"total": [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "date": "2016-05-10", "channels": []}
        },
        uiContextService = {
            getDates: function() {
                return ['12-3-20160'];
            },
            getHotelId: function() {
                return 1;
            }
        };

    beforeEach(module(function($provide) {
        $provide.value('UIContext', uiContextService);
        $provide.value('BookingCurve', curveService);
    }));

    beforeEach(inject(function($controller, $rootScope, $q) {
        curveService.getSegmented = function() {
            var deferred = $q.defer();
            deferred.resolve(function() {
                return [{"segments": ["Other", "Group", "Corporate", "Leisure"], "data": {"Agency": [17, 17, 14, 14, 14, 12, 12, 5, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Tour": [12, 12, 12, 12, 12, 12, 11, 6, 6, 6, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Other": [8, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Walkins": [25, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "OTA": [19, 19, 15, 14, 13, 13, 11, 11, 11, 11, 11, 10, 10, 10, 10, 9, 8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 4, 4, 4, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "total": [90, 68, 61, 56, 52, 49, 46, 33, 33, 32, 32, 31, 29, 29, 26, 25, 23, 23, 23, 22, 20, 17, 16, 15, 14, 14, 13, 13, 11, 10, 10, 10, 9, 9, 9, 9, 9, 9, 8, 8, 7, 6, 6, 6, 4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Group": [21, 17, 17, 17, 17, 17, 17, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Direct": [17, 17, 17, 16, 13, 12, 12, 11, 11, 10, 10, 10, 9, 9, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 7, 7, 5, 4, 4, 4, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Leisure": [42, 33, 29, 24, 21, 20, 18, 17, 17, 17, 17, 17, 16, 16, 16, 16, 15, 15, 15, 14, 14, 13, 13, 13, 13, 13, 12, 12, 11, 10, 10, 10, 9, 9, 9, 9, 9, 9, 8, 8, 7, 6, 6, 6, 4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Corporate": [19, 12, 9, 9, 9, 7, 6, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "date": "2016-02-10", "channels": ["OTA", "Agency", "Tour", "Direct", "Walkins"]}];
            });
            return deferred.promise;
        };
        myScope = $rootScope.$new(true);
        ctrl = $controller('SegmentedBookingController', {
            $scope: myScope
        });
    }));

    describe('Data checks', function() {
        it('should say noData when data is unavailable', function() {
            ctrl.checkData(noData.data);
            expect(myScope.noData).toBe(true);

            ctrl.checkData(curveService.data);
            expect(myScope.noData).toBe(false);
        });
        it('should reformat the data to the required format', function () {
            var formattedData = ctrl.reformatData(curveService.data);
            expect(formattedData).toEqual(curveService.formattedData);
        });
    });

// TODO: resonse 500 should enable noData state


});
