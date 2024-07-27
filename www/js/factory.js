angular.module('starter.factory', [])

.factory('msRequestFactory', function() {

	var createRequest = function(area, resource, id, request) {
		if (!request) request = {};

		return {
			"area": area,
			"resource": resource,
			"id": id,
			"request": request
		};
	};

	return {
		createRequest: createRequest
	};

})

.factory('msRestfulApi', function($resource) {
	if (window.location.hostname == "localhost") {
		var prefixUrl = 'http://localhost:8102/api/v1';
	}
	else if (window.location.hostname == "172.30.1.15") {
		if (window.location.port == '8102') {
			var prefixUrl = 'http://172.30.1.15:8102/api/v1';
		} else if (window.location.port == '8103') {
			var prefixUrl = 'http://172.30.1.15:8103/api/v1';
		}
	}
	else {
		var prefixUrl = 'http://128.199.182.215:3000/api/v1'; 
	}

	return $resource(
		prefixUrl + '/:area/:resource/:id',
		{
			area: "@area",
			resource: "@resource",
			id: "@id"
		},
		{
			'get': {method:'GET'},
			'post': {method:'POST', headers: { 'Content-Type' : 'application/json; charset=utf-8'}},
			'update': {method:'PUT'},
			'delete': {method:'DELETE'}
		}
	);

})

.factory('Auth', function ($http, $rootScope, $state, $ionicPopup, Settings, socket, AuthCheckService, badgeService, PushToken, $ionicLoading) {
	
	var validToken = function(callback){
		$http.get(apiServer + 'validToken?token=' + localStorage.getItem('authToken'))
			.then(function(response) {
				if(response.data.err_code != "000"){//if invalid session then delete current info
					//localStorage.setItem('authToken', response.data.token);					
					localStorage.removeItem('authToken');
					localStorage.removeItem('me');
					localStorage.removeItem('count');
					return false;//false 일경우 login 페이지로 돌릴 것
				}else{
					return true;
				}
			},function(error){
				return false;
			}
		);		
	};
	
	var setUser = function (session) {
		_user = session;
		//window.localStorage['me'] = JSON.stringify(_user);
		localStorage.setItem('me', JSON.stringify(_user));
	};
	
	return {
		setUser: setUser,
		isLoggedIn: function () {
			if(!localStorage.getItem('authToken')){
				return false;
			} else {
				// validToken();
				AuthCheckService.authCheck({}, function(obj) {

					obj.login_check = $rootScope.me.login_check;
					localStorage.removeItem('me');
					localStorage.setItem('me', JSON.stringify(obj));

					$rootScope.me = JSON.parse(localStorage.getItem('me'));

					badgeService.getCount();

					// var me = JSON.parse(localStorage.getItem('me'));
					var _SOCK_VAR = {
										user_id:$rootScope.me.id, 
										user_name:$rootScope.me.username, 
										thumbnail_image:$rootScope.me.profile.thumbnail_image
									};
					socket.emit('login', _SOCK_VAR);

				});

				var _user = JSON.parse(localStorage.getItem('me'));
				return _user ? true : false;
			}	
		},
		getUser: function () {
			return _user;
		},
		loginByEmail: function (email, password) {
			
			$ionicLoading.show();
			// $http.post(apiServer+'auth', {email: email, password: password})
			$http({
				method: 'post',
				url: apiServer + 'auth',
				data: {email: email, password: password},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
					$ionicLoading.hide();

					if(response.data.token){
						localStorage.setItem('authToken', response.data.token);
						response.data.user.login_check = 1;
						localStorage.setItem('me', JSON.stringify(response.data.user));
						localStorage.setItem('count', JSON.stringify(response.data.count));
						
						Settings.init();

						PushToken.update();//Save Push Token

						$state.go('app.mypage.info');

						// 로그인정보 노드로 보냄
						// var me = response.data.user;
						// var _SOCK_VAR = {
						// 					user_id:me.id, 
						// 					user_name:me.username, 
						// 					thumbnail_image:me.profile.thumbnail_image
						// 				};
						// socket.emit('login', _SOCK_VAR);
						
						// location.href = "#/app/messages";
						
						//$state.go('app.golfjoin.lists');
						
					}	
					else {
						var alertPopup = $ionicPopup.alert({
							title: '로그인 실패',
							template: '인증에 실패하였습니다.'
						});
					}
				}, function(error) {
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: '로그인 실패',
						template: '로그인에 실패하였습니다.</br>이메일과 패스워드를 확인해 주세요.'
					});	 
			});
			
			
			
			
		},
		logout: function () {
			localStorage.removeItem('authToken');
			localStorage.removeItem('me');
			localStorage.removeItem('count');
			//localStorage.removeItem('settings');
			
			$rootScope = $rootScope.$new(true);
			//$scope = $scope.$new(true);

			_user = null;
		},
		update:function(key, val){
			$rootScope.me	= JSON.parse(localStorage.getItem('me'));
			switch(key){
				case "profile.thumbnail_image": $rootScope.me.profile.thumbnail_image 	= val; break;
				case "profile.realname": 		$rootScope.me.profile.realname 			= val; break;
				case "profile.dob": 			$rootScope.me.profile.dob 				= val; break;
				case "profile.gender": 			$rootScope.me.profile.gender 			= val; break;
				case "profile.phone": 			$rootScope.me.profile.phone 			= val; break;
				case "profile.geo_location": 	$rootScope.me.profile.geo_location		= val; break;
				case "email": 					$rootScope.me.email 					= val; break;
				case "username": 				$rootScope.me.username 					= val; break;
				case "expired_at": 				$rootScope.me.expired_at 				= val; break;
				case "normal_expired_at": 		$rootScope.me.normal_expired_at 		= val; break;
				
			}
			localStorage.setItem('me', JSON.stringify($rootScope.me));
		}
	};
})


.factory('SocialLogin', function (
	$state, 
	$http, 
	$rootScope, 
	$ionicPopup, 
	$ionicLoading, 
	popup, 
	Settings
									, PushToken
) {
	var social_login = function(sns_login_info){//
		 	var info = "realname="+sns_login_info.realname+"&dob="+sns_login_info.dob+"&email="+sns_login_info.email+"&username="+sns_login_info.username+"&gender="+sns_login_info.gender+"&thumbnail_image="+window.encodeURIComponent(sns_login_info.thumbnail_image)+"&provider_type="+sns_login_info.provider_type+"&provider_key="+sns_login_info.provider_key;
			
			$ionicLoading.show();
			// $http.post(apiServer+"authsns?"+info)

			$http({
				method: 'post',
				url: apiServer + 'authsns',
				data: {
					realname: sns_login_info.realname, 
					dob: sns_login_info.dob, 
					email: sns_login_info.email,
					username: sns_login_info.username,
					gender: sns_login_info.gender,
					thumbnail_image: window.encodeURIComponent(sns_login_info.thumbnail_image),
					provider_type: sns_login_info.provider_type,
					provider_key: sns_login_info.provider_key
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
			.then(function(response) {

				if(response.data.token){
					localStorage.setItem('authToken', response.data.token);
					localStorage.setItem('me', JSON.stringify(response.data.user));
					localStorage.setItem('count', JSON.stringify(response.data.count));
					$rootScope.me = response.data.user;
					
					Settings.init();
					
					PushToken.update();
					$ionicLoading.hide();
					if(response.data.firstVisit){

						// popup.alert('알림','<div class="text-center"><p><strong>회원가입을 축하합니다!</strong></p><p class="padding-top">본 서비스는 실명거래를 원칙으로 하고 있으며</p><p>회원간의 신뢰와 거짓회원이 없도록</p><p><strong><u>휴대폰 인증이 필요합니다.</u></strong></p></div>');

						// $state.go('certification');

						$state.go('app.mypage.info', { obj: {type: 'firstVisit'} });
					} else {
						$state.go('app.mypage.info');
					}
					
				}	
				else {
					var alertPopup = $ionicPopup.alert({
						title: '알림',
						template: '토큰값이 없습니다. 다시 시도해 주세요.',
						okText: '확인'
					});
					$ionicLoading.hide();
				}
				
			}, function(error) {
				var alertPopup = $ionicPopup.alert({
						title: '알림',
						template: '연결에 실패하였습니다. 다시 시도해 주세요',
						okText: '확인'
					});
					$ionicLoading.hide();
			});
		 };//login start...
		 
	return {

		displayData:function(type, access_token){
			localStorage.setItem('access_token', access_token);
			var sns_login_info	= {username:"", email:"", gender:"", thumbnail_image:"", provider_type:"", provider_key:""};
			switch(type){
				case "facebook":
					$http.get("https://graph.facebook.com/v2.2/me", {params: {access_token: access_token, fields: "name,gender,location,picture,email,id, birthday", format: "json" }}).then(function(result) {
						sns_login_info.username			= result.data.name;				//YoungHyeong Ryu
						sns_login_info.realname			= result.data.name;	
						sns_login_info.email			= result.data.email;			//wangta69@naver.com
						sns_login_info.gender			= result.data.gender;			//male
						sns_login_info.thumbnail_image	= "";	//https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfp1/v/t1.0-1/c27.0.160.160/
						// sns_login_info.thumbnail_image	= result.data.picture.data.url;	//https://fbcdn-profile-a.akamaihd.net/hprofile-ak-xfp1/v/t1.0-1/c27.0.160.160/
						sns_login_info.provider_type	= "facebook";
						sns_login_info.provider_key		= result.data.id;				//1124343487590547
						
						if(result.data.birthday){
							var birth = result.data.birthday.split("/");
							sns_login_info.dob	= birth[2]+"-"+birth[0]+"-"+birth[1];
						}
						
						social_login(sns_login_info);//login start...
						
					}, function(error) {
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: error
						});
					});				
				break;
				case "naver":
					// $http.defaults.headers.post['Authorization'] = 'Bearer '+access_token;
					// $http.post("https://openapi.naver.com/v1/nid/getUserProfile.xml", {})

					$http({
						method: 'post',
						url: 'https://openapi.naver.com/v1/nid/getUserProfile.xml',
						data: {},
						headers: {
							'Authorization' : 'Bearer ' + access_token
						}
					})
					.then(function(result) {
						var xmlDoc	= $.parseXML(result.data);
						$xml		= $(xmlDoc);
						
						sns_login_info.username			= $xml.find('nickname').text();							//초월자
						sns_login_info.email			= $xml.find('email').text();							//wangta69@naver.com
						sns_login_info.gender			= $xml.find('gender').text() == 'M' ? 'male':'female';	//M
						sns_login_info.thumbnail_image	= "";					//https://phinf.pstatic.net/contactthumb/profile/blog/44/15/wangta69.jpg?type=s80 
						// sns_login_info.thumbnail_image	= $xml.find('profile_image').text();					//https://phinf.pstatic.net/contactthumb/profile/blog/44/15/wangta69.jpg?type=s80 
						sns_login_info.provider_type	= "naver";
						sns_login_info.provider_key		= $xml.find('enc_id').text();							//b46216143952ac386b0ae8e621555175122a585b2be72b03694178421fddf966
						sns_login_info.realname			= $xml.find('name').text();
						sns_login_info.dob				= '0000-'+$xml.find('birthday').text();
						
						social_login(sns_login_info);//login start...
						//console.log($xml.find('age').text());				//40-49
						//console.log($xml.find('id').text());				//22568530
						//console.log($xml.find('name').text());			//류영형
						//console.log($xml.find('birthday').text());		//10-07
					}, function(error) {
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: error
						});
					});	
				break;
				case "kakao":
				// $http.defaults.headers.post['Authorization'] = 'Bearer '+access_token;
					// $http.post("https://kapi.kakao.com/v1/user/me", {})

					$http({
						method: 'post',
						url: 'https://kapi.kakao.com/v2/user/me',
						data: {},
						headers: {
							'Authorization' : 'Bearer ' + access_token
						}
					})
					.then(function(result) {

						sns_login_info.username			= result.data.properties.nickname;		//류영형
						sns_login_info.email			= result.data.kakao_account.email;					//wangta69@naver.com
						sns_login_info.email_verified	= result.data.kakao_account.is_email_verified;					// Boolean
						sns_login_info.thumbnail_image	= "";
						sns_login_info.provider_type	= "kakao";
						sns_login_info.provider_key		= result.data.id;						//81391329
						
						// sns_login_info.username			= result.data.properties.nickname;		//류영형
						// sns_login_info.email			= result.data.kaccount_email;					//wangta69@naver.com
						// sns_login_info.email_verified	= result.data.kaccount_email_verified;					// Boolean
						// sns_login_info.thumbnail_image	= "";
						// sns_login_info.provider_type	= "kakao";
						// sns_login_info.provider_key		= result.data.id;						//81391329
						
						if (!sns_login_info.email) {
							popup.alert('알림','카카오계정 이메일 값이 넘어오지 않았습니다.<br />다시 시도하시기 바랍니다.');
							$ionicLoading.hide();
							return;
						}

						if (sns_login_info.email_verified != true) {
							popup.alert('알림','인증받지 않은 카카오계정 이메일입니다.<br />인증 후 다시 시도하시기 바랍니다.');
							$ionicLoading.hide();
							return;
						}

						social_login(sns_login_info);//login start...	
						
					}, function(error) {
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: error
						});
						return false;
					});
					
				break;
				default:
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: '알림',
						template: '로그인 결과 값을 받지 못했습니다.'
					});
					return false;
				break;
			}

		 }
	};
})

.factory('SocialShare', function ($state, $http, $rootScope, $ionicPopup, $ionicLoading) {
	
	var webIntent = function(obj){//
		
		window.plugins.webintent.startActivity({
				//action: 'com.codepath.example.customviewdemo.activities..DrawingActivity',
				action: window.plugins.webintent.ACTION_VIEW,
				//action: window.plugins.webintent.ACTION_SEND,
				//type: 'text/plain',
				url: obj.url,
				extras:obj.extras
			},
			function() {},
			function() {
				window.plugins.webintent.startActivity({
					action: window.plugins.webintent.ACTION_VIEW,
					url: "market://details?id="+obj.market
				}, 
				function() {},
				function() {
					alert('전송이 실패하였습니다.');
				}
				);
				//alert('Failed to open URL via Android Intent.');
				//console.log("Failed to open URL via Android Intent. URL: " + theFile.fullPath)
			}
		);
	};
	
	var iosShare = function(o){
		
	//	console.log(o.a_store);
	//	console.log(o.a_proto);
		//setTimeout(function(){ location.href = o.a_store; }, 200);
		setTimeout(function(){ location.href = o.a_proto; }, 100);
	};
	
	return {
		share:function(type, obj){
			
			var isIPad = ionic.Platform.isIPad();
			var isIOS = ionic.Platform.isIOS();
			var isAndroid = ionic.Platform.isAndroid();
			
			switch(type){
				case "kakaotalk":
				//obj = {"txt":"티샷에서 "+$data.me.username+"님을 만나 보세요","url":webServer+"/@"+$data.me.username, "img":$data.profile.profile_image};
				//[주의] action에 정의된 url과 appkey가 일치하여야 한다.
				//https://developers.kakao.com/docs/js-reference#kakao_link
					
					if (!obj.link) obj.link = obj.url;
						
					var objs = JSON.stringify([
						{
							objtype: "image", 
							src: obj.img,
							width: 300,
							height: 200
						},
						{
							objtype: "label", 
							text: obj.title + '\r\n\r\n' + obj.contents
						},
						{
							objtype: "link", 
							text: '자세히 보기\r\n\r\n',
							action: {type: "web", url: obj.link}
						},
						{
							objtype: "button", 
							text: "티샷 시작하기",
							action: {type: "web", url: obj.url}
						}
					]);

					var objs='[';
						objs	=	objs + '{"objtype":"label","text":"'+obj.title+'"}';
						objs	=	objs + ',{"objtype":"link","text":"'+obj.url+'","action":{"type":"web","url":"'+obj.url+'"}}';
						objs	=	objs + ',{"objtype":"image","src":"'+obj.img+'","width":300,"height":300}';
						objs	=	objs + ',{"objtype":"button","text":"티샷 시작하기","action":{"type":"web","url":"'+webServer+'"}}';
						objs	=	objs + ']';
						
					if(isIPad || isIOS){
						o = {
							a_store:'itms-apps://itunes.apple.com/app/id362057947?mt=8',
							a_proto:'kakaolink://send?appkey=d4121d1d25060425010a7d8c13b2ac89&appid=kr.co.teeshot.app&appver=1.0&apiver=3.0&linkver=3.5&extras='+encodeURIComponent('{}') + '&objs='+encodeURIComponent(objs)
						};
						iosShare(o);
			
						return;
						
					}else{
						
						
						var url = 'kakaolink://send?appkey=d4121d1d25060425010a7d8c13b2ac89&appver=1.0&apiver=3.0&linkver=3.5';
						url = url + '&extras='+encodeURIComponent('{}');
						url = url + '&objs='+encodeURIComponent(objs);
						url = url + '&forwardable=false#Intent;package=com.kakao.talk;end;';
						
						webIntent({"url":url, "extras":{"KA":"sdk/1.0.45 os/javascript lang/ko-KR device/Linux_armv7l origin/http%3A%2F%2Fteeshot.co.kr"}, "market":"com.kakao.talk"});
						return;
					}
					
				break;
				case "kakaostory":
				var objs='{"title":"'+obj.title+'","desc":"","imageurl":["'+obj.img+'"],"type":"article"}';
				
					if(isIPad || isIOS){
						o = {
							a_store:'itms-apps://itunes.apple.com/app/id486244601?mt=8',
							a_proto:'storylink://posting?post='+encodeURIComponent(obj.title+'\r\n'+webServer) + '&appid=kr.co.teeshot.app&appver=1.0&apiver=1.0&appname=Teeshot&urlinfo='+encodeURIComponent(objs)
						};
						iosShare(o);
						return;
					}else{
						
						var url = 'storylink://posting?appkey=d4121d1d25060425010a7d8c13b2ac89&appver=1.0&apiver=1.0';
						url = url + '&post='+encodeURIComponent(obj.title+'\r\n'+webServer);
						url = url + '&urlinfo='+encodeURIComponent(objs);
						url = url + '&forwardable=false#Intent;package=com.kakao.story;end;';
						
						webIntent({"url":url, "extras":{"KA":"sdk/1.0.45 os/javascript lang/ko-KR device/Linux_armv7l origin/http%3A%2F%2Fteeshot.co.kr"}, "market":"com.kakao.story"});
					}
					return;
				break;
				case "band":
				
					if(isIPad || isIOS){
						o = {
							a_store:'itms-apps://itunes.apple.com/app/id542613198?mt=8',
							a_proto:'bandapp://create/post?text=' + obj.title + encodeURIComponent('\r\n') + obj.url+'&route=teeshot.co.kr'
						};
						iosShare(o);
						return;
					}else{
						var url = 'bandapp://create/post?text=' + obj.title + encodeURIComponent('\r\n') + obj.url+'&route=teeshot.co.kr';
						url = url + '&forwardable=false#Intent;scheme=bandapp;package=com.nhn.android.band;end;';					
						webIntent({"url":url, "extras":{"KA":""}, "market":"com.nhn.android.band"});
						return;
					}
					
				break; 
				case "Navercafe":
					if(isIPad || isIOS){
						o = {
							a_store:'itms-apps://itunes.apple.com/app/id420615104?mt=8',
							a_proto:'navercafe://write?cafeUrl=&subject='+obj.title+'&contents='+obj.contents+'&attachement='+encodeURIComponent(obj.img)
						};
			
						iosShare(o);
						return;
					}else{
						//http://developer.naver.com/wiki/pages/CafeUrlScheme
						var url = 'navercafe://write?cafeUrl=&subject='+obj.title+'&contents='+obj.contents+'&attachement='+encodeURIComponent(obj.img);
						url = url + '&appId=com.naver.android.cafe#Intent;scheme=navercafe;action=android.intent.action.VIEW;category=android.intent.category.BROWSABLE;package=com.nhn.android.navercafe;end;';					
						webIntent({"url":url, "extras":{"KA":""}, "market":"com.nhn.android.navercafe"});
						return;
					}
					
				break;
			}	
		}
	};
})

.factory('PushToken', function ($state, $http, $rootScope, $ionicLoading, $cordovaDevice, $ionicHistory) {

	var isIPad		= ionic.Platform.isIPad();
	var isIOS		= ionic.Platform.isIOS();
	var isAndroid	= ionic.Platform.isAndroid();
	

	var iosConfig = {
		"badge": true,
		"sound": true,
		"alert": true,
	};
						
	var androidConfig = {
		"senderID": "267568470979",
	};	
				
	var updateDeviceToken = function(push_token, push_type){

		if(!$rootScope.me) return;

		var uuid = $rootScope.me.id;

		var settings = JSON.parse(localStorage.getItem('settings'));
		if(settings == null) settings = {push:true};
		if(settings.push){
			var querystr = '&uuid='+uuid+'&push_token='+push_token+'&device_id='+$cordovaDevice.getUUID()+'&push_type='+push_type;
			$http({
				method: 'GET',
				url: apiServer + 'push/register?token='+localStorage.getItem('authToken')+querystr
			}).then(function successCallback(response) {
				var push = {
					uuid:uuid, 
					push_token:push_token,
					device_id: $cordovaDevice.getUUID(),
					push_type:push_type
				};
				localStorage.setItem('push', JSON.stringify(push));
				
			}, function errorCallback(response) {
				console.log("token registerd error");
			});
		}
		return;
	};
		

	$rootScope.toaPop = function(obj) {

		// toaster.pop({
		// 	type: '',
		// 	title: obj.title,
		// 	body: obj.message,
		// 	showCloseButton: true,
		// 	clickHandler: function (toast, isCloseButton) {
		// 		if(isCloseButton) return true;
				
		// 		if(obj.objgo) $state.go(obj.go, obj.objgo);
		// 		else $state.go(obj.go);
		// 		return true;
		// 	} 
		// });//,closeHtml: '<button>Close</button>'

		window.plugins.toast.showWithOptions(
			{
				message: obj.message,
				duration: "short",
				position: "top",
				addPixelsY: 50,
				styling: {
					opacity: 1,
					textSize: 16,
					cornerRadius: 50,
					horizontalPadding: 50, // iOS default 16, Android default 50
  					verticalPadding: 30 // iOS default 12, Android default 30
				}
			},
			function(result) {
				if (result && result.event) {
					if (result.event == 'touch') {
						window.plugins.toast.hide();
						if(obj.objgo) $state.go(obj.go, obj.objgo);
						else $state.go(obj.go);
						return true;
					}
				}
			},
			function(e) {
				console.log('error: ', e);
			}
		);
	}

	//{go:'app.golfjoin.lists', objgo:{} foreground:foreground, title:title, message:message}
	var notificationProcessAction = function(obj){
		if(obj.foreground == false){//현재 실행중이지 않으면
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			if(obj.objgo) $state.go(obj.go, obj.objgo);
			else $state.go(obj.go);
			$ionicLoading.hide();
		}else{
			if(obj.article_type == "chat" && ($ionicHistory.currentView().stateName == "app.message" || $ionicHistory.currentView().stateName == "app.messagecreate") ){//채팅일경우 현재 사용자가 채팅창에 있으면 디스플레이 하지 않는다.
				return;
			} else {
				$rootScope.toaPop(obj);
			}
			
		}
	};
	
	var notificationProcess = function(obj, type){
		var article_type	= "";
		var foreground		= "";
		var message			= "";
		var title			= "";
		var article_id		= "";
		var name			= "";

		switch(type){
			case "gcm":
				article_type	= obj.additionalData.article_type;
				foreground		= obj.additionalData.foreground;
				message			= obj.message;
				article_id		= obj.additionalData.article_id;
				name			= obj.title;
				// article_type	= obj.payload.article_type;
				// foreground		= obj.foreground;
				// message			= obj.message;
				// article_id		= obj.payload.article_id;
				// name			= obj.payload.title;
			break;
			case "apns":
				article_type	= obj.category;
				foreground		= obj.foreground == "0" ? false : true;
				message			= obj.message;
				article_id		= obj.article_id;
				name			= obj.title;
			break;
		}

		switch(article_type){
			case "booking_invite": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.saleBooking.lists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;	
			case "booking_apply": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.saleBooking.lists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "booking_cancel": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.saleBooking.lists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "booking_win": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.saleBooking.lists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;

			case "bookingjoin_invite": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.bookingJoin.memberlists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;	
			case "bookingjoin_apply": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.bookingJoin.memberlists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "bookingjoin_cancel": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.bookingJoin.memberlists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "bookingjoin_win": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.bookingJoin.memberlists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;

			case "bookingmanager_invite": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.bookingJoin.managerlists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;	
			case "bookingmanager_apply": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.bookingJoin.managerlists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "bookingmanager_cancel": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.bookingJoin.managerlists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "bookingmanager_win": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.bookingJoin.managerlists', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			
			case "sponsor_invite": // 프리미엄 초청
				// var title	= "프리미엄 초청이 등록되었습니다.";
				notificationProcessAction({go:'app.premium.lists', objgo:{fieldId:article_id, article_type: article_type, inviteType: 1}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;	
			case "golf_join"://골프장조인
				// var title	= "골프 조인이 등록되었습니다.";
				notificationProcessAction({go:'app.sponsorInvite.lists', objgo:{fieldId:article_id, article_type: article_type, inviteType: 0}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;	
			case "sponsor_apply": // 프리미엄 신청
				// var title	= "프리미엄 초청에 신청이 접수되었습니다.";
				notificationProcessAction({go:'app.premium.lists', objgo:{fieldId:article_id, article_type: article_type, inviteType: 1}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "golf_apply": //골프조인 신청
				// var title	= "골프 조인에 신청이 접수되었습니다.";
				notificationProcessAction({go:'app.sponsorInvite.lists', objgo:{fieldId:article_id, article_type: article_type, inviteType: 0}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			// case "golf_apply"://골프신청
			// 	var title	= "골프 조인에 신청이 접수되었습니다.";
			// 	notificationProcessAction({go:'app.golfjoin.partnerlist', objgo:{fieldId:article_id}, foreground:foreground, title:title, message:message, article_type:article_type});
			// break;
			case "sponsor_cancel": // 프리미엄 신청
				// var title	= "프리미엄 초청에 신청이 접수되었습니다.";
				notificationProcessAction({go:'app.premium.lists', objgo:{fieldId:article_id, article_type: article_type, inviteType: 1}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "golf_cancel"://골프취소
				// var title	= "골프조인신청이 취소되었습니다.";
				notificationProcessAction({go:'app.sponsorInvite.lists', objgo:{fieldId:article_id, article_type: article_type, inviteType: 0}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			// case "golf_cancel"://골프취소
			// 	// var title	= "골프조인신청이 취소되었습니다.";
			// 	notificationProcessAction({go:'app.golfjoin.partnerlist', objgo:{fieldId:article_id}, foreground:foreground, title:title, message:message, article_type:article_type});
			// break;
			case "sponsor_win": // 프리미엄 신청
				// var title	= "프리미엄 초청에 신청이 접수되었습니다.";
				notificationProcessAction({go:'app.premium.lists', objgo:{fieldId:article_id, article_type: article_type, inviteType: 1}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "golf_win"://선택
				 // var title	= "파트너가 되었습니다.";
				notificationProcessAction({go:'app.sponsorInvite.lists', objgo:{fieldId:article_id, article_type: article_type, inviteType: 0}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "newbooking_invite": // 뉴할인부킹
				notificationProcessAction({go:'app.booking.list', objgo:{fieldId:article_id, article_type: article_type}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			// case "golf_win"://선택
			// 	 // var title	= "파트너가 되었습니다.";
			// 	notificationProcessAction({go:'app.golfjoin.partnerlist', objgo:{fieldId:article_id}, foreground:foreground, title:title, message:message, article_type:article_type});
			// break;
			case "chat"://채팅창으로 이동
				title = name;
				notificationProcessAction({go:'app.message', objgo:{messageId:article_id}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "friendinvite"://친구신청
				// var title	= "친구초청에 응해주세요";
				notificationProcessAction({go:'app.friendstab.request', foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "friendaccept"://친구요청 승인
				// var title	= "친구로 승낙되었습니다.";
				notificationProcessAction({go:'app.friendstab.friends', foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "reple"://댓글
				// var title	= "댓글이 달렸습니다.";
				notificationProcessAction({go:'app.golfjoin.comment', objgo:{golflistId:article_id}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "screen_join"://스크린번개(이부분은 리스트 나오면 프로그램 변경 필요)
				// var title	= "스크린번개가 도착하였습니다.";
				notificationProcessAction({go:'app.screen.invite', objgo:{postId:article_id}, foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			case "visit_profile"://프로필 방문 페이지로 이동
				// var title	= "프로필을 방문하였습니다.";
				notificationProcessAction({go:'app.visitors', foreground:foreground, title:title, message:message, article_type:article_type});
			break;
			default: notificationProcessAction({go:'app.mypage.info', foreground:foreground, title:title, message:message, article_type:article_type});
		}
	};

	return {
		update:function(registrationId, registrationType){	
			if (window.cordova) {

				var push = PushNotification.init({
			        "android": {
			            "senderID": "267568470979"
			        },
			        "ios": {"alert": "true", "badge": "true", "sound": "true"},
			        "windows": {}
			    });
			    push.on('registration', function(data) {
			        updateDeviceToken(data.registrationId, data.registrationType);
			    });
			    push.on('notification', function(data){
			    	notificationProcess(data, 'gcm');
			    });
			    push.on('error', function(e) {
			      console.log(e.message);
			    });

			    var me = JSON.parse(localStorage.getItem('me'));

			    if (me && me.profile.phone) {
				    push.subscribe(me.profile.gender, function() {
				    		console.log('success');
				    	}, function(e) {
				    		console.log('error: ', e);
				    	}
				    );
				}

			}
		}//update:function(){
	};
})
/**
 * 환경변수(세팅)와 관련한 데이타 처리
 */
.factory('Settings', function ($state, $rootScope) {
	$rootScope.settings	= JSON.parse(localStorage.getItem('settings'));
	return {
		init:function(){	
			//초기 로딩시 기본값을 불러와 초기 값을 설정한다.
			if($rootScope.settings == null){
				//push : push서비스를 받을 것인가,apprate: 평가를 종료시 띄울 것인가
				$rootScope.settings = {push: true, apprate: true};
			}else{
				if($rootScope.settings.push == undefined)		$rootScope.settings.push	= true;
				if($rootScope.settings.apprate == undefined)	$rootScope.settings.apprate	= true;
			}
						
			localStorage.setItem('settings', JSON.stringify($rootScope.settings));
		}//init:function(){
		,update:function(obj){
			eval("$rootScope.settings."+Object.getOwnPropertyNames(obj)[0]+" = "+obj.apprate);
			localStorage.setItem('settings', JSON.stringify($rootScope.settings));
		}//update:function()
	};
})

// .factory('socket', function socket($rootScope) {
// 	var baseUrl = 'http://128.199.182.215:3001';
// 	var socket = io.connect(baseUrl);
// 	console.log('soket...');
// 	return {
// 		on: function (eventName, callback) {
// 			socket.on(eventName, function () {
// 				var args = arguments;
// 				$rootScope.$apply(function () {
// 					callback.apply(socket, args);
// 				});
// 			});
// 		},
// 		emit: function (eventName, data, callback) {
// 			socket.emit(eventName, data, function () {
// 				var args = arguments;
// 				$rootScope.$apply(function () {
// 					if (callback) {
// 						callback.apply(socket, args);
// 					}
// 				});
// 			});
// 		}
// 	};
// })

.factory('socket', function(socketFactory){
	var myIoSocket = io.connect('http://128.199.182.215:3000');
	mySocket = socketFactory({
		ioSocket: myIoSocket
	});
	return mySocket;
})


.factory('popup', function($ionicPopup) {
	return {
		alert: function(title,msg,oktext) {
			if (!title) title = "에러";
			if (!msg) msg = "통신 에러가 발생하였습니다.<br />다시 시도해주시기 바랍니다.";
			if (!oktext) oktext = "확인";

			var alertPopup = $ionicPopup.alert({
				title: title,
				template: msg,
				okText: oktext
			});
			return alertPopup;
		},
		confirm: function(title,msg,oktext,canceltext) {
			if (!oktext) oktext = "예";
			if (!canceltext) canceltext = "아니요";
			var confirmPopup = $ionicPopup.confirm({
				title: title,
				template: msg,
				okText: oktext,
				cancelText: canceltext
			});
			return confirmPopup;
		}
	}
})

.factory('helpMsg', function(popup) {
	return function(msg, title) {
		if (!title) title = "도움말";
		popup.alert(title, msg);
	};
})

.factory('InAppBrowser', function() {
	return function(url, target) {
		if (target == 1) window.open(url,'_system','location=yes');
		else if (target == 2) window.open(url,'_self');
		else if (target == 3) cordova.InAppBrowser.open(url, '_blank', 'location=yes');
		else window.open(url,'_blank','location=no');
	};
})

.factory('onUserLists', function(socket) {
	return function() {
		// var me = Auth.getUser();
		var me = JSON.parse(localStorage.getItem('me'));

		// if (me.username != me.email && me.profile.thumbnail_image) {
		if (me.id) {
			var _SOCK_VAR = {
								user_id:me.id, 
								user_name:me.username, 
								thumbnail_image:me.profile.thumbnail_image
							};
			socket.emit('login', _SOCK_VAR);
		}
	};
})

.factory('focus', function($timeout, $window) {
	return function(id) {
	// timeout makes sure that it is invoked after any other event has been triggered.
	// e.g. click events that need to run before the focus or
	// inputs elements that are in a disabled state but are enabled when those events
	// are triggered.
		$timeout(function() {
			var element = $window.document.getElementById(id);
			if(element) {
				element.focus();
			}
		});
	};
})

;