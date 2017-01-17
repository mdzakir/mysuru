(function () {
    angular.module('knights')
        .factory('SegmentChart', function ($http) {
            return {
                get: function (dates, hotelId, compareWith) {
                    var params = {
                        hotel_id: hotelId,
                        compare_with: compareWith,
                        dates: _.map(dates, function (dt) {
                            return moment(dt).format('YYYY-MM-DD');
                        })
                    };
                    return $http.post('/hotel/segmentation', params);
                },
                getMix: function (dates, hotelId, compareWith) {
                    var params = {
                        hotel_id: hotelId,
                        compare_with: compareWith,
                        dates: _.map(dates, function (dt) {
                            return moment(dt).format('YYYY-MM-DD');
                        })
                    };
                    return $http.post('/hotel/channel-mix', params);
                }
            };
        })
        .factory('BookingCurve', function ($http, CacheFactory) {
            function params(date, hotelId, compareWith, metric) {
                return {
                    hotel_id: hotelId,
                    date: moment(date).format('YYYY-MM-DD'),
                    days: 90,
                    compare_with: compareWith,
                    metric: metric
                };
            }

            return {
                getHistorical: function (date, hotelId, compareWith) {
                    return $http.post('/hotel/bookings/historical', params(date, hotelId, compareWith));
                },
                getSegmented: function (date, hotelId) {
                    return $http.post('/hotel/bookings/segmented', params(date, hotelId));
                },
                getAdr: function (date, hotelId, compareWith) {
                    return $http.post('/hotel/bookings/historical', params(date, hotelId, compareWith, 'adr'));
                },
                getPickup: function (hotelId, month, year) {
                    var url = '/hotel/' + hotelId + '/pickup/' + year + '/' + (month + 1);

                    if (!CacheFactory.get('pickupCache')) {
                        CacheFactory('pickupCache', {
                            maxAge: 15 * 60 * 1000,
                            cacheFlushInterval: 60 * 60 * 1000,
                            deleteOnExpire: 'aggressive'
                        });
                    }
                    return $http.get(url, {
                        cache: CacheFactory.get('pickupCache')
                    });
                }
            };
        })
        .factory('PriceCurve', function ($http, CacheFactory) {
            return {
                get: function (date, hotelId) {
                    var formattedDate = moment(date).format('YYYYMMDD');
                    if (!CacheFactory.get('rateplansCache')) {
                        CacheFactory('rateplansCache', {
                            maxAge: 15 * 60 * 1000,
                            cacheFlushInterval: 60 * 60 * 1000,
                            deleteOnExpire: 'aggressive'
                        });
                    }
                    var url = '/api/rateplans?id=' + hotelId + '&start_date=' + formattedDate;
                    return $http.get(url, {
                        cache: CacheFactory.get('rateplansCache')
                    });
                }
            };
        })
        .factory('BookingImports', function ($http) {
            return {
                get: function (hotelId) {
                    //return '1462968804965';
                    return $http.get('/import/uploadTime?hotel_id=' + hotelId);
                }
            };

        })
        .factory('PriceOptimizer', function ($http) {
            return {
                month: moment(),
                currentMonth: function () {
                    return parseInt(this.month.format('M'));
                },
                currentYear: function () {
                    return parseInt(this.month.format('Y'));
                },
                get: function (hotelId, roomId, ratePlanId) {
                    return $http.get('/hotel/optimize/?hotel_id=' + hotelId + '&room_id=' + roomId + '&rate_id=' + ratePlanId + '&date=' + this.currentMonth() + '-' + this.currentYear());
                },
                save: function (hotelId, data) {
                    return $http.post('/hotel/override', data);
                },
                publish: function (hotelId, data) {
                    return $http.post('/hotel/publish/', data);
                },
                reset: function (data) {
                    return $http.post('/hotel/removeoverride', data);
                },
                get_hotel_min_max_rate: function (hotelId) {
                    var url = '/hotel/gethotelminmaxvalue?hotel_id=' + hotelId;
                    return $http.get(url);
                }
            };

        })
        .factory('UserProfile', function ($rootScope) {
            var activeTab = 1;
            var tabSettings = {
                setActive: function (index) {
                    activeTab = index;
                },
                getActive: function () {
                    return activeTab;
                }
            };
            var comparator;
            var numWeeks = 2;
            return {
                tabSettings: tabSettings,
                setCompareWith: function (compareWith, context) {
                    comparator = compareWith;
                    $rootScope.$broadcast('comparisonChanged', compareWith, context);
                },
                getCompareWith: function () {
                    return comparator || 'last_year';
                },
                getNumWeeks: function () {
                    return numWeeks;
                },
                setNumWeeks: function (count) {
                    numWeeks = count;
                }
            };

        })
        .factory('OccupancyRule', function ($q, $http) {
            return {
                get: function (hotelId, ruleId) {
                    var deferred = $q.defer();
                    var rule = deferred.promise;
                    $http.get('/hotel/viewOccrule/', {
                        params: {
                            hotel_id: hotelId,
                            rule_id: ruleId
                        }
                    })
                        .then(function (response) {
                            var rule = response.data;
                            deferred.resolve(rule);
                        }, function (error) {
                            rule = null;
                            deferred.reject(error);
                        });
                    return rule;
                }
            };
        })
        .factory('PromotionRule', function ($q, $http) {
            return {
                get: function (hotelId, ruleId) {
                    var deferred = $q.defer();
                    var rule = deferred.promise;
                    $http.get('/hotel/viewPromorule', {
                        params: {
                            hotel_id: hotelId,
                            rule_id: ruleId
                        }
                    })
                        .then(function (response) {
                            var rule = response.data;
                            deferred.resolve(rule);
                        }, function (error) {
                            rule = null;
                            deferred.reject(error);
                        });
                    return rule;
                }
            };
        })
        .factory('CompetitionRule', function ($q, $http) {
            return {
                get: function (hotelId, ruleId) {
                    var deferred = $q.defer();
                    var rule = deferred.promise;
                    $http.get('/hotel/viewComprule/', {
                        params: {
                            hotel_id: hotelId,
                            rule_id: ruleId
                        }
                    })
                        .then(function (response) {
                            var rule = response.data;
                            deferred.resolve(rule);
                        }, function (error) {
                            rule = null;
                            deferred.reject(error);
                        });
                    return rule;
                }
            };
        })
        .factory('Competition', function ($http, User, UIContext) {
            return {
                get_competitor: function (hid) {
                    var url = '/hotel/getcompetitors?hotel_id=' + hid;
                    return $http.get(url);
                },
                get_otas: function (hid) {
                    var url = '/hotel/getotas?hotel_id=' + hid;
                    return $http.get(url);
                },
                ge_kt_mapping: function (hid) {
                    var url = '/hotel/gemapping?hotel_id=' + hid;
                    return $http.get(url);
                }
            };
        })



        .factory('eventsTracker', function ($http, $injector) {
            return {
                logEvent: function (event_type, context) {
                    var event_data = {
                        'event': {
                            'event_type': 'ui_' + event_type,
                            'context': context,
                        }
                    };
                    var User = $injector.get('User');
                    events = ['loggedout', 'loggedin'];
                    if (events.indexOf(event_type) == -1) {
                        var token = User.getToken();
                        var url = '/user/refreshToken/';
                        $http.post(url, {"token": token}).then(function (res) {
                            User.setToken(res.data.token);
                        });
                    }
                    return $http.post('/api/events/', event_data);
                }
            };
        })
        .factory('manageRulesService', function ($http) {
            return {
                del: function (params, callback) {
                    var post_url = '/hotel/updatestatus/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                },
                rulestatus: function (activeTab, params, callback) {
                    var post_url = activeTab == 'occupancy'? '/hotel/updatestatus/' : activeTab == 'promotion' ? '/hotel/updatepromostatus/' : '/hotel/updatecompstatus/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                },
                ruleorder: function (activeTab, params, callback) {
                    var post_url = activeTab == 'occupancy'? '/hotel/updateorder/' : activeTab == 'promotion' ? '/hotel/updatepromoorder/' : '/hotel/updatecomporder/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                }
            };
        })
        .factory('ReorderOccupancyPricingRule', function ($http) {
            return {
                del: function (params, callback) {
                    var post_url = '/hotel/updatestatus/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                },
                rulestatus: function (params, callback) {
                    var post_url = '/hotel/updatestatus/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                },
                ruleorder: function (params, callback) {
                    var post_url = '/hotel/updateorder/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                }
            };
        })
        .factory('AutoRuleCreation',function ($http) {
            return{
                create_rules:function (params,callback) {
                    var post_url = '/hotel/autorulecreation/';
                    $http.post(post_url,angular.toJson(params,true))
                        .then(function () {
                            callback();
                        })

                },
                delete_all_rules:function (params,callback) {
                    var post_url = '/hotel/deleteallrules/';
                    $http.post(post_url,angular.toJson(params,true))
                        .then(function () {
                            callback();
                        })

                }
            }

        })
        .factory('ReorderCompetitionPricingRule', function ($http) {
            return {
                del: function (params, callback) {
                    var post_url = '/hotel/updatestatus/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                },
                rulestatus: function (params, callback) {
                    var post_url = '/hotel/updatecompstatus/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                },
                ruleorder: function (params, callback) {
                    var post_url = '/hotel/updatecomporder/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                }
            };
        })
        .factory('ReorderPromotionPricingRule', function ($http) {
            return {
                del: function (params, callback) {
                    var post_url = '/hotel/updatestatus/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                },
                rulestatus: function (params, callback) {
                    var post_url = '/hotel/updatestatus/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                },
                ruleorder: function (params, callback) {
                    var post_url = '/hotel/updatepromoorder/';
                    $http.post(post_url, angular.toJson(params, true))
                        .then(function () {
                            callback();
                        });
                }
            };
        })
        .factory('WalkThrough', function ($window, $http, UIContext, User, UserSettings) {
            return {
                set: function (feat, status) {
                    UserSettings.setOverlayToFalse(feat, status).then(function () {
                        var config = User.getUserConfig();
                        config[feat] = status;
                        User.setUserConfig(config);
                    });
                },
                get: function (feat) {
                    var config = User.getUserConfig();
                    return config[feat];
                },
                status: function (feat) {
                    var config = User.getUserConfig();
                    if (config === null) {
                        return true;
                    } else {
                        return config[feat] !== false;
                    }
                }
            };
        })
        .factory('UserSettings', function ($http, User, UIContext) {
            return {
                setOverlayToFalse: function (feat, status) {
                    var hotel_id = UIContext.getHotelId();
                    var url = '/hotel/setoverlaytofalse';
                    var params = {
                        'hotel_id': hotel_id,
                        'overlay_item': feat,
                        'status': status
                    };
                    return $http.post(url, params);
                },
                setUserSettings: function (settings_name, settings) {
                    var hotel_id = UIContext.getHotelId();
                    var url = '/hotel/updateusersettings';
                    var params = {
                        'hotel_id': hotel_id,
                        'settings_name': settings_name,
                        'settings': settings
                    };
                    return $http.post(url, params);
                },
                getUserSettings: function (hid) {
                    var url = '/hotel/getusersettings?hotel_id=' + hid;
                    return $http.get(url);
                },
                get_hotel_currency_code: function (hid) {
                    var url = '/hotel/gethotelsettings?hotel_id=' + hid;
                    return $http.get(url);
                },
                get_hotel_rate_type: function (hid) {
                    var url = '/hotel/gethotelratetype?hotel_id=' + hid;
                    return $http.get(url);
                },
                get_currency_iso_code: function (hid) {
                    var url = '/hotel/getcurrencyiso?hotel_id=' + hid;
                    return $http.get(url);
                },
                get_pms_code: function (hid) {
                    var url = '/hotel/getpmssettings?hotel_id=' + hid;
                    return $http.get(url);
                }

            };
        })
        .factory('AjaxCalls', function($rootScope) {
            var callsInProgress = 0;
            return {
                is_busy: function () {
                    return callsInProgress > 0;
                },

                increament: function() {
                    if(callsInProgress == 0) {
                        $rootScope.$emit('ajaxStarted')
                    }
                    callsInProgress++;
                },

                decreament: function() {
                    callsInProgress--;
                    if(callsInProgress == 0) {
                        $rootScope.$emit('ajaxEnded')
                    }
                }

            }
        });
})();
