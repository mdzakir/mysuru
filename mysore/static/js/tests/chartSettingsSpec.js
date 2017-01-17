describe('Chart Settings Controller (Booking Curve Historical & Segmentation Bars)', function() {
    beforeEach(module('chartsSettings'));

    var ctrl, myScope, rootScope,
        numWeeks = 2,
        userProfile = {
            getCompareWith: function () {
               return 'last_year';
            },
            getNumWeeks: function () {
                return numWeeks;
            },
            setNumWeeks: function (count) {
                numWeeks = count;
            }
        };

    beforeEach(module(function($provide) {
        $provide.value('UserProfile', userProfile);
    }));

    beforeEach(inject(function($controller, $rootScope, $injector) {
        userProfile.setCompareWith = function (compareWith, context) {
            $rootScope.$broadcast('comparisonChanged', compareWith, context);
        };
        rootScope = $injector.get('$rootScope');
        myScope = $rootScope.$new();
        ctrl = $controller('chartsSettingsController', {
            $scope: myScope
        });

    }));

    describe('Making Selections', function () {
        beforeEach(function () {
            var active = _.find(myScope.options, 'active');
            expect(active.code).toEqual('last_year');
        });

        it('should apply the last year if selected', function () {
            ctrl.select(myScope.options[0], 'historical');
            active = _.find(myScope.options, 'active');
            expect(active.code).toEqual('last_year');

            ctrl.select(myScope.options[0], 'segmented');
            active = _.find(myScope.options, 'active');
            expect(active.code).toEqual('last_year');
        });

        it('should apply the last month if selected', function () {
            ctrl.select(myScope.options[1], 'historical');
            active = _.find(myScope.options, 'active');
            expect(active.code).toEqual('last_month');

            ctrl.select(myScope.options[1], 'segmented');
            active = _.find(myScope.options, 'active');
            expect(active.code).toEqual('last_month');
        });

        it('should apply the last week if selected', function () {
            ctrl.select(myScope.options[2], 'historical');
            active = _.find(myScope.options, 'active');
            expect(active.code).toEqual('last_week');

            ctrl.select(myScope.options[2], 'segmented');
            active = _.find(myScope.options, 'active');
            expect(active.code).toEqual('last_week');
        });

        it('should apply the custom weeks if selected', function () {
            // setComparison won't work over here, its an async call
            userProfile.setNumWeeks(10);
            myScope.options[3].code = userProfile.getNumWeeks();

            ctrl.select(myScope.options[3], 'historical');
            expect(myScope.options[3].code).toEqual(10);
            expect(myScope.options[3].active).toBeTruthy();

            ctrl.select(myScope.options[3], 'segmented');
            expect(myScope.options[3].code).toEqual(10);
            expect(myScope.options[3].active).toBeTruthy();
        });
    });

    describe('Listening to comparison_changed events', function() {
        beforeEach(function () {
            spyOn(rootScope, '$broadcast');
        });

        it('should set the comparison to last year', function() {
            ctrl.setComparison('last_year', 'historical');
            expect(rootScope.$broadcast).toHaveBeenCalledWith('comparisonChanged', 'last_year', 'historical');

            ctrl.setComparison('last_year', 'segmented');
            expect(rootScope.$broadcast).toHaveBeenCalledWith('comparisonChanged', 'last_year', 'segmented');
        });
        it('should set the comparison to last month', function() {
            ctrl.setComparison('last_month', 'historical');
            expect(rootScope.$broadcast).toHaveBeenCalledWith('comparisonChanged', 'last_month', 'historical');

            ctrl.setComparison('last_month', 'segmented');
            expect(rootScope.$broadcast).toHaveBeenCalledWith('comparisonChanged', 'last_month', 'segmented');
        });
        it('should set the comparison to last week', function() {
            ctrl.setComparison('last_week', 'historical');
            expect(rootScope.$broadcast).toHaveBeenCalledWith('comparisonChanged', 'last_week', 'historical');

            ctrl.setComparison('last_week', 'segmented');
            expect(rootScope.$broadcast).toHaveBeenCalledWith('comparisonChanged', 'last_week', 'segmented');
        });
        it('should set the comparison to custom weeks', function() {
            ctrl.setComparison(5, 'historical');
            expect(rootScope.$broadcast).toHaveBeenCalledWith('comparisonChanged', 5, 'historical');

            ctrl.setComparison(12, 'segmented');
            expect(rootScope.$broadcast).toHaveBeenCalledWith('comparisonChanged', 12, 'segmented');
        });
    });
});
