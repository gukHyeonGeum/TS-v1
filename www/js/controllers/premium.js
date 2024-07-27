angular.module('starter.controllers')

	.controller('premiumListsCtrl', function(
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
		BookingService,
		InAppBrowser,
		PremiumService
	) {

		var year = new Date().getFullYear();//97
		$scope.ageRange = [];
		for(var i=30; i<=60; i++) {
			$scope.ageRange.push({value:i});
		}

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
			if ($state.current.name == 'app.premiumTabs.request') {
				if (type) BookingService.getRsvps({ limit:nlimit, offset:offset, inviteType: 1 }, $scope.loadList);
				else BookingService.getRsvps({ limit:nlimit, offset:offset, inviteType: 1 }, $scope.loadListScroll);
			} else {
				
				var sod = $scope.b_sod ? "ASC" : "DESC";

				if ($state.current.name == 'app.premiumTabs.invite') {
					var invite = '';
				} else {
					var invite = 1;
				}

				if (type) BookingService.getLists({ limit:nlimit, offset:offset, inviteType: invite, bookingDate: '', bookingSst: $scope.b_sst, bookingSod: sod, bookingOpen: '', active: 1 }, $scope.loadList);
				else BookingService.getLists({ limit:nlimit, offset:offset, inviteType: invite, bookingDate: '', bookingSst: $scope.b_sst, bookingSod: sod, bookingOpen: '', active: 1 }, $scope.loadListScroll);
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


		// 프리미엄 등록 신청
		$scope.golfPosts = function() {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			$scope.openModal(3,'');

		};

		$scope.inviteDefault = function() {
			$scope.form = { 'fieldId' : $scope.fieldInfo.id, 'distance' : '0', 'inviteCnt' : 0 };
		}

		$scope.invitationSend = function() {
			if ($rootScope.me.id == $scope.fieldInfo.poster_id) {

				// var endTime = $filter('BetweenDay')($rootScope.me.expired_at);

				// if (endTime > 0) {
					
					var PopupConfirm = popup.confirm('초대장 발송', '<div class="margin-top20 margin-bottom20 text-center">초대장을 발송 하시겠습니까?</div>','예','아니요');
					PopupConfirm.then(function(res) {
						if (res) {

							var obj = {
								user_id: $rootScope.me.id,
								field_id: $scope.form.fieldId,
								gender: $scope.form.filterSex, 
								s_age: $scope.form.filterSage, 
								e_age: $scope.form.filterEage, 
								radius: $scope.form.distance,
								target: $scope.form.inviteCnt
							};

							var url = apiServer + 'premium/invite/insert?token=' + localStorage.getItem('authToken');
							
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
									var PopupAlert = popup.alert('발송완료','<div class="text-center margin-top20 margin-bottom20">초대장이 발송되었습니다.</div>');
									PopupAlert.then(function(res) {
										$scope.openModal(2);
									});
									$scope.get_field({id: $scope.form.fieldId});
									$scope.closeModal(1);
								} else {
									popup.alert('알림', '<div class="text-center margin-top20 margin-bottom20">'+ response.data.message +'</div>');
								}
							},function(error){
								popup.alert('오류','통신 오류가 발생하였습니다. 다시시도 하시기 바랍니다.');
								$ionicLoading.hide();
							}).finally(function() {
								$ionicLoading.hide();
							});

						}
					});

				// } else {
				// 	if(endTime == 0) {
				// 		var PopupConfirm = popup.confirm('이용권 구매', '<div class="padding text-center"><p class="assertive">"프리미엄 이용구매권이 없습니다"</p><p class="margin-top20">-> 지금 구매하시면 즉시 발송됩니다.</p></div>','구매하기','취소');
				// 	} else {
				// 		var PopupConfirm = popup.confirm('이용권 만료', '<div class="padding text-center"><p class="assertive">"프리미엄 이용권이 만료되었습니다"</p><p class="margin-top20">-> 지금 연장하시면 즉시 발송됩니다.</p></div>','연장하기','취소');
				// 	}
					
				// 	PopupConfirm.then(function(res) {
				// 		if (res) {
				// 			$state.go('app.payment');
				// 		}
				// 	});
				// }
			} else {
				var PopupAlert = popup.alert('안내', '<div class="margin-top20 margin-bottom20 text-center">프리미엄 등록을 하신 후<br />필터 & 초대장을 발송하실수 있습니다.</div>');
				PopupAlert.then(function(res) {
					$scope.closeModal(1);
					$scope.closeModal(9);
					$scope.golfPosts();
				});
			}
		}

		// 초대 결과 리턴
		$scope.submitregistFormInvite = function(isValid) {
			if (isValid.$valid) {

				if (!$scope.form.filterSex) {
					popup.alert('오류','성별 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}


					var obj = {
						field_id: $scope.form.fieldId,
						filter_sex: $scope.form.filterSex, 
						filter_s_age: $scope.form.filterSage, 
						filter_e_age: $scope.form.filterEage, 
						location: $scope.form.distance
					};

					var url = apiServer + 'premium/invite?token=' + localStorage.getItem('authToken');
					
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
							$scope.form.inviteText = response.data.count_text;
							$scope.form.inviteCnt = response.data.cnt;
						} else {
							popup.alert('오류', response.data.message);
						}
						// 	overlap = false;

						// 	popup.alert('접수완료','<div class="margin-top20"><h4 class="text-center positive bold">접수되었습니다.</h4><p class="margin-top text-center">1:1 상담 전화드립니다.</p><div class="margin-top20"><p>[이후 진행사항]</p><p>① 골프장 선택하기(티샷 추천골프장)</p><p>② 필터링하고 초대장 발송하기</p></div></div>');
							
						// 	$scope.doRefresh();
						// 	if($scope.form.post_id) $scope.get_field({id: $scope.form.post_id});
						// 	$scope.closeModal(3);

						// 	// console.log($scope.fieldInfo);
						// } else {
						// 	overlap = false;

						// 	var error = response.data.errors ? response.data.errors : '다시 시도해 주세요';
						// 	popup.alert('DB 등록실패',error);
						// }

					},function(error){
						popup.alert('오류','통신 오류가 발생하였습니다. 다시시도 하시기 바랍니다.');

						$ionicLoading.hide();
					}).finally(function() {
						$ionicLoading.hide();
					});

			} else {
				popup.alert('등록오류','정보가 넘어오지 않았습니다. <br />다시 시도하시기 바랍니다.');
				return;
			}
		}

		// 등록 신청 보내기
		$scope.submitregistFormApply = function(isValid) {

			if (isValid.$valid) {

				if (overlap) return false;

				if (!$scope.form.golfType) {
					popup.alert('오류','골프장 회원종류 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.golfDate) {
					popup.alert('오류','골프장 지역 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.golfArea) {
					popup.alert('오류','골프장 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.golfGreen) {
					popup.alert('오류','초청하는 날짜 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.golfPeople) {
					popup.alert('오류','초청하는 시간 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}

				$scope.submitProcess = function() {

					overlap = true;

					var obj = {
						user_id: $rootScope.me.id,
						golf_type: $scope.form.golfType, 
						golf_date: $scope.form.golfDate, 
						golf_area: $scope.form.golfArea, 
						green_fee: $scope.form.golfGreen, 
						golf_people: $scope.form.golfPeople, 
						message: $scope.form.message
					};

					if($scope.form.post_id) 
						var url = apiServer + 'fields/update/'+$scope.form.post_id+'?token=' + localStorage.getItem('authToken');
					else 
						var url = apiServer + 'premium/apply?token=' + localStorage.getItem('authToken');
					
					$ionicLoading.show();

					$http({
						method: 'post',
						url: url,
						data: obj,
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						// console.log(response);
						if(response.data.success) {
							overlap = false;

							popup.alert('접수완료','<div class="margin-top20"><h4 class="text-center positive bold">접수되었습니다.</h4><p class="margin-top text-center">1:1 상담 전화드립니다.</p><div class="margin-top20"><p>[이후 진행사항]</p><p>① 초대장 발송하기</p><p>② 파트너 선택하기(프리미엄 이용권 구매)</p></div></div>');
							
							$scope.doRefresh();
							if($scope.form.post_id) $scope.get_field({id: $scope.form.post_id});
							$scope.closeModal(3);

							// console.log($scope.fieldInfo);
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

				};

				if (!post_id) {
					$scope.submitProcess();
					// 등록 오류시 포인트 차감 취소처리 필요함
				} else {
					InviteService.getRequest(post_id, function(res) {
						$scope.submitProcess();
					});
				}
				
			} else {
				popup.alert('등록오류','정보가 넘어오지 않았습니다. <br />다시 시도하시기 바랍니다.');
				return;
			}

		};


		//등록하기
		$scope.submitregistForm = function(isValid) {	

			if (isValid.$valid) {

				if (overlap) return false;

				if ($scope.form.golfType == 4) {
					if (!$scope.form.screenArea) {
						popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">골프장 지역 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
						return;
					}
					if (!$scope.form.screenName) {
						popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">골프장 지역 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
						return;
					}
					$scope.form.clubRegion = 99;
					$scope.form.clubName = 488;
				} else {
					if (!$scope.form.clubRegion) {
						popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">골프장 지역 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
						return;
					}
					if (!$scope.form.clubName) {
						popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">골프장 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
						return;
					}
					$scope.form.screenArea = '';
					$scope.form.screenName = '';
				}

				if (!$scope.form.bookingDate) {
					popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">초청하는 날짜 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
					return;
				}

				if ($scope.form.golfType == 1 || $scope.form.golfType == 4) {
					if (!$scope.form.bookingDateTime) {
						popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">초청하는 시간 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
						return;
					}
				} else {
					if (!$scope.form.nextDate) {
						popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">초청하는 종료날짜 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
						return;
					}
				}
				if ($scope.form.golfType != 2 && $scope.form.golfType != 3) {
					if (!$scope.form.sponsor) {
						popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">무료초대 내용 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
						return;
					}

					if (!$scope.form.option) {
						popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">무료초대 옵션 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
						return;
					}
				}
				// if (!$scope.form.partnerType) {
				// 	popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">원하는 파트너 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
				// 	return;
				// }
				if (!$scope.form.filterSex) {
					popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">파트너 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
					return;
				}
				if (!$scope.form.partners) {
					popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">초대인원 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
					return;
				}
				if (!$scope.form.filterSage) {
					popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">최소 연령대 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
					return;
				}
				if (!$scope.form.filterEage) {
					popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">최대 연령대 정보가 없습니다.<br />다시시도 하시기 바랍니다.</div>');
					return;
				}
				if ($scope.form.filterSage > $scope.form.filterEage) {
					popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">연령 선택이 잘 못 되었습니다.</div>');
					return;
				}
				if (($scope.form.filterEage - $scope.form.filterSage) < 5 ) {
					popup.alert('연령대','<div class="margin-top20 margin-bottom20 text-center">나이 차이는 5살이상 적용하셔야 합니다.</div>');
					return;
				}

				//입력된 시간의 유효성 시작
				var bookingDate	= $filter('date')($scope.form.bookingDate, "yyyy/MM/dd");
				var bookedDate	= 	bookingDate.split("/");
				var today = new Date(); 

				if ($scope.form.golfType == 1 || $scope.form.golfType == 4) {
					var nextDate 	= '';
					var bookingHour	= $filter('date')($scope.form.bookingDateTime, "HH:mm");
					var bookedTime	= 	bookingHour.split(":");
					var dateObj = new Date(bookedDate[0], bookedDate[1]-1, bookedDate[2], bookedTime[0], bookedTime[1], 0);
					$scope.form.nextDate = '';
				} else {
					var bookingHour	= '00:00';
					var bookedTime	= bookingHour.split(":");
					var nextDate	= $filter('date')($scope.form.nextDate, "yyyy/MM/dd");
					var nextedDate	= 	nextDate.split("/");
					var dateObj = new Date(bookedDate[0], bookedDate[1]-1, bookedDate[2], 0, 0, 0);
					var dateObj2 = new Date(nextedDate[0], nextedDate[1]-1, nextedDate[2], 0, 0, 0);
				}

				if (dateObj > dateObj2) {
					popup.alert('오류', '<div class="margin-top20 margin-bottom20 text-center">초청 종료날짜 정보가 잘 못 되었습니다.</div>');
					return;
				}
				
				var interval = dateObj - today;
				
				if(interval < 0) {
					popup.alert('오류','<div class="margin-top20 margin-bottom20 text-center">초청하는 날짜 및 시간이 이미 지났습니다.</div>');
					return;
				}
				//입력된 시간 유효성 끝


				$scope.submitProcess = function() {

					overlap = true;
								
					var obj = {
						golf_type: $scope.form.golfType,
						golf_invite_type: 1,
						club_region: $scope.form.clubRegion, 
						club_name: $scope.form.clubName, 
						date: bookingDate, 
						hour: bookedTime[0], 
						minute: bookedTime[1],
						partners: $scope.form.partners, 
						companion: 1, 
						filter_sex: $scope.form.filterSex, 
						filter_s_age: $scope.form.filterSage, 
						filter_e_age: $scope.form.filterEage, 
						green_fee: 0, 
						cart_fee: 0, 
						caddie_fee: 0, 
						user_id: $rootScope.me.id,
						sponsor: $scope.form.sponsor,
						golf_option: $scope.form.option,
						screen_area: $scope.form.screenArea,
						screen_name: $scope.form.screenName,
						golf_partner_type: $scope.form.partnerType,
						message: $scope.form.message
					};

					if ($scope.form.golfType == 2 || $scope.form.golfType == 3) {
						obj.golf_next_time = nextDate;
					}


					// 테스트
					if($scope.form.post_id) 
						var url = apiServer + 'premium/update/'+$scope.form.post_id+'?token=' + localStorage.getItem('authToken');
					else 
						var url = apiServer + 'premium/create?token=' + localStorage.getItem('authToken');

					// if($scope.form.post_id) 
					// 	var url = apiServer + 'premium/update/'+$scope.form.post_id+'?token=' + localStorage.getItem('authToken');
					// else 
					// 	var url = apiServer + 'fields/create?token=' + localStorage.getItem('authToken');
					
					$ionicLoading.show();

					$http({
						method: 'post',
						url: url,
						data: obj,
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						console.log(response);
						if(response.data.success) {
							overlap = false;

							if($scope.form.post_id) {
								var PopupAlert = popup.alert('수정 완료','<div class="text-center margin-top20 margin-bottom20">수정이 완료되었습니다.</div>');
							} else {
								var PopupAlert = popup.alert('등록 완료','<div class="text-center margin-top20 margin-bottom20">프리미엄 초청이 등록되었습니다.</div>');	
							}
							
							PopupAlert.then(function(res) {
								$scope.doRefresh();
								if($scope.form.post_id) $scope.get_field({id: $scope.form.post_id});
								$scope.closeModal(3);
							});
						} else {
							overlap = false;

							var error = response.data.errors ? response.data.errors : '다시 시도해 주세요';
							popup.alert('DB 등록실패', '<div class="text-center margin-top20 margin-bottom20">' + error + '</div>');
						}

					},function(error){
						overlap = false;
						popup.alert('오류','<div class="text-center margin-top20 margin-bottom20">통신 오류가 발생하였습니다. 다시시도 하시기 바랍니다.</div>');

						$ionicLoading.hide();
					}).finally(function() {
						$ionicLoading.hide();
					});

				};

				$scope.submitProcess();

			} else {
				popup.alert('등록오류','<div class="margin-top20 margin-bottom20 text-center">정보가 넘어오지 않았습니다. <br />다시 시도하시기 바랍니다.</div>');
				return;
			}

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

						$scope.form.post_id		= post_id;
						
						if (obj.golf_type == 3) {
							$scope.form.clubRegion	= obj.club_type.toString();
							$scope.set_club_type( obj.golf_club_id );
						} else {
							$scope.form.clubRegion	= obj.club_region.toString();
							$scope.set_clubs(obj.golf_club_id);	
						}
						
						// $scope.club_info(obj.golf_club_id);
						
						
						$scope.form.bookingDate	= $filter('s_date')(obj.golf_time);
						$scope.form.bookingDateTime	= $filter('s_date')(obj.golf_time);

						if (obj.golf_type == 2 || obj.golf_type == 3) {
							$scope.form.nextDate	= $filter('s_date')(obj.golf_next_time);
						}

						$scope.form.partners	= obj.golf_partner.toString();
						// $scope.form.green_fee	= obj.green_fee;
						$scope.form.message		= obj.message;

						$scope.form.golfType	= obj.golf_type;
						$scope.form.filterSex	= obj.filter_sex;
						$scope.form.sponsor		= obj.golf_sponsor.toString();
						$scope.form.filterSage	= obj.filter_s_age.toString();
						$scope.form.filterEage	= obj.filter_e_age.toString();
						$scope.form.option		= obj.golf_option.toString();
						$scope.form.partnerType	= obj.golf_partner_type.toString();
						$scope.form.screenArea	= obj.golf_club_region_name.toString();
						$scope.form.screenName	= obj.golf_club_name.toString();
						$scope.form.club_code	= obj.golf_club_code.toString();
						$scope.form.club_name	= obj.golf_club_name.toString();

						// for (var i = 0; i < $scope.arrayBookingOption.length; i++) {
						// 	if (obj.booking_option&Math.pow(2, i)) {
						// 		if (i == 0) $scope.form.cart = true;
						// 		if (i == 1) $scope.form.meal = true;
						// 		if (i == 2) $scope.form.caddie = true;
						// 	}
						// }
					}
				);
						
			} else {//수정이 아닐 경우 초기화 시킨다.
				var nextDay = new Date();
				nextDay.setDate(nextDay.getDate()+1);
				$scope.form = { 'golfType' : 4, 'bookingDate' : new Date(), 'nextDate' : nextDay };
				$scope.view.title = '등록하기(무료)';
			}

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
		 * 결체취소 및 개인정보 테스트 노출
		 */
		$scope.toggleText = function(type) {
			if (type == 1) {
				$scope.fieldInfo.privacy = false;
				$scope.fieldInfo.terms = !$scope.fieldInfo.terms;
			} else {
				$scope.fieldInfo.terms = false;
				$scope.fieldInfo.privacy = !$scope.fieldInfo.privacy;
			}
		}

		/**
		 * 예약하기
		 */
		$scope.reservation = function(item) {
			console.log(item);

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if (!item.reqPeople) {
				popup.alert('인원선택','<div class="text-center bold margin-top20 margin-bottom20">신청자 인원을 선택해 주세요</div>');
				if($scope.InvitationViewModal) $scope.closeModal(4);
				return;
			}

			var confirmPopup = popup.confirm('신청하기', '<div class="margin-top20 margin-bottom20 bold text-center">신청하시겠습니까?</div>');
			confirmPopup.then(function(res) {
				if (res) {

					$http({
						method: 'post',
						url: apiServer + 'premium/rsvp/store?token=' + localStorage.getItem('authToken'),
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
							popup.alert('신청 대기', '<div class="margin-top20 margin-bottom20 bold font16 text-center"><p>현재 <span class="assertive">"신청대기 중"</span> 입니다.</p><p>회원님 프로필 사진이 있는가를 확인중이며,</p><p>확인후에 바로 등록됩니다.</p></div>');
							$scope.closeModal(99);
							$scope.get_field({id: item.id});
							$scope.doRefresh();
						} else {
							if(obj.result_code==1) {
								popup.alert('신청실패', '<div class="margin-top20 margin-bottom20 bold text-center">' + obj.message + '</div>');
							} else {
								popup.alert('신청중복', '<div class="margin-top20 margin-bottom20 bold text-center">' + obj.message + '</div>');
							}
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
		 * 수정하기
		 */
		$scope.modify = function(item) {
			$scope.openModal(3, item.id);
		};

		/**
		 * 초청취소
		 */
		$scope.finish = function(item) {

			if (item.deleted_at) {
				popup.alert('알림','<p class="text-center margin-top20 margin-bottom20">이미 초청을 마감 하셨습니다.</p>');
				return;
			}

			var confirmPopup = popup.confirm('초청 취소','<div class="text-center"><div class="margin-top20 margin-bottom20 bold text-center">정말로 초청을 취소하시겠습니까?</div></div>');
			
			confirmPopup.then(function(res) {
				 if(res) {//실행
					$ionicLoading.show();
					$http.get(apiServer + 'fields/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
						.then(function(response) {
								// loadGolfList();
								popup.alert('초청 취소','<div class="margin-top20 margin-bottom20 text-center">초청이 취소되었습니다.</div>');
								$scope.doRefresh();
								$scope.closeModal(9);
								$state.go('app.premiumTabs.invite');
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
			console.log(item);

			var endTime = $filter('BetweenDay')($rootScope.me.expired_at);

			if (endTime > 0) {

				$scope.selection = [rsvp.id];

				var confirmPopup = popup.confirm('파트너 선택', '<div class="margin-top20 margin-bottom20 bold text-center"><p class="positive">선택하신 회원을 파트너로 확정하시겠습니까?</p><p class="margin-top20">선택하면 이름, 휴대폰 통화 가능합니다.</p></div>');
				confirmPopup.then(function(res) {
					if(res) {
						$ionicLoading.show();

						$http({
							method: 'post',
							url: apiServer + 'premium/rsvps/put?token=' + localStorage.getItem('authToken'),
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

								if (response.data.success) {

									// popup.alert('골프장 결제','<div class="text-center bold margin-top margin-bottom20"><p>① '+ rsvp.poster +'님을 파트너로 확정하였습니다.</p><p>② 예약 골프장을 결제하시기 바랍니다.</p><p>(미결제시 매칭이 취소됩니다)</p></div>');
									popup.alert('파트너 확정','<div class="text-center bold margin-top20 margin-bottom20"><p class="assertive">"파트너로 확정되었습니다."</p><p class="margin-top20">① 통화하여 인사를 나누시고 내용을 확인하세요~</p><p>② 파트너로 맞지 않으시면 파트너 취소 가능합니다.</p></div>');

									$scope.get_field({id: item.id});

									$scope.nodeList($scope.lists.length, 0, 1);
									
									$ionicLoading.hide();
									$scope.selection = [];

								} else {
									popup.alert('알림', '<div class="text-center bold margin-top20 margin-bottom20">' + response.data.message + '</div>');
								}
								
							},function(error){
								popup.alert('알림','<div class="text-center bold margin-top20 margin-bottom20">부킹 확정 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.</div>');
								$ionicLoading.hide();
							}).finally(function() {
								$ionicLoading.hide();
							});
					} else {
						return;
					}
				});

			} else {
				if(endTime == 0) {
					var PopupConfirm = popup.confirm('이용권 구매', '<div class="margin-top20 margin-bottom20 text-center"><p class="assertive">"프리미엄 이용권이 없습니다"</p><p class="margin-top20">-> 이용권을 구매하셔야 파트너를 선택할 수 있습니다.</p></div>','구매하기','취소');
				} else {
					var PopupConfirm = popup.confirm('이용권 만료', '<div class="margin-top20 margin-bottom20 text-center"><p class="assertive">"프리미엄 이용권이 만료되었습니다"</p><p class="margin-top20">-> 이용권을 구매하셔야 파트너를 선택할 수 있습니다.</p></div>','연장하기','취소');
				}
				
				PopupConfirm.then(function(res) {
					if (res) {
						$state.go('app.payment');
					}
				});
			}

		};

		/**
		 * 부킹 예약 취소
		 */
		 $scope.bookingCancel = function(item, rsvp) {

		 	if (rsvp.status == 1) {
		 		var confirmPopup = popup.confirm('파트너 취소','<div class="text-center bold margin-top20 margin-bottom20 assertive">파트너를 취소하시겠습니까?</div>');
		 	} else {
		 		var confirmPopup = popup.confirm('신청 취소','<div class="text-center bold margin-top20 margin-bottom20 assertive">신청을 취소하시겠습니까?</div>');
		 	}
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					$http({
						method: 'post',
						url: apiServer + 'premium/rsvps/delete?token=' + localStorage.getItem('authToken'),
						data: {
							id: rsvp.id
						},
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
					.then(function(response) {
						// console.log(response);
						if (response.data.success) {
							if (rsvp.status == 1) {
								popup.alert('취소 확정','<div class="text-center bold margin-top20 margin-bottom20">"취소 되었습니다"</div>');
							} else {
								popup.alert('취소 확정','<div class="text-center bold margin-top20 margin-bottom20">"취소 되었습니다."</div>');
							}
							$scope.get_field({id: item.id});
							$scope.doRefresh();
						} else {
							popup.alert('오류', '<div class="text-center bold margin-top20 margin-bottom20">' + response.data.message + '</div>');
						}
					},function(error){
						popup.alert('알림','<div class="text-center bold margin-top20 margin-bottom20">취소 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.</div>');
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

		$scope.set_club_type = function(sel) {
			if ($scope.form.clubRegion) {
				$ionicLoading.show();
				PremiumService.getClubType({ clubType: $scope.form.clubRegion}, function(obj) {
					console.log($scope.form.clubRegion);
					console.log(sel);
					console.log(obj);
					$scope.clubs = obj;
					if(sel) $scope.form.clubName = sel;
				});
			}
		};

		/**
		 * 클럽 선택 정보
		 */
		$scope.club_info = function(id) {
			if (id) {
				BookingService.getClubOne(
					{
						id: id
					}, 
					function(obj) {
						console.log(obj);
						console.log($scope.form);
						if ($scope.form.golfType == 1) {
							$scope.form.club_name = obj.name;
						} else if ($scope.form.golfType == 2) {
							$scope.form.club_name = obj.name;
						} else if ($scope.form.golfType == 3) {
							$scope.form.club_name = obj.region;
							$scope.form.club_code = obj.club_code;
						}
					}
				);
			}
		};


		/**
		 * 상세보기
		 */
		$scope.get_field = function(item) {

			$scope.payForm = {};

			$scope.fieldInfo = '';

			BookingService.getOne(
				{
					id: item.id,
					booking_id: item
				}, 
				function(obj) {

					obj.endTime = $filter('BetweenDay')(obj.expired_at);

					if (obj.endTime > 0) {
						obj.rsvpText = '파트너 선택';
					} else {
						obj.rsvpText = '프로필 보기';
					}

					obj.bookingjoincnt = item.bookingjoincnt;

					obj.bOption = '';

					for (var i = 0; i < $scope.arrayBookingOption.length; i++) {
						if (obj.booking_option&Math.pow(2, i)) {
							if (obj.bOption) obj.bOption += ', ';
							obj.bOption += $scope.arrayBookingOption[i];
						}
					}

					obj.payPrice = obj.green_fee*obj.booking_people;

					if (obj.advance_payment) {
						obj.textPay = "선결제";
					}

					$scope.fieldInfo	= obj;

					$scope.fieldInfo.companionInfo = $filter('f_companion_count')(obj.golf_companion);
					$scope.fieldInfo.partnerInfo = $filter('f_partner_count')(obj.golf_partner);
					$scope.fieldInfo.teamCnt = $scope.fieldInfo.companionInfo.cnt + $scope.fieldInfo.rsvpsStatusCnt.cnt;

					$scope.fieldInfo.terms = false;
					$scope.fieldInfo.privacy = false;

					// if($scope.fieldInfo.invitation_list_cnt > 0 && $rootScope.me.id != $scope.fieldInfo.poster_id) $scope.openModal(4);
					// if($scope.fieldInfo.me_rsvp_cnt == 0 && $rootScope.me.id != $scope.fieldInfo.poster_id && $scope.fieldInfo.gender!=$rootScope.me.profile.gender) $scope.openModal(4);
					if($scope.fieldInfo.me_rsvp_cnt == 0 && $rootScope.me.id != $scope.fieldInfo.poster_id && $scope.fieldInfo.invitation_list_cnt > 0 && $scope.fieldInfo.gender!=$rootScope.me.profile.gender) $scope.openModal(4);

					$scope.payForm = {
						'CASH_GB': '',
						'CN_SVCID': '180419053346',
						'PAY_MODE': '10',
						'Prdtprice': $scope.fieldInfo.payPrice,
						'Tradeid': 'TEESHOT-180419053346_' + $filter('appr_dtm')(),
						'Prdtnm': $scope.fieldInfo.golf_club_name,
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


					if ($scope.fieldInfo.me_rsvp_cnt > 0 && $scope.fieldInfo.me_rsvp_status==1) {
						if ( JSON.parse(localStorage.getItem('popup')) ) {
							$scope.getLocal = JSON.parse(localStorage.getItem('popup'));
						} else {
							$scope.getLocal = [];
						}

						var popchk = true;

						angular.forEach($scope.getLocal, function(value, key) {
							if (popchk) {
								if (value == $scope.fieldInfo.id) {
									popchk = false;
								}
							}
						});

						if (popchk) {
							var alertPopup = popup.alert('파트너 확정','<div class="text-center bold margin-top20 margin-bottom20"><p class="assertive">"파트너로 확정되었습니다"</p><p class="margin-top20">① 통화하여 인사를 나누시고 내용을 확인하세요~</p><p>② 파트너로 맞지 않으시면.. 파트너취소 가능합니다.</p></div>');
							alertPopup.then(function() {
								$scope.getLocal.push($scope.fieldInfo.id);
								localStorage.setItem('popup', JSON.stringify($scope.getLocal) );
							});
						}
					}

				}
			);
			
		};



// function loadStartCallBack() {

//     $('#status-message').text("loading please wait ...");

// }

// function loadStopCallBack() {

//     if (inAppBrowserRef != undefined) {

//         inAppBrowserRef.insertCSS({ code: "body{font-size: 25px;" });

//         $('#status-message').text("");

//         inAppBrowserRef.show();
//     }

// }

// function loadErrorCallBack(params) {

//     $('#status-message').text("");

//     var scriptErrorMesssage =
//        "alert('Sorry we cannot open that page. Message from the server is : "
//        + params.message + "');"

//     inAppBrowserRef.executeScript({ code: scriptErrorMesssage }, executeScriptCallBack);

//     inAppBrowserRef.close();

//     inAppBrowserRef = undefined;

// }

// function executeScriptCallBack(params) {

//     if (params[0] == null) {

//         $('#status-message').text(
//            "Sorry we couldn't open that page. Message from the server is : '"
//            + params.message + "'");
//     }

// }

// var inAppBrowserRef;

// function startCallback(event) {
// 	console.log('시작');
// 	console.log(event);
// }

// function stopCallback(event) {
// 	console.log('끝');
// 	console.log(event);
// 	var script = "MCASH_PAYMENT(document.paymentForm)";
// 	var scriptErrorMesssage =
//        "alert('Sorry we cannot open that page. Message from the server is : ');"
// 	// inAppBrowserRef.executeScript({ code: alert('Sorry we cannot open that page. Message from the server is : ') }, scriptCallback);
// }

// function exitCallback(event) {
// 	console.log('취소');
// 	console.log(event);
// 	$scope.get_field({id: $scope.fieldInfo.id});
// }

// function scriptCallback(event) {
// 	console.log('스크립트 콜백');
// 	console.log(event);
// }

		$scope.GolfPayment = function(isValid) {

			if (isValid.$valid) {

				if (!$scope.payForm.CASH_GB) {
					popup.alert('오류','결제수단을 선택하세요.');
					return;
				}

				var Tradeid = 'TEESHOT-180419053346_' + $filter('appr_dtm')();
				$scope.payForm.Tradeid = Tradeid;

				$ionicLoading.show();

				$http({
					method: 'post',
					url: apiServer + 'premium/paymentcart?token=' + localStorage.getItem('authToken'),
					data: {
						payment_type: 'golf',
						code: 'P',
						user_id: $rootScope.me.id,
						field_id: $scope.fieldInfo.id,
						CASH_GB: $scope.payForm.CASH_GB,
						Prdtprice: $scope.payForm.Prdtprice,
						Prdtnm: $scope.payForm.Prdtnm,
						Tradeid: Tradeid
					},
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				})
				.then(function(response) {

					if (response.data.success) {

						var url = apiServer + "appPayment?Tradeid="+Tradeid+"&token=" + localStorage.getItem('authToken');
						var target = "_system";

						var options = "location=yes";

						var inAppBrowserRef = cordova.InAppBrowser.open(url, target, options);

// inAppBrowserRef.addEventListener('loadstart', startCallback);
// inAppBrowserRef.addEventListener('loadstop', stopCallback);
// inAppBrowserRef.addEventListener('exit', exitCallback);

// inAppBrowserRef.show();

						// MCASH_PAYMENT(document.paymentForm);
					} else {
						popup.alert('오류',response.data.message);
					}
					
				},function(error){
					popup.alert('알림','결제 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
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
		 * 프리미엄 종료
		 */
		$scope.end = function(item) {
			if (item.deleted_at) {
				popup.alert('알림','<p class="text-center margin-top20 margin-bottom20">이미 초청을 종료 하셨습니다.</p>');
				return;
			}

			var confirmPopup = popup.confirm('초청 종료','<div class="margin-top20 margin-bottom20 bold text-center"><p>종료하시겠습니까?</p><p class="margin-top20">초청이 종료되어 신청이 마감됩니다.</p></div>');
			
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					$http.post(apiServer + 'premium/end/'+item.id+'?token=' + localStorage.getItem('authToken'))
						.then(function(response) {
							popup.alert('종료 확정','<div class="margin-top20 margin-bottom20 text-center"><p>"종료 되었습니다"</p><p>마이페이지-활동내용에서 볼수 있습니다.</p></div>');
							$scope.doRefresh();
							$scope.closeModal(9);
						},function(error){
							$ionicLoading.hide();
						}).finally(function() {
							$ionicLoading.hide();
							if ($scope.modalMenu) $scope.modalMenu.hide();
						}
					);
				}
			});
		};

		/**
		 *  초청종류 선택시 값 초기화
		 */
		$scope.golfType = function() {
			$scope.form.sponsor = '';
			$scope.form.option = '';
			$scope.form.clubRegion = '';
			$scope.form.clubName = '';
			$scope.form.bookingDateTime = '';
		};

		/**
		 * 관리자 확인
		 */
		$scope.adminCheck = function(item, rsvp) {
			var confirmPopup = popup.confirm('관리자 확인','<div class="text-center"><div class="margin-top20 margin-bottom20 bold text-center">대기자를 신청자로 등록하시겠습니까?</div></div>');
			
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					$http({
						method: 'post',
						url: apiServer + 'premium/hidden?token=' + localStorage.getItem('authToken'),
						data: { id: rsvp.id },
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
					.then(function(response) {
						if (response.data.success) {
							popup.alert('등록완료','<div class="margin-top20 margin-bottom20 bold text-center">신청자로 등록되었습니다.</div>');
							$scope.get_field({ id: item.id });
						} else {
							popup.alert('오류', response.data.message);
							return;
						}
					},function(error){
						$ionicLoading.hide();
					}).finally(function() {
						$ionicLoading.hide();
						if ($scope.modalMenu) $scope.modalMenu.hide();
					});
				}
			});
		};

		/**
		 * 조인중인 골프조인으로 이동
		 */
		$scope.golfjoinMove = function(item) {
			$scope.closeModal(9);
			$state.go('app.bookingJoin.lists', {article_type: true, fieldId: item.booking_id});
		};

		$scope.share = function(item) {
			var spon = $filter('p_sponsor')(item.golf_sponsor, item.golf_type);

			if (item.golf_type) {
				var people = $filter('f_golf_sex')(item.filter_sex) + ' ' + item.golf_partner + '명';
			} else {
				var people = $filter('f_invite')(item.golf_partner) + '인 필수';
			}

			if (item.golf_type == 0 || item.golf_type == 1 || item.golf_type == 4) {
				var gtime = $filter('f_formatdate')(item.golf_time, 1);
				var name = item.golf_club_name;
			} else {
				var gtime = $filter('f_formatdate')(item.golf_time, 'm.dw')+'~'+$filter('f_formatdate')(item.golf_next_time, 'm.dw');
				var name = $filter('p_foreign')(item.golf_club_code);
			}
			var message = '[티샷] 프리미엄 무료초대 \r\n' + name + ' \r\n' + gtime +' \r\n' + spon + ' \r\n'+ people +
			'\r\n\r\n\r\n[앱 다운받기]' +
			'\r\n\r\n▶ http://localhost';

			$cordovaSocialSharing
			.share(message, '', '', '')
			.then(function(result) {
			}, function(err) {
			});
		};

		$scope.openInAppBrowser = function(url, target) {
			InAppBrowser(url, target);
		};

		$scope.infoLink = function() {

			$scope.toggleSubmenu(1);
			$state.go('app.premiumTabs.invite');
		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			if (item.poster_id) item.user_id = item.poster_id;
			else item.user_id = item.id;

			if (item.poster) item.username = item.poster;

			$scope.openProfile(item);
		};

		$scope.testcheck = function() {
			$http({
				method: 'post',
				url: apiServer + 'fields/test?token=' + localStorage.getItem('authToken'),
				data: {},
				headers: {
					'Content-Type' : 'application/json; charset=utf-8'
				}
			})
			.then(function(response) {

				if (response.data.success) {
					console.log(response.data);
				} else {
					popup.alert('오류',response.data.message);
				}
				
			},function(error){
				popup.alert('알림','부킹 확정 작업중 오류가 발생하였습니다.<br />다시시도 하시기 바랍니다.');
			}).finally(function() {
			});
		};

		var timeoutId = null;

		$scope.$watch('form.distance', function() {
	        if(timeoutId !== null) {
	            return;
	        }
	        
	        timeoutId = $timeout( function() {
	            $timeout.cancel(timeoutId);
	            timeoutId = null;
	            // Now load data from server 
	        }, 1000); 
	    });

		var ConfirmPopup = '';

		$scope.$on('$stateChangeStart', function() {
			if($scope.invitationModal) $scope.invitationModal.hide();
			if($scope.invitationReviewModal) $scope.invitationReviewModal.hide();
			if($scope.PostModal) $scope.PostModal.hide();
			if($scope.InvitationViewModal) $scope.InvitationViewModal.hide();
			if($scope.TermsModal) $scope.TermsModal.hide();
			if($scope.PrivacyModal) $scope.PrivacyModal.hide();
			if($scope.ReCommentMenuModal) $scope.ReCommentMenuModal.hide();
			if($scope.PartnerListModal) $scope.PartnerListModal.hide();
			if($scope.DetailInfoModal) $scope.DetailInfoModal.hide();
			if(ConfirmPopup) ConfirmPopup.close();
		});
		
		$scope.openModal = function(index,item) {
			$scope.shareItem = item;
			if (index == 1) {

				$scope.form	= {};
				$scope.form = { 'fieldId' : $scope.fieldInfo.id, 'distance' : '0', 'inviteCnt' : 0 };

				$ionicModal.fromTemplateUrl('templates/modal/premium/invitation.html', {
					id: '1',
					scope: $scope
				}).then(function(modal) {
					$scope.invitationModal = modal;
					$scope.invitationModal.show();
				});
			} else if (index == 2) {
				console.log($scope.form);
				$ionicModal.fromTemplateUrl('templates/modal/premium/invitation-review.html', {
					id: '2',
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.invitationReviewModal = modal;
					$scope.invitationReviewModal.show();
				});
			} else if (index == 3) {

				$scope.postsOpen(item);

				$ionicModal.fromTemplateUrl('templates/modal/premium/posts.html', {
					id: '3',
					scope: $scope
				}).then(function(modal) {
					$scope.PostModal = modal;
					$scope.PostModal.show();
				});

			} else if (index == 4) {
				$ionicModal.fromTemplateUrl('templates/modal/premium/invitation-view.html', {
					id: '4',
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.InvitationViewModal = modal;
					$scope.InvitationViewModal.show();
				});
			} else if (index == 5) {
				$ionicModal.fromTemplateUrl('templates/modal/premium/terms.html', {
					id: '5',
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.TermsModal = modal;
					$scope.TermsModal.show();
				});
			} else if (index == 6) {
				$ionicModal.fromTemplateUrl('templates/modal/premium/privacy.html', {
					id: '6',
					scope: $scope,
					animation: 'fade-in-scale'
				}).then(function(modal) {
					$scope.PrivacyModal = modal;
					$scope.PrivacyModal.show();
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

				$ionicModal.fromTemplateUrl('templates/modal/premium/detail-info.html', {
					id: '9',
					scope: $scope
				}).then(function(modal) {
					$scope.DetailInfoModal = modal;
					$scope.DetailInfoModal.show();
				});
			} else if (index == 99) {
				$ionicModal.fromTemplateUrl('templates/modal/premium/invite-people.html', {
					id: '99',
					scope: $scope
				}).then(function(modal) {
					$scope.InvitePeopleModal = modal;
					$scope.InvitePeopleModal.show();
				});
			}
		};

		$scope.closeModal = function(index,item) {
			if (index == 1) {
				$scope.invitationModal.hide();
				$scope.invitationModal.remove();
			} else if (index == 2) {
				$scope.invitationReviewModal.hide();
				$scope.invitationReviewModal.remove();
			} else if (index == 3) {
				$scope.PostModal.hide();
				$scope.PostModal.remove();
			} else if (index == 4) {
				// if (item) {
				// 	BookingService.invitationread({ list_id: item }, function() {});
				// }
				$scope.InvitationViewModal.hide();
				$scope.InvitationViewModal.remove();
			} else if (index == 5) {
				$scope.TermsModal.hide();
				$scope.TermsModal.remove();
			} else if (index == 6) {
				$scope.PrivacyModal.hide();
				$scope.PrivacyModal.remove();
			} else if (index == 7) {
				$scope.ReCommentMenuModal.hide();
				$scope.ReCommentMenuModal.remove();
			} else if (index == 8) {
				$scope.PartnerListModal.hide();
				$scope.PartnerListModal.remove();
			} else if (index == 9) {
				$scope.DetailInfoModal.hide();
				$scope.DetailInfoModal.remove();
			} else if (index == 99) {
				$scope.InvitePeopleModal.hide();
				$scope.InvitePeopleModal.remove();
			}
		};

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if($scope.invitationModal) $scope.invitationModal.remove();
			if($scope.invitationReviewModal) $scope.invitationReviewModal.remove();
			if($scope.PostModal) $scope.PostModal.remove();
			if($scope.InvitationViewModal) $scope.InvitationViewModal.remove();
			if($scope.TermsModal) $scope.TermsModal.remove();
			if($scope.PrivacyModal) $scope.PrivacyModal.remove();
			if($scope.ReCommentMenuModal) $scope.ReCommentMenuModal.remove();
			if($scope.PartnerListModal) $scope.PartnerListModal.remove();
			if($scope.DetailInfoModal) $scope.DetailInfoModal.remove();
			if($scope.InvitePeopleModal) $scope.InvitePeopleModal.remove();
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