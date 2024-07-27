angular.module('starter.controllers')

	.controller('paymentListsCtrl', function(
		$rootScope, 
		$scope,
		$state,
		$ionicLoading,
		$filter,
		$timeout,
		$http,
		$ionicModal,
		Auth,
		BookingService,
		PaymentService,
		popup
	) {

		var limit = 0;
		var offset = 0;
		var overlap = false;
		var post_id = '';

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			if (offset) limit = offset + 20;
			else limit = 20;

			$scope.b_date = '';
			$scope.b_sst = '';
			$scope.b_sod = false;
			// $scope.dateText = new Date();

			// if($rootScope.me.expired_at) {
			// 	$scope.endTime = $filter('BetweenDay')($rootScope.me.expired_at,'day');
			// 	$scope.dateText = $scope.endTime ? '사용중 (남은기간 ' + $scope.endTime + ' 일)' : '종료';
			// } else {
			// 	$scope.dateText = '';
			// }

			$scope.nodeList(limit, 0, 1);
		});

		$scope.nodeList = function(nlimit, offset, type) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
				
			if ($state.current.name == 'app.paymentTabs.golf') {
				var tabType = 1;
			} else {
				var tabType = 2;
			}

			if (type) PaymentService.getLists({ limit:nlimit, offset:offset, type: tabType }, $scope.loadList);
			else PaymentService.getLists({ limit:nlimit, offset:offset, type: tabType }, $scope.loadListScroll);

			
		};

		$scope.loadList = function(obj) {
			
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

		$scope.paymentCancel = function(item) {

			if (item.item_code == "P") {
				var confirmPopup = popup.confirm('취소신청','<div class="padding text-center"><p>부킹 임박 취소일 경우,</p><p>골프장별 취소시한 및 위약금 규정에 따라<br />위약금이 발생합니다.</p><p class="margin-top20">정말로 취소신청을 하시겠습니까?</p></div>');
				var completeMsg = "";
			} else {
				var dayCount = $filter('BetweenDay')(item.created_at, 'dayCount');
				if (dayCount > 7) {
					popup.alert('알림','<div class="text-center padding"><p>구매일로 부터 7일이 경과하여</p><p>취소가 불가합니다.</p></div>');
					return;
				}

				var code = item.item_code.substring(0,1);

				if (code == 'p') {
					if (item.ended_at != $rootScope.me.expired_at) {
						popup.alert('알림','<div class="text-center padding"><p>최근 결제하신 프리미엄이용권 내역부터</p><p>취소요청이 가능합니다.</p></div>');
						return;
					}
				} else if (code == 'n') {
					if (item.ended_at != $rootScope.me.normal_expired_at) {
						popup.alert('알림','<div class="text-center padding"><p>최근 결제하신 일반이용권 내역부터</p><p>취소요청이 가능합니다.</p></div>');
						return;
					}
				}

				var confirmPopup = popup.confirm('취소신청','<div class="text-center padding">정말로 취소신청을 하시겠습니까?</div>');
				var completeMsg = "<p>이용내역이 있는 경우에는</p><p>이용금액 공제후 환불됩니다.</p>";
			}


			confirmPopup.then(function(res) {
				if (res) {
					var url = apiServer + 'payment/delete/'+item.id+'?token=' + localStorage.getItem('authToken');
									
					$ionicLoading.show();

					$http({
						method: 'post',
						url: url,
						data: '',
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						if(response.data.success) {
							var PopupAlert = popup.alert('발송완료','<div class="text-center padding"><p>취소 신청이 접수되었습니다.</p>'+completeMsg+'</div>');
							PopupAlert.then(function(res) {
								$scope.doRefresh();
							});
						} else {
							popup.alert('알림', '<div class="text-center padding">'+ response.data.message +'</div>');
						}
					},function(error){
						popup.alert('오류','통신 오류가 발생하였습니다. 다시시도 하시기 바랍니다.');
						$ionicLoading.hide();
					}).finally(function() {
						$ionicLoading.hide();
					});
				}
			});
		};

		$scope.openModal = function(index,item) {
			$scope.moreItem = item;

			if (index == 1) {
				$ionicModal.fromTemplateUrl('templates/modal/payment-coupon-more.html', {
					id: '1',
					scope: $scope
				}).then(function(modal) {
					$scope.MoreShowModal = modal;
					$scope.MoreShowModal.show();
				});
			}
		};

		$scope.closeModal = function(index,item) {
			if (index == 1) {
				$scope.MoreShowModal.hide();
				$scope.MoreShowModal.remove();
			}
		};

		$scope.$on('$stateChangeStart', function() {
			if($scope.MoreShowModal) $scope.MoreShowModal.hide();
		});

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if($scope.MoreShowModal) $scope.MoreShowModal.remove();
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