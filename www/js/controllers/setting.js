angular.module('starter.controllers')

	.controller('settingCtrl', function(
		$scope, 
		$state, 
		$rootScope, 
		$http, 
		$cordovaPush, 
		$cordovaDevice,
		$ionicModal,
		$ionicLoading,
		$ionicHistory,
		Auth, 
		PushToken,
		popup
	) {	// 환경설정

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) $state.go('login');
			load_settings();
		});
		
		var load_settings = function(){
			$rootScope.settings	= JSON.parse(localStorage.getItem('settings'));
			
			if($rootScope.settings == null){//초기일경우 기초값 세팅
				$scope.setDate			= {};//{push:true}
				$rootScope.settings		= {};
				$scope.setDate.push	= true;
			}else{
				$scope.setDate	= $rootScope.settings;
			}
		};
		
		var updateSetting = function(){
			localStorage.setItem('settings', JSON.stringify($rootScope.settings));
		};
		//알림 받기 설정 시작
		$scope.ChangedPush = function(){
			if($scope.setDate.push){//푸쉬토큰 추가
				PushToken.update();
				$rootScope.settings.push	= true;
			}else{//푸쉬토큰 삭제
				removePushToken();
				$rootScope.settings.push	= false;
			}
			updateSetting();
		};

		var removePushToken = function(){
			var settings	= JSON.parse(localStorage.getItem('settings'));

			if(settings.push){

				if (window.cordova) {

					var isIPad		= ionic.Platform.isIPad();
					var isIOS		= ionic.Platform.isIOS();
					var isAndroid	= ionic.Platform.isAndroid();

					var uuid = $rootScope.me.id
					var device_id = $cordovaDevice.getUUID();
					
					if(isIPad || isIOS){
						var push_type = 'apns';
					} else {
						var push_type = 'gcm';
					}
				}
				
				$http({
					method: 'GET',
					url: apiServer + 'push/delete?token='+localStorage.getItem('authToken')+'&uuid='+uuid+'&push_type='+push_type+'&device_id='+device_id
					}).then(function successCallback(response) {
						console.log(response);
					}, function errorCallback(response) {
						console.log(response);
				});
			}
		};
		//알림 받기 설정 끝
		
		
		//앱평가하기 시작
		$scope.rateApp = function(){
			console.log("rateApp Start")
			AppRate.preferences.storeAppURL.ios = 'id1092007968';
			AppRate.preferences.storeAppURL.android = 'market://details?id=kr.co.teeshot.app';
			//AppRate.promptForRating(false);
			AppRate.navigateToAppStore().then(function (result) {
				// success
			});
		};

		$scope.submitUsername = function(isValid){
			$ionicLoading.show();

			$http({
				method: 'post',
				url: apiServer + 'user/username?token=' + localStorage.getItem('authToken'),
				data: { new_username: $scope.setData.newUsername },
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
			.then(function(response) {
				console.log(response);
				
				if(response.data.success){
					popup.alert('확인','정보가 업데이트 되었습니다.');
					Auth.update('username', $scope.setData.newUsername);
					$scope.closeModal(1);
				}else{
					popup.alert('알림', response.data.message);
				}
				
			},function(error){
				popup.alert('알림','닉네임 수정중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
				$ionicLoading.hide();
			}).finally(function() {
				$ionicLoading.hide();
			});
				
		};

		$scope.submitPassword = function(isValid){
			$ionicLoading.show();

			$http({
				method: 'post',
				url: apiServer + 'user/password?token=' + localStorage.getItem('authToken'),
				data: {old_password: $scope.setData.old_password, new_password: $scope.setData.new_password},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
			.then(function(response) {
				
				if(response.data.success){
					popup.alert('확인','정보가 업데이트 되었습니다.');
					$scope.closeModal(2);
				}else{
					popup.alert('알림', response.data.message);
				}
				
			},function(error){
				popup.alert('알림','비밀번호 수정중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
				$ionicLoading.hide();
			}).finally(function() {
				$ionicLoading.hide();
			});
		};

		$scope.submitDropForm = function () {
			$ionicLoading.show();

			$http({
				method: 'post',
				url: apiServer + 'user/quit?token=' + localStorage.getItem('authToken'),
				data: {password:$scope.setData.password, reason:$scope.setData.reason},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
			.then(function(response) {
				
				if(response.data.success){
					popup.alert('확인','정상적으로 탈퇴처리 되었습니다.');
					Auth.logout();
					$state.go('login');
				}else{
					popup.alert('알림', response.data.message);
				}
				
			},function(error){
				popup.alert('알림','탈퇴 처리중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
				$ionicLoading.hide();
			}).finally(function() {
				$ionicLoading.hide();
			});
		};

		$scope.submitBugReport	= function(){
			$ionicLoading.show();
			$http({
				method: 'post',
				url: apiServer + 'inquiry?token=' + localStorage.getItem('authToken'),
				data: {
					form_type: $scope.setData.type, 
					subject: 'etc', 
					body: $scope.setData.body
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
			.then(function(response) {
				 if(response.data.success){
				 	popup.alert('정상적으로 접수되었습니다.','확인 후 빠른 결과 안내해 드리겠습니다.<br />감사합니다.');
					$scope.closeModal(4);
				 }else{
				 	popup.alert('확인','접수중 오류가 발생하였습니다.</br>잠시후 다시 시도해 주시기 바랍니다.');
				 }
				},function(error){
					popup.alert('확인','접수중 오류가 발생하였습니다.</br>잠시후 다시 시도해 주시기 바랍니다.');
					$ionicLoading.hide();
				}
			).finally(function() {
				$ionicLoading.hide();
			});
		};

		
		$scope.openModal = function(index,item) {
			$scope.setData = {};

			if (index == 1) {
				$ionicModal.fromTemplateUrl('templates/modal/setting/modify-nickname.html', {
					id: '1',
					scope: $scope
				}).then(function(modal) {
					$scope.SettingNickModal = modal;
					$scope.SettingNickModal.show();
				});
			} else if (index == 2) {
				$ionicModal.fromTemplateUrl('templates/modal/setting/modify-passwd.html', {
					id: '2',
					scope: $scope
				}).then(function(modal) {
					$scope.SettingPassModal = modal;
					$scope.SettingPassModal.show();
				});
			} else if (index == 3) {
				if ($rootScope.me.social) {
					$scope.setData.socialContent = '소셜로그인('+ $rootScope.me.social.provider_type +')';
					$scope.setData.hasPassword = false;
				} else {
					$scope.setData.socialContent = '이메일 가입';
					$scope.setData.hasPassword = true;
				}
				$ionicModal.fromTemplateUrl('templates/modal/setting/modify-account.html', {
					id: '3',
					scope: $scope
				}).then(function(modal) {
					$scope.SettingAccountModal = modal;
					$scope.SettingAccountModal.show();
				});
			} else if (index == 4) {
				$scope.setData.titles = { bug: '버그 및 오류신고', partner: '제휴문의'};
				$scope.setData.placeholder = { bug: '오류나 버그가 있으면 알려주세요.', partner: '제휴 내용을 입력해주세요.'};
				$scope.setData.type = item;
				$ionicModal.fromTemplateUrl('templates/modal/setting/modify-bugs.html', {
					id: '4',
					scope: $scope
				}).then(function(modal) {
					$scope.SettingBugsModal = modal;
					$scope.SettingBugsModal.show();
				});
			}
		};

		$scope.closeModal = function(index,item) {
			if (index == 1) {
				$scope.SettingNickModal.hide();
				$scope.SettingNickModal.remove();
			} else if (index == 2) {
				$scope.SettingPassModal.hide();
				$scope.SettingPassModal.remove();
			} else if (index == 3) {
				$scope.SettingAccountModal.hide();
				$scope.SettingAccountModal.remove();
			} else if (index == 4) {
				$scope.SettingBugsModal.hide();
				$scope.SettingBugsModal.remove();
			}
		};

		$scope.$on('$stateChangeStart', function() {
			if($scope.SettingNickModal) $scope.SettingNickModal.hide();
			if($scope.SettingPassModal) $scope.SettingPassModal.hide();
			if($scope.SettingAccountModal) $scope.SettingAccountModal.hide();
			if($scope.SettingBugsModal) $scope.SettingBugsModal.hide();
		});

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if($scope.SettingNickModal) $scope.SettingNickModal.remove();
			if($scope.SettingPassModal) $scope.SettingPassModal.remove();
			if($scope.SettingAccountModal) $scope.SettingAccountModal.remove();
			if($scope.SettingBugsModal) $scope.SettingBugsModal.remove();
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