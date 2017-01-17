describe('KPI Controller', function() {
    var ctrl, $scope, UIContext, UserProfile,
        activeTab = 1;

    beforeEach(function() {
        module('knights');

        // Provide will help us create fake implementations for our dependencies
        module(function($provide) {

            // Fake UIContext Implementation
            $provide.value('UIContext', {
                getDates: function () {
                    return [1,2,3];
                }
            });

            // Fake UserProfile Implementation
            $provide.value('UserProfile', {
                tabSettings: {
                    setActive: function (index) {
                        activeTab = index;
                    },
                    getActive: function () {
                        return activeTab;
                    }
                }
            });

            return null;
        });
    });

    beforeEach(function() {
        // When Angular Injects the UIContext and UserProfile dependency,
        // it will use the implementation we provided above
        inject(function($controller, $rootScope, _UIContext_, _UserProfile_) {
            $scope = $rootScope.$new(true);
            UIContext = _UIContext_;
            UserProfile = _UserProfile_;
            ctrl = $controller('TabsController', {
                    $scope: $scope
                });
        });
    });

    describe('Add/Remove KPIs', function () {
        var selectedKPIs;
        beforeEach(function () {
            selectedKPIs = _.countBy($scope.tabs, function(a) { return a.selected; });
        });

        it('should display all available charts in dropdown', function () {
            var available_charts = $scope.tabs.length;

            expect($scope.tabs.length).toEqual(available_charts);
            expect($scope.tabs.length).not.toEqual(selectedKPIs.true);
        });

        it('should update the selected charts count on selecting/unselecting the checkbox', function () {
            $scope.countTabs();
            expect(selectedKPIs.true).toEqual(4);

            $scope.tabs[0].selected = false;
            $scope.countTabs();
            selectedKPIs = _.countBy($scope.tabs, function(a) { return a.selected; });
            expect(selectedKPIs.true).toEqual(3);
        });

        it('should disable other options if max charts are selected', function () {
            $scope.countTabs();
            expect(selectedKPIs.true).toEqual(4);

            var inactiveTab = _.find($scope.tabs, ['selected', false]);
            expect($scope.isDisabled(inactiveTab)).toBeTruthy();
        });

        it('should disable the last option if all charts are unselected', function () {
            _($scope.tabs).forEach(function (tab) {
                tab.selected = false;
            });

            var oneActiveTab = _.head($scope.tabs);
            oneActiveTab.selected = true;
            $scope.countTabs();

            expect($scope.isDisabled(oneActiveTab)).toBeTruthy();
        });
    });
});
