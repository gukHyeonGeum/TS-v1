/**
 * state('app.usersFind', url: '/usersFind', templateUrl: 'templates/users-find.html',// 회원검색 (users.js)
 * state('app.usersFind.main', url: '/main', templateUrl: 'templates/users-find-main.html', controller: 'UsersFindMainCtrl'// 회원검색-메인 (users.js)
 * state('app.usersFind.visit', url: '/visit', templateUrl: 'templates/users-find-visit.html', controller: 'UsersFindVisitCtrl'// 회원검색-검색순 (users.js)
 * state('app.usersFind.join', url: '/join', templateUrl: 'templates/users-find-join.html', controller: 'UsersFindJoinCtrl' // 회원검색-가입순 (users.js)
*/

	


angular.module('starter.controllers')
	//main 현재 로그인된 사용자 리스트
	.controller('UsersFindMainCtrl', function(
		$rootScope,
		$scope, 
		$state, 
		$ionicModal, 
		$ionicLoading, 
		$http, 
		$cordovaCamera, //카메라 혹은 겔러리 활성
		$cordovaFileTransfer,	//for file upload
		socket,
		Auth
	) {
		
		$scope.setData = {};
		$scope.lists = {};
		$scope.searchLists = {};
		
		
		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}
			//현재 접속자를 구한다.
				
		});

		socket.emit('connect_list_to_me');
		
		//온라인 리스트 가져오기
		// socket.on('connectListToMe', function (req) {
		socket.on('connectList', function (req) {

			// 현재 온라인 리스트에 있는 모든 사용자를  off 라인으로 보내고 다시 온라인으로보낸다.
			var onlineList = Array();
			angular.forEach(req, function(value, key) {//편법으로 처리(이 파트를 node와 연동해야 함)
				if(value && value.user_id){
					var inarray = false;
					$.each(onlineList, function(i, v){
						if(v.user_id == value.user_id){
							inarray = true;
						}
						v.thumbnail_image = encodeURI(decodeURIComponent(v.thumbnail_image));
					});
					
					if(!inarray) onlineList.push(value);
				}
			});

			$scope.lists	= onlineList;

		});

		$scope.serchFriend	= function(){
			// console.log("serchFriend Start..");
			// console.log($scope.setData.search);
			if($scope.setData.search){//기본 검색으로 회원을 가져온다.
				$ionicLoading.show();
				$http.get(apiServer + 'users?search='+$scope.setData.search+'&token=' + localStorage.getItem('authToken'))
					.then(function(response) {
						//받아오는 데이타가 기본 데이타 형태와 다르므로 기본 데이타 형태로 모습을 바꾸어 주어야 한다.
						$scope.searchLists	= response.data.users.data;
						$scope.openModal(2,$scope.searchLists);

						$ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			}
		};

		$ionicModal.fromTemplateUrl('templates/modal/users-search-list.html', {
			id: '2',
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.searchmodal = modal;
			
		});
		
		$ionicModal.fromTemplateUrl('templates/modal/users-sort.html', {
			id: '1',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modal = modal;
		});

		$scope.$on('$stateChangeStart', function() {
			if ($scope.modal) $scope.modal.hide();
			if ($scope.searchmodal) $scope.searchmodal.hide();
		});
		
		$scope.openModal = function(i,item) {
			$scope.list = item;
			if (i == 1) $scope.modal.show();
			else $scope.searchmodal.show();
		};
		
		$scope.closeModal = function(i,item) {
			if (i == 1) $scope.modal.hide();
			else $scope.searchmodal.hide();
		};

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.modal.remove();
			$scope.searchmodal.remove();
		});

		//프로필 방문
		$scope.onItemProfile = function(i, item) {
			if (i == 2) {
				item.user_id = item.id;
			} else {
				item.username = item.user_name;
			}

			$scope.openProfile(item);
		};
		
		//프로필 방문
		// $scope.onItemProfile = function(i,item) {
			
		// 	if (!$rootScope.me.profile.phone) {
		// 		$scope.phoneCertCheck();
		// 		return;
		// 	}

		// 	if (i == 2) {
		// 		var uname = item.username;
		// 		var userId = item.id;
		// 	} else {
		// 		var uname = item.user_name;
		// 		var userId = item.user_id;
		// 	}
		// 	$state.go('app.mypage.visit', {Id: uname, userId: userId});
		// };
		
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
						targetWidth: 1000,
						targetHeight: 1000,
						popoverOptions: CameraPopoverOptions,
						correctOrientation: true,
						saveToPhotoAlbum: false
					};
					
					
			//사진으로 찍은 이후
			$cordovaCamera.getPicture(options).then(
				function(imageData) {
					uploadPicture(apiServer+"pictures", "data:image/jpeg;base64," + imageData);
				},
				function(err){
					$ionicLoading.show({template: '알림.. 카메라를 가져오지 못했습니다.', duration:500});
				}
			);
		};//사진으로 찍을 경우


		// 겔러리에서 이미지를 선택할 경우
		$scope.selectPicture = function() {
			$scope.modalImage.hide();
			// console.log("selectPicture Start...");
			var options = {
						quality: 75,
						destinationType: Camera.DestinationType.FILE_URL,
						//destinationType: Camera.DestinationType.DATA_URL,
						sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
						allowEdit: true,
						encodingType: Camera.EncodingType.PNG,
						targetWidth: 1000,
						targetHeight: 1000,
						popoverOptions: CameraPopoverOptions,
						correctOrientation: true,
						saveToPhotoAlbum: false
					};
	
			//이미지를 선택한 경우
			$cordovaCamera.getPicture(options).then(function(imageData) {
						uploadPicture(apiServer+"pictures", imageData);
			},
			function(err){
				// console.log(err);
				$ionicLoading.show({template: '겔러리를 호출하지 못했습니다.', duration:500});
			});
		};

		//서버로 파일 업로드
		var uploadPicture = function(url, targetPath){
			// console.log('uploadPicture start..');
			//http://stackoverflow.com/questions/30783847/file-upload-error-code-1-in-ng-cordova-filetransfer-plugin
			//var filename = targetPath.split("/").pop();
			// console.log("targetPath:"+targetPath);
			var filename = targetPath.substr(targetPath.lastIndexOf('/')+1);
			var options = {
					fileKey: "filedata",
					fileName: "image.png",
					//fileName: filename,
					chunkedMode: false,
					mimeType: "image/png",
					httpMethod:"POST"
				};
				// console.log(options);
				$cordovaFileTransfer.upload(url+"?token="+localStorage.getItem('authToken'), targetPath, options).then(function(result) {
					// console.log(result);
					// console.log("SUCCESS: " + JSON.stringify(result.response));
				}, function(err) {
					// console.log("ERROR: " + JSON.stringify(err));
				}, function (progress) {
					// console.log("PROGRESS: " + JSON.stringify(progress));
					//$timeout(function () {
					//	$scope.downloadProgress = (progress.loaded / progress.total) * 100;
					//})
				});
			//$cordovaFileTransfer.upload(url+"?token="+localStorage.getItem('authToken'), fileURL, options)
		
		};

	})
	//검색순
	.controller('UsersFindVisitCtrl', function(
		$rootScope, 
		$scope, 
		$state, 
		$ionicModal, 
		$ionicLoading, 
		$http,
		$ionicScrollDelegate, 
		Auth, 
		UserService
	) {

		var offset = 0;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			if (offset) var limit = offset + 48;
			else var limit = 48;

			$scope.nodeList(limit, 0, 'neighborhoodVisit', 1);

			// UserService.neighborhood({limit:limit,offset:0,type:'neighborhoodVisit'}, $scope.loadList);
		});

		$scope.nodeList = function(nlimit, offset, check, type) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if (check) UserService.neighborhood({limit:nlimit,offset:offset,type:'neighborhoodVisit'}, $scope.loadList);
			else UserService.neighborhood({limit:nlimit,offset:offset,type:'neighborhoodVisit'}, $scope.loadListScroll);
		};

		$scope.loadList = function(obj) {
			$scope.lists = obj;
			$scope.hasMoreData = false;
		}

		$scope.loadListScroll = function(obj) {
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
			if (obj.length < 48) $scope.hasMoreData = true;
			else $scope.hasMoreData = false;
		}

		$scope.loadMores = function() {
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				$scope.nodeList(48, offset, 0);	
				// UserService.neighborhood({limit:30,offset:offset,type:'neighborhoodVisit'}, $scope.loadListScroll);
			} else {
				$scope.hasMoreData = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			offset = 0;
			$scope.nodeList(48, offset, 1);	
			$scope.$broadcast('scroll.refreshComplete');
		}

		// $scope.nodeList = function() {
		// 	$scope.hasMoreData = true;
		// 	offset = 0;
		// 	UserService.neighborhood({limit:30,offset:offset,type:'neighborhoodVisit'}, $scope.loadList);
		// }



	// 	var current_page = 1;
	// 	$scope.$on('$ionicView.beforeEnter', function() {
	// 		current_page = 1;
	// 		get_user_list();
	// 	});
		
	// 	//친구리스트 가져오기;
	// 	var get_user_list = function(){
	// 		$ionicLoading.show();
	// 		$http.get(apiServer + 'users?token=' + localStorage.getItem('authToken'))
	// 			.then(function(response) {
	// 				$scope.lists	= response.data.users.data;
	// 				$ionicLoading.hide();
	// 			},function(error){
	// 				$ionicLoading.hide();
	// 			}
	// 		);
	// 	};
	// //	get_user_list();
		
		
	// 	// 스크롤 내릴시 리스트 추가
	// 	$scope.loadMore = function(data) {
	// 		current_page = current_page +1;
	// 		$ionicLoading.show();
	// 		$http.get(apiServer + 'users/?token=' + localStorage.getItem('authToken')+'&page='+current_page)
	// 			.then(function(response) {
	// 				$scope.lists = $scope.lists.concat(response.data.users.data);
	// 				//$scope.lists.push(response.data.users.data);
	// 				$scope.$broadcast('scroll.infiniteScrollComplete');
	// 				},function(error){
	// 					$ionicLoading.hide();
	// 				}
	// 			).finally(function() {
	// 				$ionicLoading.hide();
	// 			}
	// 		);
	// 	};
		
		$scope.serchFriend	= function(){
			// console.log("serchFriend Start..");
			// console.log($scope.setData.search);
			if($scope.setData.search){//기본 검색으로 회원을 가져온다.
				$ionicLoading.show();
				$http.get(apiServer + 'users?search='+$scope.setData.search+'&token=' + localStorage.getItem('authToken'))
					.then(function(response) {
						//받아오는 데이타가 기본 데이타 형태와 다르므로 기본 데이타 형태로 모습을 바꾸어 주어야 한다.
						$scope.searchLists	= response.data.users.data;
						$scope.openModal(2,$scope.searchLists);

						$ionicLoading.hide();
					},function(error){
						$ionicLoading.hide();
					}
				);
			}
		};

		$ionicModal.fromTemplateUrl('templates/modal/users-search-list.html', {
			id: '2',
			scope: $scope,
			animation: 'slide-in-up'
		}).then(function(modal) {
			$scope.searchmodal = modal;
			
		});
		
		$ionicModal.fromTemplateUrl('templates/modal/users-sort.html', {
			id: '1',
			scope: $scope,
			animation: 'fade-in-scale'
		}).then(function(modal) {
			$scope.modal = modal;
		});

		$scope.$on('$stateChangeStart', function() {
			if ($scope.modal) $scope.modal.hide();
			if ($scope.searchmodal) $scope.searchmodal.hide();
		});
		
		$scope.openModal = function(i,item) {
			$scope.list = item;
			if (i == 1) $scope.modal.show();
			else $scope.searchmodal.show();
		};
		
		$scope.closeModal = function(i,item) {
			if (i == 1) $scope.modal.hide();
			else $scope.searchmodal.hide();
		};

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			$scope.modal.remove();
			$scope.searchmodal.remove();
		});

		//프로필 방문
		$scope.onItemProfile = function(i, item) {
			if (i == 2) {
				item.user_id = item.id;
			}

			$scope.openProfile(item);
		};
		// $scope.onItemProfile = function(item) {

		// 	$scope.openProfile(item);

		// 	// if (!$rootScope.me.profile.phone) {
		// 	// 	$scope.phoneCertCheck();
		// 	// 	return;
		// 	// }
		// 	// $state.go('app.mypage.visit', {Id: item.username, userId: item.id});
		// };
	})
	//가입순
	.controller('UsersFindJoinCtrl', function(
		$rootScope, 
		$scope, 
		$state, 
		$ionicModal, 
		$ionicLoading, 
		$http,
		$ionicScrollDelegate, 
		Auth, 
		UserService
	) {

		var offset = 0;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			if (offset) var limit = offset + 30;
			else var limit = 30;

			UserService.neighborhood({limit:limit,offset:0,type:'neighborhoodJoin'}, $scope.loadList);
		});

		$scope.loadList = function(obj) {
			// console.log(obj);
			$scope.lists = obj;
			$scope.hasMoreData = false;
		}

		$scope.loadMores = function() {
			$scope.hasMoreData = true;

			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				UserService.neighborhood({limit:30,offset:offset,type:'neighborhoodJoin'}, $scope.loadListScroll);
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		$scope.loadListScroll = function(obj) {
			$scope.hasMoreData = false;
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
		}

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			$scope.nodeList();	
			$scope.$broadcast('scroll.refreshComplete');
		}

		$scope.nodeList = function() {
			$scope.hasMoreData = true;
			offset = 0;
			UserService.neighborhood({limit:30,offset:offset,type:'neighborhoodJoin'}, $scope.loadList);
		}
		


		// var current_page = 1;
		// $scope.$on('$ionicView.beforeEnter', function() {
		// 	current_page = 1;
		// 	get_user_list();
		// });
		
		
		// //친구리스트 가져오기;
		// var get_user_list = function(){
		// 	$ionicLoading.show();
		// 	$http.get(apiServer + 'users?sort=join&token=' + localStorage.getItem('authToken'))
		// 		.then(function(response) {
		// 			$scope.lists	= response.data.users.data;
		// 			$ionicLoading.hide();
		// 		},function(error){
		// 			$ionicLoading.hide();
		// 		}
		// 	);
		// };
		
		// // 스크롤 내릴시 리스트 추가
		// $scope.loadMore = function(data) {
		// 	// console.log("loadMore Start.....");
		// 	current_page = current_page +1;
		// 	$ionicLoading.show();
		// 	$http.get(apiServer + 'users?sort=join&token=' + localStorage.getItem('authToken')+'&page='+current_page)
		// 		.then(function(response) {
		// 			$scope.lists = $scope.lists.concat(response.data.users.data);
		// 			//$scope.lists.push(response.data.users.data);
		// 			$scope.$broadcast('scroll.infiniteScrollComplete');
		// 			},function(error){
		// 				$ionicLoading.hide();
		// 			}
		// 		).finally(function() {
		// 			$ionicLoading.hide();
		// 		}
		// 	);
		// };
		
		//프로필 방문
		$scope.onItemProfile = function(item) {

			$scope.openProfile(item);

			// if (!$rootScope.me.profile.phone) {
			// 	$scope.phoneCertCheck();
			// 	return;
			// }
			// $state.go('app.mypage.visit', {Id: item.username, userId: item.id});
		};
	})

	.controller('UsersFindPopularCtrl', function(
		$rootScope, 
		$scope, 
		$state, 
		$ionicModal, 
		$ionicLoading, 
		$http,
		$ionicScrollDelegate, 
		Auth, 
		UserService
	) {

		var offset = 0;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			if (offset) var limit = offset + 48;
			else var limit = 48;

			$scope.nodeList(limit, 0, 'neighborhoodPopular', 1);

		});

		$scope.nodeList = function(nlimit, offset, check, type) {
			$ionicLoading.show();
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if (check) UserService.neighborhood({limit:nlimit,offset:offset,type:'neighborhoodPopular'}, $scope.loadList);
			else UserService.neighborhood({limit:nlimit,offset:offset,type:'neighborhoodPopular'}, $scope.loadListScroll);
		};

		$scope.loadList = function(obj) {
			$ionicLoading.hide();
			$scope.lists = obj;
			$scope.hasMoreData = false;
		}

		$scope.loadListScroll = function(obj) {
			$ionicLoading.hide();
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
			if (obj.length < 48) $scope.hasMoreData = true;
			else $scope.hasMoreData = false;
		}

		$scope.loadMores = function() {
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				$scope.nodeList(48, offset, 0);	
				// UserService.neighborhood({limit:30,offset:offset,type:'neighborhoodVisit'}, $scope.loadListScroll);
			} else {
				$scope.hasMoreData = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			offset = 0;
			$scope.nodeList(48, offset, 1);	
			$scope.$broadcast('scroll.refreshComplete');
		}

		//프로필 방문
		$scope.onItemProfile = function(item) {
			$scope.openProfile(item);
		};

	})

	.controller('UsersFindListCtrl', function(
		$rootScope, 
		$scope, 
		$state, 
		$ionicModal, 
		$ionicLoading, 
		$http,
		$ionicScrollDelegate, 
		$stateParams,
		$timeout,
		$ionicHistory,
		Auth, 
		popup, 
		UserService
	) {

		$scope.Params = $stateParams;

		var offset = 0;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			$scope.form = { 'distance' : '0', 'golf_score' : '0', 'golf_year' : '0', 'golf_frequency' : '0', 'golf_oversea' : '0' };

			// if (offset) var limit = offset + 48;
			// else var limit = 48;

			offset = 0;
			var limit = 48;

			if (!$scope.Params.obj)
				$scope.usersloc = 'neighborhoodVisit';
			else 
				$scope.usersloc = $scope.Params.obj;

			$scope.usersLocation($scope.usersloc);

			$scope.usersSex = '';

			// $scope.nodeList(limit, 0, 1, $scope.usersloc, $scope.usersSex);

		});

		// $scope.$on('$ionicView.enter', function() {
		// 	$timeout(function(){
	 //            $ionicScrollDelegate.scrollTop();
	 //        }, 300);
		// });

		$scope.nodeList = function(nlimit, offset, check, type, sex) {
			$ionicLoading.show();
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if (check) UserService.neighborhood({limit:nlimit,offset:offset,type:type, sex:sex}, $scope.loadList);
			else UserService.neighborhood({limit:nlimit,offset:offset,type:type, sex:sex}, $scope.loadListScroll);
		};

		$scope.loadList = function(obj) {
			$ionicLoading.hide();
			$scope.lists = obj;
			$scope.hasMoreData = false;
		}

		$scope.loadListScroll = function(obj) {
			$ionicLoading.hide();
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
			if (obj.length < 48) $scope.hasMoreData = true;
			else $scope.hasMoreData = false;
		}

		$scope.loadMores = function() {
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				$scope.nodeList(48, offset, 0, $scope.usersloc, $scope.usersSex);	
				// UserService.neighborhood({limit:30,offset:offset,type:'neighborhoodVisit'}, $scope.loadListScroll);
			} else {
				$scope.hasMoreData = true;
			}
			$scope.$broadcast('scroll.infiniteScrollComplete');
		}

		// 스크롤 올릴시 리스트 새로고침
		$scope.doRefresh = function() {
			if ($scope.usersloc) {
				offset = 0;
				$scope.nodeList(48, offset, 1, $scope.usersloc, $scope.usersSex);
				$scope.$broadcast('scroll.refreshComplete');
			} else {
				$timeout(function(){
		            $ionicScrollDelegate.scrollTop();
		        }, 0);
			}
		};

		$scope.usersLocation = function(loc, sex) {

			$scope.lists = [];

			if (!sex) sex = '';

			$scope.usersloc = loc;
			$scope.usersSex = sex;

			if (loc == 'neighborhoodLocation') {
				$scope.usersTitle = '근처회원';
			} else if (loc == 'neighborhoodJoin') {
				$scope.usersTitle = '신규회원';
			} else if (loc == 'neighborhoodPopular') {
				$scope.usersTitle = '인기회원';
			} else if (loc == 'neighborhoodVisit') {
				$scope.usersTitle = '접속회원';
			} else {
				$scope.usersTitle = '필터링';
				$scope.form = { 'distance' : '0', 'golf_score' : '0', 'golf_year' : '0', 'golf_frequency' : '0', 'golf_oversea' : '0' };
			}

			if (loc) {
				offset = 0;
				$scope.nodeList(48, offset, 1, loc, sex);
			}

			$timeout(function(){
	            $ionicScrollDelegate.scrollTop();
	        }, 500);

			// $scope.usersSort.hide();

			// $state.go('app.usersFind.list', {loc: loc});
		};

		$scope.onUsersFilter = function() {
			$scope.lists = [];

			$ionicHistory.nextViewOptions({
				disableBack: true
			});
			$state.go('app.usersFilter');
		};

		//프로필 방문
		$scope.onItemProfile = function(item) {
			if (item.id) item.user_id = item.id;
			$scope.openProfile(item);
		};


		$scope.ageRange = [];
		for(var i=30; i<=60; i++) {
			$scope.ageRange.push({value:i});
		}

		$scope.submitUsersFind = function(isValid) {
			if (isValid.$valid) {

				if ($scope.form.filterSage || $scope.form.filterEage) {
					if (!$scope.form.filterSage) {
						popup.alert('알림','최소 나이를 선택하세요.');
						return;
					}
					if (!$scope.form.filterEage) {
						popup.alert('알림','최대 나이를 선택하세요.');
						return;
					}
				}

				if ($scope.form.filterSage > $scope.form.filterEage) {
					popup.alert('알림','최소, 최대 나이값이 잘 못되었습니다.');
					return;
				}

				if (($scope.form.filterEage - $scope.form.filterSage) < 5 ) {
					popup.alert('알림','나이 차이는 5살이상 적용하셔야 합니다.');
					return;
				}

				$scope.listsFilter = [];

				$ionicLoading.show();

				UserService.neighborhood(
					{
						limit:200,
						offset:0,
						type:'preference', 
						sex: $scope.form.filterSex, 
						filter_s_age: $scope.form.filterSage, 
						filter_e_age: $scope.form.filterEage, 
						locations: $scope.form.distance, 
						golf_score: parseInt($scope.form.golf_score), 
						golf_year: parseInt($scope.form.golf_year), 
						golf_frequency: parseInt($scope.form.golf_frequency), 
						golf_oversea: parseInt($scope.form.golf_oversea)
					}, function(obj) {
						$ionicLoading.hide();
						$scope.listsFilter = obj;
						$scope.openModal();
					}
				);

			} else {
				popup.alert('등록오류','정보가 넘어오지 않았습니다. <br />다시 시도하시기 바랍니다.');
				return;
			}
		};

		$scope.preferenceChange = function(val, type) {
			$scope.form.golf_score = '0';
			$scope.form.golf_year = '0';
			$scope.form.golf_frequency = '0';
			$scope.form.golf_oversea = '0';

			if (type == 'score') {
				$scope.form.golf_score = val;
			} else if (type == 'year') {
				$scope.form.golf_year = val;
			} else if (type == 'frequency') {
				$scope.form.golf_frequency = val;
			} else if (type == 'oversea') {
				$scope.form.golf_oversea = val;
			}
		};

		$scope.$on('$stateChangeStart', function() {
			if ($scope.usersFilterList) {
				$scope.usersFilterList.hide();
				$scope.usersFilterList.remove();
			}
		});
		
		$scope.openModal = function(i,item) {
			$scope.list = item;

				$ionicModal.fromTemplateUrl('templates/modal/users-filter-list.html', {
					scope: $scope
				}).then(function(modal) {
					$scope.usersFilterList = modal;
					$scope.usersFilterList.show();
				});	
		};
		
		$scope.closeModal = function(i,item) {
			$scope.usersFilterList.hide();
			$scope.usersFilterList.remove();
		};

		//Cleanup the modal when we're done with it!
		$scope.$on('$destroy', function() {
			if ($scope.usersFilterList) $scope.usersFilterList.remove();
		});

	})

	// .controller('UsersFilterCtrl', function(
	// 	$rootScope, 
	// 	$scope, 
	// 	$state, 
	// 	$ionicModal, 
	// 	$ionicLoading, 
	// 	$http,
	// 	$ionicScrollDelegate, 
	// 	$stateParams,
	// 	$timeout,
	// 	$ionicHistory,
	// 	Auth, 
	// 	popup, 
	// 	UserService
	// ) {

	// 	$scope.ageRange = [];
	// 	for(var i=30; i<=60; i++) {
	// 		$scope.ageRange.push({value:i});
	// 	}

	// 	$scope.$on('$ionicView.beforeEnter', function() {
	// 		if(!Auth.isLoggedIn()) {
	// 			$state.go('login');
	// 			return false;
	// 		}

	// 		$scope.form = { 'distance' : '0', 'golf_score' : '0', 'golf_year' : '0', 'golf_frequency' : '0', 'golf_oversea' : '0' };
	// 	});

	// 	$scope.submitUsersFind = function(isValid) {
	// 		if (isValid.$valid) {

	// 			if ($scope.form.filterSage || $scope.form.filterEage) {
	// 				if (!$scope.form.filterSage) {
	// 					popup.alert('알림','최소 나이를 선택하세요.');
	// 					return;
	// 				}
	// 				if (!$scope.form.filterEage) {
	// 					popup.alert('알림','최대 나이를 선택하세요.');
	// 					return;
	// 				}
	// 			}

	// 			if ($scope.form.filterSage > $scope.form.filterEage) {
	// 				popup.alert('알림','최소, 최대 나이값이 잘 못되었습니다.');
	// 				return;
	// 			}

	// 			if (($scope.form.filterEage - $scope.form.filterSage) < 5 ) {
	// 				popup.alert('알림','나이 차이는 5살이상 적용하셔야 합니다.');
	// 				return;
	// 			}

	// 			$scope.listsFilter = [];

	// 			$ionicLoading.show();

	// 			UserService.neighborhood(
	// 				{
	// 					limit:200,
	// 					offset:0,
	// 					type:'preference', 
	// 					sex: $scope.form.filterSex, 
	// 					filter_s_age: $scope.form.filterSage, 
	// 					filter_e_age: $scope.form.filterEage, 
	// 					locations: $scope.form.distance, 
	// 					golf_score: parseInt($scope.form.golf_score), 
	// 					golf_year: parseInt($scope.form.golf_year), 
	// 					golf_frequency: parseInt($scope.form.golf_frequency), 
	// 					golf_oversea: parseInt($scope.form.golf_oversea)
	// 				}, function(obj) {
	// 					$ionicLoading.hide();
	// 					$scope.listsFilter = obj;
	// 					$scope.openModal();
	// 				}
	// 			);

	// 		} else {
	// 			popup.alert('등록오류','정보가 넘어오지 않았습니다. <br />다시 시도하시기 바랍니다.');
	// 			return;
	// 		}
	// 	};

	// 	$scope.preferenceChange = function(val, type) {
	// 		$scope.form.golf_score = '0';
	// 		$scope.form.golf_year = '0';
	// 		$scope.form.golf_frequency = '0';
	// 		$scope.form.golf_oversea = '0';

	// 		if (type == 'score') {
	// 			$scope.form.golf_score = val;
	// 		} else if (type == 'year') {
	// 			$scope.form.golf_year = val;
	// 		} else if (type == 'frequency') {
	// 			$scope.form.golf_frequency = val;
	// 		} else if (type == 'oversea') {
	// 			$scope.form.golf_oversea = val;
	// 		}
	// 	};

	// 	//프로필 방문
	// 	$scope.onItemProfile = function(item) {
	// 		if (item.id) item.user_id = item.id;
	// 		$scope.openProfile(item);
	// 	};

	// 	$scope.usersLocation = function(loc, sex) {
	// 		$ionicHistory.nextViewOptions({
	// 			disableBack: true
	// 		});
	// 		$state.go('app.usersFind.list', { obj: loc});
	// 	};		

	// 	$scope.$on('$stateChangeStart', function() {
	// 		if ($scope.usersFilterList) {
	// 			$scope.usersFilterList.hide();
	// 			$scope.usersFilterList.remove();
	// 		}
	// 	});
		
	// 	$scope.openModal = function(i,item) {
	// 		$scope.list = item;

	// 			$ionicModal.fromTemplateUrl('templates/modal/users-filter-list.html', {
	// 				scope: $scope
	// 			}).then(function(modal) {
	// 				$scope.usersFilterList = modal;
	// 				$scope.usersFilterList.show();
	// 			});	
	// 	};
		
	// 	$scope.closeModal = function(i,item) {
	// 		$scope.usersFilterList.hide();
	// 		$scope.usersFilterList.remove();
	// 	};

	// 	//Cleanup the modal when we're done with it!
	// 	$scope.$on('$destroy', function() {
	// 		if ($scope.usersFilterList) $scope.usersFilterList.remove();
	// 	});

	// })

;