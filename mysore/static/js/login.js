(function(){
    angular.module('knights')
        .config(function($stateProvider) {
            $stateProvider.state('login', {
                url: '/login',
                templateUrl: '/login',
                controller: function($scope, User, ngProgressFactory, deviceDetector) {
                    $scope.loginUser = function () {
                        User.login($scope.email, $scope.password).then(function(){
                            if(User.getToken('auth-token')=='invalid'){
                               $scope.invalidLogin = true; 
                            }
                            else{
                                $scope.invalidLogin = false;
                            }

                        });
                    }
                    $scope.deviceDetector = deviceDetector;

                    if ($scope.deviceDetector.browser == 'chrome') {
                        $scope.chromeBrowser = true
                    }
                    $scope.browserAlert = true;
                    $scope.closeBrowserCheckAlert = function() {
                        $scope.browserAlert = false;
                    };

                }
            })

        })
})();