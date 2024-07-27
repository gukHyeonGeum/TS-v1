/**
 * state('login', url: '/login',templateUrl: 'templates/login.html',controller: 'LoginIntroCtrl',
 * state('loginTeeshot', url: '/loginTeeshot',templateUrl: 'templates/login-teeshot.html',controller: 'LoginCtrl'
 * state('join', url: '/join',templateUrl: 'templates/join.html',controller: 'JoinCtrl'
 * state('joinForm', url: '/joinForm',templateUrl: 'templates/join-form.html',controller: 'JoinFormCtrl'
 * state('findId', url: '/findId',templateUrl: 'templates/findId.html',controller: 'findIdCtrl'
 * state('findPass', url: '/findPass',templateUrl: 'templates/findPass.html',controller: 'findPassCtrl' 
 */

angular.module('starter.controllers')

.controller('LoginIntroCtrl', function($scope
										, $state
										, $http
										, $ionicModal
										, $cordovaOauth //for oauth (http://ngcordova.com/docs/plugins/oauth/)
										, $ionicPlatform
										, $ionicLoading
										, $ionicPopup
										, $timeout
										, Auth
										, SocialLogin
										) {
		
		
		$scope.$on('$ionicView.beforeEnter', function() {
			// if(Auth.isLoggedIn()){
			// 	$state.go('app.mypage.info');
			// }
		});

		$scope.facebookLogin = function() {
			//$cordovaOauth.facebook("1431823447118286", ["email", "public_profile", "user_about_me", "user_birthday", "user_hometown", "user_website", "read_stream", "publish_actions"]).then(function(result) {
			$cordovaOauth.facebook("1431823447118286", ["email"]).then(function(result) {
				//email, user_about_me, user_birthday, user_hometown, user_website, read_stream, publish_actions, read_friendlists				
				
				if (window.cordova) {
	 				facebookConnectPlugin.logEvent(
	 					"login facebook", 
	 					{
	 						ContentType: "페이스북 로그인"
	 					}
	 				);
	 			}

				SocialLogin.displayData('facebook', result.access_token);
			}, function(error) {
				var alertPopup = $ionicPopup.alert({
					title: '확인',
					template: error
				});
			});
		};
		
		//렌덤 토큰 생성 시작
		var rand = function() {
			return Math.random().toString(36).substr(2); // remove `0.`
		};

		var token = function() {
			return rand() + rand(); // to make it longer
		};
		
		//랜덤 토큰 생성 끝
		$scope.naverLogin = function() {
			 //'id' => 'y0qbfOWABZpLJ3bFVATu', 'secret' => 'oam5CqR5J4' , 'state' =>'임의값'
			$cordovaOauth.naver("y0qbfOWABZpLJ3bFVATu", "oam5CqR5J4", token()).then(function(result) {
				//displayData('naver', $http, result.access_token);
				
				if (window.cordova) {
	 				facebookConnectPlugin.logEvent(
	 					"login naver", 
	 					{
	 						ContentType: "네이버 로그인"
	 					}
	 				);
	 			}

				SocialLogin.displayData('naver', result.access_token);
			}, function(error) {
				var alertPopup = $ionicPopup.alert({
					title: '알림',
					template: error
				});
			});
		};
		
		$scope.kakaoLogin = function() {
			
			$cordovaOauth.kakao("53a30c18096a18bda29162111208b79f", token()).then(function(result) {
				//displayData('kakao', $http, result.access_token);
				
				if (window.cordova) {
	 				facebookConnectPlugin.logEvent(
	 					"login kakao", 
	 					{
	 						ContentType: "카카오 로그인"
	 					}
	 				);
	 			}

				SocialLogin.displayData('kakao', result.access_token);
			}, function(error) {
				var alertPopup = $ionicPopup.alert({
					title: '확인',
					template: error
				});
			});
		};
})

.controller('LoginCtrl', function($scope
								, $state
								, $http
								, $ionicModal
								, $cordovaOauth //for oauth (http://ngcordova.com/docs/plugins/oauth/)
								, $ionicPlatform
								, $ionicPopup
								, Auth
								, popup
								) {

	$scope.$on('$ionicView.beforeEnter', function() {

		$scope.user = {};

		//$state.go('app.golfjoin.lists');
			// if(Auth.isLoggedIn()){
			// 	$state.go('app.mypage.info');
			// }
	});
	


	$scope.doLogin = function() {
		$state.go('app.golfjoin.lists');
	};

	$scope.loginprocess = function() {
		if (!$scope.user.username) {
			popup.alert('오류','이메일을 입력하세요.');
			return;
		}
		if (!$scope.user.password) {
			popup.alert('오류','비밀번호를 입력하세요.');
			return;
		}
		var email		= $scope.user.username;
		var password	= $scope.user.password;
		Auth.loginByEmail(email, password);
	};

	$ionicModal.fromTemplateUrl('templates/modal/login-join.html', {
		scope: $scope,
		animation: 'fade-in-scale'
	}).then(function(modal) {
		$scope.modal = modal;
	});

	$scope.openModal = function() {
		$scope.modal.show();
	};
	$scope.closeModal = function() {
		$scope.modal.hide();
	};
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modal.remove();
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

.controller('JoinCtrl', function($scope
										, $state
										, $http
										, $ionicModal
										, $cordovaOauth //for oauth (http://ngcordova.com/docs/plugins/oauth/)
										,$ionicPlatform
										,SocialLogin
										) {
											
		$scope.facebookLogin = function() {
			$cordovaOauth.facebook("1431823447118286", ["email", "public_profile", "user_about_me", "user_birthday", "user_hometown", "user_website", "read_stream", "publish_actions"]).then(function(result) {
				//displayData('facebook', $http, result.access_token);
				
				if (window.cordova) {
	 				facebookConnectPlugin.logEvent(
	 					"join facebook", 
	 					{
	 						ContentType: "페이스북 회원가입"
	 					}
	 				);
	 			}

				SocialLogin.displayData('facebook', result.access_token);
			}, function(error) {
				console.log("facebookLogin Fail");
			});
		};
		
		//렌덤 토큰 생성 시작
		var rand = function() {
			return Math.random().toString(36).substr(2); // remove `0.`
		};

		var token = function() {
			return rand() + rand(); // to make it longer
		};
		
		//랜덤 토큰 생성 끝
		$scope.naverLogin = function() {
			$cordovaOauth.naver("y0qbfOWABZpLJ3bFVATu", "oam5CqR5J4", token()).then(function(result) {
				//displayData('naver', $http, result.access_token);
				
				if (window.cordova) {
	 				facebookConnectPlugin.logEvent(
	 					"join naver", 
	 					{
	 						ContentType: "네이버 회원가입"
	 					}
	 				);
	 			}

				SocialLogin.displayData('naver', result.access_token);
			}, function(error) {
				console.log("naverLogin Fail");
			});
		};
		
		$scope.kakaoLogin = function() {
			$cordovaOauth.kakao("53a30c18096a18bda29162111208b79f", token()).then(function(result) {
				//displayData('kakao', $http, result.access_token);
				
				if (window.cordova) {
	 				facebookConnectPlugin.logEvent(
	 					"join kakao", 
	 					{
	 						ContentType: "카카오 회원가입"
	 					}
	 				);
	 			}

				SocialLogin.displayData('kakao', result.access_token);
			}, function(error) {
				console.log(error);
				console.log("kakaoLogin Fail");
			});
		};

})


.controller('JoinFormCtrl', function($scope, $state, $http, $ionicModal, $ionicPlatform, $ionicLoading) {

	$ionicModal.fromTemplateUrl('templates/modal/join-agreement.html', {
		id: '1',
		scope: $scope,
		animation: 'fade-in-scale'
	}).then(function(modal) {
		$scope.modalAgreement = modal;
	});

	$ionicModal.fromTemplateUrl('templates/modal/join-personal.html', {
		id: '2',
		scope: $scope,
		animation: 'fade-in-scale'
	}).then(function(modal) {
		$scope.modalPersonal = modal;
	});

	$scope.$on('$stateChangeStart', function() {
		$scope.modalAgreement.hide();
		$scope.modalPersonal.hide();
	});

	$scope.openModal = function(index) {
		if (index == 1) $scope.modalAgreement.show();
		else $scope.modalPersonal.show();
	};
	$scope.closeModal = function(index) {
		if (index == 1) $scope.modalAgreement.hide();
		else $scope.modalPersonal.hide();
	};
	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modalAgreement.remove();
		$scope.modalPersonal.remove();
	});
	// Execute action on hide modal
	$scope.$on('modal.hidden', function() {
		// Execute action
	});
	// Execute action on remove modal
	$scope.$on('modal.removed', function() {
		// Execute action
	});	

	//데이타 전송
	$scope.submitForm = function(isValid) {
		if ($scope.userForm.$valid) {
			$ionicLoading.show();
			//console.log(apiServer + 'register?email='+$scope.userForm.email.$viewValue+'&password='+$scope.userForm.password.$viewValue+'&nickname='+$scope.userForm.nickname.$viewValue);
			// $http.post(apiServer + 'register', {email: $scope.userForm.email.$viewValue, password:$scope.userForm.password.$viewValue, nickname:$scope.userForm.nickname.$viewValue})
			//$http.get(apiServer + 'register?email='+$scope.userForm.email.$viewValue+'&password='+$scope.userForm.password.$viewValue+'&nickname='+$scope.userForm.nickname.$viewValue, {})
			$http({
				method: 'post',
				url: apiServer + 'register',
				data: {
					email: $scope.userForm.email.$viewValue, 
					password:$scope.userForm.password.$viewValue, 
					nickname:$scope.userForm.nickname.$viewValue
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
					if(response.data.success){

						if (window.cordova) {
			 				facebookConnectPlugin.logEvent(
			 					"join email", 
			 					{
			 						ContentType: "이메일 회원가입"
			 					}
			 				);
			 			}

						localStorage.setItem('authToken', response.data.token);
						localStorage.setItem('me', JSON.stringify(response.data.user));
						localStorage.setItem('count', JSON.stringify(response.data.count));
						$state.go('app.mypage.info');
					}else{
						switch(response.data.error){
							case "duplicated email":
								alert('중복된 이메일입니다.');
							break;
							case "duplicated username":
								alert('중복된 닉네임입니다.');
							break;
						}
					}
					 $ionicLoading.hide();
				},function(error){
					//$log.log(error);	
					console.log(error);
					$ionicLoading.hide();
				}
			);
		}
	};
  
})

.controller('findIdCtrl', function($scope, $state, $http, $ionicModal, $ionicLoading, $ionicPopup, $filter, popup) {
	
	
	$scope.find = {gender: 'male'};//male선택
	$scope.setData = {};

	//닉네임으로 아이디 찾기
	$scope.submitByNickNameForm = function(form) {
		if (form.$valid) {
			$ionicLoading.show();
			// $http.post(apiServer + 'find/email/nickname', {nickname: form.nickname.$viewValue})
			$http({
				method: 'post',
				url: apiServer + 'find/email/nickname',
				data: {
					nickname: form.nickname.$viewValue
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
					if(response.data.success){
						
						if (window.cordova) {
			 				facebookConnectPlugin.logEvent("findID nickname", {nickname: form.nickname.$viewValue});
			 			}

						popup.alert('알림','아이디는 '+response.data.user.email+'입니다.');
					}else{
						popup.alert('알림',response.data.message);
					}
					 $ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		}
	};
	
	//본인확인으로 아이디 찾기
	$scope.submitByRealNameForm = function(form) {

		if (form.$valid) {
			var year	= $filter('date')($scope.setData.BirthDate, "yyyy");
			var month	= $filter('date')($scope.setData.BirthDate, "MM");
			var day		= $filter('date')($scope.setData.BirthDate, "dd");

			$ionicLoading.show();
			$http({
				method: 'post',
				url: apiServer + 'find/email/realnamecert',
				data: {
					realname: $scope.setData.realname, 
					year: year, 
					month: month, 
					day: day, 
					gender: $scope.setData.gender,
					phone: $scope.setData.phone
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
					if(response.data.success){

						if (window.cordova) {
			 				facebookConnectPlugin.logEvent("findID certificate");
			 			}

						popup.alert('알림','아이디는 '+response.data.user.email+'입니다.');
					}else{
						popup.alert('알림',response.data.message);
					}
					 $ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);

		}
	};
	
	//휴대폰으로 아이디 찾기
	$scope.submitBySmsForm = function(form) {
		if (form.$valid) {
			$ionicLoading.show();
			
			// $http.post(apiServer + 'find/email/sms', {name: form.rname.$viewValue, phone:form.phone.$viewValue})
			$http({
				method: 'post',
				url: apiServer + 'find/email/sms',
				data: {
					name: form.rname.$viewValue, 
					phone:form.phone.$viewValue
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
					if(response.data.success){

						if (window.cordova) {
			 				facebookConnectPlugin.logEvent("findID sms");
			 			}

						var alertPopup = $ionicPopup.alert({
							title: '성공',
							template: '등록된 폰으로 아이디를 보냈습니다.'
						});
					}else{
						var alertPopup = $ionicPopup.alert({
							title: '실패',
							template: '아이디를 찾을 수 없습니다.'
						});
					}
					 $ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		}
	};
	
	

})

.controller('findPassCtrl', function($scope, $state, $http, $ionicLoading, $ionicPopup, popup) {
	$scope.setData = {};
	//from finding by email, as select domain	
	$scope.set_domain = function(){
		$scope.setData.emailDomain = $scope.setData.sel_domain;
	};

	
	//휴대폰으로 패스워드 찾기
	$scope.submitBySmsForm = function(form) {
		
	//	console.log();
		if (form.$valid) {
			$ionicLoading.show();
			
			// $http.post(apiServer + 'find/password/sms', {name: form.rname.$viewValue, phone:form.phone.$viewValue})
			$http({
				method: 'post',
				url: apiServer + 'find/password/sms',
				data: {
					name: form.rname.$viewValue, 
					phone:form.phone.$viewValue
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
					if(response.data.success){

						if (window.cordova) {
			 				facebookConnectPlugin.logEvent("findPASS sms");
			 			}

						popup.alert('알림','등록된 폰으로 패스워드를 전송하였습니다.');
					} else {
						popup.alert('알림',response.data.message);
					}
					$ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		}
	};
	
	//이메일로 패스워드 찾기
	$scope.submitByEmailForm = function(form) {
		if (form.$valid) {
			$ionicLoading.show();
			
			//console.log($scope.setData.emailId, $scope.setData.emailDomain);
			// $http.post(apiServer + 'find/password/email', {email: $scope.setData.emailId, domain:$scope.setData.emailDomain})
			$http({
				method: 'post',
				url: apiServer + 'find/password/email',
				data: {
					email: $scope.setData.emailId, 
					domain:$scope.setData.emailDomain
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
					if(response.data.success){

						if (window.cordova) {
			 				facebookConnectPlugin.logEvent("findPASS email");
			 			}

						popup.alert('알림','등록된 이메일로 패스워드를 전송하였습니다.');
					}else{
						popup.alert('알림',response.data.message);
					}
					 $ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		}
	};
	
})
;


angular.module('UserValidation', [])
.directive('validPasswordC', function () {//confirm password
	return {
		require: 'ngModel',
		link: function (scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function (viewValue, $scope) {
				var Match = viewValue == scope.userForm.password.$viewValue;
				ctrl.$setValidity('Match', Match);
				return Match;
			});
			
		}
		
	};
});
/*
.directive('validKorean', function () {//confirm password
	return {
		require: 'ngModel',
		link: function (scope, elm, attrs, ctrl) {
			ctrl.$parsers.unshift(function (viewValue, $scope) {
				var kor_check = /([^가-힣ㄱ-ㅎㅏ-ㅣ\x20])/i;
				var noKorean = kor_check.test(viewValue);//  != scope.userForm.password.$viewValue;
				ctrl.$setValidity('noKorean', !noKorean);
			});
		}
		
	};
});
*/