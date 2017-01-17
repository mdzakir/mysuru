(function () {
    angular.module('chartsSettings', [])
        .controller('chartsSettingsController', function ($scope, $rootScope, UserProfile) {
            var self = this;

            self.init = function () {
                var compareWith = UserProfile.getCompareWith();
                self.makeSelection(compareWith);

                self.weeksAgo = UserProfile.getNumWeeks();
                $scope.options[$scope.options.length-1].code = self.weeksAgo;
            };


            $scope.options = [
                {name: 'Last year', code: 'last_year', active: true},
                {name: 'Last month', code: 'last_month', active: false},
                {name: 'Last week', code: 'last_week', active: false},
                {name: 'weeks ago', code: self.weeksAgo, active: false, custom: true}
            ];

            $scope.settingSelected = false;
            $scope.applyBtn = false;

            self.editing = function () {
                $scope.applyBtn = true;
            };

            self.toggleApplyBtn = function (opt) {
                $scope.applyBtn = opt.custom;
            };

            $scope.toggleSettings = function () {
                $scope.settingSelected = !$scope.settingSelected;
            };

            self.setComparison = function (code, context) {
                UserProfile.setCompareWith(code, context);
                if (!isNaN(code)) {
                    UserProfile.setNumWeeks(code, context);
                }
            };

            self.makeSelection = function (code) {
                _.forEach($scope.options, function(d){ d.active = false; });
                var index;
                if (isNaN(code)) {
                    index = _.findIndex($scope.options, function(o) { return o.code === code; });
                } else {
                    index = _.findIndex($scope.options, function(o) { return o.custom; });
                }
                $scope.options[index].active = true;
            };

            self.select = function (opt, context) {
                self.toggleApplyBtn(opt);
                self.makeSelection(opt.code);
                self.setComparison(opt.code, context);
            };

            self.init();

        });
})();