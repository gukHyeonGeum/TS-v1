angular.module('starter.controllers')

	.controller('salebookingCtrl', function() {
	})

	.controller('salebookingListsCtrl', function(
		$rootScope, 
		$scope,
		$state,
		$ionicModal, 
		$http, 
		$ionicLoading,
		$stateParams, 
		$ionicSideMenuDelegate,
		$ionicScrollDelegate, 
		$filter,
		$timeout, 
		$cordovaSocialSharing,
		SocialShare, 
		InAppBrowser, 
		popup, 
		Auth,
		InviteService,
		BookingService
	) {

		$scope.Params = $stateParams;

		var limit = 0;
		var offset = 0;
		var overlap = false;
		var post_id = '';

		$scope.$on('$ionicView.enter', function() {
			$ionicSideMenuDelegate.canDragContent(false);
		});

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			var day = new Date();//97

			$scope.DateList = [];

			for(var i=1; i<=30; i++) {
				var newDay = day.setDate(day.getDate() + 1);

				$scope.DateList.push({ date: new Date(newDay) });
			}

			// 푸시으로 들어왔을시 필드번호 값 지정
			// $scope.Params = {fieldId: '2505', article_type: 'sponsor_invite'};
			if ($scope.Params.article_type) {
				$timeout(function() {
					$scope.openModal(9, { id: $scope.Params.fieldId });
				}, 500);
			}

			if (offset) limit = offset + 20;
			else limit = 20;

			$scope.b_date = '';
			$scope.b_sst = '';
			$scope.b_sod = false;

			$scope.nodeList(limit, 0, 1);
		});

		$scope.nodeList = function(nlimit, offset, type) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if ($state.current.name == 'app.saleBookingTabs.request') {
				if (type) BookingService.getRsvps({ limit:nlimit, offset:offset, inviteType: 6 }, $scope.loadList);
				else BookingService.getRsvps({ limit:nlimit, offset:offset, inviteType: 6 }, $scope.loadListScroll);
			} else {
				
				if (!$scope.b_date)
					$scope.b_date = $filter('f_formatdate')($scope.DateList[0].date, 97);

				var sod = $scope.b_sod ? "ASC" : "DESC";

				if ($state.current.name == 'app.saleBookingTabs.invite') {
					var invite = '';
				} else {
					var invite = 6;
				}

				if (type) BookingService.getLists({ limit:nlimit, offset:offset, inviteType: invite, bookingDate: $scope.b_date, bookingSst: $scope.b_sst, bookingSod: sod, bookingOpen: '', active: 6 }, $scope.loadList);
				else BookingService.getLists({ limit:nlimit, offset:offset, inviteType: invite, bookingDate: $scope.b_date, bookingSst: $scope.b_sst, bookingSod: sod, bookingOpen: '', active: 6 }, $scope.loadListScroll);
			}
		};

		$scope.loadList = function(obj) {
			// console.log(obj);
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


		// 부킹 등록
		$scope.golfPosts = function() {

			if ($rootScope.me.level != 6) {
				var managerPopup = popup.confirm('알림','<div class="text-center margin-top margin-bottom">부킹 매니저로 승인 후 등록 가능합니다.</div>','매니저등록신청','취소');
				managerPopup.then(function(res) {
					if (res) {
						$state.go('app.manager.request');
					}
				});

				return;
			}

			$scope.openModal(3,'');
		};

		$scope.postsOpen = function(item) {
			$scope.form	= {};
			$scope.view = {};

			post_id = item;
		
			if(post_id) {//수정일 경우 현재 등록된 내용을 다시 불러 온다.

				$scope.view.title = '수정하기';

				BookingService.getOne(
					{
						id: post_id,
						booking_id: ''
					}, 
					function(obj) {

						// console.log(obj);

						$scope.form.post_id		= post_id;
						$scope.form.clubRegion	= obj.club_region.toString();
						$scope.set_clubs(obj.golf_club_id);
						// $scope.club_info(obj.golf_club_id);
						
						
						$scope.form.bookingDate	= $filter('s_date')(obj.golf_time);
						$scope.form.bookingDateTime	= $filter('s_date')(obj.golf_time);
					
	
						$scope.form.partners	= obj.booking_people;
						$scope.form.green_fee	= obj.green_fee;
						$scope.form.message		= obj.message;

						for (var i = 0; i < $scope.arrayBookingOption.length; i++) {
							if (obj.booking_option&Math.pow(2, i)) {
								if (i == 0) $scope.form.cart = true;
								if (i == 1) $scope.form.meal = true;
								if (i == 2) $scope.form.caddie = true;
							}
						}
					}
				);
						
			} else {//수정이 아닐 경우 초기화 시킨다.
				$scope.view.title = '등록';
				$scope.form.cart = false;
				$scope.form.meal = false;
				$scope.form.caddie = false;
			}

			// $timeout(function() {
			//  	viewScroll.scrollTop();
			// }, 0);
		};


		//등록하기
		$scope.submitregistForm = function(isValid) {

			if (isValid.$valid) {

				if (overlap) return false;

				if (!$scope.form.clubRegion) {
					popup.alert('오류','골프장 지역 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.clubName) {
					popup.alert('오류','골프장 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.bookingDate) {
					popup.alert('오류','초청하는 날짜 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.bookingDateTime) {
					popup.alert('오류','초청하는 시간 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.partners) {
					popup.alert('오류','초청인원 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}

				if (!$scope.form.green_fee) {
					popup.alert('오류','그린피 할인비용 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}

				if (!$scope.form.message) {
					$scope.form.message = '';
				}

				$scope.form.option = 0;

				if ($scope.form.cart) {
					$scope.form.option += 1;
				}
				if ($scope.form.meal) {
					$scope.form.option += 2;
				}
				if ($scope.form.caddie) {
					$scope.form.option += 4;
				}

				var bookingDate	= $filter('date')($scope.form.bookingDate, "yyyy/MM/dd");
				var bookingHour	= $filter('date')($scope.form.bookingDateTime, "HH:mm");
				
				//입력된 시간의 유효성 시작
				var today = new Date();
				var todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);
				var dateChk = new Date($scope.form.bookingDate);

				var interval = dateChk - todayZero;
				
				if(interval < 0) {
					popup.alert('오류', $filter('f_formatdate')(todayZero, 96) + '일 이후로 등록 가능합니다.');
					return;
				}
				//입력된 시간 유효성 끝

				var obj = {
					golf_invite_type: 6,
					club_name: $scope.form.clubName, 
					date: bookingDate, 
					hour: bookingHour, 
					booking_people: $scope.form.partners, 
					green_fee: $scope.form.green_fee, 
					message: $scope.form.message,
					booking_option: $scope.form.option,
					golf_companion: 0, 
					partners: 0, 
					filter_sex: 0, 
					filter_s_age: 0, 
					filter_e_age: 0, 
					cart_fee: 0, 
					caddie_fee: 0
				};

				overlap = true;
							
				if($scope.form.post_id) {
					var url = apiServer + 'fields/update/'+$scope.form.post_id+'?token=' + localStorage.getItem('authToken');
					var msg = "할인부킹이 수정되었습니다.";
				} else {
					var url = apiServer + 'fields/create?token=' + localStorage.getItem('authToken');
					var msg = "할인부킹이 등록되었습니다.";
				}
				
				$ionicLoading.show();

				$http({
					method: 'post',
					url: url,
					data: obj,
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				}).then(function(response) {
					if(response.data.success) {
						overlap = false;

						popup.alert('알림', msg);

						$scope.dateView($scope.form.bookingDate);
						
						// $scope.doRefresh();
						if($scope.form.post_id) $scope.get_field({id: $scope.form.post_id});

						$scope.closeModal(3);
					} else {
						overlap = false;

						var error = response.data.errors ? response.data.errors : '다시 시도해 주세요';
						popup.alert('DB 등록실패',error);
					}
				},function(error){
					overlap = false;
					popup.alert('오류','통신 오류가 발생하였습니다. 다시시도 하시기 바랍니다.');

					$ionicLoading.hide();
				}).finally(function() {
					$ionicLoading.hide();
				});

			} else {
				popup.alert('등록오류','정보가 넘어오지 않았습니다. <br />다시 시도하시기 바랍니다.');
				return;
			}

		};

		/**
		 * 날짜별 리스트
		 */
		$scope.dateView = function(date) {
			$ionicLoading.show();
			$scope.b_date = $filter('f_formatdate')(date, 97);
			$scope.nodeList(20, 0, 1);
		};

		/**
		 * 정렬
		 */
		 $scope.bookingSort = function(type) {
		 	if (type == $scope.b_sst) {
		 		$scope.b_sod = !$scope.b_sod;
		 	} else {
		 		$scope.b_sod = false;
		 	}

		 	$scope.b_sst = type;
		 	$scope.nodeList(20, 0, 1);
		 };

		/**
		 * 예약하기
		 */
		$scope.reservation = function(item) {
			// console.log(item);

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			var confirmPopup = popup.confirm('부킹예약', '<div><div class="bold">[부킹내용]</div><ul><li> ▶ '+ item.golf_club_name +'</li><li> ▶ '+ $filter('f_golfdate')(item.golf_time) +'</li><li> ▶ '+ $filter('numberformat')(item.green_fee) +'원</li><li> ▶ '+ item.booking_people +'인</li><div class="margin-top margin-bottom bold">[예약자 : '+ $rootScope.me.profile.realname +' '+ $filter('phoneNumber')($rootScope.me.profile.phone) +']</div><div class="margin-top margin-bottom bold text-center">부킹 예약하시겠습니까?</div>');
			confirmPopup.then(function(res) {
				if (res) {

					$http({
						method: 'post',
						url: apiServer + 'fields/rsvp/store?token=' + localStorage.getItem('authToken'),
						data: {
							poster: $rootScope.me.username, 
							poster_id: $rootScope.me.id, 
							field_id: item.id,
							gender: '',
							message: ''
						},
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						var obj	= response.data;

						if(obj.success){
							popup.alert('예약 완료', '<div class="text-center"><div class="margin-top20 margin-bottom20 bold font16">예약 완료되었습니다.</div><div class="assertive margin-bottom20">★ 매니저에게서 확정문자를 받아야만<br />부킹확정이 됩니다.</div></div>');
							$scope.get_field({id: item.id});
							$scope.doRefresh();
						} else {
							popup.alert('신청실패', obj.message);
							return;
						}
					},function(error){
						$ionicLoading.hide();
					}).finally(function() {
						$ionicLoading.hide();
					});

				}
			})
		};

		/**
		 * 부킹조인
		 */
		$scope.bookingJoin = function(item) {
			// console.log(item);

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			var confirmPopup = popup.confirm('조인 등록', '<div><div class="bold">[부킹내용]</div><ul><li> · '+ item.golf_club_name +'</li><li> · '+ $filter('f_golfdate')(item.golf_time) +'</li><li> · '+ $filter('numberformat')(item.green_fee) +'원</li><li>· '+ item.booking_people +'인</li><div class="margin-top margin-bottom bold text-center">조인 등록하시겠습니까?</div>');
			confirmPopup.then(function(res) {
				if (res) {
					$state.go('app.bookingJoin.lists', { joinChk: true, joinInfo: item });
				}
			});
		};

		/**
		 * 수정하기
		 */
		$scope.modify = function(item) {
			$scope.openModal(3, item.id);
		};

		/**
		 * 마감하기
		 */
		$scope.finish = function(item) {

			if (item.deleted_at) {
				popup.alert('알림','<p class="text-center padding">이미 부킹 마감 하셨습니다.</p>');
				return;
			}

			var confirmPopup = popup.confirm('부킹 마감','<div class="text-center"><p>마감후, <span class="assertive">활동정보</span>에서 열람가능합니다.</p><div class="margin-top margin-bottom bold text-center">마감하시겠습니까?</div></div>');
			
			confirmPopup.then(function(res) {
				 if(res) {//실행
					$ionicLoading.show();
					$http.get(apiServer + 'fields/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
						.then(function(response) {
								// loadGolfList();
								$scope.doRefresh();
								$scope.closeModal(9);
							},function(error){
								$ionicLoading.hide();
							}
						).finally(function() {
							$ionicLoading.hide();
							if ($scope.modalMenu) $scope.modalMenu.hide();
						}
					);
				}
			});
		};

		/**
		 * 부킹 예약확정
		 */
		$scope.bookingConfirm = function(item, rsvp) {

			$scope.selection = [rsvp.id];

			var confirmPopup = popup.confirm('부킹확정', '<div><div class="bold">[부킹내용]</div><ul><li> ▶ '+ item.golf_club_name +'</li><li> ▶ '+ $filter('f_golfdate')(item.golf_time) +'</li><li> ▶ '+ $filter('numberformat')(item.green_fee) +'원</li><li> ▶ '+ item.booking_people +'인</li><div class="margin-top margin-bottom bold">[예약자 : '+ rsvp.realname +' '+ $filter('phoneNumber')(rsvp.phone) +']</div><div class="margin-top margin-bottom bold text-center">부킹 확정하시겠습니까?</div>');
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();

					$http({
						method: 'post',
						url: apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken'),
						// method: 'get',
						// url: apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken') + '&field_id=' + item.id + '&golf_partner=' + item.golf_partner + '&invite_count=' + $scope.field.invite_count + '&selection=' + $scope.selection + addstr,
						data: {
							field_id: item.id,
							golf_partner: '',
							invite_count: 1,
							ids: $scope.selection
						},
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {

							if (response.data.success) {

								// popup.alert('부킹확정 통지','<div class="text-center bold margin-top margin-bottom20">예약자에게 "부킹확정"이 통지됩니다.</div><div class="margin-bottom20 text-center assertive">※ 부킹타임 노쇼와 취소시한에 대하여<br />확실하게 숙지시켜 주시기 바랍니다.</div>');

								$scope.get_field({id: item.id});

								$scope.nodeList($scope.lists.length, 0, 1);
								
								$ionicLoading.hide();
								$scope.selection = [];

							} else {
								popup.alert('오류',response.data.message);
							}
							
						},function(error){
							popup.alert('알림','부킹 확정 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
							$ionicLoading.hide();
						}).finally(function() {
							$ionicLoading.hide();
						});
				} else {
					return;
				}
			});

		};

		/**
		 * 부킹 예약 취소
		 */
		 $scope.bookingCancel = function(item, rsvp) {
		 	var confirmPopup = popup.confirm('부킹 취소','<div class="text-center bold margin-top margin-bottom20">정말로 부킹을 취소하시겠습니까?</div>');
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					$http.get(apiServer + 'fields/rsvps/delete/?id='+rsvp.id+'&token=' + localStorage.getItem('authToken'))
						.then(function(response) {
							// console.log(response);
							if (response.data.success) {
								popup.alert('알림','<div class="text-center bold margin-top margin-bottom20">부킹이 취소되었습니다.</div>');
								$scope.get_field({id: item.id});
								$scope.doRefresh();
							} else {
								popup.alert('오류',response.data.message);
							}
						},function(error){
							popup.alert('알림','취소 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
							$ionicLoading.hide();
						}).finally(function() {
							$ionicLoading.hide();
						});
				}
			});
		 };

		/**
		 * 클럽리스트 불러오기
		 */
		$scope.set_clubs = function(sel){
			if ($scope.form.clubRegion) {
				$ionicLoading.show();
				BookingService.getClub({ region: $scope.form.clubRegion }, function(obj){ 
					$scope.clubs = obj;
					if(sel) $scope.form.clubName = sel;
				});
			}
		};

		/**
		 * 클럽 선택 정보
		 */
		// $scope.club_info = function(id) {
		// 	BookingService.getClubOne(
		// 		{
		// 			id: id
		// 		}, 
		// 		function(obj) {
		// 			$scope.form.green_fee_orignal = obj.weekend_fee;
		// 		}
		// 	);
		// };

		/**
		 * 상세보기
		 */
		$scope.get_field = function(item) {

			$scope.fieldInfo = '';

			BookingService.getOne(
				{
					id: item.id,
					booking_id: ''
				}, 
				function(obj) {

					// console.log(obj);

					obj.bookingjoincnt = item.bookingjoincnt;

					obj.bOption = '';

					for (var i = 0; i < $scope.arrayBookingOption.length; i++) {
						if (obj.booking_option&Math.pow(2, i)) {
							if (obj.bOption) obj.bOption += ', ';
							obj.bOption += $scope.arrayBookingOption[i];
						}
					}

					obj.cancelMsg = '';

					// if (obj.cancel_chk) {
					// 	obj.cancelMsg = '취소가능시한 : ' + $filter('f_formatdate')(obj.cancel_time,98) + '까지';
					// } else {
					// 	obj.cancelMsg = '이 부킹건은 예약 후, 취소할 수 없습니다.';
					// }

					$scope.fieldInfo	= obj;
				}
			);
			
		};

		/**
		 * 조인중인 골프조인으로 이동
		 */
		$scope.golfjoinMove = function(item) {
			$scope.closeModal(9);
			$state.go('app.bookingJoin.lists', {article_type: true, fieldId: item.booking_id});
		};

		/**
		 * 부킹조인 완료
		 */
		$scope.bookingComplete = function(item) {

			var confirmPopup = popup.confirm('부킹완료','<div class="text-center bold margin-bottom20">부킹완료 하시겠습니까?</div><div class="text-center">부킹완료시 더이상 부킹 예약이 진행되지 않으며<br />상태가 부킹완료로 변경됩니다.</div>');
			confirmPopup.then(function(res) {
				if(res) {
					if (item.booking_id) {
						var booking_id = item.booking_id;
					} else {
						var booking_id = '';
					}

					BookingService.putComplete(
						{
							id: item.id,
							booking_id: booking_id
						}, 
						function(obj) {
							$scope.get_field({id: item.id});
							$scope.nodeList($scope.lists.length, 0, 1);
						}
					);
				}
			});
		};

		$scope.share = function(item) {
			var message = '[티샷 부킹] ' + item.golf_club_name + ' \r\n' + $filter('f_golfdate')(item.golf_time) +' \r\n' + $filter('numberformat')(item.green_fee) + '원 ('+ item.bOption +') \r\n'+ item.booking_people +'인 \r\n매니저 ' + item.realname + ' ' + item.phone +
			'\r\n\r\n\r\n[티샷 앱 다운]' +
			'\r\n\r\n다운로드 : http://localhost';

			$cordovaSocialSharing
			.share(message, '', '', '')
			.then(function(result) {
			}, function(err) {
			});
		};

		$scope.shareSms = function(item) {
			var message = '[티샷 부킹] ' + item.golf_club_name + ' \r\n' + $filter('f_golfdate')(item.golf_time) +' \r\n' + $filter('numberformat')(item.green_fee) + '원\r\n문의합니다.';

			$cordovaSocialSharing
			.shareViaSMS(message, item.phone)
			.then(function(result) {
			}, function(err) {
			});
		};

		$scope.sharekakaotalk = function(item) {
			var message = '[티샷 부킹] ' + item.golf_club_name + ' \r\n' + $filter('f_golfdate')(item.golf_time) +' \r\n' + $filter('numberformat')(item.green_fee) + '원 ('+ item.bOption +') \r\n'+ item.booking_people +'인 \r\n매니저 ' + item.realname + ' ' + item.phone +
			'\r\n\r\n\r\n[티샷 앱 다운]' +
			'\r\n\r\n다운로드 : http://localhost';
			var obj = {"title": message, "url": webServer, "img": 'http://localhost/images/main/sns_1st.png'};
			SocialShare.share('kakaotalk', obj);
		};

		$scope.openInAppBrowser = function(url, target) {
			InAppBrowser(url, target);
		};

		$scope.infoLink = function() {

			$scope.toggleSubmenu(1);
			$state.go('app.saleBookingTabs.invite');
		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			if (item.poster_id) item.user_id = item.poster_id;
			else item.user_id = item.id;

			if (item.poster) item.username = item.poster;

			$scope.openProfile(item);
		};


		var ConfirmPopup = '';

		$scope.$on('$stateChangeStart', function() {
			if($scope.modalMenu) $scope.modalMenu.hide();
			if($scope.shareModal) $scope.shareModal.hide();
			if($scope.PostModal) $scope.PostModal.hide();
			if($scope.CommentModal) $scope.CommentModal.hide();
			if($scope.CommentMenuModal) $scope.CommentMenuModal.hide();
			if($scope.ReCommentModal) $scope.ReCommentModal.hide();
			if($scope.ReCommentMenuModal) $scope.ReCommentMenuModal.hide();
			if($scope.PartnerListModal) $scope.PartnerListModal.hide();
			if($scope.DetailInfoModal) $scope.DetailInfoModal.hide();
			if(ConfirmPopup) ConfirmPopup.close();
		});
		
		$scope.openModal = function(index,item) {
			$scope.shareItem = item;
			if (index == 1) {
				$ionicModal.fromTemplateUrl('templates/modal/golf-list-menu.html', {
					id: '1',
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.modalMenu = modal;
					$scope.modalMenu.show();
				});
			} else if (index == 2) {
				$ionicModal.fromTemplateUrl('templates/modal/golf-list-share.html', {
					id: '2',
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.shareModal = modal;
					$scope.shareModal.show();
				});
			} else if (index == 3) {

				if (!$rootScope.me.profile.phone) {
					$scope.phoneCertCheck();
					return;
				}

				$scope.postsOpen(item);

				$ionicModal.fromTemplateUrl('templates/modal/salebooking/posts.html', {
					id: '3',
					scope: $scope
				}).then(function(modal) {
					$scope.PostModal = modal;
					$scope.PostModal.show();
				});

			} else if (index == 4) {
				$scope.get_comment(item);

				$ionicModal.fromTemplateUrl('templates/modal/invite/comment.html', {
					id: '4',
					scope: $scope
				}).then(function(modal) {
					$scope.CommentModal = modal;
					$scope.CommentModal.show();
				});
			} else if (index == 5) {
				$ionicModal.fromTemplateUrl('templates/modal/invite/comment-list-menu.html', {
					id: '5',
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.CommentMenuModal = modal;
					$scope.CommentMenuModal.show();
				});
			} else if (index == 6) {
				$scope.get_recomment(item)

				$ionicModal.fromTemplateUrl('templates/modal/invite/recomment.html', {
					id: '6',
					scope: $scope,
					animation: 'fade-in-right'
				}).then(function(modal) {
					$scope.ReCommentModal = modal;
					$scope.ReCommentModal.show();
				});
			} else if (index == 7) {
				$ionicModal.fromTemplateUrl('templates/modal/invite/recomment-list-menu.html', {
					id: '7',
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.ReCommentMenuModal = modal;
					$scope.ReCommentMenuModal.show();
				});
			} else if (index == 8) {
				$scope.get_partner(item);

				$ionicModal.fromTemplateUrl('templates/modal/invite/partner-list.html', {
					id: '8',
					scope: $scope
				}).then(function(modal) {
					$scope.PartnerListModal = modal;

					$scope.PartnerListModal.show();
				});
			} else if (index == 9) {
				$scope.get_field(item);

				$ionicModal.fromTemplateUrl('templates/modal/salebooking/detail-info.html', {
					id: '9',
					scope: $scope
				}).then(function(modal) {
					$scope.DetailInfoModal = modal;
					$scope.DetailInfoModal.show();
				});
			}
		};

		$scope.closeModal = function(index,item) {
			if (index == 1) {
				$scope.modalMenu.hide();
				$scope.modalMenu.remove();
			} else if (index == 2) {
				$scope.shareModal.hide();
				$scope.shareModal.remove();
			} else if (index == 3) {
				$scope.PostModal.hide();
				$scope.PostModal.remove();
			} else if (index == 4) {
				$scope.CommentModal.hide();
				$scope.CommentModal.remove();
			} else if (index == 5) {
				$scope.CommentMenuModal.hide();
				$scope.CommentMenuModal.remove();
			} else if (index == 6) {
				$scope.ReCommentModal.hide();
				$scope.ReCommentModal.remove();
			} else if (index == 7) {
				$scope.ReCommentMenuModal.hide();
				$scope.ReCommentMenuModal.remove();
			} else if (index == 8) {
				$scope.PartnerListModal.hide();
				$scope.PartnerListModal.remove();
			} else if (index == 9) {
				$scope.DetailInfoModal.hide();
				$scope.DetailInfoModal.remove();
			}
		};

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if($scope.modalMenu) $scope.modalMenu.remove();
			if($scope.shareModal) $scope.shareModal.remove();
			if($scope.PostModal) $scope.PostModal.remove();
			if($scope.CommentModal) $scope.CommentModal.remove();
			if($scope.CommentMenuModal) $scope.CommentMenuModal.remove();
			if($scope.ReCommentModal) $scope.ReCommentModal.remove();
			if($scope.ReCommentMenuModal) $scope.ReCommentMenuModal.remove();
			if($scope.PartnerListModal) $scope.PartnerListModal.remove();
			if($scope.DetailInfoModal) $scope.DetailInfoModal.remove();
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

	.controller('bookingListsCtrl', function(
		$rootScope, 
		$scope,
		$state,
		$ionicModal, 
		$http, 
		$ionicLoading,
		$stateParams, 
		$ionicSideMenuDelegate,
		$ionicScrollDelegate, 
		$filter,
		$timeout, 
		InAppBrowser, 
		popup, 
		Auth,
		InviteService,
		BookingService,
		CompareService,
		NewBookingService,
		badgeService,
		GolfcubeService
	) {

		$scope.Params = $stateParams;



		var limit = 0;
		var offset = 0;

		var timeScroll = $ionicScrollDelegate.$getByHandle('bookingTimeScroll');
		var dateScroll = $ionicScrollDelegate.$getByHandle('bookingDateScroll');

		$scope.$on('$ionicView.enter', function() {
			$ionicSideMenuDelegate.canDragContent(false);
		});

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			var day = new Date();//97

			// if (day.getHours() >= 17) {
			// 	day.setDate(day.getDate() + 1);
			// }

			$scope.DateList = [];

			for(var i=1; i<=21; i++) {
				var newDay = day.setDate(day.getDate() + 1);
				$scope.DateList.push({ date: new Date(newDay) });
			}

			// 푸시으로 들어왔을시 필드번호 값 지정
			// $scope.Params = {fieldId: '2505', article_type: 'sponsor_invite'};
			if ($scope.Params.article_type) {
				$timeout(function() {
					$scope.openModal(1, { id: $scope.Params.fieldId });
				}, 500);
			}

			if (offset) limit = offset + 20;
			else limit = 20;

			$scope.b_date = '';
			$scope.b_sst = '';
			$scope.b_sod = false;
			$scope.clubRegion = '';
			$scope.clubName = '';
			$scope.clubs = {};

			$scope.nodeList(limit, 0, 1);
		});

		$scope.nodeList = function(nlimit, offset, type) {
			// $ionicLoading.show();
			$scope.hasMoreData = true;
			if (!offset) offset = 0;

			if ($state.current.name == 'app.bookingTabs.invite') {
				if (type) NewBookingService.getReservationLists({ limit:nlimit, offset:offset, tabs: 1 }, $scope.loadList);
				else NewBookingService.getReservationLists({ limit:nlimit, offset:offset, tabs: 1 }, $scope.loadListScroll);
			} else if ($state.current.name == 'app.bookingTabs.request') {
				if (type) NewBookingService.getReservationLists({ limit:nlimit, offset:offset, tabs: 0 }, $scope.loadList);
				else NewBookingService.getReservationLists({ limit:nlimit, offset:offset, tabs: 0 }, $scope.loadListScroll);
			} else {

				var sod = $scope.b_sod ? "ASC" : "DESC";

				// if (!$scope.b_date)
				// 	$scope.b_date = $filter('f_formatdate')($scope.DateList[0].date, 97);

				if (type) NewBookingService.getLists({ limit:nlimit, offset:offset, compareDate:$scope.b_date, compareSst:$scope.b_sst, compareSod:sod, compareLoc: $scope.clubRegion, compareClub: $scope.clubName, type: 0 }, $scope.loadList);
				else NewBookingService.getLists({ limit:nlimit, offset:offset, compareDate:$scope.b_date, compareSst:$scope.b_sst, compareSod:sod, compareLoc: $scope.clubRegion, compareClub: $scope.clubName, type: 0 }, $scope.loadListScroll);
			}
		};

		$scope.loadList = function(obj) {
			// console.log(obj);
			$scope.lists = obj.list;
			$scope.bookingCnt = { clubcnt: obj.clubcnt, totalcnt: obj.totalcnt};
			$scope.hasMoreData = false;

			timeScroll.scrollTop();

			// $ionicScrollDelegate.resize();
			// $ionicScrollDelegate.scrollTop();

			$ionicLoading.hide();
		};

		$scope.loadListScroll = function(obj) {
			$scope.lists = $scope.lists.concat(obj.list);
			$ionicScrollDelegate.resize();
			if (obj.list.length < 20) $scope.hasMoreData = true;
			else $scope.hasMoreData = false;
			$ionicLoading.hide();
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

		/**
		 * 날짜별 리스트
		 */
		$scope.dateView = function(date) {
			$ionicLoading.show();
			$scope.b_date = $filter('f_formatdate')(date, 97);
			$scope.nodeList(20, 0, 1);
		};

		/**
		 * 부킹 지역
		 */
		 $scope.location = function(val) {
		 	$scope.clubRegion = val;
		 	$scope.nodeList(20, 0, 1);	
		 };

		/**
		 * 정렬
		 */
		 $scope.compareSort = function(type) {
		 	if (type == $scope.b_sst) {
		 		$scope.b_sod = !$scope.b_sod;
		 	} else {
		 		$scope.b_sod = false;
		 	}

		 	$scope.b_sst = type;
		 	$scope.nodeList(20, 0, 1);
		 };

		 /**
		 * 클럽리스트 불러오기
		 */
		$scope.set_clubs = function(sel){
			if ($scope.clubRegion) {
				$ionicLoading.show();
				CompareService.getClub({ region: $scope.clubRegion }, function(obj){ 
					$scope.clubs = obj;
					if(sel) $scope.clubName = sel;
				});
				$scope.nodeList(20, 0, 1);
			}
		};

		// 골프타임 리스트
		$scope.get_field = function(item, date, type) {
			if (type) $ionicLoading.show();

			if (!date) {
				$scope.b_date = $filter('f_formatdate')($scope.DateList[0].date, 97);
			} else {
				$scope.b_date = $filter('f_formatdate')(date, 97);
				$scope.dateView(date);
			}

			var day = $filter('BetweenDay')($filter('f_formatdate')($scope.b_date, 'date'), 'day');
			if (day > 5) day = day + 1;

			NewBookingService.getOne({ id: item.id, golf_time: $scope.b_date }, function(obj){ 
				$scope.bookingInfo = obj;

				$timeout(function(){
		            timeScroll.scrollTop();
		            dateScroll.scrollTo(day*50);
		        }, 0);

				if (obj.lists.length == $scope.bookingInfo.lists.length) {
					$ionicLoading.hide();
				} else {
					$timeout(function(){
			            $ionicLoading.hide();
			        }, 3000);
				}

			});

		};

		// 골프타임 상세보기 
		$scope.view_reservation = function(item, type) {

			NewBookingService.getInfo({ id: item.id, type: type }, function(obj){ 

				if (type) {

					if (obj.deleted_at) {
						popup.alert('알림','<div class="text-center padding">이미 마감 된 타임입니다.</div>');
						if (type) $scope.closeModal(2);
						else  $scope.closeModal(3);
						return;
					}

					$scope.reservationInfo = obj;
					$scope.reservationInfo.reqPeople = 4;

					$scope.payForm = {
						'CASH_GB': 'CN',
						'CN_SVCID': '180419053346',
						'PAY_MODE': '10',
						'Prdtprice': parseInt($scope.reservationInfo.green_fee * $scope.reservationInfo.reqPeople),
						'Tradeid': 'TEESHOT-180419053346_' + $filter('appr_dtm')(),
						'Prdtnm': $scope.reservationInfo.name,
						'Siteurl': 'teeshot.co.kr',
						'Userid': $rootScope.me.id,
						'Notiurl': 'http://localhost/page/payment/noti',
						'Okurl': 'http://localhost/page/payment/okv1',
						'Closeurl': 'teeshotapp://',
						'RA_SVCID': '180419053352',
						'LOGO_YN': 'N',
						'CALL_TYPE': 'SELF',
						'MC_SVCID': '150305820001'
					};

				} else {
					$scope.reservationInfo = obj;
					$scope.reservationInfo.reqPeople = item.people;

					if ($scope.reservationInfo.refund_text) {
						var refund = $scope.reservationInfo.refund_text.split('|');

						if (refund.length) {
							var refund_week = refund[0].split(':');
							var refund_weekend = refund[1].split(':');
							$scope.reservationInfo.week = refund_week;
							$scope.reservationInfo.weekend = refund_weekend;
						}
					}
				}

			});
		};


		/**
		 * 예약하기
		 */
		$scope.reservation = function(item) {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if (!$scope.payForm.agreement) {
				popup.alert('확인','<div class="text-center margin-top20 margin-bottom20">위약규정 및 개인정보 제3자제공 동의에<br />체크해주세요.</div>');
				return;
			}

			$ionicLoading.show();

			$http.post(apiServer + 'booking/use/'+ item.id + '?token=' + localStorage.getItem('authToken'))
				.then(function(response) {

					console.log(response);
					if (response.data.success) {


						var cancel_day2 = $filter('BetweenDay')(item.golf_time, "canceled_time", item.w_2);
						var dayCount = $filter('BetweenDay')($filter('f_formatdate')(cancel_day2, 'date'), 'dayCount');

						if (dayCount >= 0) {
							var confirmPopup = popup.confirm('예약하기', '<div class="margin-top20 margin-bottom20 text-center"><div class="margin-top assertive">★ 주 의 ★</div><div class="margin-top margin-bottom">선택하신 부킹타임은 <u>취소가능 시한이 지나서</u><br />예약시 취소가 불가하니, 신중한 예약을 부탁드립니다.</div><div class="margin-top margin-bottom">골프장 예약을 진행하시겠습니까?</div></div>');
						} else {
							var confirmPopup = popup.confirm('예약하기', '<div class="margin-top20 margin-bottom20 text-center">골프장을 예약하시겠습니까?</div>');
						}

						confirmPopup.then(function(res) {
							if (res) {

								$ionicLoading.show();

								var price = item.green_fee * item.reqPeople;
								var cancel_day = $filter('f_formatdate')($filter('BetweenDay')(item.golf_time, "canceled_time", item.w_2), 'date');
								var refund_text = item.w_1+':'+item.w_2+':'+item.w_3+'|'+item.w_4+':'+item.w_5+':'+item.w_6;
								var random = Math.floor(Math.random()*10000);
								var datenum = $filter('f_formatdate')(new Date(), 'YmdHis');
								var randnum = $filter('Zeros')(random, 4);
								var id = item.id;

								$http({
									method: 'post',
									url: apiServer + 'booking/store?token=' + localStorage.getItem('authToken'),
									data: {
										serialnum: datenum + randnum,
										transaction_id: '',
										user_id: $rootScope.me.id,
										golf_club_id: item.golf_club_id, 
										reservation_type: 6,
										item_code: 1,
										payment_division: item.payment,
										golf_time: item.golf_time,
										cancel_day: cancel_day,
										refund_text: refund_text,
										courses: item.courses,
										green_fee: item.green_fee,
										explain: item.explain,
										people: item.reqPeople,
										payment_type: $scope.payForm.CASH_GB,
										payment_price: price,
										status: 1,
										id: id
									},
									headers: {
										'Content-Type' : 'application/json; charset=utf-8'
									}
								}).then(function(response) {
									console.log(response);
									var obj	= response.data;

									if(obj.success){
										var alertPopup = popup.alert('확인','<div class="margin-top20 margin-bottom20 text-center">예약이 완료되었습니다.</div>');
										alertPopup.then(function(res) {
											$state.go('app.bookingTabs.invite');
										});
									} else {
										popup.alert('신청실패', obj.message);
										return;
									}
								},function(error){
									$ionicLoading.hide();
								}).finally(function() {
									$ionicLoading.hide();
								});


								// NewBookingService.Putreservation(
								// 	{ 
								// 		serialnum: datenum + randnum,
								// 		golf_club_id: item.golf_club_id, 
								// 		reservation_type: 6,
								// 		item_code: 1,
								// 		payment_division: item.payment,
								// 		golf_time: item.golf_time,
								// 		cancel_day: cancel_day,
								// 		refund_text: refund_text,
								// 		courses: item.courses,
								// 		green_fee: item.green_fee,
								// 		explain: item.explain,
								// 		people: item.reqPeople,
								// 		payment_type: $scope.payForm.CASH_GB,
								// 		payment_price: price,
								// 		status: 1,
								// 		id: id
								// 	}, 
								// 	function(obj){ 

								// 		var alertPopup = popup.alert('확인','<div class="margin-top20 margin-bottom20 text-center">예약이 완료되었습니다.</div>');
								// 		alertPopup.then(function(res) {
								// 			$state.go('app.bookingTabs.invite');
								// 		});
								// 	}
								// );

							}
						});

					} else {
						popup.alert('알림',response.data.message);
					}
				},function(error){
					popup.alert('알림','예약중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
					$ionicLoading.hide();
				}).finally(function() {
					$ionicLoading.hide();
				});

		};

		// 결제 프로세서
		$scope.insertBooking = function(item) {

			var price = item.green_fee * item.reqPeople;
			var cancel_day = $filter('BetweenDay')(item.golf_time, "canceled_time", item.w_2);
			var refund_text = item.w_1+':'+item.w_2+':'+item.w_3+'|'+item.w_4+':'+item.w_5+':'+item.w_6;
			var random = Math.floor(Math.random()*10000);
			var datenum = $filter('f_formatdate')(new Date(), 'YmdHis');
			var randnum = $filter('Zeros')(random, 4);
			var id = item.id;

			if (item.payment == 1) {
				var status = 5;
			} else {
				var status = 1;
			}

			NewBookingService.Putreservation(
				{ 
					serialnum: datenum + randnum,
					golf_club_id: item.golf_club_id, 
					reservation_type: 6,
					item_code: 1,
					payment_division: item.payment,
					golf_time: item.golf_time,
					cancel_day: cancel_day,
					refund_text: refund_text,
					courses: item.courses,
					green_fee: item.green_fee,
					explain: item.explain,
					people: item.reqPeople,
					payment_type: $scope.payForm.CASH_GB,
					payment_price: price,
					status: status,
					id: id
				}, 
				function(obj){ 

					if (item.payment == 1) {

						$state.go('app.bookingTabs.invite');

						$scope.payProcess(obj.id);

						// $scope.openModal(3, obj);

					} else {

						var alertPopup = popup.alert('확인','<div class="margin-top20 margin-bottom20 text-center">예약이 완료되었습니다.</div>');
						alertPopup.then(function(res) {
							$state.go('app.mypage.new');
						});
					}

				}
			);
		};

		// 취소하기
		$scope.bookingCancel = function(item) {

			var cancel_day = $filter('BetweenDay')(item.cancel_day);

			var type_msg = item.payment_division ? '결제' : '예약';

			if (cancel_day <= 0) {
				popup.alert('확인','<div class="margin-top20 margin-bottom20 text-center"><p class="bold assertive">임박취소('+ type_msg +'취소) 불가</p><p>전화로 문의하여 주시기 바랍니다.</p></div>');
				return;
			}

			if (item.payment_division) var confirmPopup = popup.confirm('결제 취소','<div class="margin-top20 margin-bottom20 text-center">결제(예약)를 취소 하시겠습니까?</div>');
			else var confirmPopup = popup.confirm('예약 취소','<div class="margin-top20 margin-bottom20 text-center">골프장 예약을 취소 하시겠습니까?</div>');
			
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					$http.post(apiServer + 'booking/delete/'+ item.id + '?token=' + localStorage.getItem('authToken'))
						.then(function(response) {
							if (response.data.success) {
								popup.alert('확인','<div class="margin-top20 margin-bottom20 text-center">예약이 취소되었습니다.</div>');
								$scope.reservationInfo.status = 3;
								$scope.reservationInfo.deleted_at = $filter('f_formatdate')(new Date(), 'date');
								$scope.doRefresh();
								badgeService.getCount();
							} else {
								popup.alert('오류',response.data.message);
							}
						},function(error){
							popup.alert('알림','취소요청 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
							$ionicLoading.hide();
						}).finally(function() {
							$ionicLoading.hide();
						});
				}
			});
		};

		// 결제하기
		$scope.GolfPayment = function(isValid, item, type) {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			// if (isValid.$valid) {

				if (!$scope.payForm.agreement) {
					popup.alert('확인','<div class="text-center margin-top20 margin-bottom20">위약규정 및 개인정보 제3자제공 동의에<br />체크해주세요.</div>');
					return;
				}

				if (!$scope.payForm.CASH_GB) {
					popup.alert('오류','<div class="text-center margin-top20 margin-bottom20">결제수단을 선택하세요.</div>');
					return;
				}

				$ionicLoading.show();

				$http.post(apiServer + 'booking/use/'+ item.id + '?token=' + localStorage.getItem('authToken'))
					.then(function(response) {
						if (response.data.success) {


							var cancel_day2 = $filter('BetweenDay')(item.golf_time, "canceled_time", item.w_2);
							var dayCount = $filter('BetweenDay')($filter('f_formatdate')(cancel_day2, 'date'), 'dayCount');

							if (dayCount >= 0) {
								var confirmPopup = popup.confirm('예약하기', '<div class="margin-top20 margin-bottom20 text-center"><div class="margin-top assertive">★ 주 의 ★</div><div class="margin-top margin-bottom">선택하신 부킹타임은 <u>취소가능 시한이 지나서</u><br />예약시 취소가 불가하니, 신중한 예약을 부탁드립니다.</div><div class="margin-top margin-bottom">골프장 예약을 진행하시겠습니까?</div></div>');
							} else {
								var confirmPopup = popup.confirm('예약하기', '<div class="margin-top20 margin-bottom20 text-center">골프장을 예약하시겠습니까?</div>');
							}


							confirmPopup.then(function(res) {
								if (res) {

									if ($scope.payForm.CASH_GB == 'RA') {
										var cashid = $scope.payForm.RA_SVCID;
									} else if ($scope.payForm.CASH_GB == 'MC') {
										var cashid = $scope.payForm.MC_SVCID;
									} else {
										var cashid = $scope.payForm.CN_SVCID;
									}

									var Tradeid = 'TEESHOT-'+ cashid +'_' + $filter('appr_dtm')();
									var Totalprice = parseInt($scope.reservationInfo.reqPeople * $scope.reservationInfo.green_fee);
									
									$scope.payForm.Tradeid = Tradeid;
									$scope.payForm.Prdtprice = Totalprice;

									$ionicLoading.show();

									$http({
										method: 'post',
										url: apiServer + 'premium/paymentcart?token=' + localStorage.getItem('authToken'),
										data: {
											payment_type: 'booking',
											code: 'B',
											user_id: $rootScope.me.id,
											field_id: $scope.reservationInfo.id,
											CASH_GB: $scope.payForm.CASH_GB,
											Prdtprice: $scope.payForm.Prdtprice,
											Prdtnm: $scope.payForm.Prdtnm,
											Tradeid: $scope.payForm.Tradeid
										},
										headers: {
											'Content-Type' : 'application/json; charset=utf-8'
										}
									})
									.then(function(response) {

										if (response.data.success) {

											var url = apiServer + "appPayment?Tradeid="+$scope.payForm.Tradeid+"&token=" + localStorage.getItem('authToken');
											var target = "_system";

											var options = "location=yes";

											var inAppBrowserRef = cordova.InAppBrowser.open(url, target, options);

										} else {
											popup.alert('오류',response.data.message);
										}
										
									},function(error){
										popup.alert('알림','결제 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
										$ionicLoading.hide();
									}).finally(function() {
										$ionicLoading.hide();
									});						

								}

							});


						} else {
							popup.alert('알림',response.data.message);
						}
					},function(error){
						popup.alert('알림','예약중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
						$ionicLoading.hide();
					}).finally(function() {
						$ionicLoading.hide();
					});

				// GolfcubeService.ajax(
				// 	{
				// 		type: 'book_use',
				// 		club: item.club_region,
				// 		rdate: $filter('f_formatdate')(item.golf_time, 'Ymd'),
				// 		rtime: $filter('f_formatdate')(item.golf_time, 'Hi'),
				// 		course: item.courses
				// 	}, 
				// function(obj) {

				// 	$ionicLoading.hide();

				// 	console.log(obj);

				// 	if (obj.result == '0') {
				// 	} else {
				// 		GolfcubeService.end({id: item.id});

				// 		var popupAlert = popup.alert('알림','<div class="text-center padding"><p>죄송합니다.</p><p>마감된 상품입니다.</p></div>');
				// 		popupAlert.then(function() {
				// 			$scope.closeModal(2);
				// 			$scope.get_field(item, $scope.b_date, 0);
				// 		})
				// 		return;						
				// 	}

				// });			

				



			// } else {
			// 	popup.alert('등록오류','정보가 넘어오지 않았습니다. <br />다시 시도하시기 바랍니다.');
			// 	return;
			// }
		};

		// 결제 프로세서
		$scope.payProcess = function(id) {

			if ($scope.payForm.CASH_GB == 'RA') {
				var cashid = $scope.payForm.RA_SVCID;
			} else if ($scope.payForm.CASH_GB == 'MC') {
				var cashid = $scope.payForm.MC_SVCID;
			} else {
				var cashid = $scope.payForm.CN_SVCID;
			}

			var Tradeid = 'TEESHOT-'+ cashid +'_' + $filter('appr_dtm')();
			var Totalprice = parseInt($scope.reservationInfo.reqPeople * $scope.reservationInfo.green_fee);
			
			$scope.payForm.Tradeid = Tradeid;
			$scope.payForm.Prdtprice = Totalprice;

			// console.log($scope.reservationInfo);
			// console.log($scope.payForm);

			// popup.alert('개발중','결제 프로세서 작업중입니다.');
			// return;

			$ionicLoading.show();

			$http({
				method: 'post',
				url: apiServer + 'premium/paymentcart?token=' + localStorage.getItem('authToken'),
				data: {
					payment_type: 'booking',
					code: 'B',
					user_id: $rootScope.me.id,
					field_id: id,
					CASH_GB: $scope.payForm.CASH_GB,
					Prdtprice: $scope.payForm.Prdtprice,
					Prdtnm: $scope.payForm.Prdtnm,
					Tradeid: $scope.payForm.Tradeid
				},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
			.then(function(response) {

				if (response.data.success) {

					var url = apiServer + "appPayment?Tradeid="+$scope.payForm.Tradeid+"&token=" + localStorage.getItem('authToken');
					var target = "_system";

					var options = "location=yes";

					var inAppBrowserRef = cordova.InAppBrowser.open(url, target, options);

				} else {
					popup.alert('오류',response.data.message);
				}
				
			},function(error){
				popup.alert('알림','결제 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
				$ionicLoading.hide();
			}).finally(function() {
				$ionicLoading.hide();
			});

		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			$scope.openProfile(item);
		};

		$scope.openInAppBrowser = function(url, target) {
			InAppBrowser(url, target);
		};

		$scope.openModal = function(index,item) {
			$scope.shareItem = item;

			if (index == 1) {
				$scope.get_field(item, $scope.b_date, 0);

				$ionicModal.fromTemplateUrl('templates/modal/booking/detail-info.html', {
					id: '1',
					scope: $scope
				}).then(function(modal) {
					$scope.BookingDetailModal = modal;
					$scope.BookingDetailModal.show();
				});
			} else if (index == 2) {
				$scope.reservationInfo = '';
				$scope.view_reservation(item, 1);

				$ionicModal.fromTemplateUrl('templates/modal/booking/reservation.html', {
					id: '2',
					scope: $scope
				}).then(function(modal) {
					$scope.BookingReservationModal = modal;
					$scope.BookingReservationModal.show();
				});
			} else if (index == 3) {
				$scope.reservationInfo = '';
				$scope.view_reservation(item, 0);

				$ionicModal.fromTemplateUrl('templates/modal/booking/reservation-list.html', {
					id: '3',
					scope: $scope
				}).then(function(modal) {
					$scope.BookingReservationListModal = modal;
					$scope.BookingReservationListModal.show();
				});
			} else if (index == 99) {
				$ionicModal.fromTemplateUrl('templates/modal/booking/BRAgreementA.html', {
					id: '99',
					scope: $scope
				}).then(function(modal) {
					$scope.BRAgreementAModal = modal;
					$scope.BRAgreementAModal.show();
				});
			} else if (index == 98) {
				$ionicModal.fromTemplateUrl('templates/modal/booking/BRAgreementB.html', {
					id: '98',
					scope: $scope
				}).then(function(modal) {
					$scope.BRAgreementBModal = modal;
					$scope.BRAgreementBModal.show();
				});
			} else if (index == 5) {
				$ionicModal.fromTemplateUrl('templates/modal/premium/terms.html', {
					id: '5',
					scope: $scope
				}).then(function(modal) {
					$scope.BRtermsModal = modal;
					$scope.BRtermsModal.show();
				});
			} else if (index == 6) {
				$ionicModal.fromTemplateUrl('templates/modal/premium/privacy.html', {
					id: '6',
					scope: $scope
				}).then(function(modal) {
					$scope.BRprivacyModal = modal;
					$scope.BRprivacyModal.show();
				});
			}
		};

		$scope.closeModal = function(index,item) {
			if (index == 1) {
				$scope.BookingDetailModal.hide();
				$scope.BookingDetailModal.remove();
				$scope.bookingInfo = {};
			} else if (index == 2) {
				$scope.BookingReservationModal.hide();
				$scope.BookingReservationModal.remove();
			} else if (index == 3) {
				$scope.BookingReservationListModal.hide();
				$scope.BookingReservationListModal.remove();
			} else if (index == 99) {
				$scope.BRAgreementAModal.hide();
				$scope.BRAgreementAModal.remove();
			} else if (index == 98) {
				$scope.BRAgreementBModal.hide();
				$scope.BRAgreementBModal.remove();
			} else if (index == 5) {
				$scope.BRtermsModal.hide();
				$scope.BRtermsModal.remove();
			} else if (index == 6) {
				$scope.BRprivacyModal.hide();
				$scope.BRprivacyModal.remove();
			}
		};

		$scope.$on('$stateChangeStart', function() {
			if($scope.BookingDetailModal) $scope.BookingDetailModal.hide();
			if($scope.BookingReservationModal) $scope.BookingReservationModal.hide();
			if($scope.BookingReservationListModal) $scope.BookingReservationListModal.hide();
			if($scope.BRAgreementAModal) $scope.BRAgreementAModal.hide();
			if($scope.BRAgreementBModal) $scope.BRAgreementBModal.hide();
			if($scope.BRtermsModal) $scope.BRtermsModal.hide();
			if($scope.BRprivacyModal) $scope.BRprivacyModal.hide();
		});

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if($scope.BookingDetailModal) $scope.BookingDetailModal.remove();
			if($scope.BookingReservationModal) $scope.BookingReservationModal.remove();
			if($scope.BookingReservationListModal) $scope.BookingReservationListModal.remove();
			if($scope.BRAgreementAModal) $scope.BRAgreementAModal.remove();
			if($scope.BRAgreementBModal) $scope.BRAgreementBModal.remove();
			if($scope.BRtermsModal) $scope.BRtermsModal.remove();
			if($scope.BRprivacyModal) $scope.BRprivacyModal.remove();
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