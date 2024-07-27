angular.module('starter.controllers')

	.controller('profileCtrl', function($scope,  $http, $stateParams) {
		
		var username	= $stateParams.Id;
		console.log(username);
		
		//대화 내용 가져오기 방문자 명단에 내용 추가
		$http.get(apiServer + '@'+username+'?token=' + localStorage.getItem('authToken'))
			.then(function(response) {
				console.log(response.data.user);
				$scope.data = response.data.profile;
			},function(error){
				console.log(error);
			}
		);
		
	});