describe('Segmentation Chart Controller', function() {
    beforeEach(module('segChartCtrl'));

    var ctrl, myScope,
        segmentationService = {
            data: {
                "meta": {
                    "segments": ["All"],
                    "status": "success",
                    "previous_dates": ["2015-06-01"],
                    "current_dates": ["2016-06-06"]
                },
                "data": {
                    "adr": {
                        "All": {
                            "categories": ["Walk-In", "Corporate", "OTA"],
                            "data": {
                                "current": [2999.0, 1193.6666666666667, 1088.3529411764705],
                                "previous": [0, 1612.0, 1473.111111111111]
                            }
                        },
                        "Summary": {
                            "categories": ["All"],
                            "data": {
                                "current": [1194.2916666666667],
                                "previous": [1507.5]
                            }
                        }
                    },
                    "revpar": {
                        "All": {
                            "categories": ["Walk-In", "Corporate", "OTA"],
                            "data": {
                                "current": [93.71875, 223.8125, 578.1875],
                                "previous": [0, 201.5, 414.3125]
                            }
                        },
                        "Summary": {
                            "categories": ["All"],
                            "data": {
                                "current": [895.71875],
                                "previous": [659.53125]
                            }
                        }
                    },
                    "rooms": {
                        "All": {
                            "categories": ["Walk-In", "Corporate", "OTA"],
                            "data": {
                                "current": [1, 6, 17],
                                "previous": [0, 4, 9]
                            }
                        },
                        "Summary": {
                            "categories": ["All"],
                            "data": {
                                "current": [24],
                                "previous": [14]
                            }
                        }
                    },
                    "revenue": {
                        "All": {
                            "categories": ["Walk-In", "Corporate", "OTA"],
                            "data": {
                                "current": [2999, 7162, 18502],
                                "previous": [0, 6448, 13258]
                            }
                        },
                        "Summary": {
                            "categories": ["All"],
                            "data": {
                                "current": [28663],
                                "previous": [21105]
                            }
                        }
                    }
                }
            }
        },
        noData = {
            data: {
                "meta": {
                    "segments": [],
                    "status": "success",
                    "previous_dates": ["2015-06-01"],
                    "current_dates": ["2016-06-06"]
                },
                "data": {
                    "adr": {
                        "Summary": {
                            "categories": [],
                            "data": {
                                "current": [],
                                "previous": []
                            }
                        }
                    },
                    "revpar": {
                        "Summary": {
                            "categories": [],
                            "data": {
                                "current": [],
                                "previous": []
                            }
                        }
                    },
                    "rooms": {
                        "Summary": {
                            "categories": [],
                            "data": {
                                "current": [],
                                "previous": []
                            }
                        }
                    },
                    "revenue": {
                        "Summary": {
                            "categories": [],
                            "data": {
                                "current": [],
                                "previous": []
                            }
                        }
                    }
                }
            }
        },
        uiContextService = {
            getDates: function() {
                return ['11-05-2016'];
            },
            getHotelId: function() {
                return 1;
            }
        };

    beforeEach(module(function($provide) {
        $provide.value('UIContext', uiContextService);
        $provide.value('SegmentChart', segmentationService);
    }));

    beforeEach(inject(function($controller, $rootScope, $q) {
        segmentationService.get = function() {
            var deferred = $q.defer();
            deferred.resolve(function() {
                return true;
            });
            return deferred.promise;
        };
        myScope = $rootScope.$new(true);
        ctrl = $controller('segChartController', {
            $scope: myScope
        });
    }));

    describe('Data checks', function() {
        it('should say noData when data is unavailable', function() {
            ctrl.checkData(noData.data, '2016');
            expect(myScope.noData).toBe(true);

            ctrl.checkData(segmentationService.data, '2016');
            expect(myScope.noData).toBe(false);
        });

        describe('should reformat the data to the required format:', function() {

            it('Rooms - Summary', function() {
                var rooms_summary = [ [ 'Last year (1st Jun 2015)', 14 ], [ 'Current year (6th Jun 2016)', 24 ] ];
                var formattedData = ctrl.reformatData(segmentationService.data, "rooms", "Summary");
                expect(formattedData).toEqual(rooms_summary);
            });
            it('RevPAR - Summary', function() {
                var revpar_summary = [ [ 'Last year (1st Jun 2015)', 659.53125 ], [ 'Current year (6th Jun 2016)', 895.71875 ] ];
                var formattedData = ctrl.reformatData(segmentationService.data, "revpar", "Summary");
                expect(formattedData).toEqual(revpar_summary);
            });
            it('ADR - Summary', function() {
                var adr_summary = [ [ 'Last year (1st Jun 2015)', 1507.5 ], [ 'Current year (6th Jun 2016)', 1194.2916666666667 ] ];
                var formattedData = ctrl.reformatData(segmentationService.data, "adr", "Summary");
                expect(formattedData).toEqual(adr_summary);
            });
            it('Revenue - Summary', function() {
                var revenue_summary = [ [ 'Last year (1st Jun 2015)', 21105 ], [ 'Current year (6th Jun 2016)', 28663 ] ];
                var formattedData = ctrl.reformatData(segmentationService.data, "revenue", "Summary");
                expect(formattedData).toEqual(revenue_summary);
            });

            it('Rooms - All', function() {
                var rooms_All = [ [ 'Last year (1st Jun 2015)', 0, 4, 9 ], [ 'Current year (6th Jun 2016)', 1, 6, 17 ] ];
                var formattedData = ctrl.reformatData(segmentationService.data, "rooms", "All");
                expect(formattedData).toEqual(rooms_All);
            });
            it('RevPAR - All', function() {
                var revpar_All = [ [ 'Last year (1st Jun 2015)', 0, 201.5, 414.3125 ], [ 'Current year (6th Jun 2016)', 93.71875, 223.8125, 578.1875 ] ];
                var formattedData = ctrl.reformatData(segmentationService.data, "revpar", "All");
                expect(formattedData).toEqual(revpar_All);
            });
            it('ADR - All', function() {
                var adr_All = [ [ 'Last year (1st Jun 2015)', 0, 1612, 1473.111111111111 ], [ 'Current year (6th Jun 2016)', 2999, 1193.6666666666667, 1088.3529411764705 ] ];
                var formattedData = ctrl.reformatData(segmentationService.data, "adr", "All");
                expect(formattedData).toEqual(adr_All);
            });
            it('Revenue - All', function() {
                var revenue_All = [ [ 'Last year (1st Jun 2015)', 0, 6448, 13258 ], [ 'Current year (6th Jun 2016)', 2999, 7162, 18502 ] ];
                var formattedData = ctrl.reformatData(segmentationService.data, "revenue", "All");
                expect(formattedData).toEqual(revenue_All);
            });

        });

    });

});
