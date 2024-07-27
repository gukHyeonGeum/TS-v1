angular.module('starter.controllers', ['angular-datepicker'])

.controller('AppCtrl', function(
	$rootScope, 
	$scope, 
	$state, 
	$location, 
	$ionicHistory, 
	$ionicSideMenuDelegate,
	socket,
	$filter,
	$http,
	$ionicModal,
	$window, 
	$ionicLoading, 
	$ionicSlideBoxDelegate,
	$timeout,
	$focusChat,
	helpMsg,
	popup,
	ProfileService,
	VisitorsService,
	BookingService,
	toaster,
	Auth
) {

	$scope.profileSlideChanged = function(index) {
		$scope.profileSlideIndex = index;
	};
	$scope.profileNext = function() {
		$ionicSlideBoxDelegate.next();
	};
	$scope.profilePrevious = function() {
		$ionicSlideBoxDelegate.previous();
	};
	$scope.userLike = function(item) {

		// if (flag == 0) {
		// 	item.like_cnt = 1;
		// } else {
		// 	$scope.onelinelike = false;
		// 	$ionicLoading.show();
		// }
 // return;
 
 		var flag = 0;
		if (item.like_cnt) {
			$scope.onelinelike = false;
			// $ionicLoading.show();
			item.like_cnt = 0;
			item.user.like_count--;
			flag = 1;
		} else {
			item.like_cnt = 1;
			item.user.like_count++;
		}

		$http({
			method: 'post',
			url: apiServer + 'users/'+ item.user.id +'/like?token=' + localStorage.getItem('authToken'),
			data: { flag: flag },
			headers: {
				'Content-Type' : 'application/json; charset=utf-8'
			}
		})
		.then(function(response) {
			if (response.data.success) {
				// item.like_cnt = 1;
				ProfileService.visit({id: item.user.id, matchId: ''}, function(obj) {
					$scope.profileInfo = obj;
				});
			} else {
				popup.alert('오류', response.data.message);
				return;
			}
		},function(error){
			popup.alert('오류', error);
			return;
		}).finally(function() {
			$ionicLoading.hide();
		});
	};
	$scope.userComment = function(item) {
		$scope.openProfileModal(3, item);
	};

	$scope.submitLike = function(user, msg) {
		return;
		if (user.onemessage) {
			socket.emit('setMessage', {thread_id: user.thread_id, recipient: user.user.id, message: user.onemessage});
			$scope.onelinelike = false;
			user.onemessage = '';
			$scope.shouldNotFocusOnBlur();
			
			window.plugins.toast.showWithOptions(
				{
					message: "전송하였습니다.",
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
		}
	};

	$scope.shouldNotFocusOnBlur = function() {
		if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
            window.cordova.plugins.Keyboard.close(); //open keyboard manually
        }
		$focusChat.setFocusOnBlur(false);
	};	

	$scope.helpMsg = function(type) {
		var msg = '';
		var title = '';
		switch(type) {
			case "premium":
				msg = '<div><div class="margin-top20"><p>※ 주요내용</p><p class="assertive">• 원하는 파트너를 매칭해드립니다.</p><p>• 초청자가 <u>"무료로 초대"</u> 합니다.</p><p>• 비공개로 진행됩니다.(파트너끼리만 공개)</p></div><div class="margin-top20 padding-top"><p>※ 진행절차</p><p>① <span class="assertive">초청자 무료등록</span></p><p>② 신청자 무료신청</p><p>③ 이용권 구매</p><p>④ 파트너 선택</p><p>⑤ <span class="assertive">매칭</span></p></div><div class="margin-top20 padding-top">※ 문의 : 02) 2277-3489</div></div>';
				title = '★ 프리미엄 서비스란?';
			break;	
			case "premiumView":
				msg = '<div class="padding margin-left margin-right"><div class="margin-top20"><p class="assertive">① 초청자 무료등록</p><p>② 신청자 무료신청</p><p>③ 이용권구매</p><p>④ 파트너 선택</p><p>⑤ <span class="assertive">매칭</span></p></div><div class="padding-top margin-top20 text-center">※ 문의 : 02) 2277-3489</div></div>';
				title = '진행 절차';
			break;
			case "payment":
				msg = '<div class="margin-top20 margin-bottom20 font14"><p>• 일반 이용권 : 골프조인과 메시지 서비스 이용</p><p>• 프리미엄 이용권 : 모든 서비스 이용 가능</p></div>';			
				title = '이용권 구매';
			break;
			case "premiumStand":
				msg = '<div class="margin-top20 margin-bottom20 font14"><dl><dt class="assertive bold">※ 프로필 사진등록</dt><dd class="padding-left margin-top20">① 회원님의 프로필 사진이 있는지 확인중입니다.</dd><dd class="padding-left margin-top">② 프로필에 <strong><u>사진을 등록</u></strong>해야 하며, 없으면 승인되지 않습니다. (얼굴,전신 각1장)</dd><dd class="padding-left margin-top">③ <span class="assertive">무료로 초대하는 혜택이기 때문에</span>, 초청자가 프로필 사진을 보고 선택할 수 있어야 합니다.<p class="padding-left">(다른회원 비공개)</p></dd></dl><dl class="padding-top"><dt class="assertive margin-top20">※ 비공개 원칙 & 매칭</dt><dd class="padding-left margin-top">① 다른회원은 볼 수 없도록 <strong><u>비공개로 진행</u></strong>됩니다.</dd><dd class="padding-left margin-top">② 파트너로 선택되어야 <strong>"매칭"</strong>이 되며 -> 파트너끼리 휴대폰번호가 통지됩니다.</dd><dd class="padding-left margin-top">③ 통화후에 서로 조건이 맞지 않을 때에는 -> "파트너취소"가 가능합니다.</dd></dl></div>';
				title = '신청 대기중입니다';
			break;
		}
		helpMsg(msg, title);
	}

	// $scope.golfCompanion = [{'','초청자','초청자, 남1명','초청자, 남2명','초청자, 여1명','초청자, 여2명','초청자, 남1여1','부부','커플'}];
	
	$scope.arrayCompanion 	= ['','초청자','초청자, 남1명','초청자, 남2명','초청자, 여1명','초청자, 여2명','초청자, 남1여1','부부','커플'];
	$scope.arrayCompanionJoin 	= ['','등록자','등록자, 남1명','등록자, 남2명','등록자, 여1명','등록자, 여2명','등록자, 남1여1','','부부&커플'];
	$scope.arrayCompanionBooking 	= ['','조인 1명','조인 2명','조인 3명','','','','','부부&커플'];
	$scope.arrayPartner 	= ['','조인 1명','조인 2명','조인 3명', '여자 1명','여자 2명','남자 1명','남자 2명','남1, 여1','','부부&커플'];
	$scope.arrayPartnerBooking 	= ['','조인 1명','조인 2명','조인 3명','','','','','','','부부&커플'];
	$scope.arrayInvite 		= ['','무관 1명','무관 2명','무관 3명','여자 1명','여자 2명','남자 1명','남자 2명','남1, 여1','부부','커플'];
	$scope.arrayBookingOption = ['카트포함','식사포함','노캐디'];
	$scope.arrayBookingPartner = ['','4인필수','3인이상','2인이상'];
	$scope.arrayBookingReqPeople = ['','1명','2명','부부커플'];
	$scope.arrayPremiumType = ['당일','당일','국내1박2일','해외골프','스크린'];

	$scope.submenu = false;

	// 방문자 뱃지 및 localStorage 갱신
	socket.on('getVisitorsBagde', function() {
		$rootScope.badgeCount.newVisit++;

		$scope.lcnt = JSON.parse(localStorage.getItem('count'));
		$scope.lcnt.newVisit++;
		localStorage.setItem('count', JSON.stringify($scope.lcnt));
	});

	socket.on('getFriendsBagde', function() {
		$rootScope.badgeCount.newInvite++;

		$scope.lcnt = JSON.parse(localStorage.getItem('count'));
		$scope.lcnt.newInvite++;
		localStorage.setItem('count', JSON.stringify($scope.lcnt));
	});

	socket.on('putMessageBadge', function() {
		$rootScope.badgeCount.newMessage++;

		$scope.lcnt = JSON.parse(localStorage.getItem('count'));
		$scope.lcnt.newMessage++;
		localStorage.setItem('count', JSON.stringify($scope.lcnt));
	});	

	socket.on('putMessageRead', function(req) {
		$rootScope.badgeCount.newMessage--;

		$scope.lcnt = JSON.parse(localStorage.getItem('count'));
		$scope.lcnt.newMessage--;
		localStorage.setItem('count', JSON.stringify($scope.lcnt));

		socket.emit('putMessageReadDb', req);
	});

	socket.on('msgPush', function(req) {
		// $http.post(apiServer + 'message/send?token=' + localStorage.getItem('authToken'), req)
		$http({
			method: 'post',
			url: apiServer + 'message/send?token=' + localStorage.getItem('authToken'),
			data: req,
			headers: {
				'Content-Type' : 'application/json; charset=utf-8'
			}
		})
			.then(function(response) {
				// console.log(response);
			},function(error){
				console.log(error);
			}
		);
	});

	$scope.toggleSubmenu = function(type) {
		if (type) $scope.submenu = true;
		else $scope.submenu = !$scope.submenu;
	};

	$scope.logout = function() {
		var confirmPopup = popup.confirm('로그아웃 확인','<p class="padding text-center">로그아웃 하시겠습니까?</p>','로그아웃','취소');
		confirmPopup.then(function(res) {
			if (res) {
				$ionicHistory.clearCache();
				$ionicHistory.clearHistory();
				if ($ionicSideMenuDelegate.isOpen()) 
					$ionicSideMenuDelegate.toggleLeft();
				localStorage.clear();
				
				for (var prop in $rootScope) {
					if (prop.substring(0,1) !== '$')  delete $rootScope[prop];
				}
				
				$location.path('/login');
				// $state.go('login', {}, {notify: false});
			}
		});
	};

	// 휴대폰 보인인증 체크 팝업
	$scope.phoneCertCheck = function() {
		// var alertPopup = popup.confirm('알림','<div class="text-center">본 서비스는 실명거래를<br />원칙으로 하고 있습니다.<br /><br />회원간의 신뢰와 거짓회원이 없도록<br />하기 위해서 본인 인증이 필요합니다.<br /><br />인증 하시겠습니까?</div>');
		var msg = '<div class="text-center"><p>서비스 이용을 위해서는</p><p>휴대폰 인증이 필요합니다.</p>';

		if($rootScope.me.profile.gender == 'male') {
			msg+= '<p class="margin-top20 assertive">★ 휴대폰 인증시 1개월 이용권을 드립니다.</p></div>';
		} else {
			msg+='</div>';	
		}
		
		var alertPopup = popup.confirm('휴대폰 인증',msg);
		alertPopup.then(function(res) {
			if(res){
				$scope.certificationOpen();
				// $state.go('app.mypage.realname');
			}			
		}); 
	};

	$scope.picturesCheck = function() {
		var alertPopup = popup.confirm('알림','<div class="text-center"><p class="padding-top">다른회원의 프로필을 보시려면</p><p>프로필 사진을 등록하셔야 합니다.</p></div>','등록하기');
		alertPopup.then(function(res) {
			if(res){
				$ionicHistory.nextViewOptions({
					disableBack: true
				});
				$state.go('app.mypage.info');
			}			
		}); 
	};

	$scope.bookingManagerRequest = function() {
		if (!$rootScope.me.profile.phone) {
			$scope.phoneCertCheck();
			return;
		}

		var confirmPopup = popup.confirm('매니저 등록신청', '<div class="text-center margin-top20 margin-bottom20"><p>관리자 승인을 받아 매니저로 등록됩니다.</p><p class="bold">신청하시겠습니까?</p></div>');
		confirmPopup.then(function(res) {
			if (res) {
				BookingService.putManager({userid: $rootScope.me.id}, function(obj) {
					if (obj.success) {
						popup.alert('알림', '<div class="text-center margin-top20 margin-bottom20">신청이 완료되었습니다.<div class="assertive margin-top">티샷에서 1일 이내 승인을 하면<br />바로 등록하실 수 있습니다.</div></div>')
					}
				});
			}
		});
	};

	// 프로필 모달 프로세서
	var profileStateInfo = {};

	$scope.profileProcess = function(item) {

		$scope.onelinelike = false;

		$scope.profileInfo = [];

		$scope.profile_image = {"width" : $window.innerWidth + 'px', "height" : $window.innerWidth + 'px', "max-width" : "450px", "max-height" : "450px"}

		$scope.completeShow = true;

		ProfileService.visit(
			{id: item.user_id, matchId: ''}, 
			function(obj) {
				
				$scope.profileInfo = obj;

				// console.log(obj);
				// $scope.profileInfo.user.profile_image = $scope.profileInfo.user.profile_image.replace("medium", "original");

				if ($scope.profileInfo) {
					if ($scope.profileInfo.visit_cnt < 1) {
						socket.emit('putVisitors', {userId: $scope.profileInfo.user.id});
						
						// 푸시발송
						$http({
							method: 'post',
							url: apiServer + 'push/direct?token=' + localStorage.getItem('authToken'),
							data: {
								id: $scope.profileInfo.user.id,
								message: $rootScope.me.username + '님이 회원님의 프로필에 관심을 가지고 방문하였습니다.',
								article_type: 'visit_profile',
								article_id: ''
							},
							headers: {
								'Content-Type' : 'application/json; charset=utf-8'
							}
						}).then(function(response) {
							// console.log(response);
						}, function(error){
							console.log(error.statusText);
						}).finally(function() {
							// console.log('완료!!');
						});
					}
				}

				if (item.state == 'new') {
					$rootScope.badgeCount.newVisit--;

					$scope.lcnt = JSON.parse(localStorage.getItem('count'));
					$scope.lcnt.newVisit--;
					localStorage.setItem('count', JSON.stringify($scope.lcnt));

					$rootScope.visitorsBadge.state = '';

					VisitorsService.readProfile({id: $scope.profileInfo.user.id});
				}


				// 프로필 이미지
				$scope.imgs = [];
				if ($scope.profileInfo) {
					if ($scope.profileInfo.pictures.length > 0) {
						angular.forEach($scope.profileInfo.pictures, function(value, key) {
							$scope.imgs.push('http://s3-ap-northeast-1.amazonaws.com/teeshot-photo/images/'+value.id+'/medium/'+value.image_file_name);
						});
					} else {
						$scope.imgs.push('images/avatars/avatar-unknown.jpg');
					}
					setTimeout(function() {
						$ionicSlideBoxDelegate.slide(0);
						$ionicSlideBoxDelegate.update();
						$scope.$apply();
					});
				}

				// show image in popup
				$scope.showImage = function (index) {
					$scope.imageIndex = index;
					$scope.imageSrc = $scope.imgs[index];
					$scope.openProfileModal(1);
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

				
			}
		);

		// 신고하기
		$scope.ReportData = {
			choice: '1'
		};
		$scope.ReportData.title = ['','불쾌감을 주는 언행(욕설, 비방 등)','가짜 프로필 및 사진','허위 가입(주민번호 도용 등)','사생활 침해','광고, 홍보성 글 신고'];
		$scope.userReport = function(item) {
			$scope.openProfileModal(2, item);
		};

		$scope.submitReport = function(user) {
			// console.log(user);

			if (!$scope.ReportData.choice) {
				popup.alert('알림','신고내용을 선택하시기 바랍니다.');
				return;
			}

			if ($scope.ReportData.choice == 6) {
				if (!$scope.ReportData.etc) {
					popup.alert('알림','신고하실 내용을 입력하세요.');
					return;
				}

				$scope.ReportData.body = $scope.ReportData.etc;
			} else {
				$scope.ReportData.body = $scope.ReportData.title[$scope.ReportData.choice];	
			}

			var confirmPopup = popup.confirm('불량회원 신고하기', '<div class="text-center"><p><strong>' + user.user.username + '</strong>님을</p><p>불량회원으로 신고하시겠습니까?</p></div>');
			confirmPopup.then(function(res) {
				if (res) {

					$ionicLoading.show();
					$http({
						method: 'post',
						url: apiServer + 'inquiry?token=' + localStorage.getItem('authToken'),
						data: {
							form_type: 'report', 
							subject: 'etc', 
							body: $scope.ReportData.body,
							target_id: user.user.id
						},
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						if(response.data.success){
							popup.alert('정상적으로 접수되었습니다.','<div class="text-center"><p>확인 후 빠른 결과 안내해 드리겠습니다.</p><p>감사합니다.</p></div>');
						} else {
							popup.alert('확인','<div class="text-center"><p>접수중 오류가 발생하였습니다.</p><p>잠시후 다시 시도해 주시기 바랍니다.</p></div>');
						}
					}, function(error){
						popup.alert('확인','<div class="text-center"><p>접수중 오류가 발생하였습니다.</p><p>잠시후 다시 시도해 주시기 바랍니다.</p></div>');
						$ionicLoading.hide();
					}).finally(function() {
						$ionicLoading.hide();
						$scope.closeProfileModal(2);
					});

				}
			});

		};

		/**
		 * 채팅하기 
		 */
		$scope.onItemMessage = function(user) {
			if (user.thread_id) {
				$state.go('app.message', { messageId: user.thread_id });
			} else {
				$state.go('app.messagecreate', {userId:user.user.id});
			}
		};
		
		/**
		 * 친구신청하기 
		 */
		$scope.onItemMakeFriend = function(user) {
			var confirmPopup = popup.confirm('친구 신청', '<div class="text-center padding"><strong>' + user.user.username + '</strong>님께<br />친구 신청을 하시겠습니까?</div>');
			confirmPopup.then(function(res) {

				if (res) {

					$ionicLoading.show();
					$http({
						method: 'post',
						url: apiServer + 'user/friendinvite/'+user.user.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						if(response.data.success){
							popup.alert('성공','친구신청을 하였습니다.');

							socket.emit('friendRequest', {userId: user.user.id});
						}else{
							popup.alert('알림',response.data.message);
						}
					},function(error){
						popup.alert('확인','친구 신청중 오류가 발생하였습니다.</br>잠시후 다시 시도해 주시기 바랍니다.');
						$ionicLoading.hide();
					}).finally(function() {
						$ionicLoading.hide();
					});				

				}

			})
			
		};

		// 프로필창 모달
		$ionicModal.fromTemplateUrl('templates/modal/image-modal.html', {
			id: 1,
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalProfileImage = modal;
		});

		$ionicModal.fromTemplateUrl('templates/modal/report-modal.html', {
			id: 2,
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalProfileReport = modal;
		});

		$ionicModal.fromTemplateUrl('templates/modal/like-modal.html', {
			id: 3,
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalProfileLike = modal;
		});

		$scope.openProfileModal = function(idx, item) {
			$scope.showNav = true;
			$scope.item = item;
			if (idx == 1) $scope.modalProfileImage.show();
			else if (idx == 2) $scope.modalProfileReport.show();
			else $scope.modalProfileLike.show();
		};

		$scope.closeProfileModal = function(idx, item) {
			if (idx == 1) $scope.modalProfileImage.hide();
			else if (idx == 2) $scope.modalProfileReport.hide();
			else $scope.modalProfileLike.hide();
		};

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.modalProfileImage.remove();
			$scope.modalProfileReport.remove();
			$scope.modalProfileLike.remove();
		});

		$scope.$on('$stateChangeStart', function() {
			if($scope.modalProfileImage) $scope.modalProfileImage.hide();
			if($scope.modalProfileReport) $scope.modalProfileReport.hide();
			if($scope.modalProfileLike) $scope.modalProfileLike.hide();
		});

	};

	// 프로필 모달
	$scope.openProfile = function(item) {
		if (!$rootScope.me.profile.phone) {
			$scope.phoneCertCheck();
			return;
		}

		if ($rootScope.me.id == item.user_id) {
			return;
		}

		if (!$rootScope.badgeCount.pictureCnt) {
			$scope.picturesCheck();
			return;
		}

		$scope.profileProcess(item);

		$ionicModal.fromTemplateUrl('templates/modal/profile.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalProfile = modal;
			$scope.modalProfile.show();
		});
	};

	$scope.closeProfile = function(item) {
		$scope.modalProfile.hide();
		$scope.imgs = [];
		$scope.modalProfileImage.remove();
		$scope.modalProfileReport.remove();
		$scope.modalProfileLike.remove();
		$scope.onelinelike = false;
	};

	$scope.certificationOpen = function(item) {
		$ionicModal.fromTemplateUrl('templates/modal/certification.html', {
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.modalCertification = modal;
			$scope.modalCertification.show();
		});
	};

	$scope.certificationClose = function(item) {
		$scope.modalCertification.hide();
	};

	//Cleanup the modal when we're done with it!
	$scope.$on('$destroy', function() {
		$scope.modalProfile.remove();
		$scope.modalCertification.remove();
	});
	// Execute action on hide modal
	// $scope.$on('modal.hidden', function() {
	// 	// Execute action
	// });
	// // Execute action on remove modal
	// $scope.$on('modal.removed', function() {
	// 	// Execute action
	// });	
	
	$scope.$on('$stateChangeStart', function() {
		if($scope.modalProfile) $scope.modalProfile.hide();
		if($scope.modalCertification) $scope.modalCertification.hide();
	});


	$scope.realData	= {};	

	//실명인증서버로 전송(내부)
	$scope.realnameStart	= function(url){

		var birthDate = $scope.realData.birthday +'T000000Z';

		var name	= $scope.realData.realname;
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
					popup.alert('인증오류','인증코드에 오류가 발생하였습니다.');
				}
			} else {
				popup.alert('인증실패',response.data.message);
			}

		}, function(error){
			popup.alert('에러',error.statusText);
			$ionicLoading.hide();
		}).finally(function() {
			$ionicLoading.hide();
		});	

	};
	
	//서버로 결과 전송
	$scope.realnameSubmit = function(){

		var birthDate = $scope.realData.birthday +'T000000Z';
		
		var rid		= $scope.realData.rid;
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
							
							Auth.update('normal_expired_at', response.data.user.normal_expired_at);
							
							// if(response.data.me.realnamecount > 1){
							// 	//동일 실명인증이 있을 경우 계정통합 페이지로 이동시킨다.
							// 	var alertPopup = popup.alert('인증성공','동일실명인증이 존재합니다.</br>계정 통합을 진행해 주세요.');
							// 	alertPopup.then(function(res) {
							// 		$scope.certificationClose();
							// 		$state.go('app.mypage.account');
							// 	});
							// }else{
								//동일 실명인증이 없을 경우
								var msg = '<div class="text-center"><p>휴대폰 인증이 완료되었습니다.</p>';

								if ($rootScope.me.profile.gender == 'male') {
									if ($rootScope.me.profile.phone) {
										var alertPopup = popup.alert('인증완료', msg);
										alertPopup.then(function(res) {
											$scope.certificationClose();
											Auth.isLoggedIn();
										});
									} else {
										msg += '<p class="margin-top20">★ 무료 체험을 위하여</p><p><u class="assertive">1개월 일반이용권</u>을 지급하였습니다.</p></div>';
										var alertPopup = popup.alert('인증완료', msg);
										alertPopup.then(function(res) {
											$scope.certificationClose();
											Auth.isLoggedIn();
											$state.go('app.paymentCoupon');
										});
									}
								} else {
									msg += '</div>';

									var alertPopup = popup.alert('인증완료', msg);
									alertPopup.then(function(res) {
										$scope.certificationClose();
										Auth.isLoggedIn();
									});
								}

							Auth.update('profile.phone', tel);
								
								
							// }
						} else {
							popup.alert('인증실패','시스템에서 에러가 발생하였습니다.이미 등록된 핸드폰 번호인지를 확인해 주세요.');
						}

					}, function(error){
						$ionicLoading.hide();

						popup.alert('에러',error.statusText);
					}).finally(function() {
						$ionicLoading.hide();
					});
					
				} else {
					popup.alert('인증오류','인증코드에 오류가 발생하였습니다.');
					$ionicLoading.hide();
				}

			} else {
				var alertPopup = popup.alert('인증실패','인증번호가 맞지 않습니다.');
				alertPopup.then(function(res) {
					$scope.realData.secretRealname = '';
				});
				
				$ionicLoading.hide();
			}

		}, function(error){
			$ionicLoading.hide();

			popup.alert('에러',error.statusText);
		}).finally(function() {
			$ionicLoading.hide();
		});
		
	};

})

.controller('certificationCtrl', function(
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

	$scope.realData	= {};	

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
		
	};

})

.controller('paymentCtrl', function(
	$rootScope,
	$scope, 
	$ionicPlatform, 
	$ionicLoading, 
	$ionicPopup,
	$filter,
	$state,
	$ionicHistory,
	$timeout,
	Auth,
	popup,
	PaymentService,
	LogService
) {

	if (window.cordova) {
		facebookConnectPlugin.logEvent(
			"payment List", 
			{
				ContentType: "결제하기 리스트"
			}
		);
	}

	$scope.items = [
		{ 
			title: '일반 1개월 - 9,900',
			productId: 'n1',
			price: 9900
		},
		{ 
			title: '일반 2개월 - 20,000',
			productId: 'n2',
			price: 20000
		},
		{ 
			title: '일반 3개월 - 30,000',
			productId: 'n3',
			price: 30000
		},
		{ 
			title: '프리미엄 1개월 - 55,000',
			productId: 'p1',
			price: 55000
		},
		{ 
			title: '프리미엄 2개월 - 99,000',
			productId: 'p2',
			price: 99000
		},
		{ 
			title: '프리미엄 3개월 - 132,000',
			productId: 'p3',
			price: 132000
		}
	];

	$scope.isIPad		= ionic.Platform.isIPad();
	$scope.isIOS		= ionic.Platform.isIOS();
	$scope.isAndroid	= ionic.Platform.isAndroid();

	$scope.$on('$ionicView.beforeEnter', function() {
		if(!Auth.isLoggedIn()) {
			$state.go('login');
			return false;
		}

		if (!$rootScope.me.profile.phone) {
			$scope.phoneCertCheck();
			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.mypage.info');
			return;
		}

		if (window.cordova) {
			$scope.loadProducts();

			// $timeout(function() {
		 //        $scope.restore();
			// }, 3000);
		}
	});

	$scope.buyProcess = function(productId,price,data) {

		LogService.Insert({ msg: data, f_1: 'buyProcess start-android'});

		if (!data) var data = {};

		// if (!isNaN(price)) {
		// 	var priceVal = price;
		// } else {
		// 	if ($scope.isIPad || $scope.isIOS) {
		// 		var priceVal = price;
		// 	} else {
		// 		var priceVal = parseInt(price.replace(/₩|,/g,''));	
		// 	}
		// }

		var priceVal = price;

		var paylist = $filter('PayList')(productId);
		var id = $rootScope.me.id;

		// var confirmPopup = popup.confirm('알림','결제를 진행하시겠습니까?');

		// confirmPopup.then(function(res) {
		// 	if(res) {

			    PaymentService.Payinsert( { 
					user_id: id, 
					productId: productId, 
					productName: paylist.title, 
					price: priceVal, 
					type: 'inapp', 
					productType: 'inapp',
					signature: data.signature,
					transactionId: data.transactionId,
					receipt: data.receipt,
					users: $rootScope.me
				}, function(obj) {

					LogService.Insert({ msg: obj, f_1: 'Payinsert done-android'});

					// console.log(obj);

					if (obj.expired_at) Auth.update('expired_at', obj.expired_at);
					if (obj.normal_expired_at) Auth.update('normal_expired_at', obj.normal_expired_at);

					if (window.cordova) {
						facebookConnectPlugin.logEvent(
							"payment Complete", 
							{
								ContentType: "결제완료"
							}
						);
					}					
					
					var alertPopup = popup.alert('결제완료!',paylist.title + ' 결제가 완료되었습니다.');
					alertPopup.then(function(res) {
						$state.go('app.paymentCoupon');
					});

			    });

		// 	}
		// });

	};

	// $scope.check = function() {

	// 	inAppPurchase.consume('inapp', '{\"packageName\":\"kr.co.mounting.app\",\"productId\":\"p_10\",\"purchaseTime\":1479968674033,\"purchaseState\":0,\"purchaseToken\":\"djflffojnhpnhnnpoodacpck.AO-J1OzQUsXVOkLPpYEoEUYATnHkXDZdK6jqee36M0qLGOnkZWg-Aq2CwH6oMdqGJEp-GMCcT6xMGuGpF2IqANG9f-Wc52DB_YEGSLvnDsev2AD4HJNqlrY\"}"}', 'TaU16z4dV2vBmD+E0vx7ThqtjMi1rFITqJwnqmoYePikCHhcc8AAQEWf/1qwbi9CoLctqRS8eSQtI14dYKXdzELQ7c+AHsmq9R6sHc7nLV3ljYPC6C7jbSrrCJnVtN6AqVH7DUzRTqteq6iIDtmrkaZ9WLNZUHG0pp9vpKHcwQK4tUQQ/EzMWKQ+HbP7TEV6OZ62rQJZ6u398x3dFsdChxVJNxb7CQZz6xwJRAcZogJeVhEy8eFL5UlBTsCM40CM+ygaPNBYbwK41eF0IrgKUTjVM2RO3xQWMLE/A5pU2HDKYSVHnCmZTxBNvd4E7PjvOLJBIfTPiuRkfspKnC7oJA==');	
	// }
	

	var productIds = ['n1','n2','n3','p1','p2','p3'];

	var spinner = '<ion-spinner icon="dots" class="spinner-stable"></ion-spinner><br/>';

	$scope.loadProducts = function () {
		$ionicLoading.show();
	    // $ionicLoading.show({ template: spinner + 'Loading Products...' });
	    inAppPurchase
	      .getProducts(productIds)
	      .then(function (products) {
	        $ionicLoading.hide();

        	$scope.products = products;

        	$scope.restore();
	        // console.log(products);
	      })
	      .catch(function (err) {
	        $ionicLoading.hide();
	        console.log(err);
	      });
	};

	$scope.buy = function (productId,price) {

		LogService.Insert({ msg: 'buy click!!', f_1: 'buy start-android'});

	    $ionicLoading.show();
	    inAppPurchase
	      .buy(productId)
	      .then(function (data) {

	      	LogService.Insert({ msg: data, f_1: 'buy then-android'});

			$scope.buyProcess(productId, price, data);

			$ionicLoading.hide();

	        return inAppPurchase.consume(data.type, data.receipt, data.signature);
	      })
	      .catch(function (err) {

	      	LogService.Insert({ msg: err, f_1: 'controllers.buy.catch-android'});

	        $ionicLoading.hide();

	        if (window.cordova) {
				if ($scope.isAndroid) {
					if (err.code == -9) {
			        	popup.alert('이미 구매한 항목','항목을 구입할 수 없습니다.');	
			        } else if (err.code == -5) {
			        	popup.alert('결제 취소','사용자 취소');
			        } else {
			        	popup.alert(err.message,err.text);
			        }
				}

				if ($scope.isIOS || $scope.isIPad) {
					popup.alert('알림', err.errorMessage);
				}
		    }
	        
	      });

	};

	$scope.restore = function () {
	    // $ionicLoading.show({ template: spinner + 'Restoring Purchases...' });
	    inAppPurchase
	      .restorePurchases()
	      .then(function (purchases) {
	      	// console.log('restore then');
	        $ionicLoading.hide();

	        LogService.Insert({ msg: JSON.stringify(purchases), f_1: 'controllers.restore-android'});
	        
	        // LogService.insert({title:'controllers.restore', content: purchases});

	        purchases.forEach(function (data, k) {
	        	// console.log(data);
	        	inAppPurchase.consume(data.type, data.receipt, data.signature);
	        });

	        // console.log(JSON.stringify(purchases));
	        // $ionicPopup.alert({
	        //   title: 'Restore was successful!',
	        //   template: 'Check your console log for the restored purchases data'
	        // });
	      })
		.catch(function (err) {

			LogService.Insert({ msg: err, f_1: 'controllers.restore.catch-android'});
			
			// LogService.insert({title:'controllers.restore.catch', content: err});

			// console.log('restore error');
	        $ionicLoading.hide();
	        // console.log(err);
	        // $ionicPopup.alert({
	        //   title: 'Something went wrong',
	        //   template: 'Check your console log for the error details'
	        // });
		});
	};	
	
})

.directive('a', function() {
	return {
		restrict: 'E',
		link: function(scope, elem, attrs) {
			if(attrs.ngClick || attrs.href === '' || attrs.href === '#'){
				elem.on('click', function(e){
					e.preventDefault();
				});
			}
		}
	};
})


;
