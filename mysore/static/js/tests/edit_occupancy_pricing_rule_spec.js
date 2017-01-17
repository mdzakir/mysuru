describe('EDIT OCCUPANCY PRICING RULE', function() {

    var ctrl, myScope;
    beforeEach(module('knights'));

    var editData = {},
        roomsService = {
            "data": [{
                "capacity": 0,
                "is_base": true,
                "order": 1,
                "id": 1,
                "name": "Zakir"
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
        rule = {},
        /*hotels = [{
            id:"57557ce27159cc4c3e432619",
            name:"La Classic"
        }];*/
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
        $provide.value('rule', rule);
    }));


    beforeEach(inject(function($controller, $rootScope) {
        myScope = $rootScope.$new(true);
        mockOccupancyPricingRule = {
            save: function(params, isCreate, callback) {
                this.params = params;
                this.isCreate = isCreate;
                this.callback = callback;
            }
        };

        ctrl = $controller('createPricingRule', {
            $scope: myScope,
            OccupancyPricingRule: mockOccupancyPricingRule
        });

        editData = {
            name: 'Rule test',
            date_range: {
                start: { $date: new Date(2016, 9, 1) },
                end: { $date: new Date(2016, 9, 10) }
            },
            partitions: [{
                price: "6000",
                occupancy: 50,
                offset: 50,
                hidePercentInfo: true
            }, {
                price: "5000",
                occupancy: 50,
                offset: 100,
                hidePercentInfo: false,
                readonly: true
            }]
        };



        /*myScope.rule = {
            name: 'Test Rule',
            date_range: {
                start: { $date: new Date(2016, 9, 1) },
                end: { $date: new Date(2016, 9, 10) }
            },
            partitions: [{
                price: "6000",
                occupancy: 50,
                offset: 50,
                hidePercentInfo: true
            }, {
                price: "5000",
                occupancy: 50,
                offset: 100,
                hidePercentInfo: false,
                readonly: true
            }]
        };*/


    }));

    xdescribe('EDIT Pricing Rule', function() {
        it('should load the EDIT OCCUPANCY PRICING RULE form', function() {

            expect(editData.name).toEqual(myScope.rule.name);

            /*myScope.submitRule();
            expect(mockOccupancyPricingRule.params).not.toBe(null);
            expect(mockOccupancyPricingRule.params.hotel_id).toBe('57557ce27159cc4c3e432619');
            expect(mockOccupancyPricingRule.isCreate).toBe(true);*/
        });

        it('should submit the EDIT OCCUPANCY PRICING RULE ', function() {
            myScope.submitRule();
            expect(mockOccupancyPricingRule.params).not.toBe(null);
            expect(mockOccupancyPricingRule.params.hotel_id).toBe('57557ce27159cc4c3e432619');
            expect(mockOccupancyPricingRule.isCreate).toBe(true);
        });
    });

});
