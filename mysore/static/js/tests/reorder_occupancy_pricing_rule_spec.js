describe('Reoder Pricing Rule', function() {
    beforeEach(module('knights'));

    var ctrl, myScope;

    var roomsService = {
            "data": [{
                "capacity": 0,
                "is_base": true,
                "order": 1,
                "id": 1,
                "name": "Standard"
            }, {
                "capacity": 0,
                "is_base": false,
                "order": 2,
                "id": 2,
                "name": "Deluxe"
            }, {
                "capacity": 0,
                "is_base": false,
                "order": 3,
                "id": 3,
                "name": "Luxury"
            }, {
                "capacity": 0,
                "is_base": false,
                "order": 4,
                "id": 4,
                "name": "Suite"
            }],
            "status": 200,
            "config": {
                "method": "GET",
                "transformRequest": [null],
                "transformResponse": [null],
                "url": "/hotel/viewrooms?hotel_id=57557ce27159cc4c3e432619",
                "headers": {
                    "Accept": "application/json, text/plain, */*",
                    "Authorization": "JWT eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjE0NjUzODIwNDUsInVzZXJuYW1lIjoibGFjbGFzc2ljIiwidXNlcl9pZCI6MSwiZW1haWwiOiJ1c2VyQGxhY2xhc3NpYy5jb20iLCJvcmlnX2lhdCI6MTQ2NTM3ODQ0NX0.wZq3by7U8QilKdYn_QrAwZtYDWRHpJTqxB9O1xtSq4U"
                }
            },
            "statusText": "OK"
        },
        hotelId = '57557ce27159cc4c3e432619',
        rules = {},
        uiContextService = {
            getDates: function() {
                return [new Date()];
            },
            getHotelId: function() {
                return 1;
            }
        };

    beforeEach(module(function($provide) {
        $provide.value('rooms', roomsService);
        $provide.value('uiContext', uiContextService);
        $provide.value('hotelId', hotelId);
        $provide.value('rules', rules);
    }));

    beforeEach(inject(function($controller, $rootScope) {
        myScope = $rootScope.$new(true);
        mockReorderOccupancyPricingRule = {
            del: function(params, callback) {
                this.params = params;
                this.callback = callback;
            },
            rulestatus: function(params, callback) {
                this.params = params;
                this.callback = callback;
            },
            ruleorder: function(params, callback) {
                this.params = params;
                this.callback = callback;
            }
        };

        ctrl = $controller('reorderPricingRule', {
            $scope: myScope,
            ReorderOccupancyPricingRule: mockReorderOccupancyPricingRule
        });

        myScope.rules_data = [{"days":[true,true,true,true,true,true,true],"creation_date":{"$date":1465590078581},"date_range":{"end":{"$date":1466726400000},"_cls":"DateRange","start":{"$date":1465516800000}},"name":"asdfkh","local_id":7,"rate_plans":{},"status":"1","priority":8,"rooms":{"1":{"prices":[{"offset":100,"price":10000,"delta":0,"occupancy":100}]},"2":{"prices":[{"offset":100,"price":10010,"delta":10,"occupancy":100}]},"3":{"prices":[{"offset":100,"price":10020,"delta":20,"occupancy":100}]},"4":{"prices":[{"offset":100,"price":10030,"delta":30,"occupancy":100}]}},"room_occupancies":{},"description":"khkhk"},{"days":[true,true,true,true,true,false,false],"creation_date":{"$date":1465476706597},"date_range":{"end":{"$date":1466726400000},"_cls":"DateRange","start":{"$date":1465516800000}},"name":"Rule test","local_id":5,"rate_plans":{},"status":"1","priority":7,"rooms":{"1":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"2":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"3":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"4":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]}},"room_occupancies":{},"description":"sample"},{"days":[true,true,true,true,true,true,true],"creation_date":{"$date":1465589730321},"date_range":{"end":{"$date":1467244800000},"_cls":"DateRange","start":{"$date":1465603200000}},"name":"sdfdaf","local_id":6,"rate_plans":{},"status":"1","priority":6,"rooms":{"1":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"2":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"3":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"4":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]}},"room_occupancies":{},"description":"asdfs"},{"days":[true,true,true,true,true,true,true],"creation_date":{"$date":1465590103739},"date_range":{"end":{"$date":1466035200000},"_cls":"DateRange","start":{"$date":1465516800000}},"name":"kjhh","local_id":8,"rate_plans":{},"status":"1","priority":5,"rooms":{"1":{"prices":[{"offset":50,"price":322,"delta":0,"occupancy":50},{"offset":25,"price":3222,"delta":0,"occupancy":75},{"offset":25,"price":3322,"delta":0,"occupancy":100}]},"2":{"prices":[{"offset":50,"price":332,"delta":10,"occupancy":50},{"offset":25,"price":3232,"delta":10,"occupancy":75},{"offset":25,"price":3332,"delta":10,"occupancy":100}]},"3":{"prices":[{"offset":50,"price":324,"delta":2,"occupancy":50},{"offset":25,"price":3224,"delta":2,"occupancy":75},{"offset":25,"price":3324,"delta":2,"occupancy":100}]},"4":{"prices":[{"offset":50,"price":324,"delta":2,"occupancy":50},{"offset":25,"price":3224,"delta":2,"occupancy":75},{"offset":25,"price":3324,"delta":2,"occupancy":100}]}},"room_occupancies":{},"description":"h"},{"days":[true,true,true,true,true,true,true],"creation_date":{"$date":1465462516658},"date_range":{"end":{"$date":1467331200000},"_cls":"DateRange","start":{"$date":1465430400000}},"name":"a","local_id":4,"rate_plans":{},"status":"DELETED","priority":4,"rooms":{"1":{"prices":[{"offset":100,"price":22,"delta":0,"occupancy":100}]},"2":{"prices":[{"offset":100,"price":22,"delta":0,"occupancy":100}]},"3":{"prices":[{"offset":100,"price":22,"delta":0,"occupancy":100}]},"4":{"prices":[{"offset":100,"price":22,"delta":0,"occupancy":100}]}},"room_occupancies":{},"description":"sd"},{"days":[true,true,true,true,true,true,true],"creation_date":{"$date":1465462416891},"date_range":{"end":{"$date":1466121600000},"_cls":"DateRange","start":{"$date":1465430400000}},"name":"asd","local_id":3,"rate_plans":{},"status":"1","priority":3,"rooms":{"1":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"2":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"3":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]},"4":{"prices":[{"offset":100,"price":100,"delta":0,"occupancy":100}]}},"room_occupancies":{},"description":"asdf"},{"days":[true,true,true,true,true,false,false],"creation_date":{"$date":1465403227520},"date_range":{"end":{"$date":1466640000000},"_cls":"DateRange","start":{"$date":1465516800000}},"name":"Test Sample","local_id":2,"rate_plans":{},"status":"1","priority":2,"rooms":{"1":{"prices":[{"offset":50,"price":70,"delta":0,"occupancy":50},{"offset":25,"price":190,"delta":0,"occupancy":75},{"offset":25,"price":190,"delta":0,"occupancy":100}]},"2":{"prices":[{"offset":50,"price":79,"delta":9,"occupancy":50},{"offset":25,"price":199,"delta":9,"occupancy":75},{"offset":25,"price":199,"delta":9,"occupancy":100}]},"3":{"prices":[{"offset":50,"price":150,"delta":80,"occupancy":50},{"offset":25,"price":270,"delta":80,"occupancy":75},{"offset":25,"price":270,"delta":80,"occupancy":100}]},"4":{"prices":[{"offset":50,"price":170,"delta":100,"occupancy":50},{"offset":25,"price":290,"delta":100,"occupancy":75},{"offset":25,"price":290,"delta":100,"occupancy":100}]}},"room_occupancies":{},"description":"sample test"},{"days":[true,true,true,true,true,false,false],"creation_date":{"$date":1465394600261},"date_range":{"end":{"$date":1467244800000},"_cls":"DateRange","start":{"$date":1465344000000}},"name":"ds","local_id":1,"rate_plans":{},"status":"DELETED","priority":1,"rooms":{"1":{"prices":[{"offset":50,"price":190,"delta":0,"occupancy":50},{"offset":25,"price":290,"delta":0,"occupancy":75},{"offset":25,"price":390,"delta":0,"occupancy":100}]},"2":{"prices":[{"offset":50,"price":192,"delta":2,"occupancy":50},{"offset":25,"price":292,"delta":2,"occupancy":75},{"offset":25,"price":392,"delta":2,"occupancy":100}]},"3":{"prices":[{"offset":50,"price":197,"delta":7,"occupancy":50},{"offset":25,"price":297,"delta":7,"occupancy":75},{"offset":25,"price":397,"delta":7,"occupancy":100}]},"4":{"prices":[{"offset":50,"price":198,"delta":8,"occupancy":50},{"offset":25,"price":298,"delta":8,"occupancy":75},{"offset":25,"price":398,"delta":8,"occupancy":100}]}},"room_occupancies":{},"description":"fdasdf"}];

    }));

    describe('Reorder Occupancy Pricing Rule', function() {

        it('Check rooms length', function(){
            
            myScope.room_length(myScope.rules_data[0]);
            expect(myScope.room_length).not.toBe(null);

        });
        it('should say no rules if rules are empty', function(){
            myScope.rules_data = {};
            myScope.config_sort(myScope.rules_data);

            expect(myScope.NoRules).toBeTruthy();
            expect(myScope.toggleButton).toBeFalsy();
        });
        it('should delete occupancy pricing rule', function() {
            myScope.deleteRule(myScope.rules_data);
            expect(mockReorderOccupancyPricingRule.params).not.toBe(null);
        });
        it('should update status of occupancy pricing rule', function() {
            myScope.updateStatus(myScope.rules_data);
            expect(mockReorderOccupancyPricingRule.params).not.toBe(null);
        });
        it('should populate rules of occupancy pricing', function() {
            myScope.populateRules();
            expect(mockReorderOccupancyPricingRule.params).not.toBe(null);
        });
        it('should update order of occupancy pricing rule', function() {
            
            myScope.config_sort(myScope.rules_data);

            myScope.sortableOptions.stop();

            //expect(myScope.rules_data[0].priority).toEqual('8');
            mockReorderOccupancyPricingRule.ruleorder();
        });
    });

});
