KnightsTesting = {
    pendingCalls: 0
};

(function () {
    angular.module('knights')
        .factory('User', function ($http, $window, $rootScope, eventsTracker, CacheFactory) {
            var user = null;
            var store = $window.localStorage;
            var token_key = 'auth-token';
            var email = 'email';
            var user_config = 'user_config';
            var currency_code = 'currency_code';
            var currency_iso_code = "currency_iso_code";
            var is_pms = 'is_pms';
            var ToggleConfig = 'active_rules_toggle';
            var ExpandCollapseRulesConfig = 'toggleRules_expand_collapse';
            var HotelID = 'hotelid';
            var RoomID = 'selected_room_id';

            return {
                login: function (email, password) {
                    var params = {email: email, password: password};
                    var that = this;
                    return $http.post('/user/auth', params).then(function (response) {
                        user = {name: email, authenticated: true};
                        eventsTracker.logEvent('loggedin');
                        that.setToken(response.data.token);
                        that.setEmail(email);
                        that.setUserConfig(response.data.config);
                        that.setHotelConfig(response.data.hotel_config);
                        that.setCurrencyIsoCode(response.data.currency_iso_code);
                        that.setPmsConfig(response.data.is_pms);
                        that.setHotelID(response.data.hotel_id);
                        that.setPricingToggle(response.data.config);
                        $rootScope.$broadcast('userLoggedIn');
                    }, function (response) {
                        that.setToken('invalid');
                    });
                },
                logout: function () {
                    eventsTracker.logEvent('loggedout');
                    this.setToken();
                    this.setUserConfig();
                    CacheFactory.destroyAll();
                    $rootScope.$broadcast('userLoggedOut');
                },
                getToken: function () {
                    return store.getItem(token_key);
                },
                setToken: function (token) {
                    if (token) {
                        store.setItem(token_key, token);
                    } else {
                        user = {authenticated: false};
                        store.removeItem(token_key);
                    }
                },
                getEmail: function () {
                    return store.getItem(email);
                },
                setEmail: function (email_id) {
                    store.setItem(email, email_id);
                },
                getUserConfig: function () {
                    return JSON.parse(store.getItem(user_config));
                },
                setUserConfig: function (config) {
                    store.setItem(user_config, JSON.stringify(config));
                },
                getHotelCurrency: function () {
                    return JSON.parse(store.getItem(currency_code));
                },
                setHotelConfig: function (config) {
                    store.setItem(currency_code, JSON.stringify(config));
                },
                isPms: function () {
                    return JSON.parse(store.getItem(is_pms));
                },
                setPmsConfig: function (config) {
                    store.setItem(is_pms, JSON.stringify(config));
                },
                setToggleConfig: function (config) {
                    store.setItem(ToggleConfig, JSON.stringify(config));
                },
                getToggleConfig: function () {
                    return JSON.parse(store.getItem(ToggleConfig));
                },
                setExpandCollapseRulesConfig: function (config) {
                    store.setItem(ExpandCollapseRulesConfig, JSON.stringify(config));
                },
                getExpandCollapseRulesConfig: function () {
                    return JSON.parse(store.getItem(ExpandCollapseRulesConfig));
                },
                setPricingToggle: function (config) {
                    if (config.active_rules_toggle) {
                        pricing_toogle = config.active_rules_toggle
                    }
                    else {
                        pricing_toogle = false
                    }
                    store.setItem(ToggleConfig, JSON.stringify(pricing_toogle));

                    if (config.toggleRules_expand_collapse) {
                        Rules_expand_collapse = config.toggleRules_expand_collapse
                    }
                    else {
                        Rules_expand_collapse = false
                    }
                    store.setItem(ExpandCollapseRulesConfig, JSON.stringify(Rules_expand_collapse));

                },
                getCurrencyIsoCode: function () {
                    return JSON.parse(store.getItem(currency_iso_code));
                },
                setCurrencyIsoCode: function (config) {
                    store.setItem(currency_iso_code, JSON.stringify(config));
                },
                getHotelID: function () {
                    return JSON.parse(store.getItem(HotelID));
                },
                setHotelID: function (config) {
                    store.setItem(HotelID, JSON.stringify(config));
                },
                getRoomID: function () {
                    return JSON.parse(store.getItem(RoomID));
                },
                setRoomID: function (config) {
                    store.setItem(RoomID, JSON.stringify(config));
                },


            };
        })
        .factory('AuthInterceptor', function ($injector, $rootScope, $q) {
            return {
                request: function (config) {
                    KnightsTesting.pendingCalls++;
                    var User = $injector.get('User');
                    var token = User.getToken();
                    if (token) {
                        config.headers = config.headers || {};
                        config.headers.Authorization = 'JWT ' + token;
                    }
                    return config;
                },
                responseError: function (rejection) {
                    KnightsTesting.pendingCalls--;
                    var User = $injector.get('User');
                    if (rejection.status === 401 || rejection.status === 403) {
                        User.setToken();
                        $rootScope.$broadcast('authenticationRequired');
                    }
                    return $q.reject(rejection);
                },
                response: function (response) {
                    KnightsTesting.pendingCalls--;
                    return response;
                }
            };
        })
        .factory('AjaxTracker', function (AjaxCalls, $q) {
            return {
                request: function (config) {
                    AjaxCalls.increament();
                    return config;
                },
                responseError: function (rejection) {
                    AjaxCalls.decreament();
                    return $q.reject(rejection);
                },
                response: function (response) {
                    AjaxCalls.decreament();
                    return response;
                }
            }
        })
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push('AuthInterceptor');
            $httpProvider.interceptors.push('AjaxTracker');
        });
})();