angular.module('starter.controllers')

	.controller('compareListsCtrl', function(
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
		CompareService,
		InAppBrowser
	) {

		var limit = 0;
		var offset = 0;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			var day = new Date();//97

			// if (day.getHours() >= 17) {
			// 	day.setDate(day.getDate() + 1);
			// }

			$scope.DateList = [];

			for(var i=1; i<=30; i++) {
				var newDay = day.setDate(day.getDate() + 1);
				$scope.DateList.push({ date: new Date(newDay) });
			}

			if (offset) limit = offset + 20;
			else limit = 20;

			$scope.b_date = '';
			$scope.b_sst = '';
			$scope.b_sod = false;
			$scope.clubRegion = '';
			$scope.clubName = '';
			$scope.clubs = {};

			// $scope.nodeList(limit, 0, 1);
		});

		$scope.nodeList = function(nlimit, offset, type) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;

			var sod = $scope.b_sod ? "ASC" : "DESC";

			if (!$scope.b_date)
				$scope.b_date = $filter('f_formatdate')($scope.DateList[0].date, 97);

			if (type) CompareService.getLists({ limit:nlimit, offset:offset, compareDate:$scope.b_date, compareSst:$scope.b_sst, compareSod:sod, compareLoc: $scope.clubRegion, compareClub: $scope.clubName, type: 0 }, $scope.loadList);
			else CompareService.getLists({ limit:nlimit, offset:offset, compareDate:$scope.b_date, compareSst:$scope.b_sst, compareSod:sod, compareLoc: $scope.clubRegion, compareClub: $scope.clubName, type: 0 }, $scope.loadListScroll);
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

		/**
		 * 날짜별 리스트
		 */
		$scope.dateView = function(date) {
			$ionicLoading.show();
			$scope.b_date = $filter('f_formatdate')(date, 97);
			$scope.nodeList(20, 0, 1);
		};

		/**
		 * 정렬
		 */
		 $scope.compareSort = function(type) {
		 	if (type == $scope.b_sst) {
		 		$scope.b_sod = !$scope.b_sod;
		 	} else {
		 		$scope.b_sod = false;
		 	}

		 	$scope.b_sst = type;
		 	$scope.nodeList(20, 0, 1);
		 };

		 /**
		 * 클럽리스트 불러오기
		 */
		$scope.set_clubs = function(sel){
			if ($scope.clubRegion) {
				$ionicLoading.show();
				CompareService.getClub({ region: $scope.clubRegion }, function(obj){ 
					$scope.clubs = obj;
					if(sel) $scope.clubName = sel;
				});
				$scope.nodeList(20, 0, 1);
			}
		};

		// 상세보기
		$scope.get_field = function(item) {

			CompareService.getOne({ id: item.id }, function(obj){ 
				console.log(obj);
				$scope.compareInfo = obj;
			});

		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			$scope.openProfile(item);
		};

		$scope.openInAppBrowser = function(url, target) {
			InAppBrowser(url, target);
		};

		$scope.$on('$stateChangeStart', function() {
			if($scope.CompareDetailModal) $scope.CompareDetailModal.hide();
		});
		
		$scope.openModal = function(index,item) {
			$scope.shareItem = item;

			if (index == 1) {
				$scope.get_field(item);

				$ionicModal.fromTemplateUrl('templates/modal/compare/detail-info.html', {
					id: '1',
					scope: $scope
				}).then(function(modal) {
					$scope.CompareDetailModal = modal;
					$scope.CompareDetailModal.show();
				});
			}
		};

		$scope.closeModal = function(index,item) {
			if (index == 1) {
				$scope.CompareDetailModal.hide();
				$scope.CompareDetailModal.remove();
				$scope.compareInfo = {};
			}
		};

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if($scope.CompareDetailModal) $scope.CompareDetailModal.remove();
		});
		// Execute action on hide modal
		$scope.$on('modal.hidden', function() {
			// Execute action
		});
		// Execute action on remove modal
		$scope.$on('modal.removed', function() {
			// Execute action
		});

	})

;	