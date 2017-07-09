app.controller('WisataCtrl', function($scope, Data, toaster, uiGmapGoogleMapApi) {
    var tableStateRef;
    var control_link = "appwisata";
    $scope.displayed = [];
    $scope.form = {};
    $scope.is_edit = false;
    $scope.is_view = false;
    $scope.editorOptions = {
        height: '250px',
    };
    $scope.callMap = function(lat, long) {
        if (!$scope.is_view) {
            $scope.map = {
                center: {
                    latitude: lat,
                    longitude: long
                },
                scrollwheel:false,
                zoom: 13,
                markers: {
                    id: 1,
                    coords: {
                        latitude: lat,
                        longitude: long
                    }
                },
                events: {
                    click: function(map, eventName, originalEventArgs) {
                        var e = originalEventArgs[0];
                        var lat = e.latLng.lat(),
                            lon = e.latLng.lng();
                        var marker = {
                            id: 1,
                            coords: {
                                latitude: lat,
                                longitude: lon
                            }
                        };
                        $scope.map.markers = marker;
                        $scope.$apply();
                    }
                }
            };
        }
    };
    /** get list data */
    $scope.callServer = function callServer(tableState) {
        tableStateRef = tableState;
        $scope.isLoading = true;
        /** set offset and limit */
        var offset = tableState.pagination.start || 0;
        var limit = tableState.pagination.number || 10;
        var param = {
            offset: offset,
            limit: limit
        };
        /** set sort and order */
        if (tableState.sort.predicate) {
            param['sort'] = tableState.sort.predicate;
            param['order'] = tableState.sort.reverse;
        }
        /** set filter */
        if (tableState.search.predicateObject) {
            param['filter'] = tableState.search.predicateObject;
        }
        Data.get(control_link + '/index', param).then(function(response) {
            $scope.displayed = response.data.list;
            tableState.pagination.numberOfPages = Math.ceil(response.data.totalItems / limit);
        });
    };
    /** Get kategori */
    $scope.getKategori = function() {
        $scope.listKategori = [];
        Data.get(control_link + '/getkategori').then(function(response) {
            $scope.listKategori = response.data;
        });
    };
    /** create */
    $scope.create = function(form) {
        $scope.is_edit = true;
        $scope.is_view = false;
        $scope.is_create = true;
        $scope.form = {};
        $scope.form.publish = '1';
        $scope.getKategori();
        $scope.callMap(-7.871162, 112.526753);
    };
    /** update */
    $scope.update = function(form) {
        $scope.is_edit = true;
        $scope.is_view = false;
        $scope.getKategori();
        $scope.form = form;
        $scope.callMap(form.lattitude, form.longitude);
    };
    /** view */
    $scope.view = function(form) {
        $scope.is_edit = true;
        $scope.is_view = true;
        $scope.getKategori();
        $scope.form = form;
        $scope.callMap(form.lattitude, form.longitude);
    };
    /** save action */
    $scope.save = function(form) {
        form.lattitude = $scope.map.markers.coords.latitude;
        form.longitude = $scope.map.markers.coords.longitude;
        Data.post(control_link + '/save', form).then(function(result) {
            if (result.status_code == 200) {
                $scope.is_edit = false;
                $scope.callServer(tableStateRef);
                toaster.pop('success', "Berhasil", "Data berhasil tersimpan");
            } else {
                toaster.pop('error', "Terjadi Kesalahan", setErrorMessage(result.errors));
            }
        });
    };
    /** cancel action */
    $scope.cancel = function() {
        if (!$scope.is_view) {
            $scope.callServer(tableStateRef);
        }
        $scope.is_edit = false;
        $scope.is_view = false;
    };
    /** delete data */
    $scope.delete = function(row) {
        if (confirm("Apa anda yakin akan MENGHAPUS PERMANENT item ini ?")) {
            Data.delete(control_link + '/delete/' + row.id).then(function(result) {
                $scope.displayed.splice($scope.displayed.indexOf(row), 1);
            });
        }
    };
})