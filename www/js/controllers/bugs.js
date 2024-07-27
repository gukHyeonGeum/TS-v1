angular.module('starter.controllers')

	.controller('bugsCtrl', function(
		$rootScope,
		$scope, 
		$state, 
		$ionicPopup, 
		$ionicModal, 
		$http,
		$ionicLoading,
		$stateParams,
		$ionicHistory,
		popup
		) {
			
		$scope.setData = {};

		$scope.setData.type = $stateParams.type;

		$scope.setData.title = ['','오류, 버그 신고하기','제휴하기'];
		$scope.setData.placeholder = ['','오류나 버그가 있으면 알려주세요.','제휴 내용을 입력해주세요.'];

		if ($scope.setData.type == '1') {
			$scope.setData.subject = 'bug';
		} else if ($scope.setData.type == '2') {
			$scope.setData.subject = 'partner';
		} else {
			popup.alert('알림','접근이 잘 못 되었습니다.');
			$ionicHistory.goBack();
			return;
		}
		
		$scope.submitBugReport	= function(){
			$ionicLoading.show();
			$http({
				method: 'post',
				url: apiServer + 'inquiry?token=' + localStorage.getItem('authToken'),
				data: {
					form_type: $scope.setData.subject, 
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
						$scope.setData.body = '';
					 }else{
					 	popup.alert('확인','접수중 오류가 발생하였습니다.</br>잠시후 다시 시도해 주시기 바랍니다.');
					 }
					},function(error){
						popup.alert('확인','접수중 오류가 발생하였습니다.</br>잠시후 다시 시도해 주시기 바랍니다.');
						$ionicLoading.hide();
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
			
			
		};
		
	})
;

