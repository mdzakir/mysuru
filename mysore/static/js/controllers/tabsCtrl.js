(function() {
    angular.module('knights')
        .controller('TabsController', function ($scope, $rootScope, UIContext, UserProfile, Tabs, WalkThrough) {
            $scope.tabs = Tabs.getTabs();
            $scope.showAddChart = true;

            $scope.countTabs = function (tabId) {
                Tabs.setTabs($scope.tabs);
                var selectedTabs = _.countBy($scope.tabs, function(a) { return a.selected; });
                $scope.activeTab = tabId ? tabId : UserProfile.tabSettings.getActive();
                $scope.disableTabs = selectedTabs.true === 6;
                $scope.requireTab = selectedTabs.true === 2;
                $scope.setCurrentTab($scope.activeTab);
            };

            function unSelectLastTab() {
                var segmentationChart = _.find($scope.tabs, ['id', 3]);
                var channelMixChart = _.find($scope.tabs, ['id', 4]);
                if (segmentationChart.selected === false) {
                    // find any last tab and deselect it
                    (_.findLast($scope.tabs, ['selected', true])).selected = false;
                    (_.findLast($scope.tabs, ['selected', true])).selected = false;
                    segmentationChart.selected = true;
                    channelMixChart.selected = true;
                }
            }

            $scope.isDisabled = function (tab) {
                // if max tabs selected excluding current tab OR only current tab is selected and nothing else
                return $scope.disableTabs && !tab.selected || $scope.requireTab && tab.selected;
            };

            $scope.setCurrentTab = function(tabId) {
                // if current tab is selected, set it active
                // or find any last selected tab and set it active
                if ((_.find($scope.tabs, ['id', tabId])).selected) UserProfile.tabSettings.setActive(tabId);
                else UserProfile.tabSettings.setActive(findNextTab());
                $scope.activeTab = UserProfile.tabSettings.getActive();
            };

            function findNextTab() {
                return (_.findLast($scope.tabs, ['selected', true])).id;
            }

            $scope.isActiveTab = function(tabId) {
                return tabId == $scope.activeTab;
            };

            $scope.countTabs();

            if ($rootScope.multipleDates) {
                unSelectLastTab();
                $scope.showAddChart = false;
                $scope.countTabs(3);
                $scope.hideTab = function(tab){
                    return tab.id != 3 && tab.id != 4;
                };
            }

            $scope.walk_through_tabs_toggle = WalkThrough.status('tabs_toggle');

            $scope.removeWalkThrough = function () {
                WalkThrough.set('tabs_toggle', false);
                $scope.walk_through_tabs_toggle = false;
            };

        })
        .factory('Tabs', function (User, UserSettings) {
            var self = this;

            self.getTabs = function() {
                var config = User.getUserConfig();
                var default_tabs = [{
                    id: 1,
                    title: 'Booking Curve',
                    selected: true
                }, {
                    id: 2,
                    title: 'Pricing Curve',
                    selected: true
                }, {
                    id: 3,
                    title: 'Segmentation',
                    selected: true
                }, {
                    id: 4,
                    title: 'Channel Mix',
                    selected: true
                }, {
                    id: 5,
                    title: 'Daily Pickup',
                    selected: true
                }];
                if(config !== null && angular.isDefined(config['graph_tabs'])) {
                    return config['graph_tabs'];
                } else {
                    return default_tabs;
                }
            };

            self.setTabs = function(tabs) {
                UserSettings.setUserSettings('graph_tabs', tabs).then(function() {
                    var config = User.getUserConfig();
                    config['graph_tabs'] = tabs;
                    User.setUserConfig(config);
                })
            };

            return self;

        });
})();
