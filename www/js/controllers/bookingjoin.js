angular.module('starter.controllers')

	.controller('bookingJoinCtrl', function() {
	})

	.controller('bookingJoinListsCtrl', function(
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

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			// 푸시으로 들어왔을시 필드번호 값 지정
			// $scope.Params = {fieldId: '2505', article_type: 'sponsor_invite'};
			if ($scope.Params.article_type) {
				$timeout(function() {
					$scope.openModal(9, { id: $scope.Params.fieldId });
				}, 500);
			}

			if ($scope.Params.joinChk) {
				$timeout(function() {
					$scope.salebookingSelect($scope.Params.joinInfo);
				},0);
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
			if ($state.current.name == 'app.bookingJoinTabs.request') {
				if (type) BookingService.getRsvps({ limit:nlimit, offset:offset, inviteType: 0 }, $scope.loadList);
				else BookingService.getRsvps({ limit:nlimit, offset:offset, inviteType: 0 }, $scope.loadListScroll);
			} else {

				var sod = $scope.b_sod ? "ASC" : "DESC";

				if ($state.current.name == 'app.bookingJoinTabs.invite') {
					var invite = '';
					if ($rootScope.me.level == 6) var active = 7;
					else var active = 0;
				} else if ($state.current.name == 'app.bookingJoin.managerlists') {
					var invite = 7;
					var active = 7;
				} else {
					var invite = 0;
					var active = 0;
				}

				if (type) BookingService.getLists({ limit:nlimit, offset:offset, inviteType: invite, bookingDate: '', bookingSst: $scope.b_sst, bookingSod: sod, bookingOpen: '', active: active }, $scope.loadList);
				else BookingService.getLists({ limit:nlimit, offset:offset, inviteType: invite, bookingDate: '', bookingSst: $scope.b_sst, bookingSod: sod, bookingOpen: '', active: active }, $scope.loadListScroll);

			}
		};

		$scope.loadList = function(obj) {
			// console.log(obj);
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
		// $scope.golfPosts = function() {
		// 	$scope.openModal(3,'');
		// };

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
					
	
						$scope.form.partners	= obj.golf_partner;
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

					obj.bOption = '';

					for (var i = 0; i < $scope.arrayBookingOption.length; i++) {
						if (obj.booking_option&Math.pow(2, i)) {
							if (obj.bOption) obj.bOption += ', ';
							obj.bOption += $scope.arrayBookingOption[i];
						}
					}

					$scope.fieldInfo	= obj;

					if (obj.level >= 6) {
						$scope.fieldInfo.companionInfo = $filter('f_companion_booking_count')(obj.golf_companion);
					} else {
						$scope.fieldInfo.companionInfo = $filter('f_companion_count')(obj.golf_companion);
					}
					$scope.fieldInfo.partnerInfo = $filter('f_partner_count')(obj.golf_partner);
					$scope.fieldInfo.teamCnt = $scope.fieldInfo.companionInfo.cnt + $scope.fieldInfo.rsvpsStatusCnt.cnt;
				}
			);
			
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
		 * 할인 부킹 리스트 가져오기
		 */
		$scope.nodeListSale = function(nlimit, offset, type) {
			$scope.hasMoreDataSale = true;
			if (!offset) s_offset = 0;
				
			var sod = $scope.sb_sod ? "ASC" : "DESC";

			if (type) BookingService.getLists({ limit:nlimit, offset:s_offset, inviteType: 6, bookingDate: '', bookingSst: $scope.sb_sst, bookingSod: sod, bookingOpen: 1 }, $scope.loadListSale);
			else BookingService.getLists({ limit:nlimit, offset:s_offset, inviteType: 6, bookingDate: '', bookingSst: $scope.sb_sst, bookingSod: sod, bookingOpen: 1 }, $scope.loadListSaleScroll);
		};

		$scope.loadListSale = function(obj) {
			// console.log(obj);
			$scope.SaleLists = obj;
			$scope.hasMoreDataSale = false;
		};

		$scope.loadListSaleScroll = function(obj) {
			// console.log(obj);
			$scope.SaleLists = $scope.SaleLists.concat(obj);
			$ionicScrollDelegate.resize();
			if (obj.length < 20) $scope.hasMoreDataSale = true;
			else $scope.hasMoreDataSale = false;
		};

		// 스크롤 내릴시 리스트 추가
		$scope.loadMoresSale = function() {
			if (s_offset != $scope.SaleLists.length) {
				s_offset = $scope.SaleLists.length;
				$scope.s_offset = s_offset;
				$scope.nodeListSale(20, s_offset, 0);	
			} else {
				$scope.hasMoreDataSale = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		};

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefreshSale = function() {
			s_offset = 0;
			$scope.nodeListSale(20, s_offset, 1);	
			$scope.$broadcast('scroll.refreshComplete');
		};

		/**
		 * 정렬
		 */
		 $scope.bookingSortSale = function(type) {
		 	if (type == $scope.sb_sst) {
		 		$scope.sb_sod = !$scope.sb_sod;
		 	} else {
		 		$scope.sb_sod = false;
		 	}

		 	$scope.sb_sst = type;
		 	$scope.nodeListSale(20, 0, 1);
		 };

		/**
		 * 부킹 리스트 불러오기
		 */
		$scope.get_salebooking_list = function() {

			var s_limit = 0;
			var s_offset = 0;

			$scope.sb_sst = '';
			$scope.sb_sod = false;

			$scope.nodeListSale(20, 0, 1);
		};

		/**
		 * 부킹 세일 선택 등록
		 */
		 $scope.salebookingSelect = function(item) {

		 	$scope.joinform	= {};

		 	$scope.salebookingInfo = item;

		 	$scope.salebookingInfo.bOption = '';

			for (var i = 0; i < $scope.arrayBookingOption.length; i++) {
				if ($scope.salebookingInfo.booking_option&Math.pow(2, i)) {
					$scope.salebookingInfo.bOption += ' / ' + $scope.arrayBookingOption[i];
				}
			}

		 	var now = new Date();
			var time = new Date(item.golf_time);
			time.setDate(time.getDate() - 4);
			time.setHours(17);
			time.setMinutes(00);

			if (now > time)
			{
				$scope.salebookingInfo.cancelMsg = '이 부킹건은 예약 후, 취소할 수 없습니다.';
			} else {
				$scope.salebookingInfo.cancelMsg = '취소가능시한 : ' + $filter('f_formatdate')(time,98) + '까지';
			}

			// console.log($scope.salebookingInfo);

		 	$scope.openModal(5,'');
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
				if (!$scope.form.companion) {
					popup.alert('오류','등록자 인원 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}

				if (!$scope.form.partners) {
					popup.alert('오류','조인요청 인원 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}

				if (!$scope.form.green_fee) {
					popup.alert('오류','그린피 할인비용 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}

				if ($scope.form.green_fee < 10000) {
					popup.alert('오류','그린피 비용이 너무 작습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}

				if (!$scope.form.bookingPeople) {
					popup.alert('오류','내장인원 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
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

				$scope.form.bOption = '';

				for (var i = 0; i < $scope.arrayBookingOption.length; i++) {
					if ($scope.form.option&Math.pow(2, i)) {
						if ($scope.form.bOption) $scope.form.bOption += ', ';
						$scope.form.bOption += $scope.arrayBookingOption[i];
					}
				}

				var Ccount = $filter('f_companion_count')($scope.form.companion);
				var Pcount = $filter('f_partner_count')($scope.form.partners);

				if (Ccount.cnt + Pcount.cnt > 4) {
					popup.alert('오류','등록자의 동반자와 조인요청의 합이 4명이 넘습니다.<br />최대 4명으로 변경 하시기 바랍니다.');
					return;
				}

				var bookingDate	= $filter('date')($scope.form.bookingDate, "yyyy/MM/dd");
				var bookingHour	= $filter('date')($scope.form.bookingDateTime, "HH:mm");
				
				//입력된 시간의 유효성 시작
				var bookedDate	= 	bookingDate.split("/");
				var bookedTime	= 	bookingHour.split(":");
				var today = new Date(); 
				var dateObj = new Date(bookedDate[0], bookedDate[1]-1, bookedDate[2], bookedTime[0], bookedTime[1], 0);
				
				var interval = dateObj - today;
				
				if(interval < 0) {
					popup.alert('오류','초청하는 날짜 및 시간이 이미 지났습니다.');
					return;
				}
			


				var confirmPopup = popup.confirm('조인 등록', '<div><div class="bold">[부킹내용]</div><ul><li> ▶ '+ $scope.form.club_name +'</li><li> ▶ '+ $filter('f_formatdate')(dateObj, 98) +'</li><li> ▶ '+ $filter('numberformat')($scope.form.green_fee) +'원('+ $scope.form.bOption +')</li><li> ▶ '+ $scope.form.bookingPeople +'인</li><div class="margin-top margin-bottom bold">[요청인원 : '+ $filter('f_partnerBooking')($scope.form.partners) +']</div><div class="margin-top margin-bottom bold text-center">조인 등록하시겠습니까?</div>');
				confirmPopup.then(function(res) {
					if (res) {

						if ($rootScope.me.level == 6) {
							var invite_type = 7;
						} else {
							var invite_type = 0;
						}

						// BookingService.getPostsChk({ booking_id: $scope.salebookingInfo.id}, function(json) {

						// 	if (!json.success) {
						// 		popup.alert('오류',json.message);
						// 		return;
						// 	} else {

							var obj = {
								golf_invite_type: invite_type,
								club_name: $scope.form.clubName, 
								date: bookingDate, 
								hour: bookingHour, 
								partners: $scope.form.partners, 
								golf_companion: $scope.form.companion, 
								green_fee: $scope.form.green_fee, 
								booking_people: $scope.form.bookingPeople, 
								booking_option: $scope.form.option,
								message: $scope.form.message,
								filter_sex: 0, 
								filter_s_age: 0, 
								filter_e_age: 0, 
								cart_fee: 0, 
								caddie_fee: 0,
								booking_id: 0
							};

								// var obj = {
								// 	golf_invite_type: 7,
								// 	club_name: $scope.salebookingInfo.golf_club_id, 
								// 	date: $filter('f_formatdate')($scope.salebookingInfo.golf_time, 'Y/m/d'), 
								// 	hour: $filter('f_formatdate')($scope.salebookingInfo.golf_time, 'H:i'), 
								// 	booking_people: $scope.salebookingInfo.booking_people, 
								// 	green_fee: $scope.salebookingInfo.green_fee, 
								// 	message: $scope.salebookingInfo.message,
								// 	booking_option: $scope.salebookingInfo.booking_option,
								// 	golf_companion: $scope.joinform.companion, 
								// 	partners: $scope.joinform.partners, 
								// 	booking_id: $scope.salebookingInfo.id, 
								// 	filter_sex: 0, 
								// 	filter_s_age: 0, 
								// 	filter_e_age: 0, 
								// 	cart_fee: 0, 
								// 	caddie_fee: 0
								// };

								overlap = true;
											
								if($scope.form.post_id) 
									var url = apiServer + 'fields/update/'+$scope.form.post_id+'?token=' + localStorage.getItem('authToken');
								else 
									var url = apiServer + 'fields/create?token=' + localStorage.getItem('authToken');
								
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

										popup.alert('등록완료','<div class="text-center bold margin-bottom20">등록이 완료되었습니다.</div>');

										$scope.doRefresh();

										if($scope.form.post_id) $scope.get_field({id: $scope.form.post_id});

										$scope.closeModal(3);

										// $scope.closeModal(4);
										// $scope.closeModal(5);
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

						// 	}

						// });

					}
				});						

			} else {
				popup.alert('등록오류','정보가 넘어오지 않았습니다. <br />다시 시도하시기 바랍니다.');
				return;
			}

		};


		/**
		 * 신청하기
		 */
		$scope.reservation = function(item) {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if (!item.reqPeople) {
				popup.alert('알림','<div class="text-center bold margin-top margin-bottom">신청자 인원을 체크해 주세요</div>');
				return;
			}

			var confirmPopup = popup.confirm('조인 신청', '<div><div class="bold margin-bottom">[조인내용]</div><ul><li> ▶ '+ item.golf_club_name +'</li><li> ▶ '+ $filter('f_golfdate')(item.golf_time) +'</li><li> ▶ '+ $filter('numberformat')(item.green_fee) +'원 ('+ item.bOption +')</li><li> ▶ '+ item.booking_people +'인</li><div class="margin-top margin-bottom bold">[신청자 : '+ $rootScope.me.profile.realname +' '+ $filter('phoneNumber')($rootScope.me.profile.phone) +']</div><div class="margin-top margin-bottom bold text-center">조인을 신청하시겠습니까?</div><div class="text-center bold assertive">(신청인원 ' + $scope.arrayBookingReqPeople[item.reqPeople] + ')</div>');
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
							message: '',
							people: item.reqPeople
						},
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						var obj	= response.data;

						if(obj.success){
							popup.alert('신청 완료', '<div class="text-center"><div class="margin-top20 margin-bottom20 bold font16">신청이 완료되었습니다.</div><div class="assertive margin-bottom20">★ 조인등록자에게서 확정문자를<br />받아야만 조인확정이 됩니다.</div></div>');
							$scope.get_field(item);
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
		 * 파트너 선택
		 */
		$scope.isconfirm = function(item, rsvp) {

			$scope.selection = [rsvp.id];

			var confirmPopup = popup.confirm('조인확정', '<div class="text-center padding"><strong>' + rsvp.realname + '</strong>님을 <br />조인동반자로 확정하시겠습니까?</div>');
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show({duration: 3000});

					InviteService.partnerChk({id: item.id}, function(obj) {

						var partnerCnt = item.partnerInfo.cnt - obj.cnt;

						if(partnerCnt < 1){
							popup.alert('알림','조인할 수 있는 인원이 초과 되었습니다.');
							$ionicLoading.hide();
							return;
						} else {

							$http({
								method: 'post',
								url: apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken'),
								data: {
									field_id: item.id,
									golf_partner: item.golf_partner,
									invite_count: item.partnerInfo.cnt,
									ids: $scope.selection
								},
								headers: {
									'Content-Type' : 'application/json; charset=utf-8'
								}
							})
							.then(function(response) {
								popup.alert('알림','<div class="margin-top margin-bottom">동반자로 확정되었습니다.</div>');

								$scope.get_field(item);

								$scope.nodeList($scope.lists.length, 0, 1);
								
								$ionicLoading.hide();
								$scope.selection = [];
								$scope.selectionName = [];
								
							},function(error){
								popup.alert('알림','참가자 선택 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
								$ionicLoading.hide();
							}).finally(function() {
								$ionicLoading.hide();
							});

						}

					});

				} else {
					return;
				}
			});

		};

		/**
		 * 신청 취소
		 */
		$scope.applyCancel = function(item, rsvp) {
			//console.log($scope.formDate.listId);
			var confirmPopup = popup.confirm('조인 취소','<div class="text-center bold margin-top margin-bottom20">정말로 조인을 취소하시겠습니까?</div>');
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					$http.get(apiServer + 'fields/rsvps/delete/?id='+rsvp.id+'&token=' + localStorage.getItem('authToken'))
						.then(function(response) {
							// console.log(response);
							if (response.data.success) {
								popup.alert('알림','<div class="text-center bold margin-top margin-bottom20">조인이 취소되었습니다.</div>');
								$scope.get_field(item);
								$scope.nodeList($scope.lists.length, 0, 1);
							} else {
								popup.alert('오류',response.data.message);
							}
						},function(error){
							console.log(error);
							popup.alert('알림','취소 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
							$ionicLoading.hide();
						}).finally(function() {
							$ionicLoading.hide();
						});
				}
			});

		};

		/**
		 * 확정 취소
		 */
		$scope.completeCancel = function(item, rsvp) {
			var confirmPopup = popup.confirm('확정취소', '<div class="margin-top20 text-center bold">'+ rsvp.realname + '님의</div><div class="text-center margin-bottom20">조인 확정을 취소하시겠습니까?</div>');
			confirmPopup.then(function(res) {
				if(res) {
					BookingService.putCompleteCancel({ id: rsvp.id }, function(obj) {
						if (obj.success) {
							popup.alert('알림', '<div class="text-center margin-top20 margin-bottom20"><p class="bold">' + rsvp.realname + '님의</p><p>조인확정이 취소되었습니다.</p><p>새로운 신청자로 조인 확정이 가능합니다.</p></div>')
							$scope.get_field({id: item.id});
							$scope.nodeList($scope.lists.length, 0, 1);
						}
					});
				}
			});
		};

		/**
		 * 확정 마감
		 */
		 $scope.bookingjoinComplete = function(item) {

		 	var confirmPopup = popup.confirm('부킹완료','<div class="text-center bold margin-bottom20">부킹완료 하시겠습니까?</div><div class="text-center">부킹완료시 더이상 조인신청이 진행되지 않으며<br />상태가 부킹완료로 변경됩니다.</div>');
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


		 /**
		 * 조인취소
		 */
		$scope.finish = function(item) {

			if (item.deleted_at) {
				popup.alert('알림','<p class="text-center padding">이미 조인마감 하셨습니다.</p>');
				return;
			}

			var confirmPopup = popup.confirm('조인 마감','<div class="text-center"><p>마감후, <span class="assertive">활동정보</span>에서 열람가능합니다.</p><div class="margin-top margin-bottom bold text-center">마감하시겠습니까?</div></div>');
			
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
		$scope.club_info = function(id) {
			BookingService.getClubOne(
				{
					id: id
				}, 
				function(obj) {
					$scope.form.club_name = obj.name;
				}
			);
		};

		$scope.share = function(item) {
			if(item.level == 6) {
				var managertext = ' \r\n매니저 ' + item.realname + ' ' + item.phone;
			} else {
				var managertext = '';
			}

			var message = '[티샷 조인] ' + item.golf_club_name + ' \r\n' + $filter('f_golfdate')(item.golf_time) +' \r\n' + $filter('numberformat')(item.green_fee) + '원 ('+ item.bOption +') \r\n'+ item.booking_people + '인' + managertext +
			'\r\n\r\n\r\n[티샷 앱 다운]' +
			'\r\n\r\n다운로드 : http://localhost';

			$cordovaSocialSharing
			.share(message, '', '', '')
			.then(function(result) {
			}, function(err) {
			});
		};

		$scope.shareSms = function(item) {
			var message = '[티샷 조인] ' + item.golf_club_name + ' \r\n' + $filter('f_golfdate')(item.golf_time) +' \r\n' + $filter('numberformat')(item.green_fee) + '원\r\n문의합니다.';

			$cordovaSocialSharing
			.shareViaSMS(message, item.phone)
			.then(function(result) {
			}, function(err) {
			});
		};

		$scope.sharekakaotalk = function(item) {
			if(item.level == 6) {
				var managertext = ' \r\n매니저 ' + item.realname + ' ' + item.phone;
			} else {
				var managertext = '';
			}
			var message = '[티샷 부킹] ' + item.golf_club_name + ' \r\n' + $filter('f_golfdate')(item.golf_time) +' \r\n' + $filter('numberformat')(item.green_fee) + '원 ('+ item.bOption +') \r\n'+ item.booking_people + '인' + managertext +
			'\r\n\r\n\r\n[티샷 앱 다운]';
			var obj = {"title": message, "url": webServer, "img": 'http://localhost/images/main/3rd.jpg'};
			SocialShare.share('kakaotalk', obj);
		};

		$scope.openInAppBrowser = function(url, target) {
			InAppBrowser(url, target);
		};

		$scope.infoLink = function() {

			$scope.toggleSubmenu(1);
			$state.go('app.bookingJoinTabs.invite');
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

				$ionicModal.fromTemplateUrl('templates/modal/bookingjoin/posts.html', {
					id: '3',
					scope: $scope
				}).then(function(modal) {
					$scope.PostModal = modal;
					$scope.PostModal.show();
				});

			} else if (index == 4) {

				if (!$rootScope.me.profile.phone) {
					$scope.phoneCertCheck();
					return;
				}

				$scope.get_salebooking_list();

				$ionicModal.fromTemplateUrl('templates/modal/bookingjoin/salebooking-list.html', {
					id: '4',
					scope: $scope
				}).then(function(modal) {
					$scope.CommentModal = modal;
					$scope.CommentModal.show();
				});
			} else if (index == 5) {

				if (!$rootScope.me.profile.phone) {
					$scope.phoneCertCheck();
					return;
				}

				$ionicModal.fromTemplateUrl('templates/modal/bookingjoin/posts.html', {
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

				$ionicModal.fromTemplateUrl('templates/modal/bookingjoin/detail-info.html', {
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
				if($scope.CommentModal) {
					$scope.CommentModal.hide();
					$scope.CommentModal.remove();
				}
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

;	