angular.module('starter.controllers')

	.controller('mapCtrl', function($scope, $state, $cordovaGeolocation, $http) {
		
		var latLng			= {};
		var options			= {timeout: 10000, enableHighAccuracy: true};
		var mapOptions		= {};
		var markers 		= [];//for cluster 
		var markerCluster	= {};
		$cordovaGeolocation.getCurrentPosition(options).then(function(position){
	 
			latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
	 
			mapOptions = {
				center: latLng,
				zoom: 15,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
	 
			$scope.map = new google.maps.Map(document.getElementById("map"), mapOptions);
			
			//Wait until the map is loaded
			google.maps.event.addListenerOnce($scope.map, 'idle', function(){
			 
			 //	var bounds = $scope.map.getBounds();
			 	
				var marker = new google.maps.Marker({
					map: $scope.map,
					animation: google.maps.Animation.DROP,
					position: latLng
				});		
			 
				var infoWindow = new google.maps.InfoWindow({
					content: "Here I am!"
				});
			 
				google.maps.event.addListener(marker, 'click', function () {
					infoWindow.open($scope.map, marker);
				});
			 
				//회원들의 좌표값 넣어줌
				//4: 10km이내, 8:20km 이내, 20:50km 이
				displayUsersViaAjax(position.coords.latitude, position.coords.longitude, 4);
				
				//드레그했을 경우 새로이 좌료를 받아온다.
				//console.log("aaa");
				google.maps.event.addListener($scope.map, 'dragend', function($event) {
					console.log("aaaa");
					//var latlng = getMapCenter();
					
					var latlng = $scope.map.getCenter();

					console.log('markers length:'+markers.length);
					
					//지도상의 모든 표시를 지운다.
					deleteMarkers();
					//for (var i = 0; i < markers.length; i++)
					//	markers[i].setMap(null);
					// markers = [];

					//displayUsersViaAjax(latlng.lat(), latlng.lng(), radius)		
					//4: 10km이내, 8:20km 이내, 20:50km 이
					displayUsersViaAjax(latlng.lat(), latlng.lng(), 4);
				
				});
				
			});
		}, function(error){
			console.log("Could not get location");
		});
		


		function displayUsersViaAjax(lat, lng, radius) {
			console.log(apiServer+'maps/load?lat='+lat+'&lng='+lng+'&radius='+radius);
			
			var customIcons = [
				{ icon: 'http://labs.google.com/ridefinder/images/mm_20_green.png', shadow: 'http://labs.google.com/ridefinder/images/mm_20_shadow.png' },
				{ icon: 'http://labs.google.com/ridefinder/images/mm_20_blue.png', shadow: 'http://labs.google.com/ridefinder/images/mm_20_shadow.png' },
				{ icon: 'http://labs.google.com/ridefinder/images/mm_20_red.png', shadow: 'http://labs.google.com/ridefinder/images/mm_20_shadow.png' },
			];
	
			var infoWindow = new google.maps.InfoWindow();
			
			$http.get(apiServer+'maps/load?lat='+lat+'&lng='+lng+'&radius='+radius)
				.then(function(response) {
					//console.log(response);
					angular.forEach(response.data.data, function(item, key){
						
						var point = new google.maps.LatLng(parseFloat(item.latitude), parseFloat(item.longitude));
						var icon = customIcons[item.gender] || {};
						var html = item.html;
						//var marker = new google.maps.Marker({ map: map, position: point, icon: icon.icon, shadow: icon.shadow });
						var marker = new google.maps.Marker({
							map: $scope.map,
							//animation: google.maps.Animation.DROP,
							position: point,
							icon: icon.icon, 
							shadow: icon.shadow
						});
						//$list.append(item.html);
						markers.push(marker);
						//bindInfoWindow(marker, map, infoWindow, html);
						bindInfoWindow(marker, $scope.map, infoWindow, html);
					});
					
					markerCluster = new MarkerClusterer($scope.map, markers);
				},function(error){
					//$log.log(error);	
					console.log(error);
				}
			);		
		}//function displayUsersViaAjax(lat, lng, radius) {
		
		
		// Binds a marker to an info window
		function bindInfoWindow(marker, map, infoWindow, html) {
			google.maps.event.addListener(marker, 'mouseover', function() {
				infoWindow.setContent('<div class="info-win clearfix">'+html+'</div>');
				infoWindow.open(map, marker);
			});
		}

		// Sets the map on all markers in the array.
		function setMapOnAll(map) {
			for (var i = 0; i < markers.length; i++) {
				markers[i].setMap(map);
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
			markerCluster.clearMarkers();
		}


	});