angular.module('starter.controllers')

	.controller('golfjoinCtrl', function() {//메인 메뉴 컨트롤
	})

	.controller('golflistsCtrl', function(
		$rootScope,
		$scope, 
		$state, 
		$interval, 
		$ionicPopover, 
		$ionicPopup, 
		$ionicModal, 
		$http,
		$ionicLoading,
		$ionicPlatform,
		$filter,
		$ionicScrollDelegate,
		Auth,
		SocialShare,
		InviteService,
		InAppBrowser,
		toaster,
		popup
	) {


		// $scope.lists = [];
		var current_page = 1;

		var offset = 0;
		
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}
			// current_page = 1;
			// loadGolfList();

			if (offset) var limit = offset + 20;
			else var limit = 20;

			InviteService.getList({limit:limit,offset:0}, $scope.loadList);
		});

		$scope.loadList = function(obj) {
			$scope.lists = obj;
			$scope.hasMoreData = false;
		}

		$scope.loadLists = function() {
			$scope.hasMoreData = true;
			offset = 0;
			InviteService.getList({limit:20,offset:offset}, $scope.loadList);
		}

		// 스크롤 내릴시 리스트 추가
		$scope.loadMores = function() {
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				InviteService.getList({limit:20,offset:offset}, $scope.loadListScroll);
			} else {
				$scope.hasMoreData = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		$scope.loadListScroll = function(obj) {
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
			// $scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			$scope.loadLists();	
			$scope.$broadcast('scroll.refreshComplete');
		};
		
		
		
		function loadGolfList() {
			$ionicLoading.show();
			current_page = 1;
			//console.log(apiServer + 'fields/?token=' + localStorage.getItem('authToken'));
			$http.get(apiServer + 'fields/?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					// console.log(response);
					 $scope.lists = response.data;
					 
					},function(error){
						$ionicLoading.hide();
						// console.log(error);
					}
				).finally(function() {
					$ionicLoading.hide();
					current_page = 1;
				}
			);
		}
		

		// 스크롤 내릴시 리스트 추가
		$scope.loadMore = function() {
			current_page = current_page +1;
			// $ionicLoading.show();
			$http.get(apiServer + 'fields/?token=' + localStorage.getItem('authToken')+'&page='+current_page)
				.then(function(response) {
					$scope.lists.fields = $scope.lists.fields.concat(response.data.fields);
					//$scope.$broadcast('scroll.infiniteScrollComplete');
					},function(error){
						// $ionicLoading.hide();
					}
				).finally(function() {
					$scope.$broadcast('scroll.infiniteScrollComplete');
					// $ionicLoading.hide();
				}
			);
		};

		//공유 모달 관련 시작
		// sharing plugin
		var shareImage = "http://localhost/images/main/sns_1st.png";
		$scope.shareMain = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var title = "'파트너 조인'하실 분 초대합니다.";
			var url = webServer + "/fields/"+$data.id;
			var subject = txt;
			var img = shareImage;
			if(img.indexOf('http')) img = webServer + "/"+img;
			//console.log(title, url, subject, img);
			window.plugins.socialsharing.share(title, subject, img, url);
		};

		//카카오톡//	f_golfdate //필터 - 일자
		$scope.sharekakaotalk = function($data) {
			//console.log($data);
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.\r\n["+txt+"]","url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('kakaotalk', obj);
		};
		
		//네이버밴드
		$scope.sharenaverband = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.["+txt+"]","url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('band', obj);
		};
		
		
		//카카오스토리
		$scope.sharekakaostory = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.", "txt":txt,"url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('kakaostory', obj);
		};
		
		//네이버카페
		$scope.sharenavercafe = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.","contents":webServer + "/fields/"+$data.id+"["+txt+"]", "img":shareImage};
			SocialShare.share('Navercafe', obj);
		};
		
		//페이스북
		$scope.sharefacebook = function($data) {
			var txt = $data.golf_club_name+' - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +'('+$data.golf_partner_str+')';
			var title	= "'파트너 조인'하실 분 초대합니다.["+txt+"]";
			var url		= webServer + "/fields/"+$data.id;
			// var img		= shareImage;
			var img		= $data.profile.thumbnail_image;
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

		$scope.partner_ask = function($data) {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			InviteService.putPartner($data, $scope.req_partner);
		}

		//공유 모달 관련 끝
		$scope.req_partner = function(flag, $data) {

			if(!$rootScope.me.profile.phone){
				$scope.phoneCertCheck();	
				return;
			} //return false;//본인이 등록한 것은 등록할 수 없습니다.

			if (flag) {
				$state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
				return;
			}

			//본인이 등록한 것은 상세리스트로 이동
			if($data.poster_id == $rootScope.me.id){
				$state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
				return;
			} //return false;//본인이 등록한 것은 등록할 수 없습니다.
			
			//본인이 신청한 것은 상세리스트로 이동
			// var flag = true;
			// angular.forEach($data.rsvps, function(value, key) {
			// 	if(value.poster_id == $rootScope.me.id){
			// 		$state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
			// 		flag = false;
			// 		return;
			// 	}
			// });
			// if(flag == false) return;

			
			//console.log($data.status_flag);
			// if($data.status_flag != 'I'){//진행중이 아니면
			var today = new Date();
			var golf_time = new Date($data.golf_time);
			var interval = golf_time - today;

			if ($data.deleted_at != null || interval < 0) {
				var alertPopup = $ionicPopup.alert({
					title: '알림',
					template: '완료된 초청입니다.',
					okText: '확인'
				});
				return;
			} //return false;//본인이 등록한 것은 등록할 수 없습니다.
			
			//조인신청하기
			var confirmPopup = $ionicPopup.confirm({
				title: '신청하기',
				template: '조인 신청하시겠습니까?',
				okText: '예',
				cancelText: '아니요'
			});

			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					// $http.post(apiServer + 'fields/rsvp/store?token=' + localStorage.getItem('authToken'), {poster:$rootScope.me.username, poster_id:$rootScope.me.id, field_id:$data.id})
					//$http.get(apiServer + 'fields/rsvp/store?token=' + localStorage.getItem('authToken')+'&poster='+$rootScope.me.username+'&poster_id='+$rootScope.me.id+'&field_id='+$data.id)
					$http({
						method: 'post',
						url: apiServer + 'fields/rsvp/store?token=' + localStorage.getItem('authToken'),
						data: {
							poster: $rootScope.me.username, 
							poster_id: $rootScope.me.id, 
							field_id: $data.id
						},
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
								//console.log(response);
								var obj	= response.data;
								if(obj.success == false){
									if(obj.result_code ==  2){
										$state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
										return;
									}else{
										var alertPopup = $ionicPopup.alert({
											title: '신청실패',
											template: obj.message
										});
									}
									
								}else{
									
									// var alertPopup = $ionicPopup.alert({
									// 	title: '신청성공',
									// 	template: '신청성공하였습니다.'
									// });
									$state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
									//$state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
								}
								
							},function(error){
								$ionicLoading.hide();
							}
						).finally(function() {
							$ionicLoading.hide();
						}
					);
			
				} else {
					//console.log('You are not sure');
				}
			});
		};
		
		//리스트메뉴(수정/샥제, 그린피 등)
		$ionicModal.fromTemplateUrl('templates/modal/golf-list-menu.html', {
			id: '1',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modalMenu = modal;
		});
		//공유하기
		$ionicModal.fromTemplateUrl('templates/modal/golf-list-share.html', {
			id: '2',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.shareModal = modal;
		});

		$scope.$on('$stateChangeStart', function() {
			if($scope.modalMenu) $scope.modalMenu.hide();
			if($scope.shareModal) $scope.shareModal.hide();
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

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.modalMenu.remove();
			$scope.shareModal.remove();
		});
		// Execute action on hide modal
		$scope.$on('modal.hidden', function() {
			// Execute action
		});
		// Execute action on remove modal
		$scope.$on('modal.removed', function() {
			// Execute action
		});		

		var message = [
			'조인 하실분 찾으세요?', '인원이 부족한가요?', '평일에 라운딩 하실분이 필요한가요?', '부부, 커플과 조인을 원하시나요?'
		];

		$scope.msg = function() {
			$scope.message = message[Math.floor(Math.random()*message.length)];
		};
		$scope.msg();

		$interval(function() {
			$scope.msg();
		}, 5000);

		
		//등록 수정하기
		$scope.onItemModify = function(item){
			InviteService.getRequest(item.id, callback);

			function callback(res) {
				if (res.success) {
					$state.go("app.golfjoin.modify", {postId:item.id}); 
					$scope.modalMenu.hide();
				}
			}
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
		
		//프로필 방문
		$scope.onItemProfile = function(item) {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			$state.go('app.mypage.visit', {Id: item.poster, userId: item.poster_id});
		};

		$scope.openInAppBrowser = function(url, target) {
			InAppBrowser(url, target);
		}
	})
	/**
	 * 조인하기 등록정보 등록/수정 
	 */
	.controller('golfpostsCtrl', function(
		$rootScope, 
		$scope, 
		$state, 
		$http, 
		$stateParams, 
		$ionicLoading, 
		$ionicPopup,
		$ionicHistory, 
		$location, 
		$filter, 
		Auth,
		popup
	) {

		$scope.form		= {}; 
		$scope.form1	= {}; 
		$scope.setData	= {};
		$scope.view = {};
		
		var post_id	= $stateParams.postId;
		
		
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) $state.go('login');


			if(post_id){//수정일 경우 현재 등록된 내용을 다시 불러 온다.
				$scope.view.title = '수정하기';
				$http.get(apiServer + 'fields/edit/'+post_id+'?token=' + localStorage.getItem('authToken'))
				//$http.get(apiServer + 'fields/create?token=' + localStorage.getItem('authToken')+"&"+obj)
					.then(function(response) {
						
						var obj	= response.data.field;
						//console.log(obj);
						$scope.form.post_id		= post_id;
						
						$scope.form.clubType	= obj.golf_club_code.substr(1, 1);//console.log("clubtype:"+obj.golf_club_code.substring(2, 1));
						$scope.form.clubRegion	= obj.golf_club_code.substr(3, 1);
						set_club(obj.golf_club_id);
						
						
						$scope.form.bookingDate	= set_date(obj.golf_time);
						$scope.form.bookingDateTime	= set_date(obj.golf_time);
					
	
						$scope.form.partners	= obj.golf_partner.toString();
						$scope.form.green_fee	= obj.green_fee;
						$scope.form.cart_fee	= obj.cart_fee;
						$scope.form.caddie_fee	= obj.caddie_fee;
						$scope.form.message		= obj.message;
						
						 $ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
				
			}else{//수정이 아닐 경우 초기화 시킨다.
				$scope.view.title = '등록하기';
				var regex=/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/;
				//실명인증을 하지 않았거나 유효한 이메일이 존재 하지 않을 경우 마이페이지로 이동한다.
				if(!$rootScope.me.profile.phone || regex.test($rootScope.me.email) === false){
					
					var alertPopup = popup.confirm('알림','휴대폰 인증이 필요한 서비스 입니다.<br />인증 하시겠습니까?');

					alertPopup.then(function(res) {
						if(res){
							if(!$rootScope.me.profile.phone) $state.go('app.mypage.realname');
							else if(regex.test($rootScope.me.email) === false) $state.go('app.mypage.email');
						}else{
							$ionicHistory.goBack(-1);
						}
						
					});
					
					//return;
				}else{
					var d = new Date();

					$scope.form.bookingDate		= d;
					$scope.form.bookingDateTime	= new Date(1970, 0, 1, d.getHours(), d.getMinutes(), 0);
				}
			}

		});
		
		
	
		
		
		/**
		 *회원종류 및 지역을 선택하면 해당 골프장을 디스플레이 한다. 
		 */
		$scope.set_clubs = function(){
			set_club();
		};//var setgolfclub = function(){
			
		var set_club	= function(sel){
			//var t = $scope.registForm.club_type.$viewValue;
			//var r = $scope.registForm.club_region.$viewValue;
			var t = $scope.form.clubType;
			var r = $scope.form.clubRegion;
			//console.log("sel:"+sel);
			if (r != undefined && t != undefined)
			{
				$ionicLoading.show();
				$http.get(apiServer + 'clubs?club_type='+t+'&club_region='+r ,{})
					.then(function(response) {
						//console.log(response);
						$scope.clubs = response.data.items;
						if(sel) $scope.form.clubName = sel;
						$ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			}
		};
			
			
		/**
		 * 선택적 부팅 데이타 체크
		 */
	//	$scope.CheckBookingMinute = function(){
	//		return $scope.form.golfReserved == '1';
	//	};
		
	//	$scope.CheckBookingHour	= function(){
	//		return $scope.form.golfReserved == '2';
	//	};
		
		var overlap = false;

		//등록하기
		$scope.submitregistForm = function(isValid) {
			if ($scope.registForm.$valid) {

				if (overlap) return false;

				overlap = true;
				
				
				var bookingDate	= $filter('date')($scope.form.bookingDate, "yyyy/MM/dd");
				var bookingHour	= $filter('date')($scope.form.bookingDateTime, "HH:mm");
				
				//입력된 시간의 유효성 시작
				var bookedDate	= 	bookingDate.split("/");
				var bookedTime	= 	bookingHour.split(":");
				var today = new Date(); 
				var dateObj = new Date(bookedDate[0], bookedDate[1]-1, bookedDate[2], bookedTime[0], bookedTime[1], 0);
				
				var interval = dateObj - today;
				
				if(interval < 0){
					overlap = false;

					var alertPopup = $ionicPopup.alert({
						title: '알림',
						template: '이미 지난 시간입니다.'
					});
					
					return false;
				}
				//입력된 시간 유효성 끝
			
				var green_fee	= $scope.form.green_fee == undefined ? 0 : $scope.form.green_fee;
				var cart_fee	= $scope.form.cart_fee == undefined ? 0:$scope.form.cart_fee;
				var caddie_fee	= $scope.form.caddie_fee == undefined ? 0:$scope.form.caddie_fee;

				var obj = {
					club_type:$scope.form.clubType, 
					club_region:$scope.form.clubRegion, 
					club_name:$scope.form.clubName, 
					date:bookingDate, 
					hour:bookingHour, 
					partners:$scope.form.partners, 
					green_fee:green_fee, 
					cart_fee:cart_fee, 
					caddie_fee:caddie_fee, 
					message:$scope.form.message
				};

				//for get
				//var obj = 'club_type='+$scope.form.clubType+'&club_region='+$scope.form.clubRegion+'&club_name='+$scope.form.clubName+'&golf_reserved='+$scope.form.golfReserved+'&date='+bookingDate+'&hour='+encodeURIComponent(bookingHour)+'&partners='+$scope.form.partners+'&green_fee='+green_fee+'&cart_fee='+cart_fee+'&caddie_fee='+caddie_fee+'&message='+$scope.form.message;
				var url = "";
				if($scope.form.post_id) 
					url = apiServer + 'fields/update/'+$scope.form.post_id+'?token=' + localStorage.getItem('authToken');
				else 
					url = apiServer + 'fields/create?token=' + localStorage.getItem('authToken');

				$ionicLoading.show();
				// $http.post(url, obj)
				//$http.get(url+"&"+obj)
				$http({
					method: 'post',
					url: url,
					data: obj,
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				})
					.then(function(response) {
						//console.log(response);
						if(response.data.success){
							overlap = false;
							$ionicHistory.goBack(-1);
						}else{
							overlap = false;
							//console.log(response.data);
							var error = response.data.errors ? response.data.errors : '다시 시도해 주세요';
							var alertPopup = $ionicPopup.alert({
								title: '실패',
								template: error 
							});
						}
						 $ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			}
		};
		
		var lpad = function(str, padString, length) {
			while (str.length < length)
				str = padString + str;
			return str;
		};
		
		var set_date = function (input) {
		
			var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
			var dateArray = reggie.exec(input); 
			var d = new Date(
				(+dateArray[1]),
				(+dateArray[2])-1, // Careful, month starts at 0!
				(+dateArray[3]),
				(+dateArray[4]),
				(+dateArray[5]),
				(+dateArray[6])
			);
			return d;
			//return d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate();
		};

	
	
	
	})

	.controller('golfcommentCtrl', function(
		$rootScope, 
		$scope, 
		$stateParams, 
		$ionicModal, 
		$http, 
		$ionicPopup, 
		$ionicLoading, 
		$state, 
		$window, 
		$timeout, 
		$ionicScrollDelegate, 
		Auth
	) {

		var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
		var footerBar; // gets set in $ionicView.enter
		var scroller;
		var txtInput; // ^^^
		var isIOS = ionic.Platform.isIOS();
		$scope.data = {};

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}
			get_comment();

			$timeout(function() {
				footerBar = document.body.querySelector('.homeView .bar-footer');
				scroller = document.body.querySelector('.homeView .scroll-content');
				txtInput = angular.element(footerBar.querySelector('textarea'));
			}, 0);
		});

		$scope.formData	= {body:"", reple_id:""};//변수 선언

		var post_id	= $stateParams.golflistId;

		$ionicModal.fromTemplateUrl('templates/modal/comment-list-menu.html', {
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modal = modal;
		});

		$scope.openModal = function(arg1) {
			$scope.list	= arg1;
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
		
		//댓글 수정
		$scope.onItemModify = function(item){
			//console.log("onItemModify start.");
			//console.log(item);
			$scope.modal.hide();	
			$scope.formData.body		= item.body;
			$scope.formData.reple_id	= item.id;
		};
		
		//댓글 삭제
		$scope.onItemDelete = function(item){
			//console.log("onItemDelete start.");
			//console.log(item);

			var confirmPopup = $ionicPopup.confirm({
				title: '삭제',
				template: '삭제하시겠습니까?',
				okText: '예',
				cancelText: '아니요'
			});

			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'reples/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'reples/delete/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
							get_comment();
							$ionicLoading.hide();
						},function(error){
							$ionicLoading.hide();
						}
					);
				}
			});	
			
			$scope.modal.hide();		
		};
		
		//프로필 방문
		$scope.onItemProfile = function(item) {
			$state.go('app.mypage.visit', {Id: item.username, userId: item.user_id});
		};
				
		var get_comment = function (){
			$http.get(apiServer + 'fields/comment/'+post_id+'?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					//console.log(response.data);
					if(response.data.success){
						$scope.comments = response.data.reple;
						//console.log(obj);
					}
					 $ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		};
		
		
		
				
		//리플등록
		$scope.commentSend = function(isValid) {
			if ($scope.commentForm.$valid) {
				$ionicLoading.show();

				var url;
				if($scope.formData.reple_id){//수정이면
					url = apiServer + 'reples/put/'+$scope.formData.reple_id+'?token=' + localStorage.getItem('authToken');
				}else{//등록이면
					url = apiServer + 'reples/create?token=' + localStorage.getItem('authToken');
				}
				
				
				// $http.post(url, {field_id: post_id, body:$scope.formData.body})
				//$http.get(apiServer + 'reples/create?token=' + localStorage.getItem('authToken')+'&field_id='+post_id+'&body='+$scope.formData.body)
				$http({
					method: 'post',
					url: url,
					data: {
						field_id: post_id, 
						body: $scope.formData.body
					},
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				})
					.then(function(response) {
						//console.log(response);
						if(response.data.success){
							//console.log("success");

							get_comment();//시간날때 바로 붙이는 것으로 처리
							$scope.formData.body = "";
							
						}else{
							//console.log("fail");
						}
						 $ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
				
				$scope.formData.reple_id = "";
			}
		};

		$scope.inputUp = function(){
	        if(isIOS) $scope.data.keyboardHeight = 216;
	        $timeout(function(){
	            $ionicScrollDelegate.scrollBottom();
	        }, 300);
	    };

	    $scope.inputDown = function(){
	        if(isIOS) $scope.data.keyboardHeight = 0;
	        $ionicScrollDelegate.resize();
	    };

		$scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
			if (!footerBar) return;

			var newFooterHeight = newHeight + 20;
			newFooterHeight = (newFooterHeight > 40) ? newFooterHeight : 40;
			newFooterHeight = (newFooterHeight > 103) ? 103 : newFooterHeight;

			footerBar.style.height = newFooterHeight + 'px';
			scroller.style.bottom = newFooterHeight + 'px';

			viewScroll.scrollBottom();
		});

	})

	.controller('golfrecommentCtrl', function(
		$scope, 
		$state, 
		$stateParams, 
		$ionicModal, 
		$http, 
		$ionicLoading, 
		$window, 
		$ionicPopup,
		$ionicScrollDelegate, 
		$timeout
	) {
		
		var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
		var footerBar; // gets set in $ionicView.enter
		var scroller;
		var txtInput; // ^^^
		var isIOS = ionic.Platform.isIOS();
		$scope.data = {};

		$scope.$on('$ionicView.beforeEnter', function() {
			$timeout(function() {
				footerBar = document.body.querySelector('.homeView .bar-footer');
				scroller = document.body.querySelector('.homeView .scroll-content');
				txtInput = angular.element(footerBar.querySelector('textarea'));
			}, 0);
		});

		$scope.formData	= {body:"", reple_id:""};//변수 선언
		
		var post_id	= $stateParams.golflistId;
		var thread	= $stateParams.thread;
		
		//console.log(post_id+","+thread);
		
		$ionicModal.fromTemplateUrl('templates/modal/comment-list-menu.html', {
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modal = modal;
		});

		$scope.openModal = function(arg1) {
			$scope.list	= arg1;
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
		
		//프로필 방문
		$scope.onItemProfile = function(item) {
			$state.go('app.mypage.visit', {Id: item.username, userId: item.user_id});
		};
		
		//댓글 수정
		$scope.onItemModify = function(item){
			//console.log("onItemModify start.");
			//console.log(item);
			$scope.modal.hide();	
			$scope.formData.body		= item.body;
			$scope.formData.reple_id	= item.id;
		};
		
		//댓글 삭제
		$scope.onItemDelete = function(item){
			//console.log("onItemDelete start.");
			//console.log(item);

			var confirmPopup = $ionicPopup.confirm({
				title: '삭제',
				template: '삭제하시겠습니까?',
				okText: '예',
				cancelText: '아니요'
			});

			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'reples/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'reples/delete/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
							get_recomment();
							$ionicLoading.hide();
						},function(error){
							$ionicLoading.hide();
						}
					);
				}
			});	
			
			$scope.modal.hide();		
		};
		
		
		//댓댓글 가져오기
		var get_recomment = function(){
			$http.get(apiServer + 'fields/recomment/'+post_id+'/'+thread+'/?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					//console.log(response.data.reple);
					
					if(response.data.success){
						$scope.recomments 		= response.data.reple;
						$scope.formData.body 	= "";
						//console.log(obj);
					}
					 $ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		};
		get_recomment();
		
		
		//리플등록
		$scope.commentSend = function(isValid) {
			if ($scope.commentForm.$valid) {
				$ionicLoading.show();
				
				var url;
				if($scope.formData.reple_id){//수정이면
					url = apiServer + 'reples/put/'+$scope.formData.reple_id+'?token=' + localStorage.getItem('authToken');
				}else{//등록이면
					url = apiServer + 'reples/create?token=' + localStorage.getItem('authToken');
				}
				
				// $http.post(url, {field_id: post_id, thread:thread, body:$scope.formData.body})
				$http({
					method: 'post',
					url: url,
					data: {
						field_id: post_id, 
						thread:thread, 
						body:$scope.formData.body
					},
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				})
					.then(function(response) {
						//console.log(response);
						if(response.data.success){
							get_recomment();
						}else{
							//console.log("fail");
						}
						 $ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
				
				$scope.formData.reple_id = "";
			}
		};
		
		$scope.inputUp = function(){
	        if(isIOS) $scope.data.keyboardHeight = 216;
	        $timeout(function(){
	            $ionicScrollDelegate.scrollBottom();
	        }, 300);
	    };

	    $scope.inputDown = function(){
	        if(isIOS) $scope.data.keyboardHeight = 0;
	        $ionicScrollDelegate.resize();
	    };

		$scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
			if (!footerBar) return;

			var newFooterHeight = newHeight + 20;
			newFooterHeight = (newFooterHeight > 40) ? newFooterHeight : 40;
			newFooterHeight = (newFooterHeight > 103) ? 103 : newFooterHeight;

			footerBar.style.height = newFooterHeight + 'px';
			scroller.style.bottom = newFooterHeight + 'px';

			viewScroll.scrollBottom();
		});

	})

	.controller('golfpartnerListCtrl', function($rootScope, $scope, $state, $stateParams, $ionicPopup, $http, $ionicLoading, Auth, popup) {
		
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			$scope.selection = [];

			load_rsvp();
		});

		var post_id	= $stateParams.fieldId;
		$scope.field = {};//필드정보 입력

		//$scope.formDate = {listId:""};
		//체크 박스 선택
		
		$scope.toggleSelection = function toggleSelection(item) {
			var idx = $scope.selection.indexOf(item);
			if (idx > -1) {// is currently selected
				$scope.selection.splice(idx, 1);
			}else {// is newly selected
				$scope.selection.push(item);
			}
		};
		
		$scope.isconfirm = function() {
			//if($scope.selection)
			if($scope.selection.length < 1){
				popup.alert('알림','한사람 이상 선택해 주세요.');
				return;
			}
			// console.log($scope.selection.length+' > '+$scope.field.invite_count);
			if($scope.selection.length > $scope.field.invite_count){
				popup.alert('알림','초청가능한 인원보다 많이 선택되었습니다.');
				return;
			}

			var confirmPopup = popup.confirm('알림','파트너로 선택하시겠습니까?');
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					var addstr = "";
					angular.forEach($scope.selection, function(value, key) {
						addstr = addstr + '&ids[]='+value;
					});

					//{"golf_partner":3,"ids":[2306,2308,2310]}
					// $http.post(apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken')+'&golf_partner='+$scope.field.golf_partner+addstr)
					//$http.get(apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken')+'&golf_partner='+field.golf_partner+addstr)
					$http({
						method: 'post',
						url: apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken')+'&golf_partner='+$scope.field.golf_partner+addstr,
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
							//console.log(response);
							load_rsvp();
							$ionicLoading.hide();
							$scope.selection = [];
							
						},function(error){
							$ionicLoading.hide();
						}
					);
				} else {
					return;
				}
			});
		};

		$scope.iscancel = function() {
			var confirmPopup = $ionicPopup.confirm({
				title: '취소',
				template: '취소하시겠습니까?'
			});
			confirmPopup.then(function(res) {
				if(res) {
					//console.log('취소 ok');
				} else {
					//console.log('취소 취소');
				}
			});
		};
		
		

		//신청자가 취소하는 경우
		$scope.formDate = {};
		$scope.applyCancel = function() {
			//console.log($scope.formDate.listId);
			var confirmPopup = $ionicPopup.confirm({
				title: '취소',
				template: '취소하시겠습니까?'
			});
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					$http.get(apiServer + 'fields/rsvps/delete/?id='+$scope.formDate.listId+'&token=' + localStorage.getItem('authToken'))
						.then(function(response) {
							//console.log(response);
							load_rsvp();
							$ionicLoading.hide();
						},function(error){
							$ionicLoading.hide();
						}
					);
				} else {
					//console.log('취소 취소');
				}
			});
		};
		
		
		var load_rsvp = function(){
			$http.get(apiServer + 'fields/rsvps/get/'+post_id+'?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					//console.log(response);
					$scope.lists	= response.data.rsvps;
					$scope.field	= response.data.field;

					switch($scope.field.golf_partner){
						case 9://조인2 
							$scope.field.invite_count = 2;
						break;
						default:// 조인1 3, 부부, 커플:7
							$scope.field.invite_count = 1;
						break;
					}
					//console.log($scope.field.invite_count);
					$ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
				
				
			);
		};
		
		
		/*
		$scope.lists = 
			{ 
				 field_id: $stateParams.fieldId, poster_id: 13718, poster: '일단까고볼',
				'fields_rsvps' : [
					{ id: 1234, poster: '다이아', poster_id: 8852, created_at: '2016-01-12 10:07:50'},
					{ id: 1234, poster: '다이아', poster_id: 8852, created_at: '2016-01-12 10:07:50'}
				]
			}
		;

		console.log($scope.lists);
*/

		//프로필 방문
		$scope.onItemProfile = function(item) {
			$state.go('app.mypage.visit', {Id: item.username, userId: item.poster_id});
		};

		$scope.onItemMessage = function(user) {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			$state.go('app.messagecreate', {userId:user.poster_id});
		};

	})



;