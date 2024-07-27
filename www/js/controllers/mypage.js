/*
 * state : 'app.mypage', templateUrl: 'templates/mypage.html'	: 마이페이지
 * state('app.mypage.info', templateUrl: 'templates/mypage-info.html',controller: 'mypageInfoCtrl'	// 마이페이지 내정보
 * state('app.mypage.visit', templateUrl: 'templates/mypage-visit.html',controller: 'mypageVisitCtrl'// 마이페이지 방문 
 * state('app.mypage.block', templateUrl: 'templates/mypage-block.html',controller: 'mypageBlockCtrl'// 마이페이지 방문
 * state('app.mypage.golfinfo', templateUrl: 'templates/mypage-golfinfo.html',controller: 'mypageGolfinfoCtrl' // 골프정보 수정
 * state('app.mypage.myinfo', templateUrl: 'templates/mypage-myinfo.html',controller: 'mypageMyinfoCtrl'	// 내소개 수정
 * state('app.mypage.location',templateUrl: 'templates/mypage-location.html',controller: 'mypageLocationCtrl'	// 위치정보 수정
 * state('app.mypage.nickname', templateUrl: 'templates/mypage-nickname.html',controller: 'mypageNicknameCtrl'// 닉네임변경
 * state('app.mypage.password', templateUrl: 'templates/mypage-password.html',controller: 'mypagePasswordCtrl'	// 비밀번호 변경
 * state('app.mypage.email', templateUrl: 'templates/mypage-email.html',controller: 'mypageEmailCtrl'	// 이메일 변경 
 * state('app.mypage.phone', templateUrl: 'templates/mypage-phone.html',controller: 'mypagePhoneCtrl'// 휴대폰 변경
 * state('app.mypage.realname', templateUrl: 'templates/mypage-realname.html',controller: 'mypageRealNameCtrl'	// 실명인증
 * state('app.mypage.drop', templateUrl: 'templates/mypage-drop.html',controller: 'mypageDropCtrl'	// 회원탈퇴
 * state('app.mypage.active', templateUrl: 'templates/mypage-active.html',controller: 'mypageActiveCtrl'	// 활동정보
 * state('app.mypage.account',  url: '/account', templateUrl: 'templates/mypage-account.html', controller: 'mypageAccountCtrl' // 통합계정(mypage.js)
*/

angular.module('starter.controllers')

	.controller('mypageInfoCtrl', function(
		$rootScope, 
		$state, 
		$scope, 
		$http, 
		$ionicModal, 
		$ionicLoading
		, $ionicPopup
		, $cordovaCamera //카메라 혹은 겔러리 활성
		, $cordovaFileTransfer//for file upload
		, Auth
		, SocialShare
		, $q, $http, $cordovaOauthUtility//for test
		, $ionicSideMenuDelegate
		, $filter
		, PushToken
		, popup
		, MypageService
		, $ionicHistory
		, $stateParams
		, $timeout
	) {

		$scope.Params = $stateParams.obj;

		$scope.$on('$stateChangeStmypagePhoneCtrlart', function(event, toState, toParams, fromState, fromParams){ 
			$scope.closeImageSetModal();
		});
		
		
		$scope.setData				= {};
		$scope.realData				= {};
		$scope.setData.genderBox	= false;
		$scope.setData.genderAgeBox	= false;
		$scope.setData.realNameBox	= false;
		// $rootScope.userData 		= {};

		var year = new Date().getFullYear();//97
		var range = [];
		//range.push(year);

		//range.push({key:"", value:'년도'});
		for(var i=18; i<87; i++) {
			var newyear = year - i;
			range.push({key:newyear, value:newyear});
		}

		$scope.setData.DropYears = range;
		
		$scope.$on('$ionicView.beforeEnter', function() {

			if ($scope.Params && $scope.Params.type == 'autoLogin') {
			} else {
				if(!Auth.isLoggedIn()){
					$state.go('login');
					return false;
				}
			}

			if ($scope.Params && $scope.Params.type == 'firstVisit') {
				if (!$rootScope.me.profile.phone) {
					$scope.certificationOpen();
				}
				$scope.Params = {};
			}
			MypageService.getInfo({}, $scope.meInfo);

		});
		
		$scope.$on('$ionicView.enter', function() {
			// loadInfo();
			$ionicSideMenuDelegate.canDragContent(false);
		});
		

		$scope.$on('$stateChangeStart', function() {
			if($scope.modal) $scope.modal.hide();
		});

		
		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.shareModal.remove();
		});

		$scope.myUpdate = function(value, type) {
			MypageService.put({value: value, type: type}, function(obj) {
				// toaster.pop({
				// 	type: '',
				// 	title: '',
				// 	body: '수정 되었습니다.',
				// 	showCloseButton: false,
				// 	timeout: 2000
				// });

				window.plugins.toast.showWithOptions(
					{
						message: "수정 되었습니다.",
						duration: "short", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
						position: "top",
						addPixelsY: 150,  // added a negative value to move it up a bit (default 0)
						styling: {
							textSize: 16,
							cornerRadius: 50,
							horizontalPadding: 50, // iOS default 16, Android default 50
	      					verticalPadding: 30 // iOS default 12, Android default 30
						}

					}
				);
				
				if (type == 'bio') {
					$scope.setData.bio = value;
				}


			});
		};

		$scope.meInfo = function(obj) {
			$rootScope.userData = obj;

			$rootScope.userData.profile.golf_score		= obj.profile.golf_score.toString();
			$rootScope.userData.profile.golf_year		= obj.profile.golf_year.toString();
			$rootScope.userData.profile.golf_frequency	= obj.profile.golf_frequency.toString();
			$rootScope.userData.profile.golf_oversea	= obj.profile.golf_oversea.toString();
			$rootScope.userData.profile.golf_membership	= obj.profile.golf_membership.toString();

			$scope.setData.scrollWidth = 110 * obj.pictures.length;
		};
		
		var loadInfo = function(){
			$ionicLoading.show();
				$http.get(apiServer + 'edit?token=' + localStorage.getItem('authToken'))
					.then(function(response) {
						if(response.data.err_code == "005"){
							$state.go('login');
							return;
						}

						// localStorage.setItem('count', JSON.stringify(response.data.count));
						$rootScope.userData = response.data;
						$rootScope.userData.profile.BirthYear	= "";
						$rootScope.userData.profile.BirthMonth	= "";
						$rootScope.userData.profile.BirthDay	= "";
						if($scope.userData.profile.dob && $scope.userData.profile.dob.length == 10){
							var birth_dob	= $scope.userData.profile.dob.split("-");
							$rootScope.userData.profile.BirthYear	= parseInt(birth_dob[0]);
							$rootScope.userData.profile.BirthMonth	= birth_dob[1];
							$rootScope.userData.profile.BirthDay	= birth_dob[2];
							//생년월일 변경용
							var collectionDate = $scope.userData.profile.dob;
							$scope.userData.profile.BirthDate = new Date(collectionDate);
						}
						$rootScope.userData.profile.golf_score		= $rootScope.userData.profile.golf_score.toString();
						$rootScope.userData.profile.golf_year		= $rootScope.userData.profile.golf_year.toString();
						$rootScope.userData.profile.golf_frequency	= $rootScope.userData.profile.golf_frequency.toString();
						$rootScope.userData.profile.golf_oversea	= $rootScope.userData.profile.golf_oversea.toString();
						$rootScope.userData.profile.golf_membership	= $rootScope.userData.profile.golf_membership.toString();
						
						//성별, 생년월일 입력난 박스 
						$scope.setData.genderBox = $rootScope.userData.profile.gender 
													&& $rootScope.userData.profile.BirthYear 
													&& $rootScope.userData.profile.BirthYear != "0000"
													&& $rootScope.userData.profile.BirthMonth 
													&& $rootScope.userData.profile.BirthDay;
						
						$scope.setData.genderAgeBox	= $rootScope.userData.profile.gender;
						//실명인증 박스						
						//$scope.setData.realNameBox	= $rootScope.userData.profile.realname ? true:false;
						
						$scope.setData.scrollWidth = 110 * $rootScope.userData.pictures.length;

					},function(error){
							$ionicLoading.hide();
					}
					).finally(function() {
						$ionicLoading.hide();
					}
			);
		};
		
		
		//공유 모달 관련 시작
		// sharing plugin
		$scope.shareMain = function($data) {
			var title = "티샷에서 "+$data.me.username+"님을 만나 보세요";
			var url = webServer+"/@"+$data.me.username;
			var subject = $data.profile.bio;
			var img = $data.profile.profile_image;
			if(img.indexOf('http')) img = webServer + "/"+img;
			window.plugins.socialsharing.share(title, subject, img, url);
		};

		//카카오톡
		$scope.sharekakaotalk = function($data) {
			var obj = {"title":"티샷에서 "+$data.me.username+"님을 만나 보세요","url":webServer+"/@"+$data.me.username, "img":$data.profile.profile_image};
			SocialShare.share('kakaotalk', obj);
		};
		
		//네이버밴드
		$scope.sharenaverband = function($data) {
			var obj = {"title":"TeeShot 파트너조인, 채팅과 골프친구","url":webServer+"/@"+$data.me.username, "img":$data.profile.profile_image};
			SocialShare.share('band', obj);
		};
		
		//카카오스토리
		$scope.sharekakaostory = function($data) {
			var obj = {"title":"TeeShot 파트너조인, 채팅과 골프친구", "txt":"[티샷]에서 "+$data.me.username+"님을 만나 보세요","url":webServer+"/@"+$data.me.username, "img":$data.profile.profile_image};
			SocialShare.share('kakaostory', obj);
		};
		
		//네이버카페
		$scope.sharenavercafe = function($data) {
			var obj = {"title":"TeeShot 파트너조인, 채팅과 골프친구","contents":webServer+"/@"+$data.me.username, "img":$data.profile.profile_image};
			SocialShare.share('Navercafe', obj);
		};
		
		//페이스북
		$scope.sharefacebook = function($data) {
			var title	= "TeeShot 파트너조인, 채팅과 골프친구";
			var url		= webServer+"/@"+$data.me.username;
			var img		= $data.profile.profile_image;
			if(img.indexOf('http')) img = webServer + "/"+img;
			window.plugins.socialsharing.shareViaFacebook(title, img, url);
		};
		
		$ionicModal.fromTemplateUrl('templates/modal/mypage-profile-share.html', {
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
		
		
		//공유모달 관련 끝
		$scope.setGenderBirth = function(){
			var year		= $filter('date')($scope.userData.profile.BirthDate, "yyyy");
			var month		= $filter('date')($scope.userData.profile.BirthDate, "MM");
			var day			= $filter('date')($scope.userData.profile.BirthDate, "dd");
			
			$ionicLoading.show();
			$.ajax({
				type: "POST",
				//type: "GET",
				url: apiServer + 'user/profile?token=' + localStorage.getItem('authToken'),
				data: {gender:$scope.userData.profile.gender, year:year, month:month, day:day, chType:'updateGender'},
				success: function (response) {
					$ionicLoading.hide();
					var alertPopup = $ionicPopup.alert({
						title: '확인',
						template: '정보가 업데이트 되었습니다.'
						});
				}
			});
			$ionicLoading.hide();
		};
		
		// 파일업로드 모달 활성화
		$ionicModal.fromTemplateUrl('templates/modal/image-upload-menu.html', {
			scope: $scope,
			animation: 'fade-in-scale',
		}).then(function(modal) {
			$scope.modalImage = modal;
		});

		$scope.openImageSetModal = function(item) {
			$scope.modalImage.show();
		};
		$scope.closeImageSetModal = function() {
			$scope.modalImage.hide();
		};
	
		$scope.imageData = { "imageData" :  "Select Image" };

		//사진으로 찍을 경우
		$scope.takePicture = function() {
			$scope.modalImage.hide();

			var options = {
				quality: 75,
				//destinationType: Camera.DestinationType.FILE_URL,
				destinationType: Camera.DestinationType.DATA_URL,
				sourceType: Camera.PictureSourceType.CAMERA,
				allowEdit: true,
				encodingType: Camera.EncodingType.JPEG,
				//encodingType: Camera.EncodingType.PNG,
				targetWidth: 800,
				targetHeight: 800,
				popoverOptions: CameraPopoverOptions,
				correctOrientation: true,
				saveToPhotoAlbum: false
				//saveToPhotoAlbum: true
			};
		
			//사진으로 찍은 이후
			$cordovaCamera.getPicture(options).then(
				function(imageData) {
					//uploadPicture(apiServer+"pictures", "data:image/png;base64," + imageData);
					uploadPicture(apiServer+"pictures", "data:image/jpeg;base64," + imageData);
					//uploadPicture(apiServer+"pictures", "imageData);
				},
				null
			);

		};//사진으로 찍을 경우


		// 겔러리에서 이미지를 선택할 경우
		$scope.selectPicture = function() {
			$scope.modalImage.hide();
			var options = {
						quality: 75,
						destinationType: Camera.DestinationType.FILE_URL,
						//destinationType: Camera.DestinationType.DATA_URL,
						sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
						allowEdit: true,
						encodingType: Camera.EncodingType.PNG,
						targetWidth: 800,
						targetHeight: 800,
						popoverOptions: CameraPopoverOptions,
						correctOrientation: true,
						saveToPhotoAlbum: false
					};
	
			//이미지를 선택한 경우
			$cordovaCamera.getPicture(options)
				.then(function(imageData) {
					uploadPicture(apiServer+"pictures", imageData);
				},
				null
			);
		};

		//서버로 파일 업로드
		var uploadPicture = function(url, targetPath){
			//console.log("targetPath Start...");
			//console.log(targetPath);
			var filename = targetPath.substr(targetPath.lastIndexOf('/')+1);
			var options = {
					fileKey: "filedata",
					fileName: "image.jpg",
					//fileName: "image.png",
					//fileName: filename,
					chunkedMode: false,
					//mimeType: "image/png",
					mimeType: "image/jpeg",
					httpMethod:"POST",
					headers : { Connection:"close" }
				};
				$ionicLoading.show();
				$cordovaFileTransfer.upload(url+"?token="+localStorage.getItem('authToken'), targetPath, options).then(function(result) {
					var obj							= JSON.parse(result.response);
					//console.log("====result start.....");
					//console.log(result);
					$rootScope.userData.pictures	= obj.pictures;
					$scope.setData.scrollWidth = 110 * $rootScope.userData.pictures.length;
					Auth.update('profile.thumbnail_image', obj.profile.thumbnail_image);
					$ionicLoading.hide();
				}, function(err) {
					$ionicLoading.hide();
					//console.log("ERROR: " + JSON.stringify(err));
				}, function (progress) {
					//console.log("PROGRESS: " + JSON.stringify(progress));
				});
		};
		
		/**
		 * image treat (long press) 
		 */
		// 파일업로드 모달 활성화
		$ionicModal.fromTemplateUrl('templates/modal/image-manage-menu.html', {
			scope: $scope,
			animation: 'fade-in-scale',
		}).then(function(modal) {
			$scope.modalImageManage = modal;
		});
		
		$scope.imageManage = function(item, itemIndex){
			if (item == 'social') {
				$scope.item = {id:item};
			} else {
				$scope.item = item;
			}
			
			$scope.itemIndex	= itemIndex;
			$scope.modalImageManage.show();
		};

		//이미지 삭제
		$scope.deleteProfileImage = function(item, itemIndex){
			// console.log($rootScope.me.profile.thumbnail_image);
			$scope.modalImageManage.hide();

			if (item.id != 'social') {
				var mainImg = "http://s3-ap-northeast-1.amazonaws.com/teeshot-photo/images/"+ item.id +"/thumb/"+ item.image_file_name;

				if ($rootScope.me.profile.thumbnail_image === mainImg) {
					popup.alert('메인 프로필 삭제 불가','<div class="padding-top padding-bottom">다른 사진을 메인 프로필 사진으로<br />대체 하신후에 삭제하실 수 있습니다.</div>')
					return;
				}
			}

			var confirmPopup = popup.confirm('취소','선택한 이미지를 삭제하시겠습니까?');
			
			confirmPopup.then(function(res) {
				 if(res) {//실행
					$ionicLoading.show();
					// $http.post(apiServer + 'pictures/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'pictures/delete/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
								$rootScope.userData.pictures.splice(itemIndex, 1);
								$scope.setData.scrollWidth = 110 * $rootScope.userData.pictures.length;
							},function(error){
								$ionicLoading.hide();
							}
						).finally(function() {
							$ionicLoading.hide();
						}
					);
				}
			});
			
		};
		//메인으로 설정
		$scope.setProfileImage	= function(item){
			$scope.modalImageManage.hide();
			
			$ionicLoading.show();
			// $http.post(apiServer + 'pictures/update/'+item.id+'?token=' + localStorage.getItem('authToken'))
			$http({
				method: 'post',
				url: apiServer + 'pictures/update/'+item.id+'?token=' + localStorage.getItem('authToken'),
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
						//성공이후 프로파일 이미지 변경
						Auth.update('profile.thumbnail_image', response.data.name);
					},function(error){
						$ionicLoading.hide();
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
					
		};


		/**
		 * 골프장 불러오기
		 */
		$scope.set_clubs = function(){
			set_club();
		};//var setgolfclub = function(){
			
		var set_club	= function(sel){
			var t = $scope.setData.clubType;
			var r = $scope.setData.clubRegion;
			if (r != undefined && t != undefined)
			{
				$ionicLoading.show();
				$http.get(apiServer + 'clubs?club_type='+t+'&club_region='+r ,{})
					.then(function(response) {
						$scope.clubs = response.data.items;
						//if(sel) $scope.setData.clubName = sel;
						if(sel) $scope.clubs = sel;
						
						$ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			}
		};


		/**
		 * 자주가는 골프장 등록
		 */
		$scope.pupularList = function() {
			// console.log($scope.userData.mountList);
			socket.emit('putMount', {id: $rootScope.me.id, club_id: $scope.userData.mountList});
			var mdata = $scope.userData.mountList.split('|');
			// console.log(mdata);
			$rootScope.userData.clubs = 
				$rootScope.userData.clubs.concat(
					[{
						id: mdata[0],
						name: mdata[1]
					}]
				);

			$rootScope.userData.mountList = '';
		};

		/**
		 * 골프장 추가
		 * @param {Object} isValid
		 */
		$scope.submitAddGolfPlaceForm = function(){

				$ionicLoading.show();
				// $http.post(apiServer + 'club?token=' + localStorage.getItem('authToken'), {club_id: $scope.setData.clubName.id, club_name: +$scope.setData.clubName.name})
				$http({
					method: 'post',
					url: apiServer + 'club?token=' + localStorage.getItem('authToken'),
					data: {
						club_id: $scope.setData.clubName.id, 
						club_name: $scope.setData.clubName.name
					},
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				})
					.then(function(response) {
						$rootScope.userData.clubs	= response.data.items;
						$scope.setData.clubType = '';
						$scope.setData.clubRegion = '';
						$scope.setData.clubName = '';
						 $ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			//}
		};

		/**
		* 골프장 삭제하기 
 		* @param {Object} item
		*/
		$scope.remove_club = function(item, itemIndex) {
			var confirmPopup = $ionicPopup.confirm({
				title: '삭제알림',
				template: '삭제하시겠습니까?',
				okText: '확인',
				cancelText: '취소'
			});
			confirmPopup.then(function(res) {
				if(res) {//실행
					$ionicLoading.show();
					$http({
						method: 'post',
						url: apiServer + 'club/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
					.then(function(response) {
						$rootScope.userData.clubs.splice(itemIndex, 1);
						$ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					});
				}//if(res) {//실행
			});
		};
				
		

		
		
	})
	//타 유저 프로필 보기
	.controller('mypageVisitCtrl', function(
		$rootScope, 
		$scope, 
		$http, 
		$state, 
		$ionicModal, 
		$ionicLoading, 
		$ionicPopup, 
		$stateParams, 
		SocialShare, 
		$timeout,
		$window,
		socket
	) {

		var username	= $stateParams.Id;

		$scope.user = [];

		$scope.$on('$stateChangeStart', function() {
			if($scope.shareModal) $scope.shareModal.hide();
		});
		
		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if($scope.shareModal) $scope.shareModal.remove();
		});

		$scope.$on('$ionicView.enter', function() {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			visitinfo();
		});

		$scope.profile_image = {"width" : $window.innerWidth + 'px', "height" : $window.innerWidth + 'px', "max-width" : "450px", "max-height" : "450px"}
		
		//대화 내용 가져오기 방문자 명단에 내용 추가
		function visitinfo() {
			$ionicLoading.show();
			$http.get(apiServer + 'user/id/'+$stateParams.userId+'?token=' + localStorage.getItem('authToken'))
				.then(function(response) {

					if (window.cordova) {
		 				facebookConnectPlugin.logEvent("visit profile", {username: username});
		 			}

					$scope.user = response.data.profile;

					if ($scope.user) {
						if ($scope.user.visit_cnt < 1) {
							socket.emit('putVisitors', {userId: $stateParams.userId});
						}
					}

					if ($stateParams.state == 'new') {
						$rootScope.badgeCount.newVisit--;

						$scope.lcnt = JSON.parse(localStorage.getItem('count'));
						$scope.lcnt.newVisit--;
						localStorage.setItem('count', JSON.stringify($scope.lcnt));
					}
					
					$ionicLoading.hide();

					$scope.imgs = [];
					if ($scope.user) {
						angular.forEach($scope.user.pictures, function(value, key) {
							$scope.imgs.push('http://s3-ap-northeast-1.amazonaws.com/teeshot-photo/images/'+value.id+'/medium/'+value.image_file_name);
						});
					}

					// modal to show image full screen
					$ionicModal.fromTemplateUrl('templates/modal/image-modal.html', {
				    	scope: $scope,
				    	animation: 'fade-in-scale'
					}).then(function (modal) {
				    	$scope.modal = modal;
					});
					$scope.openModal = function () {
						$scope.showNav = true;
				    	$scope.modal.show();
					};

					$scope.closeModal = function () {
				    	$scope.modal.hide();
					};
					// show image in popup
					$scope.showImage = function (index) {
						$scope.imageIndex = index;
						$scope.imageSrc = $scope.imgs[index];
						$scope.openModal();
					};
					// image navigation // swiping and buttons will also work here
					$scope.imageNavigate = function(dir){
						if(dir == 'right'){
							$scope.imageIndex = $scope.imageIndex + 1;
						} else {
							$scope.imageIndex = $scope.imageIndex - 1;
						}
						//alert(dir);
						if($scope.imgs[$scope.imageIndex] === undefined){
							if ($scope.imgs.length == $scope.imageIndex) {
								$scope.imageIndex = $scope.imageIndex - $scope.imgs.length;
								$scope.imageSrc = $scope.imgs[$scope.imageIndex];
							} else {
								$scope.imageIndex = $scope.imgs.length - 1;
								$scope.imageSrc = $scope.imgs[$scope.imageIndex];
							}
							// $scope.closeModal();
						} else {
							$scope.imageSrc = $scope.imgs[$scope.imageIndex];
						}
					};
					// cleaning modal
					$scope.$on('$stateChangeStart', function(){
						$scope.modal.remove();
					});

				},function(error){
					console.log(error);
					$ionicLoading.hide();
				}
			);
		}
		


		
		//공유 모달 관련 시작
		// sharing plugin
		$scope.shareMain = function($data) {
			var title = "티샷에서 "+$data.user.username+"님을 만나 보세요";
			var url = webServer+"/@"+$data.user.username;
			var subject = $data.user.profile.bio;
			var img = $data.user.profile.profile_image;
			if(img.indexOf('http')) img = webServer + "/"+img;
			window.plugins.socialsharing.share(title, subject, img, url);
		};

		//카카오톡
		$scope.sharekakaotalk = function($data) {
			var obj = {"title":"티샷에서 "+$data.user.username+"님을 만나 보세요","url":webServer+"/@"+$data.user.username, "img":$data.user.profile.profile_image};
			SocialShare.share('kakaotalk', obj);
		};
		
		//네이버밴드
		$scope.sharenaverband = function($data) {
			var obj = {"title":"TeeShot 파트너조인, 채팅과 골프친구","url":webServer+"/@"+$data.user.username, "img":$data.user.profile.profile_image};
			SocialShare.share('band', obj);
		};
		
		//카카오스토리
		$scope.sharekakaostory = function($data) {
			var obj = {"title":"TeeShot 파트너조인, 채팅과 골프친구", "txt":"[티샷]에서 "+$data.user.username+"님을 만나 보세요","url":webServer+"/@"+$data.user.username, "img":$data.user.profile.profile_image};
			SocialShare.share('kakaostory', obj);
		};
		
		//네이버카페
		$scope.sharenavercafe = function($data) {
			var obj = {"title":"TeeShot 파트너조인, 채팅과 골프친구","contents":webServer+"/@"+$data.user.username, "img":$data.user.profile.profile_image};
			SocialShare.share('Navercafe', obj);
		};
		
		//페이스북
		$scope.sharefacebook = function($data) {
			var title	= "TeeShot 파트너조인, 채팅과 골프친구";
			var url		= webServer+"/@"+$data.user.username;
			var img		= $data.user.profile.profile_image;
			if(img.indexOf('http')) img = webServer + "/"+img;
			window.plugins.socialsharing.shareViaFacebook(title, img, url);
		};
		
		$ionicModal.fromTemplateUrl('templates/modal/mypage-profile-share.html', {
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
		
		//공유 모달 관련 끝

		
		/**
		 * 채팅하기 
		 */
		$scope.onItemMessage = function(user) {
			$state.go('app.messagecreate', {userId:user.user.id});
		};
		
		/**
		 * 친구신청하기 
		 */
		$scope.onItemMakeFriend = function(user) {
			$ionicLoading.show();
			// $http.post(apiServer + 'user/friendinvite/'+user.user.id+'?token=' + localStorage.getItem('authToken'))
			// $http.get(apiServer + 'user/friendinvite/'+user.user.id+'?token=' + localStorage.getItem('authToken'))
			$http({
				method: 'post',
				url: apiServer + 'user/friendinvite/'+user.user.id+'?token=' + localStorage.getItem('authToken'),
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
				.then(function(response) {
					if(response.data.success){
						var alertPopup = $ionicPopup.alert({
							title: '성공',
							template: '친구신청을 하였습니다.'
						});

						socket.emit('friendRequest', {userId: user.user.id});
					}else{
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: response.data.message
						});
					}
					
					$ionicLoading.hide();
				},function(error){
					console.log(error);
					$ionicLoading.hide();
				}
			);
		};
		
	})

	.controller('mypageBlockCtrl', function($rootScope, $scope, $http) {

		$scope.choice = 'A';//male선택
		
	})
	//골프정보수정
	.controller('mypageGolfinfoCtrl', function($rootScope, $scope, $http, $ionicLoading, $ionicPopup) {
		
		$scope.setData = {};
		
		/**
		 * 골프정보 입력 
		 */
		$scope.submitGolfInfo = function(isValid){
				$ionicLoading.show();
				
				$.ajax({
						type: "POST",
						//type: "GET",
						url: apiServer + 'user/profile?token=' + localStorage.getItem('authToken'),
						data: $("#golfInfoForm").serialize(),
						success: function (response) {
							$ionicLoading.hide();
							var alertPopup = $ionicPopup.alert({
								title: '확인',
								template: '정보가 업데이트 되었습니다.'
								});
						}
					});
					
				$ionicLoading.hide();
		};
		
		/**
		 *회원종류 및 지역을 선택하면 해당 골프장을 디스플레이 한다. 
		 */
		$scope.set_clubs = function(){
			set_club();
		};//var setgolfclub = function(){
			
		var set_club	= function(sel){
			var t = $scope.setData.clubType;
			var r = $scope.setData.clubRegion;
			if (r != undefined && t != undefined)
			{
				$ionicLoading.show();
				$http.get(apiServer + 'clubs?club_type='+t+'&club_region='+r ,{})
					.then(function(response) {
						$rootScope.clubs = response.data.items;
						//if(sel) $scope.setData.clubName = sel;
						if(sel) $scope.clubs = sel;
						
						$ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			}
		};
		
		/**
		 * 골프장 추가
		 * @param {Object} isValid
		 */
		$scope.submitAddGolfPlaceForm = function(isValid){
				$ionicLoading.show();
				// $http.post(apiServer + 'club?token=' + localStorage.getItem('authToken'), {club_id: $scope.setData.clubName.id, club_name: +$scope.setData.clubName.name})
				$http({
					method: 'post',
					url: apiServer + 'club?token=' + localStorage.getItem('authToken'),
					data: {
						club_id: $scope.setData.clubName.id, 
						club_name: $scope.setData.clubName.name
					},
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				})
					.then(function(response) {
						$rootScope.userData.clubs	= response.data.items;
						 $ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			//}
		};
		
		/**
		* 골프장 삭제하기 
 		* @param {Object} item
		*/
		$scope.remove_club = function(item, itemIndex){
			var confirmPopup = $ionicPopup.confirm({
				title: '삭제알림',
				template: '삭제하시겠습니까?'
			});
			confirmPopup.then(function(res) {
				if(res) {//실행
					$ionicLoading.show();
					// $http.post(apiServer + 'club/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'club/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
							$rootScope.userData.clubs.splice(itemIndex, 1);
							$ionicLoading.hide();
						},function(error){
							$ionicLoading.hide();
						}
					);
				}//if(res) {//실행
			});
		};
	})
	//내 소개 수정
	.controller('mypageMyinfoCtrl', function($rootScope, $scope, $http, $ionicLoading, $ionicPopup) {
		
		$scope.submitMyBio = function(isValid){
			$ionicLoading.show();
			$.ajax({
					type: "POST",
					url: apiServer + 'user/profile?token=' + localStorage.getItem('authToken'),
					data: $("#myBioForm").serialize(),
					success: function (response) {
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
							title: '확인',
							template: '정보가 업데이트 되었습니다.'
							});
					}
				});
				
			$ionicLoading.hide();
		};
		
	})

	.controller('mypageLocationCtrl', function($rootScope, $scope, $http, $ionicLoading, $ionicPopup, $cordovaGeolocation, $timeout, $cordovaGoogleMap, $ionicSideMenuDelegate) {
		$scope.$on('$ionicView.beforeEnter', function() {
			$scope.map = {};
			document.getElementById("side-menu").style.visibility = "hidden";
			$ionicSideMenuDelegate.toggleRight();
		});
		
		$scope.$on('$ionicView.beforeLeave', function() {
			document.getElementById("side-menu").style.visibility = "visible";
		});
		
		
		var latLng			= {};
		var options			= {timeout: 10000, enableHighAccuracy: true};
		var mapOptions		= {};
		var geocoder;
		var geo_location	= "";//위치정보 텍스트( 서울시 강남구)
		var _marker			= {};
		$scope.mymap		= {};
		var mapType = google.maps.MapTypeId.ROADMAP;
		var defaultZoome = 15;
		
		

		$cordovaGeolocation.getCurrentPosition(options).then(function(position){
			
			//
			if($rootScope.userData && $rootScope.userData.profile && $rootScope.userData.profile.latitude && $rootScope.userData.profile.longitude){
				latLng = new plugin.google.maps.LatLng($rootScope.userData.profile.latitude, $rootScope.userData.profile.longitude);//데이타 베이스에 저장된 내용을 받을 경우
			}				
			else latLng = new plugin.google.maps.LatLng(position.coords.latitude, position.coords.longitude);//현재 위치정보를 자동으로 받을 경우

			mapOptions = {
				 'backgroundColor': 'white',
				'mapType': mapType,
				'controls': {
					'compass': true,
					'myLocationButton': true,
					'indoorPicker': true,
					'zoom': true
				},
				'gestures': {
					'scroll': true,
					'tilt': true,
					'rotate': true,
					'zoom': true
				},
				'camera': {
					'latLng': latLng
					//,'tilt': 30
					,'zoom': defaultZoome
					//,'bearing': 50
				}
				
			};
			

			$scope.map = plugin.google.maps.Map.getMap(document.getElementById("map_canvas"), mapOptions);

			geocoder = new google.maps.Geocoder();

			$scope.map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
				placeMarker(latLng);
			});

			$scope.map.on(plugin.google.maps.event.MAP_CLICK, function(latLng) {
				placeMarker(latLng);
			});

		}, function(error){
			console.log("Could not get location");
		});
		
		//현재 마크(본인의 위치)를 변경
		function placeMarker(location) {
			$scope.map.clear();
			$scope.map.addMarker({
				'position': location,
				//'title': "Hello GoogleMap for Cordova!"
			}, function(marker) {
				
				_marker	= marker;
				//marker.showInfoWindow();
			
			});


			
		}

		/**
		 * 위치 검색 
		 */
		$scope.searchPostion = function(){


			plugin.google.maps.Geocoder.geocode({'address':$scope.mymap.address}, function(results) {
				if (results.length) {
					var result = results[0];
					var position = result.position; 
					
					$scope.map.addMarker({
						'position': position,
						//'title':  JSON.stringify(result.position)
					}, function(marker) {
						_marker = marker;
						$scope.map.animateCamera({
							'target': position,
							'zoom': defaultZoome
						}, function() {
							//marker.showInfoWindow();
						});
					
					});
				} else {
					alert("Not found");
				}
			});
		};


		/**
		 *현재 위치로 가기 
		 */
		$scope.searchCurrentPostion = function(){
			$scope.map.getMyLocation(function(location){

				 var mapOptions = {
						camera: {
							'latLng':location.latLng
							,'zoom': defaultZoome
						},
					};

			$scope.map = plugin.google.maps.Map.getMap(document.getElementById("map_canvas"), mapOptions);
			$scope.map.animateCamera({
				'target': location.latLng,
				//'tilt': 60,
				'zoom': defaultZoome,
				'duration': 1000 // 10 seconds
				});
			}, function(msg){
				console.log("faile");
			});
		};

		/**
		 * 현재 위치 저장
		 */
		$scope.setNewPostion = function(){
			_marker.getPosition(function(latLng) {
				plugin.google.maps.Geocoder.geocode({'position':latLng}, function(results) {
					if (results.length) {
						var result = results[0];
						var geo_location = result.adminArea+" "+result.locality;
						update_geo_info(latLng.lat, latLng.lng, geo_location);
					}else{
						alert('Not found');
					}
				});
				
			});
		};
		
		var update_geo_info = function(latitude, longitude, geo_location){
			$ionicLoading.show();
				$scope.map.setClickable(false);
				$.ajax({
					type: "POST",
					//type: "GET",
					url: apiServer + 'user/profile?token=' + localStorage.getItem('authToken'),
					data: {latitude:latitude,longitude:longitude,geo_location:geo_location, chType:"geo"},
					success: function (response) {
						$ionicLoading.hide();
						var alertPopup = $ionicPopup.alert({
							title: '확인',
							template: '정보가 업데이트 되었습니다.'
							});
							
						alertPopup.then(function(res) {
							$scope.map.setClickable(true);
						});
					}
				});
				
			$ionicLoading.hide();
		};
	})
	
	//닉내임(유저내임) 변
	.controller('mypageNicknameCtrl', function($rootScope, $scope, $http, $ionicLoading, $ionicPopup, Auth, $state) {
		$scope.setData = {};
		$scope.submitUsername = function(isValid){
			$ionicLoading.show();
				
			$.ajax({
					type: "POST",
					url: apiServer + 'user/username?token=' + localStorage.getItem('authToken'),
					data: $("#usernameForm").serialize(),
					success: function (response) {
						$ionicLoading.hide();
						if(response.success){
							var alertPopup = $ionicPopup.alert({
							title: '확인',
							template: '정보가 업데이트 되었습니다.'
							});
							Auth.update('username', $scope.setData.newUsername);
							$state.go('app.mypage.info');
						}else{
							var alertPopup = $ionicPopup.alert({
							title: '확인',
							template: response.message
							});
						}
					}
				});
				
			$ionicLoading.hide();
		};
		
	})

	.controller('mypagePasswordCtrl', function($rootScope, $scope, $http, $ionicLoading, $ionicPopup) {

		$scope.setData = {};

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
					
					// console.log(response);

					if(response.data.success){
						var alertPopup = $ionicPopup.alert({
						title: '확인',
						template: '정보가 업데이트 되었습니다.'
						});

						$scope.setData = {};
					}else{
						var alertPopup = $ionicPopup.alert({
						title: '확인',
						template: response.data.message
						});
					}
					
				},function(error){
					popup.alert('알림','비밀번호 수정중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
					$ionicLoading.hide();
				}).finally(function() {
					$ionicLoading.hide();
				});
		};
	})
	//이메일 변경
	.controller('mypageEmailCtrl', function($rootScope, $scope, $http, $ionicLoading, $ionicPopup) {
		$scope.setData = {};
		$scope.setData.emailSecretBox = false;
		
		$scope.set_domain = function(){
			$scope.setData.emailDomain = $scope.setData.sel_domain;
		};
		
		//인증키 생성
		$scope.submitEmailForm = function(isValid){
			$ionicLoading.show();
			var new_email = $scope.setData.emailId+"@"+$scope.setData.emailDomain;
			$.ajax({
				type: "POST",
				//type: "GET",
				url: apiServer + 'user/email?token=' + localStorage.getItem('authToken'),
				data: {new_email:new_email},
				success: function (response) {
					if(response.success){
						$scope.setData.emailSecretBox = true;
						var alertPopup = $ionicPopup.alert({
							title: '확인',
							template: response.email+' 로 인증메일이 전송되었습니다. </br> 확인 후 아래 이메일 인증번호에 기입해 주세요.'
						});
					}else{
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: response.message
						});
					}
					$ionicLoading.hide();
				}
			});
				
			$ionicLoading.hide();
		};
		
		//인증번호 입력 및 이메일 업데이트
		//$scope.emailSecret = function(){
		$scope.email_secretkey = function () {
			$ionicLoading.show();
			$.ajax({
				type: "POST",
				//type: "GET",
				url: apiServer + 'user/email2?token=' + localStorage.getItem('authToken'),
				data: {code:$scope.setData.emailSecret},
				success: function (response) {
					if(response.success){
						$scope.setData.emailSecretBox = false;
						var alertPopup = $ionicPopup.alert({
							title: '확인',
							template: '변경되었습니다.'
						});
						Auth.update('email', $scope.setData.emailId+"@"+$scope.setData.emailDomain);
					}else{
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: response.message
						});
					}
					$ionicLoading.hide();
				}
			});
				
			$ionicLoading.hide();
		};
		
	})
	//실명인증
	.controller('mypageRealNameCtrl', function(
		$rootScope, 
		$ionicHistory, 
		$scope, 
		$http, 
		$state, 
		$stateParams, 
		$ionicLoading, 
		$ionicPopup, 
		$ionicModal, 
		$filter, 
		Auth,
		toaster
	) {

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) $state.go('login');
		});
		
		$scope.$on('$ionicView.loaded', function() {
			//$scope.realnameForm.$invalid;
			//console.log($scope.realnameForm.$invalid);
		});

		$scope.setData	= {};
		$scope.realData	= {};
		//year select value
		var year = new Date().getFullYear();//97
		var range = [];
		//range.push(year);

		//range.push({key:"", value:'년도'});
		for(var i=18; i<87; i++) {
			var newyear = year - i;
			range.push({key:newyear, value:newyear});
		}

		$scope.setData.DropYears = range;
		
		
		// $scope.telecomAgree = [
		// 	{name: 'term1', text: '개인정보 수집/이용/취급 약관', openTerm: 'term1.html'},
		// 	{name: 'term2', text: '본인확인서비스 이용약관', openTerm: 'term2.html'},
		// 	{name: 'term3', text: '고유식별정보처리 약관', openTerm: 'term3.html'},
		// 	{name: 'term4', text: '통신사 이용약관', openTerm: ''}
		// ];
		// $scope.selectedAll = false;
		// $scope.checkAll = function () {
		// 	$scope.selectedAll = !$scope.selectedAll;
		// 	angular.forEach($scope.telecomAgree, function (item) {
		// 		item.Selected = $scope.selectedAll;
		// 	});

		// };

		// $ionicModal.fromTemplateUrl('templates/modal/mypage-cert-agreementA.html', {
		// 	id: '1',
		// 	scope: $scope,
		// 	animation: 'fade-in-scale'
		// }).then(function(modal) {
		// 	$scope.modalAgreementA = modal;
		// });

		// $ionicModal.fromTemplateUrl('templates/modal/mypage-cert-agreementB.html', {
		// 	id: '2',
		// 	scope: $scope,
		// 	animation: 'fade-in-scale'
		// }).then(function(modal) {
		// 	$scope.modalAgreementB = modal;
		// });

		// $ionicModal.fromTemplateUrl('templates/modal/mypage-cert-agreementC.html', {
		// 	id: '3',
		// 	scope: $scope,
		// 	animation: 'fade-in-scale'
		// }).then(function(modal) {
		// 	$scope.modalAgreementC = modal;
		// });

		// $ionicModal.fromTemplateUrl('templates/modal/mypage-cert-agreementD.html', {
		// 	id: '4',
		// 	scope: $scope,
		// 	animation: 'fade-in-scale'
		// }).then(function(modal) {
		// 	$scope.modalAgreementD = modal;
		// });

		// $scope.$on('$stateChangeStart', function() {
		// 	$scope.modalAgreementA.hide();
		// 	$scope.modalAgreementB.hide();
		// 	$scope.modalAgreementC.hide();
		// 	$scope.modalAgreementD.hide();
		// });

		// $scope.openAgreeModal = function(index) {
		// 	if (index == 1) $scope.modalAgreementA.show();
		// 	else if (index == 2) $scope.modalAgreementB.show();
		// 	else if (index == 3) $scope.modalAgreementC.show();
		// 	else $scope.modalAgreementD.show();
		// };
		// $scope.closeAgreeModal = function(index) {
		// 	if (index == 1) $scope.modalAgreementA.hide();
		// 	else if (index == 2) $scope.modalAgreementB.hide();
		// 	else if (index == 3) $scope.modalAgreementC.hide();
		// 	else $scope.modalAgreementD.hide();
		// };
		// //Cleanup the modal when we're done with it!
		// $scope.$on('$destroy', function() {
		// 	$scope.modalAgreementA.remove();
		// 	$scope.modalAgreementB.remove();
		// 	$scope.modalAgreementC.remove();
		// 	$scope.modalAgreementD.remove();
		// });
		
		//실명인증 이용약관 보기
		// $scope.openTerm	= function(url){
		// 	var myPopup = $ionicPopup.show({
		// 		title: '',
		// 		templateUrl: 'templates/term/'+url

		// 	});
		// };
		//실명인증서버로 전송(내부)
		$scope.realnameStart	= function(url){
			var birthDate = $scope.realData.birthday +'T000000Z';

			var name	= $scope.realData.realname;
			
			// var tel1	= $scope.realData.tel1;
			// var tel2	= $scope.realData.tel2;
			// var tel3	= $scope.realData.tel3;
			var sex		= $scope.realData.gender;
			var carrier	= $scope.realData.carrier;
			var dob		= $filter('date')(birthDate, "yyyyMMdd");
			var tel		= $scope.realData.tel;
			var gender	= (sex == 'male') ? 1 : 0;

			$ionicLoading.show();

			$http({
				method: 'post',
				url: apiServer + 'user/okname?token=' + localStorage.getItem('authToken'),
				data: {
					tel: tel, 
					dob: dob, 
					name: name, 
					gender: gender, 
					carrier: carrier
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			}).then(function(response) {

				// console.log(response);

				if (response.data.success) {
					if (response.data.code == 'B000') {
						$scope.realData.rid = response.data.rid;

						toaster.pop({
							type: '',
							title: '',
							body: '인증번호를 입력해주세요!',
							showCloseButton: true,
							clickHandler: function (toast, isCloseButton) {
								if(isCloseButton) return true;
								return true;
							} 
						});

						// var alertPopup = $ionicPopup.alert({
						// 	title: '인증번호 전송',
						// 	template: '인증번호를 입력해주세요.'
						// });
					} else {
						var alertPopup = $ionicPopup.alert({
							title: '인증오류',
							template: '인증코드에 오류가 발생하였습니다.'
						});
					}
				} else {
					var alertPopup = $ionicPopup.alert({
						title: '인증실패',
						template: response.data.message
					});
				}

			}, function(error){
				var alertPopup = $ionicPopup.alert({
					title: '에러',
					template: error.statusText
				});
				$ionicLoading.hide();
			}).finally(function() {
				// console.log('okname');
				$ionicLoading.hide();
			});	

			// $.ajax({
			// 	type: 'GET',
			// 	//url: "http://dev.teeshot.co.kr/register/okname",
			// 	url: apiServer + 'user/okname?token=' + localStorage.getItem('authToken'),
			// 	data: { tel: tel, dob: dob, name: name, gender: gender, carrier: carrier},
			// 	success: function(data) {
			// 		if (data.success ) { 
			// 			if (data.code == 'B000'){
			// 				$scope.realData.rid = data.rid;
			// 				var alertPopup = $ionicPopup.alert({
			// 					title: '인증번호 전송',
			// 					template: '인증번호를 전송하였습니다. 인증번호 확인 절차를 진행해 주세요.'
			// 				});
			// 			}
			// 			$ionicLoading.hide();
			// 		} else {
			// 			var alertPopup = $ionicPopup.alert({
			// 				title: '인증실패',
			// 				template: data.message
			// 			});
			// 		}

			// 	}
			// });
			// $ionicLoading.hide();
		
		};
		
		//서버로 결과 전송
		$scope.realnameSubmit = function(){

			var birthDate = $scope.realData.birthday +'T000000Z';
			
			var rid		= $scope.realData.rid;
			// var tel1	= $scope.realData.tel1;
			// var tel2	= $scope.realData.tel2;
			// var tel3	= $scope.realData.tel3;
			var tel 	= $scope.realData.tel;
			var secret	= $filter('Zeros')($scope.realData.secretRealname,6);
			
			//서버 저장 변수
			var realname	= $scope.realData.realname;
			var year		= $filter('date')(birthDate, "yyyy");
			var month		= $filter('date')(birthDate, "MM");
			var day			= $filter('date')(birthDate, "dd");
			var gender		= $scope.realData.gender;

			$ionicLoading.show();

			$http({
				method: 'post',
				url: apiServer + 'user/oksms?token=' + localStorage.getItem('authToken'),
				data: {
					rid: rid, 
					tel: tel, 
					secret: secret
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			}).then(function(response) {

				// console.log(response);

				if (response.data.success) {
					if (response.data.code == 'B000') {

						$http({
							method: 'post',
							url: apiServer + 'user/profile?token=' + localStorage.getItem('authToken'),
							data: {
								chType:'realnameNew', 
								realname:realname, 
								year:year, 
								month:month, 
								day:day, 
								gender:gender, 
								tel: tel
							},
							headers: {
								'Content-Type' : 'application/json; charset=utf-8'
							}
						}).then(function(response) {

							// console.log(response);

							if (response.data.success) {
								Auth.update('profile.realname', realname);
								Auth.update('profile.dob', year+'-'+month+'-'+day);
								Auth.update('profile.gender', gender);
								Auth.update('profile.phone', tel);
								
								//console.log(data);
								if(response.data.me.realnamecount > 1){
									//동일 실명인증이 있을 경우 계정통합 페이지로 이동시킨다.
									var alertPopup = $ionicPopup.alert({
										title: '인증성공',
										template: '동일실명인증이 존재합니다.</br>계정 통합을 진행해 주세요.'
									});
									$state.go('app.mypage.account');
								}else{
									//동일 실명인증이 없을 경우
									var alertPopup = $ionicPopup.alert({
										title: '인증성공',
										template: '정상적으로 인증되었습니다.'
									});
									$state.go('app.mypage.info');
								}
							} else {
								var alertPopup = $ionicPopup.alert({
									title: '인증실패',
									template: '시스템에서 에러가 발생하였습니다.이미 등록된 핸드폰 번호인지를 확인해 주세요.'
								});
							}

						}, function(error){
							$ionicLoading.hide();

							var alertPopup = $ionicPopup.alert({
								title: '에러',
								template: error.statusText
							});
						}).finally(function() {
							$ionicLoading.hide();
						});
						

/*						
						$.ajax({
							type: 'POST',
							url: apiServer + 'user/profile?token=' + localStorage.getItem('authToken'),
							data: { 
								chType:'realname', 
								realname:realname, 
								year:year, 
								month:month, 
								day:day, 
								gender:gender, 
								tel: tel
							},
							success: function(data) {
								if (data.success) {
									Auth.update('profile.realname', realname);
									Auth.update('profile.dob', year+'-'+month+'-'+day);
									Auth.update('profile.gender', gender);
									Auth.update('profile.phone', tel);
									
									//console.log(data);
									if(data.me.realnamecount > 1){
										//동일 실명인증이 있을 경우 계정통합 페이지로 이동시킨다.
										var alertPopup = $ionicPopup.alert({
											title: '인증성공',
											template: '동일실명인증이 존재합니다.</br>계정 통합을 진행해 주세요.'
										});
										$state.go('app.mypage.account');
									}else{
										//동일 실명인증이 없을 경우
										var alertPopup = $ionicPopup.alert({
											title: '인증성공',
											template: '정상적으로 인증되었습니다.'
										});
										$state.go('app.mypage.info');
									}
								} else {
									var alertPopup = $ionicPopup.alert({
										title: '인증실패',
										template: '시스템에서 에러가 발생하였습니다.이미 등록된 핸드폰 번호인지를 확인해 주세요.'
									});
								}
							}
						});
*/
					} else {

						var alertPopup = $ionicPopup.alert({
							title: '인증오류',
							template: '인증코드에 오류가 발생하였습니다.'
						});
						$ionicLoading.hide();
					}

				} else {
					var alertPopup = $ionicPopup.alert({
						title: '인증실패',
						template: '인증번호가 맞지 않습니다.'
					});

					alertPopup.then(function(res) {
						$scope.realData.secretRealname = '';
					});
					
					$ionicLoading.hide();
				}

			}, function(error){
				$ionicLoading.hide();

				var alertPopup = $ionicPopup.alert({
					title: '에러',
					template: error.statusText
				});
			}).finally(function() {
				$ionicLoading.hide();
			});

/*
			$.ajax({
				type: 'POST',
				url: apiServer + 'user/oksms?token=' + localStorage.getItem('authToken'),
				data: { rid: rid, tel: tel, secret: secret},
				success: function(data) {
					if (data.success) {
						if (data.code == 'B000') {
							$.ajax({
								type: 'POST',
								url: apiServer + 'user/profile?token=' + localStorage.getItem('authToken'),
								data: { chType:'realname', realname:realname, year:year, month:month, day:day, gender:gender, tel1:tel1, tel2:tel2, tel3:tel3},
								success: function(data) {
									if (data.success) {
										Auth.update('profile.realname', realname);
										Auth.update('profile.dob', year+'-'+month+'-'+day);
										Auth.update('profile.gender', gender);
										Auth.update('profile.phone', tel1+''+tel2+''+tel3);
										
										//console.log(data);
										if(data.me.realnamecount > 1){
											//동일 실명인증이 있을 경우 계정통합 페이지로 이동시킨다.
											var alertPopup = $ionicPopup.alert({
												title: '인증성공',
												template: '동일실명인증이 존재합니다.</br>계정 통합을 진행해 주세요.'
											});
											$state.go('app.mypage.account');
										}else{
											//동일 실명인증이 없을 경우
											var alertPopup = $ionicPopup.alert({
												title: '인증성공',
												template: '정상적으로 인증되었습니다.'
											});
											$state.go('app.mypage.info');
										}
									} else {
										var alertPopup = $ionicPopup.alert({
											title: '인증실패',
											template: '시스템에서 에러가 발생하였습니다.이미 등록된 핸드폰 번호인지를 확인해 주세요.'
										});
									}
								}
							});
						}//if (data.code == 'B000') {
					} else {
						var alertPopup = $ionicPopup.alert({
							title: '인증실패',
							template: '인증번호가 맞지 않습니다.'
						});
					}
				}
			});
			$ionicLoading.hide();
*/			
			
		};

	})
	//휴대폰 변경
	.controller('mypagePhoneCtrl', function($rootScope, $scope, $http, $ionicLoading, $ionicPopup, $state, Auth) {
		
		$scope.setData = {};
		$scope.setData.mobileSecretBox = false;
		
		$scope.set_domain = function(){
			$scope.setData.emailDomain = $scope.setData.sel_domain;
		};
		
		
		var secretKey = "";
		//인증키 생성
		$scope.submitMobileForm = function(isValid){
			$ionicLoading.show();
			if($scope.setData.newphone){
				
				
				$.ajax({
					type: "POST",
					//type: "GET",
					url: apiServer + 'user/phonesecret?token=' + localStorage.getItem('authToken'),
					data: {new_phone:$scope.setData.newphone},
					success: function (response) {
						if(response.success){
							$scope.setData.mobileSecretBox	= true;
							secretKey						= response.secret;
							
							var alertPopup = $ionicPopup.alert({
								title: '확인',
								template: ' 인증번호가 고객님의 폰으로 전송되었습니다.'
							});
						}else{
							var alertPopup = $ionicPopup.alert({
								title: '알림',
								template: response.message
							});
						}
						$ionicLoading.hide();
						
						
					}
				});
					
				$ionicLoading.hide();
			}
		};
		
		//인증번호 입력 및 모바일폰 업데이트
		//$scope.emailSecret = function(){
		$scope.mobile_secretkey = function () {
			
			if(secretKey != $scope.setData.mobileSecret){
				var alertPopup = $ionicPopup.alert({
					title: '알림',
					template: '인증번호가 일치하지 않습니다.'
				});
			}else{
				$ionicLoading.show();
				$.ajax({
					type: "POST",
					//type: "GET",
					url: apiServer + 'user/phone?token=' + localStorage.getItem('authToken'),
					data: {secret:$scope.setData.mobileSecret, new_phone:$scope.setData.newphone},
					success: function (response) {
						if(response.success){
							$scope.setData.emailSecretBox = false;
							var alertPopup = $ionicPopup.alert({
								title: '확인',
								template: '변경되었습니다.'
							});
							$state.go('app.mypage.info');
						}else{
							var alertPopup = $ionicPopup.alert({
								title: '알림',
								template: response.message
							});
						}
						$ionicLoading.hide();
					}
				});
					
				$ionicLoading.hide();
			}

		};

	})

	.controller('mypageDropCtrl', function($rootScope, $scope, $state, $http, $ionicLoading, $ionicPopup, Auth) {
		

		//사용자의 현재 패스워드 받아오기(패스워드 출력 유무 체크용)
		$scope.setData = {};
		
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}
			ispassword();
		});
		
		var ispassword = function(){
			$ionicLoading.show();
			$http.get(apiServer + 'user/ispassword?token=' + localStorage.getItem('authToken'))
			.then(function(response) {
				if(response.data.success) $scope.setData.hasPassword = true;
				else $scope.setData.hasPassword = false;
			},function(error){
				// $ionicLoading.hide();
			}
			).finally(function() {
				$ionicLoading.hide();
			}
			);
		};
		//ispassword
		
		
		$scope.setData = {};
		$scope.submitDropForm = function () {
			$ionicLoading.show();
			$.ajax({
				type: "POST",
				//type: "GET",
				url: apiServer + 'user/quit?token=' + localStorage.getItem('authToken'),
				data: {password:$scope.setData.password, reason:$scope.setData.reason},
				success: function (response) {
					if(response.success){
						var alertPopup = $ionicPopup.alert({
							title: '확인',
							template: '정상적으로 탈퇴처리 되었습니다.'
						});
						Auth.logout();
						$state.go('login');
						
					}else{
						var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: response.message
						});
					}
					$ionicLoading.hide();
				}
			});
				
			$ionicLoading.hide();
		};
	})

	//활동정보
	.controller('mypageActiveCtrl', function($rootScope, $scope, $state, $http, $ionicLoading, $ionicPopup, $ionicPopover, $ionicModal, $filter, SocialShare, Auth) {
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()){
				$state.go('login');
			}else{
				loadList();
			}
		});
		
		var loadList = function(){
			$ionicLoading.show();
			$http.get(apiServer + 'users/activities/?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					// console.log(response);
					 $scope.data = response.data;
					},function(error){
						console.log(error);
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
		};
		
			
		
//공유 모달 관련 시작
		// sharing plugin
		var shareImage = "http://localhost/images/main/sns_1st.png";
		$scope.shareMain = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time) +'('+$data.golf_partner_str+')';
			var title = "'파트너 조인'하실 분 초대합니다.";
			var url = webServer + "/fields/"+$data.id;
			var subject = txt;
			var img = shareImage;
			if(img.indexOf('http')) img = webServer + "/"+img;
			window.plugins.socialsharing.share(title, subject, img, url);
		};

		//카카오톡//	f_golfdate //필터 - 일자
		$scope.sharekakaotalk = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.\r\n["+txt+"]","url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('kakaotalk', obj);
		};
		
		//네이버밴드
		$scope.sharenaverband = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.["+txt+"]","url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('band', obj);
		};
		
		
		//카카오스토리
		$scope.sharekakaostory = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.", "txt":txt,"url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('kakaostory', obj);
		};
		
		//네이버카페
		$scope.sharenavercafe = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.","contents":webServer + "/fields/"+$data.id+"["+txt+"]", "img":shareImage};
			SocialShare.share('Navercafe', obj);
		};
		
		//페이스북
		$scope.sharefacebook = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time) +'('+$data.golf_partner_str+')';
			var title	= "'파트너 조인'하실 분 초대합니다.["+txt+"]";
			var url		= webServer + "/fields/"+$data.id;
			var img		= shareImage;
			if(img.indexOf('http')) img = webServer + "/"+img;
			window.plugins.socialsharing.shareViaFacebook(title, img, url);
		};
		
		$ionicModal.fromTemplateUrl('templates/modal/mypage-profile-share.html', {
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
		//공유 모달 관련 끝

		
		//신청자 정보
		$scope.req_partner = function($data) {
			$state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
		};
		
		//모달 메뉴 관련 시작
		$ionicModal.fromTemplateUrl('templates/modal/golf-list-menu.html', {
			id: '1',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modalMenu = modal;
		});


		$scope.openModal = function(index,item) {
			$scope.shareItem = item;
			if (index == 1) $scope.modalMenu.show();
			else $scope.shareModal.show();
		};

		
		$scope.closeModal = function(index,item) {
			if (index == 1) $scope.modalMenu.hide();
			else $scope.shareModal.hide();
		};
		
		//등록 수정하기
		$scope.onItemModify = function(item){
			$state.go("app.golfjoin.modify", {postId:item.id}); 
			$scope.modalMenu.hide();
		};
		//등록 취소하기
		$scope.onItemCancel	= function(item){
			$scope.modalMenu.hide();
			
			var confirmPopup = $ionicPopup.confirm({
				title: '취소',
				template: '종료를 하시면 초청리스트에서 내려가게 됩니다</br>종료를 하시겠습니까?'
			});
			
			confirmPopup.then(function(res) {
				 if(res) {//실행
					$ionicLoading.show();
					$http.get(apiServer + 'fields/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
						.then(function(response) {
								loadGolfList();
								
							},function(error){
								$ionicLoading.hide();
							}
						).finally(function() {
							$ionicLoading.hide();
							$scope.modalMenu.hide();
						}
					);
				}
			});

		};
		
	})

	.controller('mypageAccountCtrl', function(
		$rootScope, 
		$scope, 
		$state, 
		$http,
		$ionicLoading,
		$ionicPopup,
		Auth
	) {
		
		$scope.setData = {};
		
		$scope.setData.setEmail			= false;
		$scope.setData.inputEmail		= false;
		$scope.setData.inputPassword	= false;
		$scope.setData.submit			= true;
		
		var email = 'pondol-_if.79@naver.com';  
		var regex=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
	
				
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()){
				$state.go('login');
			}else{
				loadList();
			}
		});
		
		var loadList = function(){
			$ionicLoading.show();
			$http.get(apiServer + 'users/account?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					//console.log(response);
						$scope.setData.accounts = response.data.accounts;
					},function(error){
						console.log(error);
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
		};
		
		//대표 계정선택시 추가입력 정보 필드 디스플레이
		$scope.setData.choice	= function(item){
			$scope.setData.setEmail			= false;
			$scope.setData.inputEmail		= false;
			$scope.setData.inputPassword	= false;
			$scope.setData.setEmailVal		= "";
			
			//if(regex.test(email) === false && regex.test($("#newEmail").val()) === false) {//잘못된 형식일경우 이메일을 추가로 입력한다.
			if(regex.test(item.email) === false) {//잘못된 형식일경우 이메일을 추가로 입력한다.
				$scope.setData.inputEmail	= true;
			}else{
				$scope.setData.setEmail			= true;
				$scope.setData.setEmailVal		= item.email;
				//console.log(item.eamil);
			}
			if(item.password.length < 10){
				$scope.setData.inputPassword	= true;
			}
			//console.log($scope.setData.inputEmail);

		};
		
		
		$scope.submitmergeAccountForm	= function(form){

			$ionicLoading.show();
			
			var newpassword = $scope.setData.inputPassword  ? $scope.setData.inputPasswordText:"";
			var newEmail 	= $scope.setData.inputEmail  ? $scope.setData.inputEmailText:"";
			var str = $scope.setData.Mchoice+"?newpassword="+newpassword+"&newEmail="+newEmail; 

			$ionicLoading.hide();

			$http.get(apiServer + 'users/account/'+str+'&token=' + localStorage.getItem('authToken'))
				.then(function(response) {
						// console.log(response);
						if(response.data.success){
							$state.go('app.mypage.info');
						}else{
							var alertPopup = $ionicPopup.alert({
							title: '알림',
							template: response.data.message
							});
						}
					},function(error){
						console.log(error);
					}
				).finally(function() {
					$ionicLoading.hide();
				}
			);
		};
		/*
		if(confirm("메인아이디를 설정하시겠습니까?")){
					//console.log("/users/account/"+main_id+"?newpassword="+$("#newPassword").val()+"&newEmail="+$("#newEmail").val()); 
					$.ajax({
						type: 'GET',
						url: "/users/account/"+main_id+"?newpassword="+$("#newPassword").val()+"&newEmail="+$("#newEmail").val(),
						success: function(data) {
							console.log(data);
							if (data.success) {
								
								location.reload();
							} else {
								alert(data.message);
							}
						}
					});
		
					//location.href="/users/account/"+main_id+"?newpassword="+$("#newPassword").val()+"&newEmail="+$("#newEmail").val();
				}
				
				*/
				
		
		
		
		
	})

	.controller('mypageAgreementCtrl', function(
		$rootScope, 
		$scope, 
		$state, 
		$http,
		$ionicModal
	) {

		$scope.telecomAgree = [
			{name: 'term1', text: '개인정보 수집/이용/취급 약관'},
			{name: 'term2', text: '본인확인서비스 이용약관'},
			{name: 'term3', text: '고유식별정보처리 약관'},
			{name: 'term4', text: '통신사 이용약관'}
		];

		$ionicModal.fromTemplateUrl('templates/modal/mypage-cert-agreementA.html', {
			id: '1',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modalAgreementA = modal;
		});

		$ionicModal.fromTemplateUrl('templates/modal/mypage-cert-agreementB.html', {
			id: '2',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modalAgreementB = modal;
		});

		$ionicModal.fromTemplateUrl('templates/modal/mypage-cert-agreementC.html', {
			id: '3',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modalAgreementC = modal;
		});

		$ionicModal.fromTemplateUrl('templates/modal/mypage-cert-agreementD.html', {
			id: '4',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modalAgreementD = modal;
		});

		$scope.$on('$stateChangeStart', function() {
			$scope.modalAgreementA.hide();
			$scope.modalAgreementB.hide();
			$scope.modalAgreementC.hide();
			$scope.modalAgreementD.hide();
		});

		$scope.openAgreeModal = function(index) {
			if (index == 1) $scope.modalAgreementA.show();
			else if (index == 2) $scope.modalAgreementB.show();
			else if (index == 3) $scope.modalAgreementC.show();
			else $scope.modalAgreementD.show();
		};
		$scope.closeAgreeModal = function(index) {
			if (index == 1) $scope.modalAgreementA.hide();
			else if (index == 2) $scope.modalAgreementB.hide();
			else if (index == 3) $scope.modalAgreementC.hide();
			else $scope.modalAgreementD.hide();
		};
		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.modalAgreementA.remove();
			$scope.modalAgreementB.remove();
			$scope.modalAgreementC.remove();
			$scope.modalAgreementD.remove();
		});
		
		//실명인증 이용약관 보기
		// $scope.openTerm	= function(url){
		// 	var myPopup = $ionicPopup.show({
		// 		title: '',
		// 		templateUrl: 'templates/term/'+url

		// 	});
		// };

	})

	.controller('mypageNewCtrl', function(
		$rootScope, 
		$state, 
		$scope, 
		$http, 
		$ionicModal, 
		$ionicLoading
		, $ionicPopup
		, $cordovaCamera //카메라 혹은 겔러리 활성
		, $cordovaFileTransfer//for file upload
		, Auth
		, SocialShare
		, $q, $http, $cordovaOauthUtility//for test
		, $ionicSideMenuDelegate
		, $filter
		, PushToken
		, popup
		, MypageService
		, $ionicHistory
		, $stateParams
		, $timeout
	) {

		$scope.$on('$ionicView.beforeEnter', function() {

			if ($scope.Params && $scope.Params.type == 'autoLogin') {
			} else {
				if(!Auth.isLoggedIn()){
					$state.go('login');
					return false;
				}
			}

			if ($scope.Params && $scope.Params.type == 'firstVisit') {
				if (!$rootScope.me.profile.phone) {
					$scope.certificationOpen();
				}
				$scope.Params = {};
			}

			$scope.myMember = {};

			MypageService.getCount({}, function(obj) {
				$scope.myMember.join = obj.join;
				$scope.myMember.joinRsvp = obj.joinRsvp;
				$scope.myMember.premium = obj.premium;
				$scope.myMember.premiumRsvp = obj.premiumRsvp;
			});

			if ($rootScope.me.payments) {
				
				if ($rootScope.me.normal_expired_at) {
					$scope.myMember.division = '일반 이용권';
					$scope.myMember.expire = $rootScope.me.normal_expired_at;

					$scope.myMember.endDate = $filter('f_formatdate')($rootScope.me.normal_expired_at, 'Y.m.d');
					$scope.myMember.day = $filter('BetweenDay')($rootScope.me.normal_expired_at, 'day');
				}
				if ($rootScope.me.expired_at) {
					$scope.myMember.division = '프리미엄 이용권';
					$scope.myMember.expire = $rootScope.me.expired_at;

					$scope.myMember.endDate = $filter('f_formatdate')($rootScope.me.expired_at, 'Y.m.d');
					$scope.myMember.day = $filter('BetweenDay')($rootScope.me.expired_at, 'day');
				}

				if ($scope.myMember.day >= 0) {
					$scope.myMember.class = '유료회원';
				} else {
					$scope.myMember.class = '무료회원';
					$scope.myMember.division = '';
				}
			} else {
				$scope.myMember.class = '무료회원';
			}

		});

	})

;