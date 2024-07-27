angular.module('starter.controllers')

	.controller('newsListsCtrl', function(
		$rootScope, 
		$scope,
		$state,
		$ionicModal, 
		$http, 
		$ionicLoading,
		$ionicScrollDelegate, 
		$filter,
		$timeout, 
		popup, 
		Auth,
		NewsService,
		badgeService
	) {

		var limit = 0;
		var offset = 0;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			if (offset) limit = offset + 20;
			else limit = 20;

			$scope.nodeList(limit, 0, 1);
		});

		$scope.nodeList = function(nlimit, offset, type) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;

			if (type) NewsService.getLists({ limit:nlimit, offset:offset, type: 0 }, $scope.loadList);
			else NewsService.getLists({ limit:nlimit, offset:offset, type: 0 }, $scope.loadListScroll);
		};

		$scope.loadList = function(obj) {
			// console.log(obj);
			$ionicLoading.hide();
			$scope.lists = obj;
			$scope.hasMoreData = false;
		};

		$scope.loadListScroll = function(obj) {
			// console.log(obj);
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
				$scope.nodeList(20, offset, 0);	
			} else {
				$scope.hasMoreData = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		};

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			offset = 0;
			$scope.nodeList(20, offset, 1);	
			$scope.$broadcast('scroll.refreshComplete');
		};

		$scope.newsMove = function(item) {
			if (item.type == "like") {
				$scope.onItemProfile(item);
			} else if (item.type == "requested") {
				$state.go('app.friendstab.request');
			} else if (item.type == "accepted") {
				$state.go('app.friendstab.friends');
			} else if (item.type == "message") {
				$state.go('app.messages');
			} else if (item.type == "nbuy") {
				$state.go('app.paymentCoupon');
			} else if (item.type == "pbuy") {
				$state.go('app.paymentCoupon');
			} else if (item.type == "gbuy") {
				$state.go('app.bookingTabs.invite');
			} else if (item.type == "ncan") {
				$state.go('app.paymentCoupon');
			} else if (item.type == "pcan") {
				$state.go('app.paymentCoupon');
			} else if (item.type == "gcan") {
				$state.go('app.bookingTabs.request');
			}

			if (item.read == 0) {
				$http({
					method: 'post',
					url: apiServer + 'users/news/read?token=' + localStorage.getItem('authToken'),
					data: { uid: item.id },
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				})
				.then(function(response) {
					if (response.data.success) {
						$rootScope.badgeCount.newsCnt--;
						$scope.lcnt = JSON.parse(localStorage.getItem('count'));
						$scope.lcnt.newsCnt--;
						localStorage.setItem('count', JSON.stringify($scope.lcnt));

						item.read = 1;

						badgeService.getCount();
					} else {
						if (item.type == "like") {
							$scope.closeProfile();
						}
						popup.alert('오류', response.data.message);
						return;
					}
				},function(error){
					console.log(error);
					popup.alert('오류', error);
					return;
				});
			}
		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			$scope.openProfile(item);
		};

	})

;	