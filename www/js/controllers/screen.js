/**
state('app.screen', url: '/screen'templateUrl: 'templates/screen/screen.html',controller: 'screenMainCtrl' //스크린 번개(for backend)
state('app.screen.map', templateUrl: 'templates/screen/screen-map.html',controller: 'screenCtrl' //스크린 번개 맵 디스플레이 (screen.js)
state('app.screen.lists', url: '/lists','screenContent': templateUrl: 'templates/screen/screen-list.html',controller: 'screenListCtrl' //번개 리스트
state('app.screen.send', url: '/send/:screenId',templateUrl: 'templates/screen/screen-send.html',controller: 'screensendCtrl' //번개 날리기 (screen.js)
state('app.screen.modify', url: '/modify/:postId',templateUrl: 'templates/screen/screen-send.html',controller: 'screensendCtrl' //번개 수정(screen.js)
state('app.screen.shopmodify', url: '/shopmodify/:postId',templateUrl: 'templates/screen/screen-modify.html',controller: 'screenShopModifyCtrl'  //스크린 상점정보 수정 요청(screen.js)
*/


angular.module('starter.controllers')
	.controller('screenMainCtrl', function() {//메인 메뉴 컨트롤
		// console.log('screenMainCtrl start...');
	})
	
	
	
	.controller('screenCtrl', function($rootScope, $scope, $state, $cordovaGeolocation, $http, $compile, $ionicPopup, $ionicLoading, $timeout) {

		//console.log("screenCtrl start...");
		var latLng			= {};
		var options			= {maximumAge: 3000, frequency:1000, timeout: 5000, enableHighAccuracy: true}; // may cause errors if true
		var mapOptions		= {};
		var markers 		= [];//for cluster 
		var markerCluster	= {};
		var geocoder;
		var marker_me		= {};
		var marker_user		= {};
		var marker_screen	= {};
		var marker_screens	= [];
		$scope.setData		= {};
		var radius			= 2;//4: 10km이내, 8:20km 이내, 20:50km 이내
		var defaultZoom		= 14;

		$scope.lists = [];
		$scope.showlist = false;
		
		//지도 css정의
		$scope.setData.mapCss = {width:'100%', height:'100%'};
		//$scope.setData.mapCss.width		= '100%';
		//$scope.setData.mapCss.height	= '100%';
		
		$scope.$on('$destroy', function() {
		
			//$scope.map.setVisible(false);
			//$scope.map.removeEventListener();
			//$scope.map.setClickable(false);
			//$scope.map.clear();
			//	$scope.map.remove()
		
		});

		$scope.$on('$ionicView.enter', function() {
			document.addEventListener("resume", onResume, false);
			$timeout(checkState, 500);

			if (window.cordova) {
 				facebookConnectPlugin.logEvent(
 					"Content View", 
 					{
 						ContentType: "스크린번개"
 					}
 				);
 			}
		});

		var onResume = function() {
			checkState();
		};

		// console.log(ionic.Platform);

		var checkState = function() {
			if (window.cordova) {
				cordova.plugins.diagnostic.isLocationEnabled(function(enabled){
					if (! enabled) {
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: "현재 위치 정보를 가져올 수 없습니다.<br />GPS 상태를 확인해주세요.",
							okText: '확인'
						});
						if (ionic.Platform.isAndroid()) {
							alertPopup.then(function(res) {
								cordova.plugins.diagnostic.switchToLocationSettings();
							});
						}else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) { //var isIPad = ;
							alertPopup.then(function(res) {
								cordova.plugins.diagnostic.switchToSettings();
							});
						}
					} else {
						getGeolocation();						
					}
				}, function(error){
					var alertPopup = $ionicPopup.alert({
						title: '알림',
						template: "다음 오류가 발생했습니다.: "+error,
						okText: '확인'
					});
				    // console.error("The following error occurred: "+error);
				});
			} else {
				getGeolocation();
			}

		};

		//위치변경을 처리
		var updateMapView = function(event) {
			//console.log("updateMapView Start...");
			var userLocation = marker_me.getPosition();
			$scope.map.panTo(userLocation);
			$scope.setData.mapCss = {width:'100%', height:'100%'};
		};
		
		/**
		 * 위치 검색 
		 */
		$scope.searchPosition = function(){
			//console.log("searchPosition Start..");
			var address = $scope.setData.address;

			if (window.cordova) {
 				facebookConnectPlugin.logEvent(
 					"Search", 
 					{
 						ContentType: "스크린번개 위치검색",
 						SearchString: address
 					}
 				);
 			}
			
			geocoder.geocode({ 'address': address }, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					deleteMarkers();
					marker_me.setPosition(results[0].geometry.location);
					//console.log(results[0]);
					displayUsersViaAjax(results[0].geometry.location.lat(), results[0].geometry.location.lng(), radius);
					//스크린골프샵 좌표에 입력
					displayStoreViaAjax(results[0].geometry.location.lat(), results[0].geometry.location.lng(), radius);
					updateMapView();
				} else {
					//console.log('Geocode was not successful for the following reason: ' + status);
					
					var alertPopup = $ionicPopup.alert({//OVER_QUERY_LIMIT
						title: '알림',
						template: status
					});

				}
			});
		};
	
		var getGeolocation = function(){

			$scope.setData.address = '';
			$scope.showlist = false;

			$cordovaGeolocation.getCurrentPosition(options).then(function(position){
		
				latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
		 
				mapOptions = {
					center: latLng,
					zoom: defaultZoom,
					zoomControl: false,
					streetViewControl: false,
					mapTypeControl: false,
					scrollwheel: false,
					mapTypeId: google.maps.MapTypeId.ROADMAP,
					minZoom: defaultZoom, 
					maxZoom: 16
				};
		 		
				$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
				geocoder = new google.maps.Geocoder();

				//Wait until the map is loaded
				//console.log('ordovaGeolocation.getCurrentPosition start...');
				google.maps.event.addListenerOnce($scope.map, 'idle', function(){
				// console.log("scope.map idle start...");
				 //	var bounds = $scope.map.getBounds();
				 	
					//현재 나의 위치를 지도상에 표시한다.
					displayMyPosition();
					
					//회원들의 좌표값 넣어줌
					displayUsersViaAjax(position.coords.latitude, position.coords.longitude, radius);
					//스크린골프샵 좌표에 입력
					displayStoreViaAjax(position.coords.latitude, position.coords.longitude, radius);
					
					//드레그했을 경우 새로이 좌료를 받아온다.
					google.maps.event.addListener($scope.map, 'dragend', function($event) {
						$scope.showlist = false;
						var latlng = $scope.map.getCenter();

						//지도상의 모든 표시를 지운다.
						deleteMarkers();
						// $scope.setData.mapCss = {width:'100%', height:'100%'};
						//회원들의 좌표값 넣어줌
						displayUsersViaAjax(latlng.lat(), latlng.lng(), radius);
						//스크린골프샵 좌표에 입력
						displayStoreViaAjax(latlng.lat(), latlng.lng(), radius);
					
					});
					
				});
			}, function(error){
				var alertPopup = $ionicPopup.alert({
					title: '알림',
					template: '현재 위치 정보를 가져올 수 없습니다.<br />GPS 상태를 확인해주세요.',
					okText: '확인'
				});
				if (ionic.Platform.isAndroid()) {
					alertPopup.then(function(res) {
						cordova.plugins.diagnostic.switchToLocationSettings();
					});
				}else if (ionic.Platform.isIPad() || ionic.Platform.isIOS()) { //var isIPad = ;
							alertPopup.then(function(res) {
								cordova.plugins.diagnostic.switchToSettings();
							});
						}
				// alertPopup.then(function(res) {
				// 	$state.go('app.screen.lists');
				// });
				// console.log(error);
				// console.log("Could not get location");
			});

		};

		
		
		//나의 위치를 지도 상에 표시한다.
		function displayMyPosition(){
			//console.log('displayMyPosition Start...');
			marker_me = new google.maps.Marker({
				map: $scope.map,
				animation: google.maps.Animation.DROP,
				position: latLng
			});		
		}

		/**
		 *현재 위치로 가기 
		 */
		$scope.searchCurrentPostion = function(){

			checkState();
			
			$cordovaGeolocation.getCurrentPosition(options).then(function(position){
				latlng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);//현재 위치정보를 자동으로 받을 경우
				geocoder.geocode({ 'latLng': latlng}, function(results, status) {
					if (status == google.maps.GeocoderStatus.OK) {
						marker_me.setPosition(results[0].geometry.location);
						geo_location	= results[0].formatted_address;
						updateMapView();
						
						//지도상의 모든 표시를 지운다.
						deleteMarkers();
						$scope.setData.mapCss = {width:'100%', height:'100%'};
						//회원들의 좌표값 넣어줌
						displayUsersViaAjax(latlng.lat(), latlng.lng(), radius);
						//스크린골프샵 좌표에 입력
						displayStoreViaAjax(latlng.lat(), latlng.lng(), radius);
					} else {
						console.log('Geocode was not successful for the following reason: ' + status);
					}
				});
			}, function(error){
				var alertPopup = $ionicPopup.alert({
					title: '알림',
					template: '현재 위치 정보를 가져올 수 없습니다.<br />GPS 상태를 확인해주세요.',
					okText: '확인'
				});
				// alertPopup.then(function(res) {
				// 	$state.go('app.screen.lists');
				// });
				// console.log("Could not get location");
			});
		};
		
		
		//모든 사용자를 지도 상에 표시한다.
		function displayUsersViaAjax(lat, lng, radius) {
			// console.log('displayUsersViaAjax Start...');
			
			var customIcons = [
				{ icon: 'http://labs.google.com/ridefinder/images/mm_20_green.png', shadow: 'http://labs.google.com/ridefinder/images/mm_20_shadow.png' },
				{ icon: 'http://labs.google.com/ridefinder/images/mm_20_blue.png', shadow: 'http://labs.google.com/ridefinder/images/mm_20_shadow.png' },
				{ icon: 'http://labs.google.com/ridefinder/images/mm_20_red.png', shadow: 'http://labs.google.com/ridefinder/images/mm_20_shadow.png' },
			];
	
			var infoWindow = new google.maps.InfoWindow();
			//console.log(apiServer+'maps/load?lat='+lat+'&lng='+lng+'&radius='+radius);
			$http.get(apiServer+'maps/load?lat='+lat+'&lng='+lng+'&radius='+radius)
				.then(function(response) {
					//console.log(response);
					$scope.lists = {length: response.data.data.length};
					angular.forEach(response.data.data, function(item, key){
						
						var point = new google.maps.LatLng(parseFloat(item.latitude), parseFloat(item.longitude));
						var icon = customIcons[item.gender] || {};
						//console.log(item);
						///#/app/mypage/info/%EA%B3%A8%ED%94%84%EC%82%AC%EB%9E%91%EC%95%84
						// var html = '<div class="avatar"><a href="#/app/mypage/info/'+item.username+'"><img src="'+item.thumbnail+'" /></a></div>';
						//var marker = new google.maps.Marker({ map: map, position: point, icon: icon.icon, shadow: icon.shadow });
						marker_user = new google.maps.Marker({
							map: $scope.map,
							//animation: google.maps.Animation.DROP,
							position: point,
							icon: icon.icon, 
							shadow: icon.shadow
						});
						//$list.append(item.html);
						markers.push(marker_user);
						//bindInfoWindow(marker, map, infoWindow, html);
						// bindInfoWindow(marker_user, $scope.map, infoWindow, html);
					});
					
					//url: "http://google-maps-utility-library-v3.googlecode.com/svn/trunk/markerclusterer/images/m5.png",
					mcOptions = {
						gridSize: 120,
						minimumClusterSize: 1,
						styles: [
							{
								height: 40,
								url: "images/icon/googlemap/markerclusterer/m1.png",
								width: 40,
								textColor: '#fff',
								textSize: 16
							},
							{
								height: 50,
								url: "images/icon/googlemap/markerclusterer/m2.png",
								width: 50,
								textColor: '#fff',
								textSize: 16
							},
							{
								height: 60,
								url: "images/icon/googlemap/markerclusterer/m3.png",
								width: 60,
								textColor: '#fff',
								textSize: 16
							},
							{
								height: 60,
								url: "images/icon/googlemap/markerclusterer/m4.png",
								width: 60,
								textColor: '#fff',
								textSize: 16
							},
							{
								height: 60,
								url: "images/icon/googlemap/markerclusterer/m5.png",
								width: 60,
								textColor: '#fff',
								textSize: 16
							}
						]
					};

					markerCluster = new MarkerClusterer($scope.map, markers, mcOptions);
					markerCluster.zoomOnClick_	= false;//줌 설정 false;

					//get user list when cluster click
					google.maps.event.addListener(markerCluster, 'clusterclick', function(cluster) {
						// console.log(markerCluster);
						angular.forEach(markerCluster.clusters_, function(value, key) {
							if (value.clusterIcon_.index_) 
								value.clusterIcon_.div_.style.backgroundImage = 'url("images/icon/googlemap/markerclusterer/m'+value.clusterIcon_.index_+'.png")';
						});
						cluster.clusterIcon_.div_.style.backgroundImage = 'url("images/icon/googlemap/markerclusterer/m'+cluster.clusterIcon_.index_+'_on.png")';
						$ionicLoading.show();
						$.ajax({
							type: "GET",
							url: apiServer + 'maps/bound',
							data: {lat:cluster.getCenter().lat(), lng:cluster.getCenter().lng(), cnt:cluster.getSize()},
							//data: $("#bulkMessageForm").serialize(),
							success: function (response) {
								// $scope.setData.mapCss.height = '300px';
								$scope.lists	= response.data;
								$scope.showlist = true;
								$ionicLoading.hide();
							}
						});
						return false;
					});
				},function(error){
					//$log.log(error);	
					console.log(error);
				}
			);		
		}//function displayUsersViaAjax(lat, lng, radius) {
		
		//모든 골프샵을 지도 상에 표시한다.
		//http://plnkr.co/edit/EbBWJQx5pOz0UyoayYFI?p=preview
		function displayStoreViaAjax(lat, lng, radius) {
			
//return false;//마운팅용으로 store를 표시하지 않는다.
//			console.log('displayStoreViaAjax Start...');
			
			var customIcons = 
				{ 
					url: 'images/icon/googlemap/markerclusterer/Golf-Club-Green-icon.png'
					,scaledSize: new google.maps.Size(31, 48), // scaled size
				};
	
			var infoWindow = new google.maps.InfoWindow();
			
			$http.get(apiServer+'stores/load?lat='+lat+'&lng='+lng+'&radius='+radius)
				.then(function(response) {
					angular.forEach(response.data.data, function(item, key){
						// console.log(item);
						var point = new google.maps.LatLng(parseFloat(item.latitude), parseFloat(item.longitude));
						var icon = customIcons;
						var screenInfo = '<div class="map-screen-wrap"><div class="map-screen-title">'+item.name+'</div><div class="map-screen-address">주소:'+item.address+'</div><div class="map-screen-tel">전화번호:'+item.phone+'</div><div class="map-screen-modify"><a href="#/app/screen/shopmodify/'+item.id+'">정보수정 요청</a></div><button type="button" class="button button-positive button-small btn-write" ng-click="setScreen('+item.id+')">번개날리기</button></div>';
						//var marker = new google.maps.Marker({ map: map, position: point, icon: icon.icon, shadow: icon.shadow });
						marker_screen = new google.maps.Marker({
							map: $scope.map,
							//animation: google.maps.Animation.DROP,
							position: point,
							icon: icon, 
							shadow: icon.shadow
						});
						marker_screens.push(marker_screen);
						//markers.push(marker_screen);
						bindInfoWindow(marker_screen, $scope.map, infoWindow, screenInfo);
					});
				},function(error){
					//$log.log(error);	
					console.log(error);
				}
			);		
		}//function displayUsersViaAjax(lat, lng, radius) {
		
		
		

		// Binds a marker to an info window
		function bindInfoWindow(marker, map, infoWindow, html) {
			// google.maps.event.addListener(marker, 'mouseover', function() {
			google.maps.event.addListener(marker, 'click', function() {
				//infoWindow.setContent(html);
				var compiled = $compile(html)($scope);
				infoWindow.setContent(compiled[0]);
				infoWindow.open(map, marker);
			});
		}

		// Sets the map on all markers in the array.
		function setMapOnAll(map) {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(map);
			}

			for (var i = 0; i < marker_screens.length; i++) {
				marker_screens[i].setMap(map);
			}
		}
		
		// Removes the markers from the map, but keeps them in the array.
		function clearMarkers() {
			setMapOnAll(null);
		}
		
		// Shows any markers currently in the array.
		function showMarkers() {
			setMapOnAll(map);
		}
		
		// Deletes all markers in the array by removing references to them.
		function deleteMarkers() {
			clearMarkers();

			markers = [];
			marker_screens = [];
			markerCluster.clearMarkers();
		}
		
		
		//번개날리기
		$scope.setScreen = function(item){
			if(!$rootScope.me.profile.phone){
				$scope.phoneCertCheck();	
				return;
			}
			$state.go('app.screen.send', {screenId: item});
		};
	
		//프로필 방문
		$scope.onItemProfile = function(item) {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			$state.go('app.mypage.visit', {Id: item.username, userId: item.user_id});
		};

		$scope.closeBottom = function() {
			$scope.showlist = false;
		};
	})
	/**
	 * 번개 등록/수정하기 
	 */
	.controller('screensendCtrl', function(
		$scope, 
		$state, 
		$stateParams, 
		$cordovaGeolocation, 
		$http, 
		$ionicLoading, 
		$ionicPopup, 
		city, 
		$filter,
		$ionicModal,
		$ionicHistory
	) {
		
		$scope.setData = {};

		var screen_id	= $stateParams.screenId;//상점아이디(상점을 클릭 후 진입시 사용)
		var post_id		= $stateParams.postId;//번개 등록 아이디(수정시 사용)
		if(screen_id) 	$scope.setData.screen_id = screen_id;//스크린 아이디의 존재 유무에 따라 스크린 선택 여부를 체크한다.
		if(post_id) 	$scope.setData.screen_id = post_id;

		if (window.cordova) {
			facebookConnectPlugin.logEvent(
				"screen register", 
				{
					ContentType: "번개 등록/수정"
				}
			);
		}
		
		if(post_id){//수정일 경우 현재 등록된 내용을 다시 불러 온다.
			$http.get(apiServer + 'screens/edit/'+post_id+'?token=' + localStorage.getItem('authToken'))
			//$http.get(apiServer + 'fields/create?token=' + localStorage.getItem('authToken')+"&"+obj)
				.then(function(response) {
					var obj	= response.data.screen;

					$scope.setData.message			= obj.message;
					$scope.setData.post_id			= post_id;
					$scope.setData.store_name_text	= obj.golf_store_name;;
					$scope.setData.store_name 		= obj.golf_store_id;

					$scope.setData.bookingDate	= set_date(obj.golf_time);
					$scope.setData.bookingDateTime	= set_date(obj.golf_time);
					
					
					 $ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
			
		}else{//수정이 아닐 경우 초기화 시킨다.
			var d = new Date();

			$scope.setData.bookingDate	= d;
			$scope.setData.bookingDateTime	= new Date(1970, 0, 1, d.getHours(), d.getMinutes(), 0);
			
			if(screen_id){//if screen_id exist then get screen info
				$ionicLoading.show();
				$http.get(apiServer+'stores/'+screen_id)
					.then(function(response) {
						 $scope.setData.store_name_text	= response.data.store.name;
						 $scope.setData.store_name 		= screen_id;
						},function(error){
							console.log(error);
						}
					).finally(function() {
						$ionicLoading.hide();
					}
				);
						
			}else{
				
			}
		}
		
		//states값을 세팅한다.
		$scope.setData.states = city;
		
		//도시 변경시 시.도.군 정보를 가져온다.
		$scope.ch_store_state	= function(){
			$ionicLoading.show();
			var store_state = $scope.setData.store_state;
			$http.get(apiServer+'stores/cities?store_state='+store_state)
				.then(function(response) {
					 $scope.setData.cities	= response.data.items;
					},function(error){
						console.log(error);
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
			
		};
		//시도군 변경시 골프장 리스트를 가져온다.
		$scope.ch_store_city	= function(){
			$ionicLoading.show();
			var store_state = $scope.setData.store_state;
			var store_city	= $scope.setData.store_city;
			$http.get(apiServer+'stores/screens?store_state='+store_state+'&store_city='+store_city)
				.then(function(response) {
					 $scope.setData.stores	= response.data.items;
					},function(error){
						console.log(error);
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
		};

		$scope.screenReview = function() {
			if($scope.setData.post_id) {
				$scope.submitregistForm();
			} else {
				$scope.setData.rDate	= $filter('date')($scope.setData.bookingDate, "yyyy/MM/dd");
				$scope.setData.rHour	= $filter('date')($scope.setData.bookingDateTime, "HH:mm");

				$ionicModal.fromTemplateUrl('templates/screen/screen-review-invite.html', {
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.callModal = modal;
					$scope.openModal($scope.setData);
				});

				//Cleanup the modal when we're done with it!
				$scope.$on('$destroy', function() {
					$scope.callModal.remove();
				});
			}
		};
		
		var overlap = false;

		//스크린골프 초청 등록하기
		$scope.submitregistForm = function(){

			if (overlap) return false;

			overlap = true;
		
			var store_name = screen_id ? screen_id : $scope.setData.store_name;

			var bookingDate	= $filter('date')($scope.setData.bookingDate, "yyyy/MM/dd");
			var bookingHour	= $filter('date')($scope.setData.bookingDateTime, "HH:mm");
				
			//입력된 시간의 유효성 시작
			var bookedDate	= 	bookingDate.split("/");
			var bookedTime	= 	bookingHour.split(":");
			var today = new Date(); 
			var dateObj = new Date(bookedDate[0], bookedDate[1]-1, bookedDate[2], bookedTime[0], bookedTime[1], 0);
			
			var interval = dateObj - today;
			
			if(interval < 0){

				overlap = false;

				var alertPopup = $ionicPopup.alert({
					title: '알림',
					template: '이미 지난 시간입니다.'
				});
				
				return false;
			}
			//입력된 시간 유효성 끝

			var url = "";
			var success_text = '';
			if($scope.setData.post_id) {
				url = apiServer + 'screens/update/'+$scope.setData.post_id+'?token=' + localStorage.getItem('authToken');
				success_text = '수정';
			} else {
				url = apiServer + 'screens/create?token=' + localStorage.getItem('authToken');
				success_text = '등록';
			}
			
			// $ionicLoading.show();
			$.ajax({
				type: "POST",
				//type: "GET",
				url: url,
				data: {store_name:store_name, date:bookingDate, hourminute:bookingHour, message:$scope.setData.message},
				success: function (response) {
					// $ionicLoading.hide();

					if(response.success){//
						// $ionicLoading.hide()

						if (window.cordova) {
							facebookConnectPlugin.logEvent(
								"screen complete", 
								{
									ContentType: "번개 등록/수정",
									store_name: store_name,
									bookingDate: bookingDate,
									bookingHour: bookingHour, 
									message: $scope.setData.message
								}
							);
						}

						overlap = false;

						var alertPopup = $ionicPopup.alert({
							title: success_text + '완료',
							template: success_text + '되었습니다.',
							okText: '확인'
						});
						alertPopup.then(function(res) {
							$state.go('app.screen.lists');
						});
						
					} else {
						overlap = false;
						// $ionicLoading.hide()
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: '등록 중 오류가 발생하였습니다. <br />오류코드 : ' + response.err_code
						});
					}
				}
			});
			// $ionicLoading.hide();
		
		 //     	}
			// });

		};
		/*
		$scope.setData.dateoptions = {
			monthsFull: [ '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월' ],
			monthsShort: [ '1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월' ],
			weekdaysFull: [ '일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일' ],
			weekdaysShort: [ '일', '월', '화', '수', '목', '금', '토' ],
			today: '오늘',
			clear: '취소',
			firstDay: 1,
			//format: 'yyyy 년 mm 월 dd 일',
			format: 'yyyy/mm/dd',
			formatSubmit: 'yyyy/mm/dd',
			closeOnSelect: false,
				closeOnClear: false
		};

		$scope.setData.timeminuteoptions = {
			//format: 'HH시 i분', // ISO formatted date
			format:'HH : i',
			interval: 30,
			min: [4,0],
			max: [22,0],
			onClose: function(e) {
			// do something when the picker closes	 
			//console.log('onClose');
			}
		};
		*/

		

		$scope.$on('$stateChangeStart', function() {
			if($scope.callModal) $scope.callModal.hide();
		});
		
		$scope.openModal = function(item) {
			$scope.shareItem = item;
			$scope.callModal.show();
		};

		
		$scope.closeModal = function(item) {
			$scope.callModal.hide();
		};

		
		// Execute action on hide modal
		$scope.$on('modal.hidden', function() {
			// Execute action
		});
		// Execute action on remove modal
		$scope.$on('modal.removed', function() {
			// Execute action
		});	

		// Disable weekend selection
			$scope.disabled = function(date, mode) {
			return mode === 'day' && (date.getDay() === 0 || date.getDay() === 6);
			};

			$scope.toggleMin = function() {
			$scope.minDate = $scope.minDate ? null : new Date();
			};

			$scope.toggleMin();
			$scope.maxDate = new Date(2020, 5, 22);

			$scope.open1 = function() {
			$scope.popup1.opened = true;
			};

			$scope.open2 = function() {
			$scope.popup2.opened = true;
			};

			$scope.setDate = function(year, month, day) {
			$scope.dt = new Date(year, month, day);
			};

			$scope.dateOptions = {
			formatYear: 'yy',
			startingDay: 1
			};

			$scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
			$scope.format = $scope.formats[0];
			$scope.altInputFormats = ['M!/d!/yyyy'];

			$scope.popup1 = {
			opened: false
			};

			$scope.popup2 = {
			opened: false
			};

			var tomorrow = new Date();
			tomorrow.setDate(tomorrow.getDate() + 1);
			var afterTomorrow = new Date();
			afterTomorrow.setDate(tomorrow.getDate() + 1);
			$scope.events =
			[
				{
				date: tomorrow,
				status: 'full'
				},
				{
				date: afterTomorrow,
				status: 'partially'
				}
			];

			$scope.getDayClass = function(date, mode) {
			if (mode === 'day') {
				var dayToCheck = new Date(date).setHours(0,0,0,0);

				for (var i = 0; i < $scope.events.length; i++) {
				var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

				if (dayToCheck === currentDay) {
					return $scope.events[i].status;
				}
				}
			}

			return '';
			};
			
		var lpad = function(str, padString, length) {
			while (str.length < length)
				str = padString + str;
			return str;
		};
		
		var set_date = function (input) {
		
			var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
			var dateArray = reggie.exec(input); 
			var d = new Date(
				(+dateArray[1]),
				(+dateArray[2])-1, // Careful, month starts at 0!
				(+dateArray[3]),
				(+dateArray[4]),
				(+dateArray[5]),
				(+dateArray[6])
			);
			return d;
			//return d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate();
		};

	})

	.controller('screenListCtrl', function(
		$rootScope,
		$scope, 
		$state, 
		$stateParams,
		$interval, 
		$ionicPopover, 
		$ionicPopup, 
		$ionicModal, 
		$http,
		$ionicLoading,
		$ionicPlatform,
		$filter,
		Auth,
		SocialShare
	) {
		//for test url : http://localhost:8100/#/app/screen/lists/160
		var post_id	= $stateParams.postId;//포스트 아이디

		var current_page = 1;
		
		$scope.lists = [];
		
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			$scope.screensListLoad();
		});
		
		$scope.$on('$ionicView.enter', function() {
			if(post_id) showInviteForm();
		});
		
		var showInviteForm = function(){
			
			//초청 번호와 관련된 정보를 호출한다.
			//$ionicLoading.show();
			$http.get(apiServer + 'screens/'+post_id+'?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
						
						//초청 번호가 있을 경우 이곳에 콜 팝업을 띄워준다.
						$ionicModal.fromTemplateUrl('templates/screen/modal-screen-call.html', {
							id: '3',
							scope: $scope,
							animation: 'fade-in-scale'
						}).then(function(modal) {
							$scope.callModal = modal;
							// $scope.openCallModal(response.data.screen);
							$scope.openModal(3,response.data.screen);
						});
					
					},function(error){
						//$ionicLoading.hide();
					}
				).finally(function() {
					
				}
			);
			
			
		};
		
		

		

		// $scope.openCallModal = function(item) {
		// 	$scope.callItem = item;
		// 	$scope.callModal.show();
		// };
		
		//$scope.closeCallModal = function() {
		//	$scope.callModal.hide();
		//};
		
		// 스크롤 올릴시 리스트 새로고침
		
		$scope.doRefresh = function(data) {
			current_page = 1;
			$scope.screensListLoad();
		};
		
		
		

		$scope.screensListLoad = function() {
			current_page = 1;

			$ionicLoading.show();
			$http.get(apiServer + 'screens/?token=' + localStorage.getItem('authToken'))
				.then(function(response) {

						$scope.lists = response.data;
						
					},function(error){
						$ionicLoading.hide();
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
		};

		// 스크롤 내릴시 리스트 추가
		$scope.loadMore = function() {
			current_page = current_page + 1;
			
			$ionicLoading.show();
			$http.get(apiServer + 'screens/?token=' + localStorage.getItem('authToken')+'&page='+current_page)
				.then(function(response) {
						$scope.lists.screens = $scope.lists.screens.concat(response.data.screens);
						
						$scope.$broadcast('scroll.infiniteScrollComplete');
					},function(error){
						$ionicLoading.hide();
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
		};

		//공유 모달 관련 시작
		// sharing plugin
		var shareImage = "http://localhost/images/main/sns_1st.png";
		$scope.shareMain = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var title = "'스크린번개 조인'하실 분 초대합니다.";
			var url = webServer + "/fields/"+$data.id;
			var subject = txt;
			var img = shareImage;
			if(img.indexOf('http')) img = webServer + "/"+img;
			// console.log(title, url, subject, img);
			window.plugins.socialsharing.share(title, subject, img, url);
		};

		//카카오톡//	f_golfdate //필터 - 일자
		$scope.sharekakaotalk = function($data) {
			// console.log($data);
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'스크린번개 조인'하실 분 초대합니다.\r\n["+txt+"]","url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('kakaotalk', obj);
		};
		
		//네이버밴드
		$scope.sharenaverband = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'스크린번개 조인'하실 분 초대합니다.["+txt+"]","url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('band', obj);
		};
		
		
		//카카오스토리
		$scope.sharekakaostory = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'스크린번개 조인'하실 분 초대합니다.", "txt":txt,"url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('kakaostory', obj);
		};
		
		//네이버카페
		$scope.sharenavercafe = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'스크린번개 조인'하실 분 초대합니다.","contents":webServer + "/fields/"+$data.id+"["+txt+"]", "img":shareImage};
			SocialShare.share('Navercafe', obj);
		};
		
		//페이스북
		$scope.sharefacebook = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var title	= "'스크린번개 조인'하실 분 초대합니다.["+txt+"]";
			var url		= webServer + "/fields/"+$data.id;
			// var img		= shareImage;
			var img		= $data.profile.thumbnail_image;
			if(img.indexOf('http')) img = webServer + "/"+img;
			window.plugins.socialsharing.shareViaFacebook(title, img, url);
		};

		//채팅하기
		$scope.onItemMessage = function(item) {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			//console.log(item);
			$state.go('app.messagecreate', {userId:item.poster_id});
		};
		
		//전화걸기
		$scope.onItemCall = function(item) {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			location.href='tel:' + item;
		};
	
		$ionicModal.fromTemplateUrl('templates/modal/screen-list-menu.html', {
			id: '1',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modalMenu = modal;
		});

		$ionicModal.fromTemplateUrl('templates/modal/golf-list-share.html', {
			id: '2',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.shareModal = modal;
		});

		$scope.$on('$stateChangeStart', function() {
			if($scope.modalMenu) $scope.modalMenu.hide();
			if($scope.shareModal) $scope.shareModal.hide();
			if($scope.callModal) $scope.callModal.hide();
		});
		
		$scope.openModal = function(index,item) {
			$scope.shareItem = item;
			if (index == 1) $scope.modalMenu.show();
			else if (index == 2) $scope.shareModal.show();
			else $scope.callModal.show();
		};

		
		$scope.closeModal = function(index,item) {
			if (index == 1) $scope.modalMenu.hide();
			else if (index == 2) $scope.shareModal.hide();
			else $scope.callModal.hide();
		};

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.modalMenu.remove();
			$scope.shareModal.remove();
		});
		// Execute action on hide modal
		$scope.$on('modal.hidden', function() {
			// Execute action
		});
		// Execute action on remove modal
		$scope.$on('modal.removed', function() {
			// Execute action
		});		

		
		//등록 수정하기
		$scope.onItemModify = function(item){
			$state.go("app.screen.modify", {postId:item.id}); 
			$scope.modalMenu.hide();
		};
		//등록 취소하기
		$scope.onItemCancel	= function(item){
			$scope.modalMenu.hide();
			
			var confirmPopup = $ionicPopup.confirm({
				title: '종료(취소)',
				template: '종료(취소)를 하시겠습니까?',
				cancelText: '취소',
				okText: '확인'
			});
			
			confirmPopup.then(function(res) {
				 if(res) {//실행
					$ionicLoading.show();
					$http.get(apiServer + 'screens/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
						.then(function(response) {
								$scope.screensListLoad();
							},function(error){
								$ionicLoading.hide();
							}
						).finally(function() {
							$ionicLoading.hide();
							$scope.modalMenu.hide();
						}
					);
				}
			});

		};
		
		//프로필 방문
		$scope.onItemProfile = function(item) {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			$state.go('app.mypage.visit', {Id: item.poster, userId: item.poster_id});
		};

	})

	.controller('screenShopModifyCtrl', function(
			$rootScope,
			$scope, 
			$state
		) 
		{

		}
	)
	
;