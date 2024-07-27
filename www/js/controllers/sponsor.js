angular.module('starter.controllers')

	.controller('sponsorInviteCtrl', function() {
	})

	.controller('sponsorListsCtrl', function(
		$rootScope, 
		$scope,
		$state,
		$ionicModal, 
		$http, 
		$ionicLoading, 
		$filter, 
		$ionicScrollDelegate, 
		$timeout, 
		$stateParams, 
		$base64,
		Auth,
		SocialShare,
		InviteService,
		InAppBrowser, 
		popup,
		md5,
		BookingService
	) {

		$scope.Params = $stateParams;

		$scope.TextInvite = {};
		
		if ($scope.Params.inviteType == 1) {
			$scope.TextInvite.topTitle = '프리미엄 초청';
			$scope.TextInvite.postsText = '초청자가 비용을 부담하는 초청입니다.';
			$scope.TextInvite.postsPerson = '초청인원';
			$scope.TextInvite.DetailInfo = '초청내용';
		} else if ($scope.Params.inviteType == 0) {
			$scope.TextInvite.topTitle = '골프 조인';
			$scope.TextInvite.postsText = '각자 1/N로 비용을 부담하는 조인입니다.';
			$scope.TextInvite.postsPerson = '조인인원';
			$scope.TextInvite.DetailInfo = '조인내용';
		}

		

		var year = new Date().getFullYear();//97
		$scope.ageRange = [];
		for(var i=19; i<=70; i++) {
			$scope.ageRange.push({value:i});
		}

		var limit = 0;
		var offset = 0;
		var overlap = false;
		var post_id = '';
		var viewScroll = $ionicScrollDelegate.$getByHandle('ModalScroll');

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			// 푸시으로 들어왔을시 필드번호 값 지정
			// $scope.Params = {fieldId: '2505', article_type: 'sponsor_invite'};
			if ($scope.Params.article_type) {
				if ($scope.Params.article_type == 'sponsor_invite' || $scope.Params.article_type == 'golf_join') {
					$timeout(function() {
						$scope.openModal(9, { id: $scope.Params.fieldId });
					}, 1000);
				} else {
					$timeout(function() {
						$scope.openModal(8, { field_id: $scope.Params.fieldId });
					}, 1000);
				}
			}

			if (offset) limit = offset + 20;
			else limit = 20;

			$scope.nodeList(limit, 0, 1);
		});

		$scope.nodeList = function(nlimit, offset, type) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if ($state.current.name == 'app.inviteTabs.request') {
				if (type) InviteService.getRsvps({ limit:nlimit, offset:offset, inviteType: $scope.Params.inviteType }, $scope.loadList);
				else InviteService.getRsvps({ limit:nlimit, offset:offset, inviteType: $scope.Params.inviteType }, $scope.loadListScroll);
			} else {
				if (type) InviteService.getLists({ limit:nlimit, offset:offset, inviteType: $scope.Params.inviteType }, $scope.loadList);
				else InviteService.getLists({ limit:nlimit, offset:offset, inviteType: $scope.Params.inviteType }, $scope.loadListScroll);
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

		// 초청 등록
		$scope.golfPosts = function(params) {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if (params.inviteType == 0) {
				var ConfirmPopup = popup.confirm('알림','<div><p><span class="bold assertive"><u>골프 조인</u></span> 등록하기 입니다.</p><p>(각자가 1/n로 비용을 내는 조인)</p><p class="padding-top">※ 프리미엄초청 등록은 프리미엄 페이지로 이동하시기 바랍니다.</p><p><a href="#/app/sponsorInvite/lists/1">프리미엄 초청 바로가기</a></p><p class="text-center bold padding">등록하시겠습니까?</p></div>');
				ConfirmPopup.then(function(res) {
					if (res) {
						$scope.openModal(3,'');
					}
				});
			} else {
				$scope.openModal(3,'');
			}

		};

		$scope.postsOpen = function(item) {
			$scope.form		= {};
			$scope.view = {};

			post_id = item;
		
			if(post_id) {//수정일 경우 현재 등록된 내용을 다시 불러 온다.

				$scope.view.title = '수정하기';

				InviteService.getOne(
					{
						id: post_id
					}, 
					function(obj) {
						$scope.form.post_id		= post_id;

						$scope.form.filterSex			= obj.filter_sex;
						$scope.form.filterSage		= obj.filter_s_age.toString();
						$scope.form.filterEage		= obj.filter_e_age.toString();
						
						$scope.form.clubType	= obj.golf_club_code.substr(1, 1);
						$scope.form.clubRegion	= obj.golf_club_code.substr(3, 1);
						$scope.set_clubs(obj.golf_club_id);
						
						
						$scope.form.bookingDate	= $filter('s_date')(obj.golf_time);
						$scope.form.bookingDateTime	= $filter('s_date')(obj.golf_time);
					
	
						$scope.form.companion	= obj.golf_companion.toString();
						$scope.form.partners	= obj.golf_partner.toString();
						$scope.form.green_fee	= obj.green_fee;
						$scope.form.cart_fee	= obj.cart_fee;
						$scope.form.caddie_fee	= obj.caddie_fee;
						$scope.form.message		= obj.message;
					}
				);
						
			} else {//수정이 아닐 경우 초기화 시킨다.
				$scope.view.title = '등록신청';
				$scope.nowTime = new Date();
			}

			// $timeout(function() {
			//  	viewScroll.scrollTop();
			// }, 0);
		};

		//등록하기
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

							popup.alert('접수완료','<div class="margin-top20"><h4 class="text-center positive bold">접수되었습니다.</h4><p class="margin-top text-center">1:1 상담 전화드립니다.</p><div class="margin-top20"><p>[이후 진행사항]</p><p>① 골프장 선택하기(티샷 추천골프장)</p><p>② 필터링하고 초대장 발송하기</p></div></div>');
							
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

				if (!$scope.form.filterSex) {
					popup.alert('오류','필터 성별 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.filterSage) {
					popup.alert('오류','필터 연령 최소 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.filterEage) {
					popup.alert('오류','필터 연령 최대 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if ($scope.form.filterSage > $scope.form.filterEage) {
					popup.alert('오류','연령 선택이 잘 못 되었습니다.');
					return;
				}
				if (!$scope.form.clubType) {
					popup.alert('오류','골프장 회원종류 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
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
					popup.alert('오류','초청자의 동반자 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.partners) {
					popup.alert('오류','초청인원 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}

				var Ccount = $filter('f_companion_count')($scope.form.companion);
				var Pcount = $filter('f_partner_count')($scope.form.partners);

				if (Ccount.cnt + Pcount.cnt > 4) {
					popup.alert('오류','초청자의 동반자와 초청인원의 합이 4명이 넘습니다.<br />최대 4명으로 변경 하시기 바랍니다.');
					return;
				}

				if (!$scope.form.green_fee) {
					popup.alert('오류','그린피 비용 정보가 없습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if ($scope.form.green_fee < 10000) {
					popup.alert('오류','그린피 비용이 너무 작습니다.<br />다시시도 하시기 바랍니다.');
					return;
				}
				if (!$scope.form.message) {
					popup.alert('오류','하고싶은 말 내용이 없습니다.<br />다시시도 하시기 바랍니다.');
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
				//입력된 시간 유효성 끝


				$scope.submitProcess = function() {

					overlap = true;
								

					var obj = {
						golf_invite_type: $scope.Params.inviteType,
						club_name: $scope.form.clubName, 
						date: bookingDate, 
						hour: bookingHour, 
						partners: $scope.form.partners, 
						golf_companion: $scope.form.companion, 
						filter_sex: $scope.form.filterSex, 
						filter_s_age: $scope.form.filterSage, 
						filter_e_age: $scope.form.filterEage, 
						green_fee: $scope.form.green_fee, 
						cart_fee: $scope.form.cart_fee, 
						caddie_fee: $scope.form.caddie_fee, 
						message: $scope.form.message
					};

					//for get
					//var obj = 'club_type='+$scope.form.clubType+'&club_region='+$scope.form.clubRegion+'&club_name='+$scope.form.clubName+'&golf_reserved='+$scope.form.golfReserved+'&date='+bookingDate+'&hour='+encodeURIComponent(bookingHour)+'&partners='+$scope.form.partners+'&green_fee='+green_fee+'&cart_fee='+cart_fee+'&caddie_fee='+caddie_fee+'&message='+$scope.form.message;
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
						// console.log(response);
						if(response.data.success) {
							overlap = false;
							
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

		//등록 수정하기
		$scope.onItemModify = function(item){
			InviteService.getRequest(item.id, function(res) {
				if (res.success) {
					$scope.openModal(3, item.id);
					if ($scope.modalMenu) $scope.modalMenu.hide();
				}
			});
		};

		//등록 취소하기
		$scope.onItemCancel	= function(item){
			// if ($scope.modalMenu) $scope.modalMenu.hide();
			
			if (item.deleted_at) {
				popup.alert('알림','<p class="text-center padding">이미 신청 마감 하셨습니다.</p>');
				return;
			}

			var confirmPopup = popup.confirm('신청 마감','<div class="text-center"><p><strong>마감하시겠습니까?</strong></p><p>(마감후, <span class="assertive">활동정보</span>에서 열람가능합니다.</p></div>');
			
			confirmPopup.then(function(res) {
				 if(res) {//실행
					$ionicLoading.show();
					$http.get(apiServer + 'fields/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
						.then(function(response) {
								// loadGolfList();
								$scope.doRefresh();
								$state.go('app.inviteTabs.invite');
								
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
		 * 신청 리스트 체크
		 */
		$scope.partner_ask = function($data) {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			InviteService.putPartner($data, $scope.req_partner);
		};

		// 신청하기
		$scope.req_partner = function(flag, $data) {

			// if (flag) {
			// 	$state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
			// 	return;
			// }

			//본인이 등록한 것은 상세리스트로 이동
			if($data.poster_id == $rootScope.me.id || flag){
				$scope.openModal(8, { field_id: $data.id });
				// $state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
				return;
			}
			
			var today = new Date();
			var golf_time = new Date($data.golf_time);
			var interval = golf_time - today;

			if ($data.deleted_at != null || interval < 0) {
				popup.alert('알림','완료된 초청입니다.');
				return;
			}

			// 신청하기
			if ($scope.Params.inviteType == 1) var text = '<p class="bold">① 초청자가 비용을 부담하는 초청입니다.</p><p><strong>② 비밀유지</strong></p><p class="padding-left">신청사실은 ' + $data.poster + '님에게만 통지되며,<br />다른 회원에게는 공개되지 않습니다.</p><p class="padding-top text-center bold"><span class="positive">' + $data.poster + '</span>님이 기다리고 있습니다.</p><p class="text-center bold">신청하시겠습니까?</p>';
			else  var text = '<p>① 각자가 1/n로 비용을 내는 조인입니다.</p><p class="padding-top text-center bold"><span class="positive">' + $data.poster + '</span>님이 기다리고 있습니다.</p><p class="text-center bold">신청하시겠습니까?</p>';
			var confirmPopup = popup.confirm('신청하기',text);

			confirmPopup.then(function(res) {
				if(res) {

					$ionicLoading.show();

					// 안심번호
					// $scope.delphicomRN = $rootScope.me.profile.phone;
					// $scope.delphicomAuto = {
					// 		iid: delphicomIID,
					// 		rn: $scope.delphicomRN,
					// 		auth: $base64.encode(md5.createHash(delphicomIID + $scope.delphicomRN))
					// }

					// $http({
					// 	method: 'POST',
					// 	url: 'http://210.109.108.132:8087/link/auto_mapp.do',
					// 	data: $.param($scope.delphicomAuto),
					// 	headers: {
					// 		'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
					// 	}
					// }).then(function(autoData) {

					// 	if (autoData.data.rt==0) {

							$http({
								method: 'post',
								url: apiServer + 'fields/rsvp/store?token=' + localStorage.getItem('authToken'),
								data: {
									poster: $rootScope.me.username, 
									poster_id: $rootScope.me.id, 
									field_id: $data.id,
									gender: ''
								},
								headers: {
									'Content-Type' : 'application/json; charset=utf-8'
								}
							}).then(function(response) {
								var obj	= response.data;

								if(obj.success == false){

									// 안심번호 삭제
									// $scope.delphicomVN = autoData.data.vn;
									// $scope.delphicomSet = {
									// 		iid: delphicomIID,
									// 		vn: $scope.delphicomVN,
									// 		rn: " ",
									// 		auth: $base64.encode(md5.createHash(delphicomIID + $scope.delphicomVN))
									// }

									// $http({
									// 	method: 'POST',
									// 	url: 'http://210.109.108.132:8087/link/set_vn.do',
									// 	data: $.param($scope.delphicomSet),
									// 	headers: {
									// 		'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
									// 	}
									// }).then(function(setData) {
									// 	// console.log(setData);
									// },function(error){
									// }).finally(function() {
									// });

									if(obj.result_code ==  2){
										$scope.openModal(8, { field_id: $data.id });
										// $state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
										return;
									}else{
										popup.alert('신청실패', obj.message);
										return;
									}
								}else{
									popup.alert('알림', '신청이 완료되었습니다.');
									$scope.openModal(8, { field_id: $data.id });
									// $state.go('app.golfjoin.partnerlist', {fieldId: $data.id});
								}
							},function(error){

								// 안심번호 삭제
								// $scope.delphicomVN = autoData.data.vn;
								// $scope.delphicomSet = {
								// 		iid: delphicomIID,
								// 		vn: $scope.delphicomVN,
								// 		rn: " ",
								// 		auth: $base64.encode(md5.createHash(delphicomIID + $scope.delphicomVN))
								// }

								// $http({
								// 	method: 'POST',
								// 	url: 'http://210.109.108.132:8087/link/set_vn.do',
								// 	data: $.param($scope.delphicomSet),
								// 	headers: {
								// 		'Content-Type' : 'application/x-www-form-urlencoded; charset=UTF-8'
								// 	}
								// }).then(function(setData) {
								// 	// console.log(setData);
								// },function(error){
								// }).finally(function() {
								// });

								$ionicLoading.hide();
							}).finally(function() {
								$ionicLoading.hide();
							});

					// 	} else {
					// 		popup.alert('오류','안심번호 생성 중 오류가 발생하였습니다.<br />다시 시도하시기 바랍니다.');
					// 		$ionicLoading.hide();
					// 		return;
					// 	}

					// },function(error){
					// 	$ionicLoading.hide();
					// }).finally(function() {
						
					// });

				}
			});

		};

		/**
		 * 파트너 리스트 불러오기
		 */
		$scope.get_partner = function(item) {

			$ionicLoading.show();

			$scope.selection = [];
			$scope.selectionName = [];
			$scope.field = {};

			$http.get(apiServer + 'fields/rsvps/get/'+ item.field_id +'?token=' + localStorage.getItem('authToken'))
				.then(function(response) {

					$scope.partnerLists	= response.data.rsvps;
					$scope.field	= response.data.field;

					$scope.field.invite_count = $filter('f_partner_count')($scope.field.golf_partner).cnt;

					// $timeout(function() {
					//  	viewScroll.scrollTop();
					// }, 0);

					$ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
				
				
			);
		};

		/**
		 * 파트너 선택
		 */
		$scope.isconfirm = function(item) {

			if($scope.selection.length < 1){
				popup.alert('알림','한사람 이상 선택해 주세요.');
				return;
			}

			InviteService.partnerChk({id: item.id}, function(obj) {

				var partnerCnt = $scope.field.invite_count - obj.cnt;

				if($scope.selection.length > partnerCnt){
					popup.alert('알림','초청가능한 인원보다 많이 선택되었습니다.');
					return;
				}

				var confirmPopup = popup.confirm('알림', '<div class="text-center padding"><strong>' + $scope.selectionName + '</strong>님을 <br />참가자로 선택하시겠습니까?</div>');
				confirmPopup.then(function(res) {
					if(res) {
						$ionicLoading.show();

						// var addstr = "";
						// angular.forEach($scope.selection, function(value, key) {
						// 	addstr = addstr + '&ids[]='+value;
						// });



						//{"golf_partner":3,"ids":[2306,2308,2310]}
						// $http.post(apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken')+'&golf_partner='+$scope.field.golf_partner+addstr)
						//$http.get(apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken')+'&golf_partner='+field.golf_partner+addstr)
						$http({
							method: 'post',
							url: apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken'),
							// method: 'get',
							// url: apiServer + 'fields/rsvps/put?token=' + localStorage.getItem('authToken') + '&field_id=' + item.id + '&golf_partner=' + item.golf_partner + '&invite_count=' + $scope.field.invite_count + '&selection=' + $scope.selection + addstr,
							data: {
								field_id: item.id,
								golf_partner: item.golf_partner,
								invite_count: $scope.field.invite_count,
								ids: $scope.selection
							},
							headers: {
								'Content-Type' : 'application/json; charset=utf-8'
							}
						})
							.then(function(response) {
								// console.log(response);
								$scope.get_partner({ field_id: item.id });

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
					} else {
						return;
					}
				});

			})

		};

		//신청자가 취소하는 경우
		$scope.formDate = {};
		$scope.applyCancel = function() {
			//console.log($scope.formDate.listId);
			var confirmPopup = popup.confirm('신청 취소','취소하시겠습니까?');
			confirmPopup.then(function(res) {
				if(res) {
					$ionicLoading.show();
					$http.get(apiServer + 'fields/rsvps/delete/?id='+$scope.formDate.listId+'&token=' + localStorage.getItem('authToken'))
						.then(function(response) {
							// console.log(response);
							if (response.data.success) {
								$scope.get_partner({ field_id: $scope.field.id });
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
		 * 토글 선택
		 */
		$scope.toggleSelection = function toggleSelection(item) {
			var idx = $scope.selection.indexOf(item.id);
			if (idx > -1) {// is currently selected
				$scope.selection.splice(idx, 1);
				$scope.selectionName.splice(idx, 1);
			}else {// is newly selected
				$scope.selection.push(item.id);
				$scope.selectionName.push(item.name);
			}
		};

		/**
		 * 댓글 가져오기
		 */
		$scope.replyId = '';
		$scope.get_comment = function (item){

			$scope.CommentLoad(1);

			$ionicLoading.show();
			$scope.replyId = item.id;
			$scope.replyformData	= {body:"", reple_id:""};//변수 선언
			$http.get(apiServer + 'fields/comment/'+item.id+'?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					if(response.data.success){
						$scope.comments = response.data.reple;

						// $timeout(function() {
						//  	viewScroll.scrollTop();
						// }, 0);
					}
					$ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		};

		/**
		 * 댓글 등록
		 */
		$scope.commentSend = function(isValid) {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if (!$scope.replyId) {
				var alertPopup = popup.alert('알림','댓글 정보가 잘못 되었습니다.<br />다시 시도하시기 바랍니다.');
				alertPopup.then(function(res) {
					$scope.closeModal(4);	
				})
				return;
			}

			if (isValid.$valid) {
				$ionicLoading.show();

				var url;
				if($scope.replyformData.reple_id){//수정이면
					url = apiServer + 'reples/put/'+$scope.replyformData.reple_id+'?token=' + localStorage.getItem('authToken');
				}else{//등록이면
					url = apiServer + 'reples/create?token=' + localStorage.getItem('authToken');
				}
				
				$http({
					method: 'post',
					url: url,
					data: {
						field_id: $scope.replyId, 
						body: $scope.replyformData.body
					},
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				}).then(function(response) {
					if(response.data.success){
						// if(response.data.reple) {
						// 	response.data.reple.thumbnail_image = response.data.reple.img_src;
						// 	$scope.comments.push(response.data.reple);
						// }
						
						$scope.replyformData.body = "";

						$scope.get_comment({id : $scope.replyId});

						var target_list = $filter('getByNo')($scope.lists, $scope.replyId);
						target_list.item.replecnt++;
					}
					$ionicLoading.hide();
				}, function(error){
					$ionicLoading.hide();
				});
				
				$scope.replyformData.reple_id = "";
			}
		};

		//댓글 수정
		$scope.onCommentModify = function(item){
			$scope.CommentMenuModal.hide();	
			$scope.replyformData.body		= item.body;
			$scope.replyformData.reple_id	= item.id;
		};
		
		//댓글 삭제
		$scope.onCommentDelete = function(item){
			var confirmPopup = popup.confirm('삭제','삭제하시겠습니까?');

			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'reples/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'reples/delete/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						$scope.comments.splice($scope.comments.indexOf(item), 1);
						$scope.get_comment({id : item.field_id});
						var target_list = $filter('getByNo')($scope.lists, item.field_id);
						target_list.item.replecnt--;
					}, function(error){
					});
				}
			});	
			
			$scope.CommentMenuModal.hide();		
		};

		$scope.recommentId = '';
		$scope.recommentThread = '';
		//댓댓글 가져오기
		$scope.get_recomment = function(item){

			var reThread = $filter('parentThread')(item.thread);

			$scope.CommentLoad(2);

			$scope.recommentId = item.field_id;
			$scope.recommentThread = item.thread;
			$scope.formData	= {body:"", reple_id:""};//변수 선언
			$http.get(apiServer + 'fields/recomment/'+item.field_id+'/'+reThread+'/?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					if(response.data.success){
						$scope.recomments 		= response.data.reple;
						// $timeout(function() {
						//  	viewScroll.scrollTop();
						// }, 0);
					}
					$ionicLoading.hide();
				},function(error){
					$ionicLoading.hide();
				}
			);
		};

		// 대댓글 등록
		$scope.reCommentSend = function(isValid) {

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if (isValid.$valid) {
				$ionicLoading.show();
				
				var url;
				if($scope.formData.reple_id){//수정이면
					url = apiServer + 'reples/put/'+$scope.formData.reple_id+'?token=' + localStorage.getItem('authToken');
				} else  {//등록이면
					url = apiServer + 'reples/create?token=' + localStorage.getItem('authToken');
				}
				
				$http({
					method: 'post',
					url: url,
					data: {
						field_id: $scope.recommentId, 
						thread: $scope.recommentThread, 
						body:$scope.formData.body
					},
					headers: {
						'Content-Type' : 'application/json; charset=utf-8'
					}
				}).then(function(response) {
					if(response.data.success){
						$scope.formData.body = "";
						$scope.get_comment({id : $scope.replyId});
						$scope.get_recomment({field_id: $scope.recommentId, thread: $scope.recommentThread});
						var target_list = $filter('getByNo')($scope.lists, $scope.recommentId);
						target_list.item.replecnt++;
					}
					$ionicLoading.hide();
				}, function(error){
					$ionicLoading.hide();
				});
				
				$scope.formData.reple_id = "";
			}
		};

		//대댓글 수정
		$scope.onReCommentModify = function(item){
			$scope.ReCommentMenuModal.hide();	
			$scope.formData.body		= item.body;
			$scope.formData.reple_id	= item.id;
		};
		
		//대댓글 삭제
		$scope.onReCommentDelete = function(item){
			var confirmPopup = popup.confirm('삭제','삭제하시겠습니까?');

			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'reples/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'reples/delete/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						$scope.recomments.splice($scope.recomments.indexOf(item), 1);
						$scope.get_comment({id : item.field_id});
						var target_list = $filter('getByNo')($scope.lists, item.field_id);
						target_list.item.replecnt--;
					}, function(error){
					});
				}
			});	
			
			$scope.ReCommentMenuModal.hide();		
		};

		/**
		 * 비용 버튼
		 */
		$scope.golfPrice = function(item) {
			popup.alert('비용','<div class="row"><div class="col col-50">그린피</div><div class="col col-50 text-right">' + $filter('numberformat')(item.green_fee) + '원</div></div><div class="row"><div class="col col-50">카트피</div><div class="col col-50 text-right">' + $filter('numberformat')(item.cart_fee) + '원</div></div><div class="row"><div class="col col-50">캐디피</div><div class="col col-50 text-right">' + $filter('numberformat')(item.caddie_fee) + '원</div></div>');
		};

		/**
		 * 클럽리스트 불러오기
		 */
		$scope.set_clubs = function(sel){
			var t = $scope.form.clubType;
			var r = $scope.form.clubRegion;

			if (r != undefined && t != undefined)
			{
				$ionicLoading.show();
				$http.get(apiServer + 'clubs?club_type='+t+'&club_region='+r ,{})
					.then(function(response) {
						// console.log(response);
						$scope.clubs = response.data.items;
						if(sel) $scope.form.clubName = sel;
						$ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			}
		};

		$scope.openInAppBrowser = function(url, target) {
			InAppBrowser(url, target);
		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			if (item.poster_id) item.user_id = item.poster_id;
			else item.user_id = item.id;

			if (item.poster) item.username = item.poster;

			$scope.openProfile(item);
		};

		// 채팅하기
		$scope.onItemMessage = function(user) {
			
			if (!user.poster_id) user.poster_id = user.id;

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if ($rootScope.me.id == user.poster_id) return;

			$state.go('app.messagecreate', {userId:user.poster_id});
		};

		$scope.gotoActive = function() {
			// $ionicHistory.nextViewOptions({
			// 	disableBack: true
			// });
			$state.go('app.inviteTabs.invite');
		};
	

		/**
		 * 상세보기
		 */
		$scope.get_field = function(item) {

			// $ionicLoading.show();
			$scope.fieldInfo = '';

			InviteService.getOne(
				{
					id: item.id
				}, 
				function(obj) {

					$scope.fieldInfo	= obj;

					$scope.fieldInfo.companionInfo = $filter('f_companion_count')(obj.golf_companion);
					$scope.fieldInfo.partnerInfo = $filter('f_partner_count')(obj.golf_partner);
					$scope.fieldInfo.teamCnt = $scope.fieldInfo.companionInfo.cnt + $scope.fieldInfo.rsvp_list.length;
				}
			);
			
		};

		$scope.infoLink = function() {
			$scope.toggleSubmenu(1);
			$state.go('app.inviteTabs.invite');
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



		//공유 모달 관련 시작
		// sharing plugin
		var shareImage = "http://localhost/images/main/sns_1st.png";
		$scope.shareMain = function($data) {
			var txt = $data.golf_club_name+' ['+ $data.golf_club_region_name +'] - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +' ('+$filter('f_partner')($data.golf_partner)+' 초대)';
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
			var txt = $data.golf_club_name+' ['+ $data.golf_club_region_name +'] - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +' ('+$filter('f_partner')($data.golf_partner)+' 초대)';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.\r\n["+txt+"]","url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('kakaotalk', obj);
		};
		
		//네이버밴드
		$scope.sharenaverband = function($data) {
			var txt = $data.golf_club_name+' ['+ $data.golf_club_region_name +'] - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +' ('+$filter('f_partner')($data.golf_partner)+' 초대)';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.["+txt+"]","url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('band', obj);
		};
		
		
		//카카오스토리
		$scope.sharekakaostory = function($data) {
			var txt = $data.golf_club_name+' ['+ $data.golf_club_region_name +'] - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +' ('+$filter('f_partner')($data.golf_partner)+' 초대)';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.", "txt":txt,"url":webServer + "/fields/"+$data.id, "img":shareImage};
			SocialShare.share('kakaostory', obj);
		};
		
		//네이버카페
		$scope.sharenavercafe = function($data) {
			var txt = $data.golf_club_name+' ['+ $data.golf_club_region_name +'] - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +' ('+$filter('f_partner')($data.golf_partner)+' 초대)';
			var obj = {"title":"'파트너 조인'하실 분 초대합니다.","contents":webServer + "/fields/"+$data.id+"["+txt+"]", "img":shareImage};
			SocialShare.share('Navercafe', obj);
		};
		
		//페이스북
		$scope.sharefacebook = function($data) {
			var txt = $data.golf_club_name+' ['+ $data.golf_club_region_name +'] - '+ $filter('f_golfdate')($data.golf_time, $data.golf_reserved) +' ('+$filter('f_partner')($data.golf_partner)+' 초대)';
			var title	= "'파트너 조인'하실 분 초대합니다.["+txt+"]";
			var url		= webServer + "/fields/"+$data.id;
			// var img		= shareImage;
			var img		= $data.profile.thumbnail_image;
			if(img.indexOf('http')) img = webServer + "/"+img;
			window.plugins.socialsharing.shareViaFacebook(title, img, url);
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

				$scope.postsOpen(item);

				$ionicModal.fromTemplateUrl('templates/modal/invite/posts.html', {
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

				$ionicModal.fromTemplateUrl('templates/modal/invite/detail-info.html', {
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

    $scope.CommentLoad = function(type) {
	    var footerBar;
			var scroller;

			$timeout(function() {
				if(type == 1) {
					footerBar = document.body.querySelector('.homeView .bar-footer');
					scroller = document.body.querySelector('.homeView .scroll-content');
					// txtInput = angular.element(footerBar.querySelector('textarea'));
				} else {
					footerBar = document.body.querySelector('.homeView .recomment-footer');
					scroller = document.body.querySelector('.homeView .recomment-scroll');
				}
			}, 0);

			$scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
				if (!footerBar) return;

				var newFooterHeight = newHeight + 20;
				newFooterHeight = (newFooterHeight > 40) ? newFooterHeight : 40;
				newFooterHeight = (newFooterHeight > 103) ? 103 : newFooterHeight;

				footerBar.style.height = newFooterHeight + 'px';
				scroller.style.bottom = newFooterHeight + 'px';

				// viewScroll.scrollBottom();
			});
		}

	})

;