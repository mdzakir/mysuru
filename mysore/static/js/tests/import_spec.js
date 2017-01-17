describe('Import Controller', function() {
    beforeEach(module('knights'));

    var ctrl, myScope,
        lastImportedTimeService = {},
        BookingImportService = {},
        hotelService= {},

        uiContextService = {
            getDates: function() {
                return [new Date()];
            },
            getHotelId: function() {
                return 1;
            }
        },
        UserService = {logout : function(){return true}},
        importResponse = {
            "failed_count": 0,
            "modify_count": 0,
            "duplicate": 2,
            "pass_count": 0
        };

    beforeEach(module(function($provide) {
        $provide.value('UIContext', uiContextService);
        $provide.value('bookingImports', lastImportedTimeService);
        $provide.value('BookingImports', BookingImportService);
        $provide.value('User', UserService);
        $provide.value('hotels', hotelService);
    }));

    beforeEach(inject(function($controller, $rootScope, $q, hotels, UIContext, User, bookingImports, BookingImports) {

        lastImportedTimeService.get = function() {
            return '1462968804965';
        };

        BookingImportService.get = function() {
            var deferred = $q.defer();
            deferred.resolve(function() {
                return "2016-06-07T12:03:47.976";
            });
            return deferred.promise;
        };

        rootScope = $rootScope;

        myScope = $rootScope.$new(true);
        ctrl = $controller('lastImportedTimeController', {
            $scope: myScope
        });
    }));

    describe('Last Imported Time', function() {
        beforeEach(function () {
            spyOn(rootScope, '$broadcast');
        });

        it('should pass last imported time function', function() {
            importSuccess(importResponse, rootScope);
            expect(rootScope.$broadcast).toHaveBeenCalledWith('bookingsImported');
        })
    });

});
