// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
// angular.module('starter', ['ionic','ionic.service.core', 'starter.controllers', 'monospaced.elastic', 'angularMoment'])

var authorized = false;
var authTokenChk = false;

var handleOpenURL = function(url) {
	console.log(url);

	var scheme = url.split("//");
	var typeObj = scheme[1].split("?");

	if (typeObj[0] == "payment") {
		location.href="#/app/bookingTabs/invite";
	}

	// localStorage.setItem('external_load', url);
}

angular.module('starter', [
							'ionic'					// inject the Ionic framework
							, 'http-auth-interceptor'	// inject the angular-http-auth module
							, 'ngMockE2E'				// inject the angular-mocks module
							, 'ngCordova'				// for googlemap and gps / for push
							, 'ngResource'
							, 'starter.controllers'
							, 'starter.filters'	
							, 'starter.factory'
							, 'starter.service'						
							, 'ionic.service.push'		//for push
							, 'UserValidation'			//회원가입시 유효성 검사(login.js 에서 directive('validPasswordC') 로정의
							// , 'ui.bootstrap'
							, 'toaster'
							, 'btford.socket-io'
							, 'monospaced.elastic'
							, 'angularMoment'
							, 'angular-md5'
							, 'base64'
							])//'ngMockE2E', 
.run(function(
	$rootScope, 
	$ionicPlatform, 
	$httpBackend, 
	$http, 
	$ionicHistory, 
	$ionicPopup, 
	$ionicSideMenuDelegate, 
	$cordovaNetwork,
	$cordovaSplashscreen,
	$timeout,
	$state,
	Settings, 
	socket, 
	Auth, 
	popup, 
	$location,
	badgeService
) {
		
	$rootScope.$on('$stateChangeStart', function() {

		socket.emit('leaveRoom');

		// if(Auth.isLoggedIn()){

		// 	// console.log('isLoggedIn...');
		// 	//소켙에 커넥션 되면 아래를 실행한다.
		// 	//1. 현재 접속자 정보를 소켙에 전송
		// 	// socket.on('connection', function (data) {
		// 	// 	console.log(data);
		// 		var me = JSON.parse(localStorage.getItem('me'));
		// 		var _SOCK_VAR = {
		// 							user_id:me.id, 
		// 							user_name:me.username, 
		// 							thumbnail_image:me.profile.thumbnail_image
		// 						};
		// 		socket.emit('login', _SOCK_VAR);
		// 	// });
		// } else {
		// 	$state.go('login');
		// 	return false;
		// }

		//내 정보를 rootScope에 담기
		//console.log('app.js < rootScope.on');//회원정보는 실지적으로 localStorage를 변경해 두어야 한다.
		$rootScope.me			= JSON.parse(localStorage.getItem('me'));

		// if (localStorage.getItem('authToken')) {
		// 	badgeService.getCount(function() {
		// 		var me = JSON.parse(localStorage.getItem('me'));
		// 		var _SOCK_VAR = {
		// 							user_id:me.id, 
		// 							user_name:me.username, 
		// 							thumbnail_image:me.profile.thumbnail_image
		// 						};
		// 		socket.emit('login', _SOCK_VAR);
		// 	});
		// }
		// $rootScope.badgeCount	= JSON.parse(localStorage.getItem('count'));
		$rootScope.map = {};

		$ionicSideMenuDelegate.canDragContent(false);

		/*
		 * {"id":13656,"username":"새로미","email":"wangta69@naver.com","confirmation_code":null,"secret_code":null,"mailling":"Y","created_at":"2016-01-13 18:47:19","updated_at":"2016-02-11 14:22:44","expired_at":null,"deleted_at":null,"profile":{"id":13654,"user_id":13656,"realname":"류영형","dob":"1972-10-07","gender":"male","carrier":0,"phone":"01089350355","marital_status":0,"latitude":"37.36619680","longitude":"126.90270470","geo_location":"안양시 안양동 수리산","golf_region":0,"golf_score":3,"golf_frequency":4,"golf_membership":4,"golf_oversea":4,"golf_year":4,"thumbnail_image":"http://s3-ap-northeast-1.amazonaws.com/teeshot-photo/images/5644/thumb/image.png","profile_image":"http://s3-ap-northeast-1.amazonaws.com/teeshot-photo/images/5644/medium/image.png","bio":"골프초보입니다.\r\n많은 사랑바랍니다.","comment":"adfadfadf","feedback_average":0,"view_count":5,"created_at":"2016-01-13 18:47:19","updated_at":"2016-02-11 14:22:21"}}
		 */
	});



	
	
	
	//on/off line check Start..
	document.addEventListener("online", onOnline, false);
	document.addEventListener("offline", onOffline, false);
	function onOnline() {
		//console.log(navigator.network.connection.type);//4g, 3g, wifi
	}

	var offlineCheck = false;
	function onOffline() {
		if (!offlineCheck) {
			var alertPopup = $ionicPopup.alert({
				title: '알림',
				template: '현재 offline 상태입니다.'
			});

			offlineCheck = true;
		}
	} 
	//on/off line check End..
	
	//var authToken = localStorage.getItem('authToken');
	//if(authToken) authorized = true;

	/*
	// returns the current list of customers or a 401 depending on authorization flag
	$httpBackend.whenGET('http://dev.teeshot.co.kr/get').respond(function (method, url, data, headers) {//passThrough().
		return authorized ? [200, customers] : [401];
	});
	$httpBackend.whenPOST('http://dev.teeshot.co.kr/login').respond(function(method, url, data) {
	authorized = true;
	return	[200 , { authorizationToken: "NjMwNjM4OTQtMjE0Mi00ZWYzLWEzMDQtYWYyMjkyMzNiOGIy" } ];
	});
	$httpBackend.whenPOST('http://dev.teeshot.co.kr/logut').respond(function(method, url, data) {
	authorized = false;
	return [200];
	});
	*/
	
	$httpBackend.whenGET(/.*/).passThrough();
	$httpBackend.whenPOST(/.*/).passThrough();
	
	
	$ionicPlatform.ready(function() {

		if (typeof analytics !== 'undefined'){
			analytics.startTrackerWithId('UA-75137368-1');
			analytics.trackView('Teeshot App');
 		}

 		// if(typeof window.localStorage.getItem("external_load") != "undefined") {
 		// 	$location.path("/");
 		// }

 		// if (window.cordova) {
 		// 	// facebookConnectPlugin.logEvent("ActivatedApp");
	 	// // 	facebookConnectPlugin.logEvent("앱실행",
			// // {
			// //     NumItems: 1,
			// //     Currency: "USD",
			// //     ContentType: "shoes",
			// //     ContentID: "HDFU-8452"
			// // }, 500);
	 	// } 		
 				
		//세팅 초기 정보
		Settings.init();
		
		
		// Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
		// for form inputs)
		if (window.cordova && window.cordova.plugins.Keyboard) {
			if (device.platform == "Android") {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
				cordova.plugins.Keyboard.disableScroll(false);
			} else if (device.platform == "iPhone" || device.platform == "iOS") {
				cordova.plugins.Keyboard.hideKeyboardAccessoryBar(false);
				cordova.plugins.Keyboard.disableScroll(true);
			}
		}
		if (window.StatusBar) {
			// org.apache.cordova.statusbar required
			StatusBar.styleDefault();
		}


		//현재 버젼과 비교하여 강제적으로 업데이트 처리 current version Check Start..
		if (window.cordova) {

			$timeout(function() {
		        if (device.platform == "Android") {
		        	// console.log('device.platform == "Android"');
		            $cordovaSplashscreen.hide();
		        }
		        if (device.platform == "iPhone" || device.platform == "iOS") {
		            navigator.splashscreen.hide();
		        }
		    }, 1000);

			$http.get(webServer + '/appver.php')
			.then(function(response) {
				cordova.getAppVersion.getVersionNumber().then(function(version) {

					var isIPad		= ionic.Platform.isIPad();
					var isIOS		= ionic.Platform.isIOS();
					var isAndroid	= ionic.Platform.isAndroid();
					if(isAndroid){
						if(compareVersionNumbers(version, response.data.android.ver) < 0){
							var alertPopup = $ionicPopup.alert({
								title: '알림',
								template: '새로운 버젼이 나왔습니다. </br> 구글플레이로 이동하겠습니다.<br />업데이트가 안될시 삭제 후 다시 설치해주시기 바랍니다.'
							});
		
							alertPopup.then(function(res) {
								window.plugins.webintent.startActivity({
									action: window.plugins.webintent.ACTION_VIEW,
									url: response.data.android.marketurl
								},
								 
								function() {ionic.Platform.exitApp();},
								function() {
									alert('업데이트에 실패하였습니다. 마켓에서 다운받아 주세요.');
								}
								);
							});
						}
					}else if(isIPad | isIOS){
						if(compareVersionNumbers(version, response.data.ios.ver) < 0){
							var alertPopup = $ionicPopup.alert({
								title: '알림',
								template: '새로운 버젼이 나왔습니다. </br> 앱스토어로 이동하겠습니다.<br />업데이트가 안될시 삭제 후 다시 설치해주시기 바랍니다.'
							});
		
							alertPopup.then(function(res) {
								// location.href=response.data.ios.marketurl;
								window.open(response.data.ios.marketurl, '_system', 'location=yes');

								$ionicHistory.nextViewOptions({
									disableBack: true
								});
								$state.go('blank');
							});
						}
					}
				//	intent = new Intent(Intent.ACTION_VIEW,Uri.parse(response.data.android.marketurl));
				//	startActivity(intent);
				});
			},function(error){
			
			});
		}
	//current version Check End..

		// //5분마다 현재 좌표값을 서버로 전송 Start
		var gps_processing = false;
		var interval;
		//var duration = 6000;//6초마다 체크 
		//var duration = 300000;//5분만다 체크 
		var duration = 3600000;//1시간마다 체크
		
		/*
		$cordovaGeolocation.getCurrentPosition({timeout: 10000, enableHighAccuracy: true}).then(function(position){
			//초기에 위치정보 동의를 받기 위해(작동하지 않은듯함)
		}, function(error){
			console.log("Could not get location");
		});
		*/
		//navigator.geolocation.getCurrentPosition(function(position) {
			//초기에 위치정보 동의를 받기 위해(작동하지 않은듯함)
		//});
			
		function hb() {
			//console.log('hb running');
			if(gps_processing) return;
			gps_processing = true;
			
			navigator.geolocation.getCurrentPosition(function(position) {
				gps_processing = false;
				findGeoAddress(position, function(geo_location){
					if(localStorage.getItem('authToken')){
						$http({
							method: 'POST',
							url: apiServer + 'user/location?token='+localStorage.getItem('authToken'), //+querystr,
							data : {latitude:position.coords.latitude, longitude:position.coords.longitude, geo_location:geo_location},
							headers: {'Content-Type' : 'application/json; charset=utf-8'}
							
						}).then(function successCallback(response) {
							//console.log(response);
						}, function errorCallback(response) {
							console.log(response);
						});
					}
				});
			});
		}
		hb();

		function findGeoAddress(position, callback)
		{
			var address;
			var geocoder	= new google.maps.Geocoder();
			var latlng		= new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
			geocoder.geocode({ 'latLng': latlng, 'language': 'kr' }, function(results, status) {
				if (status == google.maps.GeocoderStatus.OK) {
					if (results.length > 0) {
						var arr = results[results.length-1].formatted_address.split(' ');
						if (arr[0] == "대한민국") {
							if (results[3]) {
								var arrLocs = results[3].formatted_address.replace("대한민국 ", "").split(' ');
								var address = arrLocs[0] + ' ' + arrLocs[1];
								callback(address);
							}
						} else {
							if (results[results.length-2]) {
								var address = results[results.length-2].formatted_address;
								callback(address);
							}
						}
					}
				}
			});		
		}
		
		interval = window.setInterval(hb, duration);
		// hb(); //실행시 1번 체크
		// //5분마다 현재 좌표값을 서버로 전송 End
	});
	
	
	/**
	 * hardware back button시 exit confirm
	 */
	$rootScope.backButtonPressedOnceToExit = false;
	$ionicPlatform.registerBackButtonAction(function(e) {

		if ( $rootScope.backButtonPressedOnceToExit ) {
			navigator.app.exitApp();
		} else {
		// } else if ( $state.current.name == "app.mypage.info" || $state.current.name == "login") {
			window.plugins.toast.showWithOptions(
				{
					message: "'뒤로'버튼을 한번 더 누르시면 종료합니다.",
					duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
					position: "bottom",
					addPixelsY: -150,  // added a negative value to move it up a bit (default 0)
					styling: {
						opacity: 1,
						textSize: 16,
						cornerRadius: 50,
						horizontalPadding: 50, // iOS default 16, Android default 50
      					verticalPadding: 30 // iOS default 12, Android default 30
					}

				}
			);

			$rootScope.backButtonPressedOnceToExit = true;
			$timeout(function() { $rootScope.backButtonPressedOnceToExit = false; }, 2000);
		// } else {
		// 	navigator.app.backHistory();
		}

		e.preventDefault();	
	}, 101);

})
.run(function(PushToken) {
	/**
	 *  deviceready
	 * ToDo : PushToken Update
	 * ToDo : Action for Push
	 * ToDo : Current Position Update
	 */
	
	document.addEventListener("deviceready", onDeviceReady, false);
	function onDeviceReady() {	

		//ToDo : PushToken Update
		PushToken.update();//Save Push Token

		// ToDo : Current Position Update
		var geolocationSuccess = function(position){};
		var geolocationError = function(error){};
		navigator.geolocation.getCurrentPosition(geolocationSuccess,geolocationError);
			
	}//function onDeviceReady() {

})
.value('golf_membership', {1:'가평베네스트', 2:'광릉포레스트', 3:'남양주 해비치', 4:'뉴코리아', 5:'더스타휴', 6:'레이크우드', 7:'마이다스밸리', 8:'몽베르', 9:'비전힐스'
, 10:'서서울', 11:'서울', 12:'서원밸리', 13:'송추', 14:'썬힐', 15:'아난티클럽서울', 16:'양주', 17:'양평 TPC', 18:'일동레이크', 19:'크리스탈밸리', 20:'태릉', 21:'티클라우드'
, 22:'포천아도니스', 23:'프리스틴밸리', 24:'필로스', 25:'한양', 26:'88', 27:'강남300', 28:'경찰대 체력단련장', 29:'곤지암', 30:'골드', 31:'그린힐', 32:'금강', 33:'기흥', 34:'김포시사이드'
, 35:'남부', 36:'남서울', 37:'남수원 체력단련장', 38:'남촌', 39:'뉴서울', 40:'뉴스프링빌', 41:'덕산대 체력단련장', 42:'덕평힐뷰', 43:'동여주', 44:'레이크사이드', 45:'레이크힐스 용인', 46:'렉스필드'
, 47:'리베라', 48:'마에스트로', 49:'발리오스', 50:'블루버드', 51:'블루원 용인(구.태영)', 52:'블루헤런', 53:'비승대 체력단련장', 54:'비에이비스타', 55:'선봉대 체력단련장', 56:'세라지오', 57:'솔모로'
, 58:'수원', 59:'수원 체력단련장', 60:'스카이밸리', 61:'신라', 62:'신안', 63:'신원', 64:'아시아나', 65:'아일랜드', 66:'안성', 67:'안성베네스트', 68:'안양', 69:'양지파인', 70:'에덴블루', 71:'여주'
, 72:'윈체스트', 73:'은화삼', 74:'이스트밸리', 75:'이천 블랙스톤', 76:'이포', 77:'인천국제', 78:'자유', 79:'잭니클라우스', 80:'제일', 81:'중부', 82:'지산', 83:'처인', 84:'캐슬렉스', 85:'캐슬파인'
, 86:'코리아', 87:'태광', 88:'트리니티', 89:'파인크리크', 90:'평택 체력단련장', 91:'플라자 용인', 92:'한성', 93:'한성대체력단련장', 94:'한원', 95:'해슬리 나인브릿지', 96:'화산'
, 97:'휘닉스스프링스', 98:'강릉 체력단련장', 99:'골든비치', 100:'남춘천', 101:'동원썬밸리', 102:'동해 체력단련장', 103:'라데나', 104:'비발디파크', 105:'산요수 웰니스카운티', 106:'샌드파인', 107:'샤인데일'
, 108:'센추리21', 109:'알펜시아트룬', 110:'엘리시안 강촌', 111:'오크밸리', 112:'오크힐스', 113:'오투리조트', 114:'옥스필드', 115:'용평', 116:'용평버치힐', 117:'원주 체력단련장', 118:'웰리힐리', 119:'제이드팰리스'
, 120:'청우', 121:'클럽모우', 122:'파가니카', 123:'파인밸리', 124:'플라자 설악', 125:'휘닉스파크', 126:'휘슬링락', 127:'힐드로사이', 128:'계룡대', 129:'골든베이', 130:'공사 체력단련장', 131:'그랜드(청주)'
, 132:'도고', 133:'동촌', 134:'떼제베', 135:'레인보우힐스', 136:'로얄포레', 137:'마론뉴데이', 138:'버드우드', 139:'상떼힐', 140:'서산 체력단련장', 141:'서산수', 142:'세종에머슨', 143:'시그너스'
, 144:'실크리버', 145:'썬밸리', 146:'아름다운', 147:'아트밸리', 148:'에딘버러', 149:'에머슨', 150:'우정힐스', 151:'유성', 152:'이븐데일', 153:'임페리얼레이크', 154:'자운대', 155:'젠스필드'
, 156:'창공대 체력단련장', 157:'천룡', 158:'청주 체력단련장', 159:'충주 체력단련장', 160:'코스카', 161:'태안비치', 162:'힐데스하임', 163:'가야', 164:'경주 신라', 165:'고성노벨', 166:'구미', 167:'그레이스'
, 168:'김해 체력단련장', 169:'꽃담', 170:'남안동', 171:'대구', 172:'대구 체력단련장', 173:'동래베네스트', 174:'동부산', 175:'드비치', 176:'레이크힐스 경남', 177:'롯데스카이힐 김해', 178:'마우나오션'
, 179:'무열대 체력단련장', 180:'베네치아', 181:'베이사이드', 182:'보라', 183:'부곡', 184:'부산', 185:'블루원 보문', 186:'사천 체력단련장', 187:'선산', 188:'세븐밸리', 189:'스카이뷰'
, 190:'아델스코트', 191:'아시아드', 192:'양산', 193:'에덴밸리', 194:'에이원', 195:'엠스클럽의성', 196:'영천', 197:'영천 오펠', 198:'예천 체력단련장', 199:'오션뷰', 200:'오션힐스 청도', 201:'오션힐스 포항'
, 202:'용원', 203:'울산', 204:'인터불고 경산', 205:'정산', 206:'진주', 207:'진해 체력단련장', 208:'창원', 209:'충성대', 210:'타니', 211:'탑블리스', 212:'통도파인이스트', 213:'파미힐스'
, 214:'팔공', 215:'포항 체력단련장', 216:'해운대', 217:'힐마루', 218:'JNJ', 219:'골드레이크', 220:'광주', 221:'광주 체력단련장', 222:'군산', 223:'남광주', 224:'담양다이너스티', 225:'레이크힐스 순천'
, 226:'무등산', 227:'무주덕유산', 228:'베어리버', 229:'상떼힐 익산', 230:'상무대', 231:'승주', 232:'어등산', 233:'전주샹그릴라', 234:'태인', 235:'파인비치', 236:'함평다이너스티', 237:'해피니스'
, 238:'화순', 239:'나인브릿지 ', 240:'더클래식', 241:'라온', 242:'라헨느 리조트', 243:'레이크힐스 제주', 244:'롯데스카이힐 제주', 245:'블랙스톤', 246:'사이프러스', 247:'세인트포', 248:'스프링데일'
, 249:'아덴힐', 250:'에버리스', 251:'엘리시안 제주', 252:'오라', 253:'우리들', 254:'제주', 255:'제주 해비치', 256:'제피로스', 257:'캐슬렉스 제주', 258:'크라운', 259:'타미우스', 260:'테디밸리'
, 261:'핀크스', 262:'한라산'})
.value('city', {'1':'서울시','2':'부산시','3':'인천시','4':'대구시','5':'대전시','6':'광주시','7':'울산시','8':'세종시','9':'경기도','10':'강원도','11':'충청북도','12':'충청남도','13':'경상북도','14':'경상남도','15':'전라북도','16':'전라남도','17':'제주도'})

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
	
	$stateProvider
	
	.state('app', {  //controllers.js
		url: '/app',
		abstract: true,
		templateUrl: 'templates/menu.html',
		controller: 'AppCtrl'
	})
	.state('app.setting', {//셑팅 (setting.js)
		url: '/setting',
		views: {
			'menuContent': {
			templateUrl: 'templates/setting.html',
			controller: 'settingCtrl'
			}
		}
	})	

	.state('app.golfjoin', {//골프장 조인
		url: '/golfjoin',
		abstract: true,
		views: {
			'menuContent': {
			templateUrl: 'templates/golfjoin.html',
			controller: 'golfjoinCtrl'
			}
		}
	})	
	.state('app.golfjoin.lists', {//골프장 조인 리스트 (golflist.js)
		url: '/lists',
		views: {
			'golfContent': {
				templateUrl: 'templates/golflists.html',
				controller: 'golflistsCtrl'
			}
		}
	})
	.state('app.golfjoin.posts', {//골프장 조인 등록하기  (golflist.js)
		url: '/posts',
		views: {
			'golfContent': {
			templateUrl: 'templates/golflists-posts.html',
			controller: 'golfpostsCtrl'
			}
		}
	})
	.state('app.golfjoin.modify', {//골프장 조인 수정하기  (golflist.js)
		url: '/modify/:postId',
		views: {
			'golfContent': {
			templateUrl: 'templates/golflists-posts.html',
			controller: 'golfpostsCtrl'
			}
		}
	})
	.state('app.golfjoin.comment', {//골프장 조인 댓글  (golflist.js) 
		url: '/comment/:golflistId',
		views: {
			'golfContent': {
			templateUrl: 'templates/golflists-comment.html',
			controller: 'golfcommentCtrl'
			}
		}
	})
	.state('app.golfjoin.recomment', {//골프장 조인 대댓글 (golflist.js) 
		url: '/recomment/:golflistId/:thread',
		views: {
			'golfContent': {
			templateUrl: 'templates/golflists-recomment.html',
			controller: 'golfrecommentCtrl'
			}
		}
	})
	.state('app.golfjoin.partnerlist', {//골프장 조인 파트너리스트 (golflist.js) 
		url: '/partnerlist/:fieldId',
		views: {
			'golfContent': {
			templateUrl: 'templates/golflists-partnerlist.html',
			controller: 'golfpartnerListCtrl'
			}
		}
	})
	.state('app.screen', {//스크린 번개(for backend)
		url: '/screen',
		abstract: true,
		views: {
			'menuContent': {
			templateUrl: 'templates/screen/screen.html',
			controller: 'screenMainCtrl'
			}
		}
	})
	.state('app.screen.map', {//스크린 번개 맵 디스플레이 (screen.js)
		url: '/map',
		views: {
			'screenContent': {
			templateUrl: 'templates/screen/screen-map.html',
			controller: 'screenCtrl'
			}
		}
	})
	.state('app.screen.lists', {//번개 리스트
		url: '/lists',
		views: {
			'screenContent': {
			templateUrl: 'templates/screen/screen-list.html',
			controller: 'screenListCtrl'
			}
		}
	})
	.state('app.screen.invite', {//번개 리스트(초대장 처리)
		url: '/lists/:postId',
		views: {
			'screenContent': {
			templateUrl: 'templates/screen/screen-list.html',
			controller: 'screenListCtrl'
			}
		}
	})
	.state('app.screen.send', {//번개 날리기 (screen.js)
		url: '/send/:screenId',
		views: {
			'screenContent': {
			templateUrl: 'templates/screen/screen-send.html',
			controller: 'screensendCtrl'
			}
		}
	})
	.state('app.screen.modify', {//번개 수정(screen.js)
		url: '/modify/:postId',
		views: {
			'screenContent': {
			templateUrl: 'templates/screen/screen-send.html',
			controller: 'screensendCtrl'
			}
		}
	})
	.state('app.screen.shopmodify', {//스크린 상점정보 수정 요청(screen.js)
		url: '/shopmodify/:postId',
		views: {
			'screenContent': {
			templateUrl: 'templates/screen/screen-modify.html',
			controller: 'screenShopModifyCtrl'
			}
		}
	})
	.state('app.map', {//근처 회원들 @Deprecated
		url: '/map',
		views: {
			'menuContent': {
			templateUrl: 'templates/map.html',
			controller: 'mapCtrl'
			}
		}
	})
	.state('app.messages', {//chatting list (messages.js)
		url: '/messages',
		views: {
			'menuContent': {
				templateUrl: 'templates/messages.html',
				controller: 'MessagesCtrl'
			}
		},
		params: {
			obj: null
		}
	})
	.state('app.message', {//chatting from message  (messages.js)
		url: '/message/:messageId',
		views: {
			'menuContent': {
			templateUrl: 'templates/message.html',
			controller: 'MessageCtrl'
			}
		},
		onEnter: function(socket) {
			// console.log('view onEnter...');
			socket.removeAllListeners('getMessage');
			// socket.removeAllListeners('recallAuth');
		},
		onExit: function(socket) {
			// console.log('view onExit...');
			socket.removeAllListeners('getMessage');
			// socket.removeAllListeners('recallAuth');	
		}
	})
	.state('app.messagecreate', {//chatting from general users  (messages.js)
		url: '/message/create/:userId',
		views: {
			'menuContent': {
			templateUrl: 'templates/message.html',
			controller: 'MessageCtrl'
			}
		},
		onEnter: function(socket) {
			// console.log('view onEnter...');
			socket.removeAllListeners('getMessage');
			// socket.removeAllListeners('recallAuth');
		},
		onExit: function(socket) {
			// console.log('view onExit...');
			socket.removeAllListeners('getMessage');
			// socket.removeAllListeners('recallAuth');	
		}
	})
	/*
	.state('app.messagecreate', {//chatting from general users  (messages.js)
		url: '/message/create/:userId',
		views: {
			'menuContent': {
			templateUrl: 'templates/message.html',
			controller: 'MessageCreateCtrl'
			}
		}
	})
	*/
	.state('app.visitors', {//프로필방문자 (visitors.js)
		url: '/visitors',
		views: {
			'menuContent': {
			templateUrl: 'templates/visitors.html',
			controller: 'visitorsCtrl'
			}
		}
	})
	.state('app.friend', {//친구
		url: '/friend',
		views: {
			'menuContent': {
			templateUrl: 'templates/friend.html',
			controller: 'friendCtrl'
			}
		}
	})
	.state('app.friendstab', {//친구(탭) @Deprecated
		url: '/friendstab',
		abstract: true,
		views: {
			'menuContent': {
			templateUrl: 'templates/friends-tab.html'
			}
		}
	})
	.state('app.friendstab.friends', {//친구리스트 @Deprecated
		url: '/friends',
		views: {
			'friend-tab': {
			templateUrl: 'templates/friends.html',
			controller: 'friendsCtrl'
			}
		}
	})
	.state('app.friendstab.request', {//친구요청 @Deprecated
		url: '/request',
		views: {
			'request-tab': {
			templateUrl: 'templates/friends-request.html',
			controller: 'friendsRequestCtrl'
			}
		}
	})
	.state('app.profile', {//프로필방문자
		url: '/profile/:Id',
		views: {
			'menuContent': {
			templateUrl: 'templates/profile.html',
			controller: 'profileCtrl'
			}
		}
	})
	.state('app.mypage', {	// 마이페이지 (mypage.js)
		url: '/mypage',
		abstract: true,
		views: {
			'menuContent': {
			templateUrl: 'templates/mypage.html',
			}
		}
	})
	.state('app.mypage.info', {	// 마이페이지 내정보 (mypage.js)
		url: '/info',
		views: {
			'mypageContent': {
				templateUrl: 'templates/mypage-info.html',
				controller: 'mypageInfoCtrl'
			}
		},
		params: {
			obj: null
		}
	})
	.state('app.mypage.new', {	// 마이페이지 내정보 (mypage.js)
		url: '/new',
		views: {
			'mypageContent': {
				templateUrl: 'templates/mypage-new.html',
				controller: 'mypageNewCtrl'
			}
		},
		params: {
			obj: null
		}
	})
	.state('app.mypage.visit', {	// 마이페이지 방문 (mypage.js)
		url: '/info/:Id/:userId/:state',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-visit.html',
			controller: 'mypageVisitCtrl'
			}
		}
		// onEnter: function($rootScope, $state, $timeout, Auth, socket){
		// 	if (!$rootScope.me.profile.phone) {
		// 		$timeout(function() {
		// 			console.log('없음');
		// 			$state.go('app.mypage.realname');
		// 		});
		// 		return;
		// 	}
		// }
	})
	.state('app.mypage.block', {	// 마이페이지 방문
		url: '/block',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-block.html',
			controller: 'mypageBlockCtrl'
			}
		}
	})
	.state('app.mypage.golfinfo', {	// 골프정보 수정
		url: '/golfinfo',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-golfinfo.html',
			controller: 'mypageGolfinfoCtrl'
			}
		}
	})
	.state('app.mypage.myinfo', {	// 내소개 수정
		url: '/myinfo',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-myinfo.html',
			controller: 'mypageMyinfoCtrl'
			}
		}
	})
	.state('app.mypage.location', {	// 위치정보 수정
		url: '/location',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-location.html',
			controller: 'mypageLocationCtrl'
			}
		}
	})
	.state('app.mypage.nickname', {	// 닉네임변경(mypage.js)
		url: '/nickname',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-nickname.html',
			controller: 'mypageNicknameCtrl'
			}
		}
	})
	.state('app.mypage.password', {	// 비밀번호 변경(mypage.js)
		url: '/password',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-password.html',
			controller: 'mypagePasswordCtrl'
			}
		}
	})
	.state('app.mypage.email', {	// 이메일 변경 (mypage.js)
		url: '/email',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-email.html',
			controller: 'mypageEmailCtrl'
			}
		}
	})
	.state('app.mypage.phone', {	// 휴대폰 변경(mypage.js)
		url: '/phone',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-phone.html',
			controller: 'mypagePhoneCtrl'
			}
		}
	})
	.state('app.mypage.realname', {	// 실명인증(mypage.js)
		url: '/realname',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-realname.html',
			controller: 'mypageRealNameCtrl'
			}
		}
	})
	.state('app.mypage.agreement', {	// 약관동의(mypage.js)
		url: '/agreement',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-agreement.html',
			controller: 'mypageAgreementCtrl'
			}
		}
	})
	.state('app.mypage.drop', {	// 회원탈퇴(mypage.js)
		url: '/drop',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-drop.html',
			controller: 'mypageDropCtrl'
			}
		}
	})
	.state('app.mypage.active', {	// 활동정보(mypage.js)
		url: '/active',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-active.html',
			controller: 'mypageActiveCtrl'
			}
		}
	})
	.state('app.mypage.account', {	// 통합계정(mypage.js)
		url: '/account',
		views: {
			'mypageContent': {
			templateUrl: 'templates/mypage-account.html',
			controller: 'mypageAccountCtrl'
			}
		}
	})

	.state('app.usersFind', {	// 회원검색 (users.js)
		url: '/usersFind',
		abstract: true,
		views: {
			'menuContent': {
			templateUrl: 'templates/users-find.html',
			}
		}
	})
	.state('app.usersFind.main', {	// 회원검색-메인 (users.js)
		url: '/main',
		views: {
			'usersFindContent': {
			templateUrl: 'templates/users-find-main.html',
			controller: 'UsersFindMainCtrl'
			}
		}
	})
	.state('app.usersFind.visit', {	// 회원검색-검색순 (users.js)
		url: '/visit',
		views: {
			'usersFindContent': {
			templateUrl: 'templates/users-find-visit.html',
			controller: 'UsersFindVisitCtrl'
			}
		}
	})
	.state('app.usersFind.join', {	// 회원검색-가입순 (users.js)
		url: '/join',
		views: {
			'usersFindContent': {
			templateUrl: 'templates/users-find-join.html',
			controller: 'UsersFindJoinCtrl'
			}
		}
	})
	.state('app.usersFind.popular', {	// 회원검색-가입순 (users.js)
		url: '/popular',
		views: {
			'usersFindContent': {
			templateUrl: 'templates/users-find-popular.html',
			controller: 'UsersFindPopularCtrl'
			}
		}
	})
	.state('app.usersFind.list', {	// 회원검색-가입순 (users.js)
		url: '/list',
		views: {
			'usersFindContent': {
			templateUrl: 'templates/users-find-list.html',
			controller: 'UsersFindListCtrl'
			}
		},
		params: {
			obj: null
		}
	})
	.state('app.bugs', {//오류 및 버그신고
		url: '/bugs/:type',
		views: {
			'menuContent': {
			templateUrl: 'templates/bugs.html',
			controller: 'bugsCtrl'
			}
		}
	})

	.state('login', {//login
		url: '/login',
		templateUrl: 'templates/login.html',
		controller: 'LoginIntroCtrl',
		onEnter: function($state, Auth, socket, $timeout){

			if(Auth.isLoggedIn()){

				// var me = JSON.parse(localStorage.getItem('me'));
				// var _SOCK_VAR = {
				// 					user_id:me.id, 
				// 					user_name:me.username, 
				// 					thumbnail_image:me.profile.thumbnail_image
				// 				};
				// socket.emit('login', _SOCK_VAR);
				
				
				$state.go('app.mypage.info', { obj: {type: 'autoLogin'} });
				
			}
		}
	})
	.state('loginTeeshot', {//login
		url: '/loginTeeshot',
		templateUrl: 'templates/login-teeshot.html',
		controller: 'LoginCtrl'
	})
	.state('join', {//login.js
		url: '/join',
		templateUrl: 'templates/join.html',
		controller: 'JoinCtrl'
	})
	.state('joinForm', {//login.js
		url: '/joinForm',
		templateUrl: 'templates/join-form.html',
		controller: 'JoinFormCtrl'
	})
	.state('findId', {//login.js
		url: '/findId',
		templateUrl: 'templates/findId.html',
		controller: 'findIdCtrl'
	})
	.state('findPass', {//login.js
		url: '/findPass',
		templateUrl: 'templates/findPass.html',
		controller: 'findPassCtrl'
	})

	.state('certification', {//오류 및 버그신고
		url: '/certification',	
		templateUrl: 'templates/certification.html',
		controller: 'certificationCtrl'
	})

	.state('app.sponsorInvite', {//스폰서 초청
		url: '/sponsorInvite',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/sponsorInvite.html',
				controller: 'sponsorInviteCtrl'
			}
		}
	})
	.state('app.sponsorInvite.lists', {//스폰서 초청 리스트 (sponsor.js)
		url: '/lists/:inviteType',
		views: {
			'sponsorContent': {
				templateUrl: 'templates/sponsor-lists.html',
				controller: 'sponsorListsCtrl'
			}
		},
		params: {
			inviteType: null,
			fieldId: null,
			article_type: null
		}
	})
	.state('app.inviteTabs', {//스폰서 초청 리스트 (sponsor.js)
		url: '/inviteTabs',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/invite-tabs.html'
			}
		}
	})
	.state('app.inviteTabs.invite', {//스폰서 초청 리스트 (sponsor.js)
		url: '/invite/:inviteType',
		views: {
			'intive-tab': {
				templateUrl: 'templates/invite-tabs-invite.html',
				controller: 'sponsorListsCtrl'
			}
		},
		params: {
			inviteType: null,
			fieldId: null,
			article_type: null
		}
	})
	.state('app.inviteTabs.request', {//스폰서 초청 리스트 (sponsor.js)
		url: '/request/:inviteType',
		views: {
			'request-tab': {
				templateUrl: 'templates/invite-tabs-invite.html',
				controller: 'sponsorListsCtrl'
			}
		},
		params: {
			inviteType: null,
			fieldId: null,
			article_type: null
		}
	})

	.state('app.saleBooking', {//골프장 조인
		url: '/saleBooking',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/salebooking.html',
				controller: 'salebookingCtrl'
			}
		}
	})	
	.state('app.saleBooking.lists', {//골프장 조인 리스트 (golflist.js)
		url: '/lists',
		views: {
			'bookingContent': {
				templateUrl: 'templates/salebooking-list.html',
				controller: 'salebookingListsCtrl'
			}
		},
		params: {
			inviteType: null,
			fieldId: null,
			article_type: null
		}
	})

	.state('app.bookingJoin', {//골프장 조인
		url: '/bookingjoin',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/bookingjoin.html',
				controller: 'bookingJoinCtrl'
			}
		}
	})	
	.state('app.bookingJoin.memberlists', {//골프장 조인 리스트 (golflist.js)
		url: '/memberlists',
		views: {
			'bookingjoin-member-tab': {
				templateUrl: 'templates/booking-join-list.html',
				controller: 'bookingJoinListsCtrl'
			}
		},
		params: {
			inviteType: null,
			fieldId: null,
			article_type: null,
			joinChk: null,
			joinInfo: null
		}
	})
	.state('app.bookingJoin.managerlists', {//골프장 조인 리스트 (golflist.js)
		url: '/managerlists',
		views: {
			'bookingjoin-manager-tab': {
				templateUrl: 'templates/booking-manager-list.html',
				controller: 'bookingJoinListsCtrl'
			}
		},
		params: {
			inviteType: null,
			fieldId: null,
			article_type: null,
			joinChk: null,
			joinInfo: null
		}
	})

	.state('app.saleBookingTabs', {//부킹 초청 리스트 (booking.js)
		url: '/saleBookingTabs',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/saleBooking-tabs.html'
			}
		}
	})
	.state('app.saleBookingTabs.invite', {//부킹 초청 리스트 (booking.js)
		url: '/invite',
		views: {
			'intive-tab': {
				templateUrl: 'templates/saleBooking-tabs-invite.html',
				controller: 'salebookingListsCtrl'
			}
		}
	})
	.state('app.saleBookingTabs.request', {//부킹 초청 리스트 (booking.js)
		url: '/request',
		views: {
			'request-tab': {
				templateUrl: 'templates/saleBooking-tabs-invite.html',
				controller: 'salebookingListsCtrl'
			}
		}
	})

	.state('app.bookingJoinTabs', {//부킹 초청 리스트 (booking.js)
		url: '/bookingJoinTabs',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/bookingJoin-tabs.html'
			}
		}
	})
	.state('app.bookingJoinTabs.invite', {//부킹 초청 리스트 (booking.js)
		url: '/invite',
		views: {
			'intive-tab': {
				templateUrl: 'templates/bookingJoin-tabs-invite.html',
				controller: 'bookingJoinListsCtrl'
			}
		}
	})
	.state('app.bookingJoinTabs.request', {//부킹 초청 리스트 (booking.js)
		url: '/request',
		views: {
			'request-tab': {
				templateUrl: 'templates/bookingJoin-tabs-invite.html',
				controller: 'bookingJoinListsCtrl'
			}
		}
	})

	.state('app.manager', {//부킹 초청 리스트 (booking.js)
		url: '/manager',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/manager.html'
			}
		}
	})
	.state('app.manager.request', {//부킹 초청 리스트 (booking.js)
		url: '/request',
		views: {
			'managerContent': {
				templateUrl: 'templates/manager-request.html'
			}
		}
	})

	.state('app.premium', {//프리미엄 조인
		url: '/premium',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/premium.html'
			}
		}
	})	
	.state('app.premium.lists', {//프리미엄 리스트 (premium.js)
		url: '/lists',
		views: {
			'premiumContent': {
				templateUrl: 'templates/premium-list.html',
				controller: 'premiumListsCtrl'
			}
		},
		params: {
			inviteType: null,
			fieldId: null,
			article_type: null
		}
	})
	.state('app.premiumTabs', {//부킹 초청 리스트 (booking.js)
		url: '/premiumTabs',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/premium-tabs.html'
			}
		}
	})
	.state('app.premiumTabs.invite', {//부킹 초청 리스트 (booking.js)
		url: '/invite',
		views: {
			'intive-tab': {
				templateUrl: 'templates/premium-tabs-invite.html',
				controller: 'premiumListsCtrl'
			}
		}
	})
	.state('app.premiumTabs.request', {//부킹 초청 리스트 (booking.js)
		url: '/request',
		views: {
			'request-tab': {
				templateUrl: 'templates/premium-tabs-invite.html',
				controller: 'premiumListsCtrl'
			}
		}
	})

	.state('app.payment', {//controllers.js
		url: '/payment',
		views: {
			'menuContent': {
				templateUrl: 'templates/payment.html',
				controller: 'paymentCtrl'
			}
		}
	})
	.state('app.paymentTabs', {//부킹 초청 리스트 (booking.js)
		url: '/paymentTabs',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/payment-tabs.html'
			}
		}
	})
	.state('app.paymentTabs.coupon', {//controllers.js
		url: '/coupon',
		views: {
			'paymentCouponContent': {
				templateUrl: 'templates/payment-tabs-coupon.html',
				controller: 'paymentListsCtrl'
			}
		}
	})
	.state('app.paymentTabs.golf', {//controllers.js
		url: '/golf',
		views: {
			'paymentGolfContent': {
				templateUrl: 'templates/payment-tabs-golf.html',
				controller: 'paymentListsCtrl'
			}
		}
	})
	.state('app.news', {//프리미엄 조인
		url: '/news',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/news.html'
			}
		}
	})
	.state('app.news.list', {//프리미엄 조인
		url: '/list',
		views: {
			'newsContent': {
				templateUrl: 'templates/news-list.html',
				controller: 'newsListsCtrl'
			}
		}
	})

	.state('app.compare', {//프리미엄 조인
		url: '/compare',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/compare.html'
			}
		}
	})
	.state('app.compare.list', {//프리미엄 조인
		url: '/list',
		views: {
			'compareContent': {
				templateUrl: 'templates/compare-list.html',
				controller: 'compareListsCtrl'
			}
		}
	})

	.state('app.booking', {//할인부킹
		url: '/booking',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/salebooking.html'
			}
		}
	})
	.state('app.booking.list', {//할인부킹
		url: '/list',
		views: {
			'bookingContent': {
				templateUrl: 'templates/booking-list.html',
				controller: 'bookingListsCtrl'
			}
		},
		params: {
			inviteType: null,
			fieldId: null,
			article_type: null
		}
	})

	.state('app.bookingTabs', {//부킹 초청 리스트 (booking.js)
		url: '/bookingTabs',
		abstract: true,
		views: {
			'menuContent': {
				templateUrl: 'templates/booking-tabs.html'
			}
		}
	})
	.state('app.bookingTabs.invite', {//부킹 초청 리스트 (booking.js)
		url: '/invite',
		views: {
			'intive-tab': {
				templateUrl: 'templates/booking-tabs-invite.html',
				controller: 'bookingListsCtrl'
			}
		}
	})
	.state('app.bookingTabs.request', {//부킹 초청 리스트 (booking.js)
		url: '/request',
		views: {
			'request-tab': {
				templateUrl: 'templates/booking-tabs-invite.html',
				controller: 'bookingListsCtrl'
			}
		}
	})
	.state('app.paymentCoupon', {//controllers.js
		url: '/paymentCoupon',
		views: {
			'menuContent': {
				templateUrl: 'templates/paymentCoupon.html',
				controller: 'paymentListsCtrl'
			}
		}
	})

	// .state('app.usersFilter', {//프리미엄 조인
	// 	url: '/usersFilter',
	// 	views: {
	// 		'menuContent': {
	// 			templateUrl: 'templates/usersFilter.html',
	// 			controller: 'UsersFilterCtrl'
	// 		}
	// 	}
	// })

	// .state('app.users', {//회원검색
	// 	url: '/users',
	// 	abstract: true,
	// 	views: {
	// 		'menuContent': {
	// 			templateUrl: 'templates/users.html',
	// 		}
	// 	}
	// })
	// .state('app.users.updated', {
	// 	url: '/updated',
	// 	views: {
	// 		'users-updated-tab': {
	// 			templateUrl: 'templates/users-find-list.html',
	// 			controller: 'UsersFindListCtrl'
	// 		}
	// 	},
	// 	params: {
	// 		obj: null
	// 	}
	// })
	// .state('app.users.popular', {
	// 	url: '/popular',
	// 	views: {
	// 		'users-popular-tab': {
	// 			templateUrl: 'templates/users-find-popular.html',
	// 			controller: 'UsersFindPopularCtrl'
	// 		}
	// 	},
	// 	params: {
	// 		obj: null
	// 	}
	// })
	// .state('app.users.distance', {
	// 	url: '/distance',
	// 	views: {
	// 		'users-distance-tab': {
	// 			templateUrl: 'templates/users-find-popular.html',
	// 			controller: 'UsersFindPopularCtrl'
	// 		}
	// 	},
	// 	params: {
	// 		obj: null
	// 	}
	// })
	// .state('app.users.join', {
	// 	url: '/join',
	// 	views: {
	// 		'users-join-tab': {
	// 			templateUrl: 'templates/users-find-join.html',
	// 			controller: 'UsersFindJoinCtrl'
	// 		}
	// 	},
	// 	params: {
	// 		obj: null
	// 	}
	// })

	;
	// if none of the above states are matched, use this as the fallback

	$urlRouterProvider.otherwise('/login');
	//$urlRouterProvider.otherwise('/bugs');
	//$urlRouterProvider.otherwise('/app/golfjoin/lists');
	//$urlRouterProvider.otherwise('/app/mypage/info');
	
})

.constant('$ionicLoadingConfig', {
	template: '<ion-spinner></ion-spinner>',
	delay: 0
})

.config(function($ionicConfigProvider) {
	
	$ionicConfigProvider.tabs.position('top'); //bottom

	// Make tabs show up at the bottom for android if you so desire
	// $ionicConfigProvider.tabs.position('bottom');

	// Use native scrolling on Android
	// if(ionic.Platform.isAndroid()) $ionicConfigProvider.scrolling.jsScrolling(false);

	$ionicConfigProvider.backButton.text('').icon('ion-ios-arrow-back').previousTitleText(false);
});