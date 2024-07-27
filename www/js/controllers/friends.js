angular.module('starter.controllers')

	.controller('friendCtrl', function($scope, $state, $http, $ionicLoading, $ionicPopup, $ionicModal, Auth, SocialShare, socket, $rootScope, popup) {

		$scope.$on('$stateChangeStart', function(){ 
			//delete all modal
			if ($scope.shareModal) $scope.closeShareModal();
		});
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

		});
		// $scope.$on('$ionicView.enter', function() {
		// 	if ($scope.shareModal) $scope.openShareModal();
		// });
		
		// sharing plugin
		var shareImage = 'http://localhost/images/main/sns_3rd.png';
		$scope.shareMain = function($data) {
			var title = "티샷 '파트터조인'을 시작하세요";
			var url = webServer;
			var subject = "티샷 '파트터조인'을 시작하세요";
			var img = shareImage;
			window.plugins.socialsharing.share(title, subject, img, url);
		};
		
		//카카오톡
		$scope.sharekakaotalk = function($data) {
			var obj = {"title":"티샷 '파트터조인'을 시작하세요","url":webServer, "img":shareImage};
			SocialShare.share('kakaotalk', obj);
		};
		
		//네이버밴드
		$scope.sharenaverband = function($data) {
			var obj = {"title":"TeeShot 파트터조인, 채팅과 골프친구","url":webServer, "img":shareImage};
			SocialShare.share('band', obj);
		};
		
		//카카오스토리
		$scope.sharekakaostory = function($data) {
			var obj = {"title":"티샷 '파트터조인'을 시작하세요", "txt":"파트너 조인이 쉬운 TeeShot \r\n원하시는 파트너를 찾아보세요","url":webServer, "img":shareImage};
			SocialShare.share('kakaostory', obj);
		};
		
		//네이버카페
		$scope.sharenavercafe = function($data) {
			var obj = {"title":"티샷 '파트터조인'을 시작하세요","contents":"파트너 조인이 쉬운 TeeShot \r\n원하시는 파트너를 찾아보세요", "img":shareImage};
			SocialShare.share('Navercafe', obj);
		};
		
		//페이스북
		$scope.sharefacebook = function($data) {
			var title	= "티샷 '파트터조인'을 시작하세요";
			var url		= webServer;
			var img		= shareImage;
			window.plugins.socialsharing.shareViaFacebook(title, img, url);
		};

		$ionicModal.fromTemplateUrl('templates/modal/friend-invite.html', {
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.shareModal = modal;
		});

		$scope.openShareModal = function(item) {
			$scope.shareItem = item;
			$scope.shareModal.show();
		};
		
		$scope.closeShareModal = function(item) {
			$scope.shareModal.hide();
		};
		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.shareModal.remove();
		});

		$scope.selectedAll = false;
		$scope.checkAll = function () {
			$scope.selectedAll = !$scope.selectedAll;
			angular.forEach($scope.items.friends, function (item) {
				item.Selected = $scope.selectedAll;
			});

		};

		//친구들에게 메시지 보내기
		$scope.showPopup = function() {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			
			var checkCount = getCheckCount();
			if(checkCount == 0){
				var alertPopup = $ionicPopup.alert({
					title: '알림',
					template: '하나 이상 선택해 주세요.'
				});
				return;
			}

			$scope.data = {};
			// An elaborate, custom popup
			var myPopup = $ionicPopup.show({
				template: '<input type="text" ng-model="data.message" placeholder="메시지를 입력하세요.">',
				title: '메시지 보내기',
				scope: $scope,
				buttons: [
					
					{
						text: '<b>확인</b>',
						type: 'button-positive',
						onTap: function(e) {
							if (!$scope.data.message) {
								//don't allow the user to close unless he enters wifi password
								e.preventDefault();
							} else {
								return $scope.data.message;
							}
						}
					},
					{ text: '취소' }
				]
			});
			myPopup.then(function(res) {
				
				if(res){
					//$scope.formData.message = res;
					$("#formData-message").val(res);
					$.ajax({
						type: "POST",
						url: apiServer + 'msglist/bulk?token=' + localStorage.getItem('authToken'),
						data: $("#bulkMessageForm").serialize(),
						success: function (response) {
						}
					});
					
				}

				
			});
			// $timeout(function() {
			// 	myPopup.close(); //close the popup after 3 seconds for some reason
			// }, 3000);
		};
		
		// 체크된 갯수 가져오기
		var getCheckCount = function(){
			var count = 0;
			angular.forEach($scope.items.friends, function(value, key) {
				count += value.checked ? 1 : 0; 
			});			
			
			return count;
		};

		//친구리스트 가져오기;
		var get_friend_list = function(){
			$ionicLoading.show();
			$http.get(apiServer + 'user/friends/?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					 $scope.items = response.data;
					 $ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		};
		get_friend_list();
		
		//친구요청 리스트 가져오기
		$ionicLoading.show();
		$http.get(apiServer + 'user/friendsrequsters/?token=' + localStorage.getItem('authToken'))
			.then(function(response) {
				 $scope.reqitems = response.data;
				 $ionicLoading.hide();
			},function(error){
				$ionicLoading.hide();
			}
		);
		
		
		//친구 맺기 수락
		$scope.onItemMakeFriend  = function(item, itemIndex) {
			$http.get(apiServer + 'user/friend/'+item.id+'?token=' + localStorage.getItem('authToken'))
			.then(function(response) {

				popup.alert('알림','<div class="text-center">친구로 승낙되었습니다.</div>');
				
				$scope.reqitems.requesters.splice(itemIndex, 1);
				get_friend_list();
				// window.location.reload();
			},function(error){
				console.log(error);
			}
		);
		};
		
		//친구요청 삭제
		$scope.onItemDelete = function(item, itemIndex) {
			var confirmPopup = $ionicPopup.confirm({
				title: '삭제알림',
				template: '친구요청을 삭제하시겠습니까?',
				okText: '확인',
				cancelText: '취소'
			});
			
			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'user/unfriend/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'user/unfriend/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
							$scope.reqitems.requesters.splice(itemIndex, 1);

							$rootScope.badgeCount.newInvite--;

							$scope.lcnt = JSON.parse(localStorage.getItem('count'));
							$scope.lcnt.newInvite--;
							localStorage.setItem('count', JSON.stringify($scope.lcnt));

							// $scope.reCount = {};
							// var lcnt = JSON.parse(localStorage.getItem('count'));

							// angular.forEach(lcnt, function(v, k) {
							// 	if (k == 'newInvite') {
							// 		v = v - 1;
							// 	}
							// 	$scope.reCount[k] = v;
							// });

							// localStorage.setItem('count', JSON.stringify($scope.reCount));
						},function(error){
							//console.log(error);
							$ionicLoading.hide();
						}
					);
							
				}//if(res) {//실행
			});
		};//$scope.onItemDelete = function(item, itemIndex) {
		
		
		//친구 삭제
		$scope.onFriendDelete = function(item, itemIndex) {
			var confirmPopup = $ionicPopup.confirm({
				title: '삭제알림',
				template: '친구에서 삭제하시겠습니까?'
			});
			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'user/unfriend/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'user/unfriend/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
							$scope.items.friends.splice(itemIndex, 1);
						},function(error){
							//console.log(error);
							$ionicLoading.hide();
						}
					);
				}//if(res) {//실행
			});
		};//$scope.onFriendDelete = function(item, itemIndex) {
		
		
		//프로필 방문
		$scope.onItemProfile = function(item) {

			item.user_id = item.id;

			$scope.openProfile(item);

			// if (!$rootScope.me.profile.phone) {
			// 	$scope.phoneCertCheck();
			// 	return;
			// }
			// $state.go('app.mypage.visit', {Id: item.username, userId: item.id});
		};


		socket.on('getFriendsList', function(req) {
			$scope.reqitems.requesters.splice(0, 0, req);
		});
		
	})

	.controller('friendsCtrl', function(
		$rootScope,
		$scope, 
		$state, 
		$http, 
		$ionicLoading, 
		$ionicPopup, 
		$ionicModal, 
		$ionicScrollDelegate,
		$filter,
		$ionicHistory,
		Auth, 
		SocialShare, 
		socket, 
		popup, 
		FriendsService
	) {


		var offset = 0;

		$scope.showDelete = false;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			if (offset) var limit = offset + 20;
			else var limit = 20;

			$scope.selectedAll = false;

			$scope.nodeList(limit, 0, 1);
		});

		$scope.nodeList = function(nlimit, offset, check) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if (check) FriendsService.getList({limit:nlimit,offset:offset}, $scope.loadList);
			else FriendsService.getList({limit:nlimit,offset:offset}, $scope.loadListScroll);
		};

		$scope.loadList = function(obj) {
			// console.log(obj);
			$scope.lists = obj;
			$scope.hasMoreData = false;
		};

		$scope.loadListScroll = function(obj) {
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
			if (obj.length < 20) $scope.hasMoreData = true;
			else $scope.hasMoreData = false;
		};

		// 스크롤 내릴시 리스트 추가
		$scope.loadMores = function() {
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				$scope.nodeList(48, offset, 0);
			} else {
				$scope.hasMoreData = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			$scope.selectedAll = false;
			offset = 0;
			$scope.nodeList(20, offset, 1);
			$scope.$broadcast('scroll.refreshComplete');
		};

		
		$scope.checkAll = function () {
			// $scope.selectedAll = !$scope.selectedAll;
			angular.forEach($scope.lists, function (item) {
				item.checked = $scope.selectedAll;
			});

		};

		//친구들에게 메시지 보내기
		$scope.showPopup = function() {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if ($rootScope.me.profile.gender != 'female') {

				var endTime = $filter('BetweenDay')($rootScope.me.expired_at);
				var normal_endTime = $filter('BetweenDay')($rootScope.me.normal_expired_at);

				if (endTime <= 0 && normal_endTime <= 0) {
					var alertPopup = popup.alert('알림','<div class="text-center margin-top20 margin-bottom20"><p class="assertive">"일반 이용권이 없습니다"</p><p class="margin-top20">-> 구매하신후 이용 가능합니다.</p></div>','구매하기');
					alertPopup.then(function(res) {
						$ionicHistory.nextViewOptions({
							disableBack: true
						});
						$state.go('app.payment');
					});
					return;
				}

			}
			
			var checkCount = $scope.getCheckCount();
			if(checkCount == 0){
				popup.alert('알림','하나 이상 선택해 주세요.');
				return;
			}

			$scope.data = {};
			// An elaborate, custom popup
			var myPopup = $ionicPopup.show({
				template: '<input type="text" ng-model="data.message" placeholder="채팅 메시지를 입력하세요.">',
				title: '채팅메시지 보내기',
				scope: $scope,
				buttons: [
					{
						text: '<b>확인</b>',
						type: 'button-positive',
						onTap: function(e) {
							if (!$scope.data.message) {
								popup.alert('알림','채팅 메시지가 입력되지 않았습니다.');
								//don't allow the user to close unless he enters wifi password
								e.preventDefault();
							} else {
								return $scope.data.message;
							}
						}
					},
					{ text: '취소' }
				]
			});
			myPopup.then(function(res) {
				
				if(res){
					//$scope.formData.message = res;
					$("#formData-message").val(res);
					$.ajax({
						type: "POST",
						url: apiServer + 'msglist/bulk?token=' + localStorage.getItem('authToken'),
						data: $("#bulkMessageForm").serialize(),
						success: function (response) {
							if (response.success) {
								popup.alert('알림','채팅 메시지가 전송되었습니다.')
							} else {
								popup.alert('에러','채팅 메시지 전송 중 오류가 발생하였습니다.')
								return;
							}
						}
					});
				}
				
			});
			// $timeout(function() {
			// 	myPopup.close(); //close the popup after 3 seconds for some reason
			// }, 3000);
		};
		
		// 체크된 갯수 가져오기
		$scope.getCheckCount = function() {
			var count = 0;
			angular.forEach($scope.lists, function(value, key) {
				count += value.checked ? 1 : 0; 
			});
			return count;
		};

		//친구 삭제
		$scope.onFriendDelete = function(item, itemIndex) {

			if (item.u_id==$rootScope.me.id) item.id = item.f_id;
			else item.id = item.u_id;

			var confirmPopup = popup.confirm('삭제알림','친구에서 삭제하시겠습니까?');

			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'user/unfriend/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'user/unfriend/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						$scope.items.friends.splice(itemIndex, 1);
					},function(error){
						//console.log(error);
						$ionicLoading.hide();
					});
				}//if(res) {//실행
			});
		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			if (item.u_id==$rootScope.me.id) item.user_id = item.f_id;
			else item.user_id = item.u_id;
			// item.user_id = item.id;
			$scope.openProfile(item);
		};

	})
	
	.controller('friendsRequestCtrl', function(
		$rootScope,
		$scope, 
		$state, 
		$http, 
		$ionicLoading, 
		$ionicPopup, 
		$ionicModal, 
		$ionicScrollDelegate,
		Auth, 
		SocialShare, 
		socket, 
		popup, 
		FriendsService
	) {

		var offset = 0;

		$scope.showDelete = false;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			if (offset) var limit = offset + 20;
			else var limit = 20;

			$scope.nodeList(limit, 0, 1);

			// FriendsService.getRequestList({limit:limit,offset:0}, $scope.loadList);
		});

		$scope.nodeList = function(nlimit, offset, check) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if (check) FriendsService.getRequestList({limit:nlimit,offset:offset}, $scope.loadList);
			else FriendsService.getRequestList({limit:nlimit,offset:offset}, $scope.loadListScroll);
		};

		$scope.loadList = function(obj) {
			// console.log(obj);
			$scope.lists = obj;
			$scope.hasMoreData = false;
		};

		$scope.loadListScroll = function(obj) {
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
			if (obj.length < 20) $scope.hasMoreData = true;
			else $scope.hasMoreData = false;
		};

		// 스크롤 내릴시 리스트 추가
		$scope.loadMores = function() {
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				$scope.nodeList(48, offset, 0);
			} else {
				$scope.hasMoreData = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			offset = 0;
			$scope.nodeList(20, offset, 1);
			$scope.$broadcast('scroll.refreshComplete');
		};

		//친구 맺기 수락
		$scope.onItemMakeFriend  = function(item) {
			$http.get(apiServer + 'user/friend/'+item.id+'?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					popup.alert('알림','친구 승낙이 완료되었습니다.')
					$scope.lists.splice($scope.lists.indexOf(item), 1);
					// get_friend_list();
					// window.location.reload();
				},function(error){
					console.log(error);
				}
			);
		};
		
		//친구요청 삭제
		$scope.onItemDelete = function(item) {
			var confirmPopup = popup.confirm('삭제알림','친구요청을 삭제하시겠습니까?');
			
			confirmPopup.then(function(res) {
				// console.log(res);
				if(res) {//실행
					// $http.post(apiServer + 'user/unfriend/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'user/unfriend/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						$scope.lists.splice($scope.lists.indexOf(item), 1);

						$rootScope.badgeCount.newInvite--;

						$scope.lcnt = JSON.parse(localStorage.getItem('count'));
						$scope.lcnt.newInvite--;
						localStorage.setItem('count', JSON.stringify($scope.lcnt));
					},function(error){
						//console.log(error);
						$ionicLoading.hide();
					});
							
				}
			});
		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			item.user_id = item.id;

			$scope.openProfile(item);
		};

		socket.on('getFriendsList', function(req) {
			$scope.lists.splice(0, 0, req);
		});

	})
	

	
;