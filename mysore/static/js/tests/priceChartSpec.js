describe('Price Chart Controller', function() {
    beforeEach(module('priceChartCtrl'));

    var ctrl, myScope,
        priceCurveService = {
            data: {"data":{"rateplans":[{"hotel_name":"La Classic","variance":{"absolute":-112.375,"percentage":-0.03},"total":3800,"ota":"Cleartrip","last_upd":"20160511 00:09:02","sold_out":false,"total_pretax":3148.30052,"check_in":"20160511","hotel_id":6},{"ota":null,"last_upd":"20160507 00:23:51","hotel_name":"Compset Average","sold_out":false,"check_in":"20160511","total":3912.375,"hotel_id":-1},{"hotel_name":"The Sahar Pavilion","total":2769,"ota":"Cleartrip","last_upd":"20160511 00:11:26","sold_out":false,"total_pretax":2299.8,"check_in":"20160511","hotel_id":368},{"hotel_name":"Radha Regent","total":4789,"ota":"TravelGuru","last_upd":"20160509 00:31:26","sold_out":false,"total_pretax":3750,"check_in":"20160511","hotel_id":7},{"hotel_name":"Lemon Tree Hotel Electronics City","total":5785,"ota":"TravelGuru","last_upd":"20160507 00:23:51","sold_out":false,"total_pretax":4399,"check_in":"20160511","hotel_id":8},{"hotel_name":"Golden Tulip Electronics City","total":3060,"ota":"Expedia","last_upd":"20160510 04:16:24","sold_out":false,"total_pretax":3060,"check_in":"20160511","hotel_id":9},{"hotel_name":"Claresta Hotel","total":3161,"ota":"TravelGuru","last_upd":"20160511 01:54:07","sold_out":false,"total_pretax":3099,"check_in":"20160511","hotel_id":10},{"hotel_name":"Ramee Guestline Hotel","total":2277,"ota":"TravelGuru","last_upd":"20160511 00:13:13","sold_out":false,"total_pretax":2200,"check_in":"20160511","hotel_id":365},{"hotel_name":"Sai Vishram","total":3750,"ota":"TravelGuru","last_upd":"20160511 00:19:37","sold_out":false,"total_pretax":2625,"check_in":"20160511","hotel_id":366},{"hotel_name":"Svenska Design Hotel","total":5708,"ota":"Booking","last_upd":"20160509 06:49:32","sold_out":false,"total_pretax":4300,"check_in":"20160511","hotel_id":367},{"hotel_name":"La Classic","variance":{"absolute":-421.3798600640257,"percentage":-0.11},"total":3500,"ota":"Cleartrip","last_upd":"20160511 00:09:02","sold_out":false,"total_pretax":2899.75244,"check_in":"20160512","hotel_id":6},{"ota":null,"last_upd":"20160509 06:49:35","hotel_name":"Compset Average","sold_out":false,"check_in":"20160512","total":3921.3798600640257,"hotel_id":-1},{"hotel_name":"The Sahar Pavilion","total":2769,"ota":"Cleartrip","last_upd":"20160511 00:11:26","sold_out":false,"total_pretax":2299.8,"check_in":"20160512","hotel_id":368},{"hotel_name":"Radha Regent","total":4627,"ota":"Cleartrip","last_upd":"20160511 00:23:53","sold_out":false,"total_pretax":3748.75,"check_in":"20160512","hotel_id":7},{"hotel_name":"Lemon Tree Hotel Electronics City","total":5509.038880512205,"ota":"Expedia","last_upd":"20160511 02:14:16","sold_out":false,"total_pretax":4198.96,"check_in":"20160512","hotel_id":8},{"hotel_name":"Golden Tulip Electronics City","total":4632,"ota":"Cleartrip","last_upd":"20160511 00:17:17","sold_out":false,"total_pretax":3482.1800000000003,"check_in":"20160512","hotel_id":9},{"hotel_name":"Claresta Hotel","total":3161,"ota":"TravelGuru","last_upd":"20160511 01:54:08","sold_out":false,"total_pretax":3099,"check_in":"20160512","hotel_id":10},{"hotel_name":"Ramee Guestline Hotel","total":2277,"ota":"TravelGuru","last_upd":"20160511 00:13:14","sold_out":false,"total_pretax":2200,"check_in":"20160512","hotel_id":365},{"hotel_name":"Sai Vishram","total":3750,"ota":"TravelGuru","last_upd":"20160511 00:19:38","sold_out":false,"total_pretax":2625,"check_in":"20160512","hotel_id":366},{"hotel_name":"Svenska Design Hotel","total":4646,"ota":"Booking","last_upd":"20160509 06:49:35","sold_out":false,"total_pretax":3500,"check_in":"20160512","hotel_id":367},{"hotel_name":"La Classic","variance":{"absolute":12.038749999999709,"percentage":0},"total":3500,"ota":"Cleartrip","last_upd":"20160511 00:09:03","sold_out":false,"total_pretax":2899.75244,"check_in":"20160513","hotel_id":6},{"ota":null,"last_upd":"20160511 00:11:27","hotel_name":"Compset Average","sold_out":false,"check_in":"20160513","total":3487.9612500000003,"hotel_id":-1},{"hotel_name":"The Sahar Pavilion","total":2769,"ota":"Cleartrip","last_upd":"20160511 00:11:27","sold_out":false,"total_pretax":2299.8,"check_in":"20160513","hotel_id":368},{"hotel_name":"Radha Regent","total":4318,"ota":"Cleartrip","last_upd":"20160511 00:23:54","sold_out":false,"total_pretax":3498.3,"check_in":"20160513","hotel_id":7},{"hotel_name":"Lemon Tree Hotel Electronics City","total":3278.69,"ota":"Expedia","last_upd":"20160511 02:14:17","sold_out":false,"total_pretax":2499,"check_in":"20160513","hotel_id":8},{"hotel_name":"Golden Tulip Electronics City","total":4417,"ota":"Cleartrip","last_upd":"20160511 00:17:19","sold_out":false,"total_pretax":3320.66,"check_in":"20160513","hotel_id":9},{"hotel_name":"Claresta Hotel","total":3161,"ota":"TravelGuru","last_upd":"20160511 01:54:10","sold_out":false,"total_pretax":3099,"check_in":"20160513","hotel_id":10},{"hotel_name":"Ramee Guestline Hotel","total":2277,"ota":"TravelGuru","last_upd":"20160511 00:13:15","sold_out":false,"total_pretax":2200,"check_in":"20160513","hotel_id":365},{"hotel_name":"Sai Vishram","total":3750,"ota":"TravelGuru","last_upd":"20160511 00:19:39","sold_out":false,"total_pretax":2625,"check_in":"20160513","hotel_id":366},{"hotel_name":"Svenska Design Hotel","total":3933,"ota":"Cleartrip","last_upd":"20160511 00:19:24","sold_out":false,"total_pretax":2148.8,"check_in":"20160513","hotel_id":367}]}},
            formattedData: [["La Classic",3800,3500,3500],["Compset Average",3912.375,3921.3798600640257,3487.9612500000003],["The Sahar Pavilion",2769,2769,2769],["Radha Regent",4789,4627,4318],["Lemon Tree Hotel Electronics City",5785,5509.038880512205,3278.69],["Golden Tulip Electronics City",3060,4632,4417],["Claresta Hotel",3161,3161,3161],["Ramee Guestline Hotel",2277,2277,2277],["Sai Vishram",3750,3750,3750],["Svenska Design Hotel",5708,4646,3933],["x","2016-05-11T06:53:06.285Z","2016-05-12T06:53:06.285Z","2016-05-13T06:53:06.285Z","2016-05-14T06:53:06.285Z","2016-05-15T06:53:06.285Z","2016-05-16T06:53:06.285Z","2016-05-17T06:53:06.285Z","2016-05-18T06:53:06.285Z","2016-05-19T06:53:06.285Z","2016-05-20T06:53:06.285Z","2016-05-21T06:53:06.285Z","2016-05-22T06:53:06.285Z","2016-05-23T06:53:06.285Z","2016-05-24T06:53:06.285Z","2016-05-25T06:53:06.285Z","2016-05-26T06:53:06.285Z","2016-05-27T06:53:06.285Z","2016-05-28T06:53:06.285Z","2016-05-29T06:53:06.285Z","2016-05-30T06:53:06.285Z","2016-05-31T06:53:06.285Z","2016-06-01T06:53:06.285Z","2016-06-02T06:53:06.285Z","2016-06-03T06:53:06.285Z","2016-06-04T06:53:06.285Z","2016-06-05T06:53:06.285Z","2016-06-06T06:53:06.285Z","2016-06-07T06:53:06.285Z","2016-06-08T06:53:06.285Z","2016-06-09T06:53:06.285Z","2016-06-10T06:53:06.285Z","2016-06-11T06:53:06.285Z"]]
        },
        noData = {
            data: {"data":{"rateplans":[]}}
        },
        uiContextService = {
            getDates: function() {
                return ['11-05-2016'];
            },
            getFirstDay: function () {
                return '1-05-2016';
            },
            getHotelId: function() {
                return 1;
            }
        };

    beforeEach(module(function($provide) {
        $provide.value('UIContext', uiContextService);
        $provide.value('PriceCurve', priceCurveService);
    }));

    beforeEach(inject(function($controller, $rootScope, $q) {
        priceCurveService.get = function() {
            var deferred = $q.defer();
            deferred.resolve(function() {
                return [{"segments": ["Other", "Group", "Corporate", "Leisure"], "data": {"Agency": [17, 17, 14, 14, 14, 12, 12, 5, 5, 5, 5, 5, 4, 4, 4, 4, 3, 3, 3, 3, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Tour": [12, 12, 12, 12, 12, 12, 11, 6, 6, 6, 6, 6, 6, 6, 3, 3, 3, 3, 3, 3, 3, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Other": [8, 6, 6, 6, 5, 5, 5, 5, 5, 4, 4, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Walkins": [25, 3, 3, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "OTA": [19, 19, 15, 14, 13, 13, 11, 11, 11, 11, 11, 10, 10, 10, 10, 9, 8, 8, 8, 8, 8, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 5, 4, 4, 4, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "total": [90, 68, 61, 56, 52, 49, 46, 33, 33, 32, 32, 31, 29, 29, 26, 25, 23, 23, 23, 22, 20, 17, 16, 15, 14, 14, 13, 13, 11, 10, 10, 10, 9, 9, 9, 9, 9, 9, 8, 8, 7, 6, 6, 6, 4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Group": [21, 17, 17, 17, 17, 17, 17, 6, 6, 6, 6, 6, 6, 6, 4, 4, 4, 4, 4, 4, 3, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Direct": [17, 17, 17, 16, 13, 12, 12, 11, 11, 10, 10, 10, 9, 9, 9, 9, 9, 9, 9, 8, 8, 8, 8, 8, 8, 8, 7, 7, 5, 4, 4, 4, 3, 3, 3, 3, 3, 3, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Leisure": [42, 33, 29, 24, 21, 20, 18, 17, 17, 17, 17, 17, 16, 16, 16, 16, 15, 15, 15, 14, 14, 13, 13, 13, 13, 13, 12, 12, 11, 10, 10, 10, 9, 9, 9, 9, 9, 9, 8, 8, 7, 6, 6, 6, 4, 4, 4, 4, 4, 4, 3, 2, 2, 2, 2, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0], "Corporate": [19, 12, 9, 9, 9, 7, 6, 5, 5, 5, 5, 5, 4, 4, 3, 3, 2, 2, 2, 2, 1, 1, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]}, "date": "2016-02-10", "channels": ["OTA", "Agency", "Tour", "Direct", "Walkins"]}];
            });
            return deferred.promise;
        };
        myScope = $rootScope.$new(true);
        ctrl = $controller('priceChartController', {
            $scope: myScope
        });
    }));

    describe('Data checks', function() {
        it('should say noData when data is unavailable', function() {
            ctrl.checkData(noData.data);
            expect(myScope.noData).toBe(true);

            ctrl.checkData(priceCurveService.data);
            expect(myScope.noData).toBe(false);
        });
        it('should reformat the data to the required format', function () {
            var formattedData = ctrl.reformatData(priceCurveService.data, uiContextService.getDates());
            // not checking the dates
            formattedData.pop();
            priceCurveService.formattedData.pop();

            expect(formattedData).toEqual(priceCurveService.formattedData);
        });
    });

});
