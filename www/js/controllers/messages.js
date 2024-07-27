/**
state('app.messages', url: '/messages',templateUrl: 'templates/messages.html',controller: 'MessagesCtrl'//chatting list (messages.js)
state('app.message', url: '/message/:messageId',templateUrl: 'templates/message.html',controller: 'MessageCtrl'//chatting from message  (messages.js)
state('app.messagecreate', url: '/message/create/:userId',templateUrl: 'templates/message.html',controller: 'MessageCreateCtrl'//chatting from general users  (messages.js)
*/
angular.module('starter.controllers')
	.directive('whenScrolled', ['$timeout', function($timeout) {
		var height = 0;
		var hab = 0;
		return function(scope, elm, attr) {
			var raw = elm[0];

			if (!height) height = raw.scrollHeight;

			elm.bind('scroll', function() {
				if (raw.scrollTop <= 50) { // load more items before you hit the top (raw.scrollTop <= 50)
					var sh = raw.scrollHeight;
	
					// raw.scrollTop = raw.scrollHeight - sh;
					if (height != sh) {
						hab = (sh - height) + 50;
						scope.loadMores(hab);
						// scope.$apply(attr.whenScrolled);
						
						// $timeout(function() {
						// 	console.log('scrollTop height : ' + height);
						// 	raw.scrollTop = height - 50;
						// }, 500);
					}
					height = sh;
				}
			});
		};
	}])
	
	//메시지 초기 페이지(대화상대 리스트를 가져온다.)
	.controller('MessagesCtrl', function(
		$scope, 
		$rootScope, 
		$state, 
		$http, 
		$ionicLoading, 
		$ionicModal, 
		$ionicPopup, 
		$filter,
		$ionicScrollDelegate,
		$ionicHistory, 
		$stateParams,
		Auth, 
		socket,
		popup,
		MessageService
	) {

		$scope.Params = $stateParams.obj;

		// $scope.chargeCheck = 0;
		var offset = 0;

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


			// loadMessages();


			if ($rootScope.me.profile.gender != 'female') {
				var endTime = $filter('BetweenDay')($rootScope.me.expired_at);
				var normal_endTime = $filter('BetweenDay')($rootScope.me.normal_expired_at);

				if (endTime <= 0 && normal_endTime <= 0) {
					$scope.chargeCheck = 1;
				} else {
					$scope.chargeCheck = 0;
				}
			}

			if($scope.Params && $scope.Params.type == 'charge') {
				var alertPopup = popup.alert('확인','<div class="text-center margin-top20 margin-bottom20"><p class="assertive">"일반 이용권이 없습니다"</p><p class="margin-top20">-> 구매하신후 이용 가능합니다.</p></div>','구매하기');
				alertPopup.then(function(res) {
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('app.payment');
				});
			}

			if (offset) var limit = offset + 20;
			else var limit = 20;

			$scope.nodeList(limit, 0, 1);

			// MessageService.getList({limit:limit,offset:0}, $scope.loadList);
		});
		
		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if($scope.modalChatManage) $scope.modalChatManage.remove();
		});

		$scope.nodeList = function(nlimit, offset, type) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if (type) MessageService.getList({ limit:nlimit,offset:offset }, $scope.loadList);
			else MessageService.getList({ limit:nlimit,offset:offset }, $scope.loadListScroll);
			// offset = 0;
			// MessageService.getList({limit:20,offset:offset}, $scope.loadList);
		}

		$scope.loadList = function(obj) {
			// console.log(obj);
			$scope.lists = obj;
			$scope.hasMoreData = false;
		}

		$scope.loadListScroll = function(obj) {
			$ionicLoading.hide();
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
			if (obj.length < 20) $scope.hasMoreData = true;
			else $scope.hasMoreData = false;
			// $scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// 스크롤 내릴시 리스트 추가
		$scope.loadMores = function() {
			$ionicLoading.show();
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				$scope.nodeList(20, offset, 0);
				// MessageService.getList({limit:20,offset:offset}, $scope.loadListScroll);
			} else {
				$ionicLoading.hide();
				$scope.hasMoreData = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			offset = 0;
			$scope.nodeList(20, offset, 1);	
			// $scope.nodeList();	
			$scope.$broadcast('scroll.refreshComplete');
		}
		
		function loadMessages(params) {
			$ionicLoading.show();
			$http.get(apiServer + 'msglist/?token=' + localStorage.getItem('authToken'), {params: params})
				.then(function(response) {
					$scope.messages = response.data.data;

					// console.log($scope.messages);
					
					//badgeCount.newMessage를 업데이트 한다.
					// var unread_cnt = 0;
					// angular.forEach($scope.messages, function(value, key) {
					// 	unread_cnt = unread_cnt + parseInt(value.unread_cnt);
					// });
					// var badgeCount	= JSON.parse(localStorage.getItem('count'));
					// badgeCount.newMessage = unread_cnt;
					// $rootScope.badgeCount	= badgeCount;
					// localStorage.setItem('count', JSON.stringify(badgeCount));
 				},function(error){
					console.log(error);
				}
			).finally(function(){
				$ionicLoading.hide();
			});
		}
		
		/**
		 * image treat (long press) 
		 */
		// 파일업로드 모달 활성화
		$ionicModal.fromTemplateUrl('templates/modal/chat-manage-menu.html', {
			scope: $scope,
			animation: 'fade-in-scale',
		}).then(function(modal) {
			$scope.modalChatManage = modal;
		});
		
		$scope.chatManage = function(item, itemIndex){
			$scope.item			= item;
			$scope.itemIndex	= itemIndex;
			$scope.modalChatManage.show();
		};
		
		$scope.leaveChatRoom = function(item, itemIndex){
			$scope.modalChatManage.hide();
			// var confirmPopup = $ionicPopup.confirm({
			// 	title: '알림',
			// 	template: '대화방에서 나가시겠습니까?'
			// });

			var confirmPopup = popup.confirm('알림','대화방에서 나가시겠습니까?');
			
			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'msglist/delete/'+item.id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'msglist/delete/'+item.id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					})
						.then(function(response) {
							$scope.lists.splice(itemIndex, 1);
						},function(error){
						}
					);
				}
			});
		};

		//프로필 방문
		$scope.onItemProfile = function(item) {

			item.username = item.name;
			item.user_id = item.user_id;

			$scope.openProfile(item);

			// if (!$rootScope.me.profile.phone) {
			// 	$scope.phoneCertCheck();
			// 	return;
			// }
			// $state.go('app.mypage.visit', {Id: item.name, userId: item.user_id});
		};

		$scope.chatMove = function(item) {

			if ($rootScope.me.profile.gender != 'female') {
				var endTime = $filter('BetweenDay')($rootScope.me.expired_at);
				var normal_endTime = $filter('BetweenDay')($rootScope.me.normal_expired_at);

				if (endTime <= 0 && normal_endTime <= 0) {
					var alertPopup = popup.alert('확인','<div class="text-center margin-top20 margin-bottom20"><p class="assertive">"일반 이용권이 없습니다"</p><p class="margin-top20">-> 구매하신후 이용 가능합니다.</p></div>','구매하기');
					alertPopup.then(function(res) {
						$ionicHistory.nextViewOptions({
							disableBack: true
						});
						$state.go('app.payment');
					});
					return;
				} else {
					$state.go('app.message', { messageId: item.id });
				}
			} else {
				$state.go('app.message', { messageId: item.id });
			}
		};

		// socket.on('putMessageList', function(req) {
		// 	$scope.lists.splice(0, 0, req);
		// });

		socket.on('putMessageListBadge', function(req) {

			var target = $filter('getById')($scope.lists, req.user_id);

			if (target) {
				target.item.unread_cnt++;
				target.item.lastmsg = req.lastmsg;
				target.item.message_created_at = req.message_created_at;

				$scope.lists.splice(target.idx, 1);
				$scope.lists.splice(0, 0, target.item);
			} else {
				$scope.lists.splice(0, 0, req);
			}

		});
		
	})
	
	//현재 대화상대자와의 메시지리스트 및 주고 받기가 가능하다.
	.controller('MessageCtrl', function(
		$rootScope, 
		$scope, 
		$state, 
		$http, 
		$stateParams, 
		$timeout,
		$ionicLoading,
		$ionicScrollDelegate,
		$ionicPopup,
		$ionicHistory,
		$filter,
		Auth,
		socket,
		popup,
		MessageService,
		onUserLists,
		$focusChat
	) {

		var date = new Date();
		$scope.date = $filter('f_formatdate')(date,'m.d');

		$scope.me		= $rootScope.me;

		$scope.data = {};

		var message_id	= $stateParams.messageId;
		var recipient	= $stateParams.userId;

		var viewScroll = $ionicScrollDelegate.$getByHandle('userMessageScroll');
		var footerBar; // gets set in $ionicView.enter
		var scroller;
		var txtInput; // ^^^

		var isIOS = ionic.Platform.isIOS();

		var offset = 0;
		// var limit = 20;

		var maxScrollableDistanceFromTop1;

		var messageWrappe = document.body.querySelector('.homeView .list');

		var observer = new MutationObserver(function(mutations) {
			viewScroll.scrollBottom();
		});

		observer.observe(messageWrappe, {
			childList: true
		});

		window.addEventListener('keyboardDidShow', function () {
		    console.log('keyboardDidShow');
		});

		window.addEventListener('keyboardDidHide', function () {
		    console.log('keyboardDidHide');
		});

		window.addEventListener('native.keyboardshow', function(event) {
			viewScroll.scrollBottom();
		});

		window.addEventListener('native.keyboardhide', function(event) {
			viewScroll.scrollBottom();
		});	

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()){
				$state.go('login');
				return;
			}

			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}

			if ($rootScope.me.profile.gender != 'female') {

				var endTime = $filter('BetweenDay')($rootScope.me.expired_at);
				var normal_endTime = $filter('BetweenDay')($rootScope.me.normal_expired_at);

				if (endTime <= 0 && normal_endTime <= 0) {
					$ionicHistory.nextViewOptions({
						disableBack: true
					});
					$state.go('app.messages', { obj: {type: 'charge'} });
					// $state.go('app.mypage.info', { obj: {type: 'firstVisit'} });
					return;
				}

			}

			$scope.loadCheck = false;

			if (offset) var limit = offset + 20;
			else var limit = 20;

			message_id	= $stateParams.messageId;
			recipient	= $stateParams.userId;

			// $ionicLoading.show();

			if(message_id) { 
				MessageService.getListMessage({limit:limit,offset:0,thread_id:message_id}, $scope.loadList);
				// getMessages();
			} else if(recipient) {
				MessageService.getCheck({ id: recipient }, $scope.msgCreate);
				// getMessageId();
			}

			$timeout(function() {
		        footerBar = document.body.querySelector('.homeView .bar-footer');
				scroller = document.body.querySelector('.homeView .scroll-content');
				txtInput = angular.element(footerBar.querySelector('textarea'));
		    }, 0);


		    /**
			 * 메시지를 받은 후 현재 리스트에 추가한다.
			 * {thread_id, message, user_id, username, thumbnail_image, created_at }
			 */
			socket.on('getMessage', function (req) {//req.message_id : tbl_chat_message.idx

				if(typeof(message_id) == "undefined" && req.recipient != "" && req.thread_id) message_id = req.thread_id;
				
				if(typeof(message_id) != 'undefined' && message_id == req.thread_id){//현재 송신자와 채팅 중이면 

					// $timeout(function() {
					// 	$scope.keepKeyboardOpen();
					//  	// viewScroll.scrollBottom();
					// }, 0);
					
					if (req.user_id == $rootScope.me.id) {
						$scope.message = "";
					} else {
						$scope.lists.push({created_at:new Date(req.created_at), body:req.body, user_id:req.user_id, username:req.username,thumbnail_image:req.thumbnail_image});//강제젹으로  id를 맞추어
						$timeout(function() {
							viewScroll.scrollBottom();
						},0);
					}

					$scope.create = false;

				} else {//상단에 alert메시지를 띄운다.
					//알림 메시지 띄우기
					// var Alertpopup = popup.alert('알림','<div class="text-center"><p>메시지 발송 중 오류가 발생하였습니다.</p><p>대화리스트로 이동됩니다.</p></div>');
					// Alertpopup.then(function(res) {
					// 	console.log(res);
					// 	if (res) {
					// 		$state.go('app.messages');		
					// 	}
					// });
				}

				
			});

			// socket.on('recallAuth', function(req) {
			// 	if(Auth.isLoggedIn()){
			// 		var me = JSON.parse(localStorage.getItem('me'));
			// 		var _SOCK_VAR = {
			// 							user_id:me.id, 
			// 							user_name:me.username, 
			// 							thumbnail_image:me.profile.thumbnail_image
			// 						};
			// 		socket.emit('login', _SOCK_VAR);
					
			// 		keepKeyboardOpen();

			// 		socket.emit('setMessage', {thread_id:req.thread_id, recipient:req.recipient, message:req.message}); //기존 채팅방이 존재 하면
			// 	}
			// });

		});

		$scope.msgCreate = function(obj) {
			$scope.message = "";
			if (obj.thread_id) {
				message_id = obj.thread_id;
				MessageService.getListMessage({limit:20,offset:offset,thread_id:message_id}, $scope.loadList);
			} else {
				$scope.create	= true;
				$scope.toUser = {username : obj.user.username, id: obj.user.id };
				$scope.username = obj.user.username;
				$scope.lists = [];

				$ionicLoading.hide();
			}
		}

		$scope.loadList = function(obj,toname,toUser) {
			$scope.lists = obj;
			$scope.toUser = toUser;
			$scope.username = toname;

			if ($scope.lists.length >= 20) {
				// $timeout(function() {
				// 	viewScroll.scrollBottom();

					$ionicLoading.hide();

					$timeout(function () {
						$scope.loadCheck = true;
					},1000);

				// }, 0);
			} else {
				$ionicLoading.hide();
			}

			
		}

		// 스크롤 내릴시 리스트 추가
		$scope.loadMores = function(height) {
			console.log('loadMores');
			maxScrollableDistanceFromTop1 = height;
			
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;

				$ionicLoading.show();
				MessageService.getListMessage({limit:20,offset:offset,thread_id:message_id}, $scope.loadListScroll);

				$scope.loadCheck = false;
			}
		}

		$scope.loadListScroll = function(obj) {
			// console.log('loadListScroll');
			angular.forEach(obj.reverse(), function(value, key) {
				$scope.lists.splice(0,0,value);
			});

			$timeout(function() {
				var maxScrollableDistanceFromTop2 = viewScroll.getScrollView().__maxScrollTop;
				viewScroll.scrollTo(0, maxScrollableDistanceFromTop2-maxScrollableDistanceFromTop1);
				$scope.loadCheck = true;
				$ionicLoading.hide();
			}, 300);
			
			viewScroll.resize();
		}

		//대화 저장하기(내가 상대게에 메시지를 보낼 경우)
		$scope.sendMessage = function () {//$scope.sendMessage = function (channelManager) {

			// $scope.keepKeyboardOpen();
			onUserLists();

			if ($scope.message) {

				$scope.data.smsg = $scope.message;

				if (message_id) {
					MessageService.deletedCheck({thread_id: message_id, toId: $scope.toUser.id}, function(obj) {
						socket.emit('setMessage', {thread_id:message_id, recipient:recipient, message:$scope.data.smsg}); //기존 채팅방이 존재 하면
					});
				} else {
					socket.emit('setMessage', {thread_id:message_id, recipient:recipient, message:$scope.data.smsg}); //기존 채팅방이 존재 하면
				}

				$scope.message = '';
				var sdate = new Date();
				$scope.lists.push({created_at:sdate, body:$scope.data.smsg, user_id:$rootScope.me.id, username:$rootScope.me.username,thumbnail_image:''});//강제젹으로  id를 맞추어
				
			}

		};
		
		socket.emit('joinRoom', message_id);

		$scope.shouldNotFocusOnBlur = function() {
			// console.log('shouldNotFocusOnBlur');
			$focusChat.setFocusOnBlur(false);
		};

		// $scope.keepKeyboardOpen = function() {
		// 	txtInput.one('blur', function() {
		// 		// console.log('blur');
		// 		txtInput[0].focus();
		// 	});
		// };

		$scope.refreshScroll = function (scrollBottom, timeout) {
			// console.log('refreshScroll');
			$timeout(function () {
				scrollBottom = scrollBottom || $scope.scrollDown;
				viewScroll.resize();
				if (scrollBottom) {
					viewScroll.scrollBottom();
				}
				$scope.checkScroll();
			}, timeout || 0);
		};
		$scope.scrollDown = true;
		$scope.checkScroll = function () {
			$timeout(function () {
				var currentTop = viewScroll.getScrollPosition().top;
				var maxScrollableDistanceFromTop = viewScroll.getScrollView().__maxScrollTop;
				$scope.scrollDown = (currentTop >= maxScrollableDistanceFromTop);
				if (currentTop < 50 && $scope.loadCheck) $scope.loadMores(maxScrollableDistanceFromTop);
				$scope.$apply();
			}, 0);
			return true;
		};
	
		// $scope.inputUp = function() {
		// 	// console.log('inputUp');
		// 	// if (isIOS) $scope.keyboardHeight = 216;
		// 	$timeout(function() {
		// 	  viewScroll.scrollBottom();
		// 	}, 1000);			
		// };

		// $scope.inputDown = function() {
		// 	// console.log('inputDown');
		// 	// if (isIOS) $scope.keyboardHeight = 0;

		// 	viewScroll.resize();

		// 	// $timeout(function(){
	 //  //           viewScroll.resize();
	 //  //       }, 0);
		// };
		
		//현재 대화방 떠나기(삭제)
		$scope.leaveChatRoom = function(){

			var confirmPopup = popup.confirm('알림','대화방에서 나가시겠습니까?');
			
			confirmPopup.then(function(res) {
				if(res) {//실행
					// $http.post(apiServer + 'msglist/delete/'+message_id+'?token=' + localStorage.getItem('authToken'))
					$http({
						method: 'post',
						url: apiServer + 'msglist/delete/'+message_id+'?token=' + localStorage.getItem('authToken'),
						headers: {
							'Content-Type' : 'application/json; charset=utf-8'
						}
					}).then(function(response) {
						$ionicHistory.nextViewOptions({
							disableBack: true
						});
						$state.go('app.messages');
					},function(error){
					});
				}
			});
		};

		$scope.$on('elastic:resize', function (event, element, oldHeight, newHeight) {
			if (!footerBar) return;
			// console.log('elastic:resize');

			var newFooterHeight = newHeight + 20;
			newFooterHeight = (newFooterHeight > 40) ? newFooterHeight : 40;
			newFooterHeight = (newFooterHeight > 103) ? 103 : newFooterHeight;

			footerBar.style.height = newFooterHeight + 'px';
			scroller.style.bottom = newFooterHeight + 'px';

			$timeout(function(){
	        	viewScroll.scrollBottom();
	        }, 0);
		});
		
		
	})
	;
