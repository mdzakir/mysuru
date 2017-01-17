describe('Tabs Controller', function() {
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

    describe('Save current tab in user profile', function () {
        it('should show first tab if user is logging in for the first time', function () {
            var currentTab = UserProfile.tabSettings.getActive();
            expect($scope.isActiveTab(currentTab)).toBeTruthy();
        });

        it('should save the last visited tab', function () {
            var currentTab = UserProfile.tabSettings.getActive();
            expect($scope.isActiveTab(currentTab)).toBeTruthy();

            $scope.setCurrentTab(3);
            expect($scope.isActiveTab(3)).toBeTruthy();
        });

        it('should show only segmentation chart if multiple dates are selected', function () {
            expect($scope.showTab(2)).toBeTruthy();
            expect($scope.currentTab).toBeUndefined();
        });
    });

    describe('Add/Remove charts', function () {
        var selectedTabs;
        beforeEach(function () {
            selectedTabs = _.countBy($scope.tabs, function(a) { return a.selected; });
        });

        it('should display all available charts in dropdown', function () {
            var available_charts = $scope.tabs.length;

            expect($scope.tabs.length).toEqual(available_charts);
            expect($scope.tabs.length).not.toEqual(selectedTabs.true);
        });

        it('should update the selected charts count on selecting/unselecting the checkbox', function () {
            $scope.countTabs();
            expect(selectedTabs.true).toEqual(4);

            $scope.tabs[0].selected = false;
            $scope.countTabs();
            selectedTabs = _.countBy($scope.tabs, function(a) { return a.selected; });
            expect(selectedTabs.true).toEqual(3);
        });

        it('should disable other options if max charts are selected', function () {
            $scope.countTabs();
            expect(selectedTabs.true).toEqual(4);

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
