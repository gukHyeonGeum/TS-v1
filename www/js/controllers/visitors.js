angular.module('starter.controllers')
	.filter('escape', function() {
		return window.encodeURIComponent;
	})
	.controller('visitorsCtrl', function(
		$rootScope,
		$scope, 
		$http, 
		$ionicModal, 
		$ionicLoading, 
		$location,			//경로이동
		$cordovaCamera, //카메라 혹은 겔러리 활성
		$cordovaFileTransfer, //for file upload
		$state,
		$ionicPopup,
		$ionicScrollDelegate,
		Auth,
		socket,
		popup, 
		VisitorsService,
		badgeService
	) {
		
		$scope.items = [];

		var offset = 0;
		
		var current_page = 0;

		$scope.$on('$ionicView.beforeEnter', function() {
			if(!Auth.isLoggedIn()) {
				$state.go('login');
				return false;
			}

			$scope.data = {
				showDelete: false
			};
			// getVisitors();

			if (offset) var limit = offset + 20;
			else var limit = 20;

			$scope.nodeList(limit, 0, 1);
			// VisitorsService.getList({limit:limit,offset:0}, $scope.loadList);
		});

		$scope.$on('$stateChangeStart', function() {
			if($scope.modal) $scope.modal.hide();
			if($scope.modalImage) $scope.modalImage.hide();
		});

		$scope.nodeList = function(nlimit, offset, type) {
			$scope.hasMoreData = true;
			if (!offset) offset = 0;
			if (type) VisitorsService.getList({limit:nlimit,offset:offset}, $scope.loadList); 
			else VisitorsService.getList({ limit:nlimit,offset:offset }, $scope.loadListScroll);
			// offset = 0;
			// VisitorsService.getList({limit:20,offset:offset}, $scope.loadList);
		}

		$scope.loadList = function(obj) {
			$scope.lists = obj;
			$scope.hasMoreData = false;
		}

		$scope.loadListScroll = function(obj) {
			$scope.lists = $scope.lists.concat(obj);
			$ionicScrollDelegate.resize();
			if (obj.length < 20) $scope.hasMoreData = true;
			else $scope.hasMoreData = false;
		}

		// 스크롤 내릴시 리스트 추가
		$scope.loadMores = function() {
			if (offset != $scope.lists.length) {
				offset = $scope.lists.length;
				$scope.offset = offset;
				$scope.nodeList(20, offset, 0);
				// VisitorsService.getList({limit:20,offset:offset}, $scope.loadListScroll);
			} else {
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

			if (localStorage.getItem('authToken')) {
				badgeService.getCount();
			}
		}

		$ionicModal.fromTemplateUrl('templates/modal/visitors-menu.html', {
			scope: $scope,
			animation: 'fade-in-scale',
		}).then(function(modal) {
			$scope.modal = modal;
		});

		$scope.openModal = function(item, itemIndex) {
			$scope.modal.show();
			$scope.item 		= item;
			$scope.itemIndex	= itemIndex;
		};
		$scope.closeModal = function() {
			$scope.modal.hide();
		};
		
		//프로필 방문
		$scope.onItemProfile = function(item) {

			item.user_id = item.visitor_id;

			$rootScope.visitorsBadge = item;

			$scope.openProfile(item);

			// if (item.state == 'new') {
			// 	item.state = '';
			// }

			// if (!$rootScope.me.profile.phone) {
			// 	$scope.phoneCertCheck();
			// 	return;
			// }
			// if ($rootScope.me.id != item.visitor_id)
			// 	$state.go('app.mypage.visit', {Id: item.username, userId: item.visitor_id, state: item.state});
			// else
			// 	$state.go('app.mypage.info');
			
			$scope.modal.hide();
		};
		
		//채팅하기
		$scope.onItemMessage = function(item) {
			if (!$rootScope.me.profile.phone) {
				$scope.phoneCertCheck();
				return;
			}
			//$location.path( '/app/message/create/'+item.id );
			$state.go('app.messagecreate', {userId:item.visitor_id});
			$scope.modal.hide();
		};

		//방문자 삭제
		$scope.onItemDelete = function(item) {

			// var confirmPopup = $ionicPopup.confirm({
			// 	title: '방문자 삭제',
			// 	template: item.username+'님을 방문자리스트에서 삭제하시겠습니까?',
			// 	okText: '확인',
			// 	cancelText: '취소'
			// });
			
			// confirmPopup.then(function(res) {
			// 	if(res) {//실행
					var qry	= "&visitor_id="+item.visitor_id;
					$ionicLoading.show();
					$http.get(apiServer + 'user/visitordelete?token=' + localStorage.getItem('authToken') + qry)
						.then(function(response) {

							if (response.data.success) {

								$scope.lists.splice($scope.lists.indexOf(item), 1);

								if (localStorage.getItem('authToken')) {
									badgeService.getCount();
								}

								// if (item.state == 'new') {
									// $rootScope.badgeCount.newVisit--;

									// $scope.lcnt = JSON.parse(localStorage.getItem('count'));
									// $scope.lcnt.newVisit--;
									// localStorage.setItem('count', JSON.stringify($scope.lcnt));
								// }
							} else {
								popup.alert('알림',response.data.message);
							}
							// $scope.items.visitors.data.splice(itemIndex, 1);
							// $scope.items = response.data.visitors;
							 $ionicLoading.hide();
						},function(error){
							console.log(error);
							$ionicLoading.hide();
						}
					);
			// 	}
			// });

			$scope.closeModal();
			// $scope.modal.hide();
		};

		$scope.moredata = false;

		//방문자 리스트 가져오기 
		var getVisitors = function(){
			current_page = 1;
			$ionicLoading.show();
			$http.get(apiServer + 'user/visitors/?token=' + localStorage.getItem('authToken'))
				.then(function(response) {
					 $scope.items = response.data.visitors.data;
					 $scope.moredata = true;
					 $ionicLoading.hide();
				},function(error){
					console.log(error);
					$ionicLoading.hide();
				}
			);
		};

		// 스크롤 내릴시 리스트 추가
		$scope.loadMore = function() {
			$ionicLoading.show();
			current_page = current_page +1;
			$http.get(apiServer + 'user/visitors/?token=' + localStorage.getItem('authToken')+'&page='+current_page)
				.then(function(response) {
					$scope.lists = $scope.lists.concat(response.data.visitors.data);

					if (response.data.visitors.data.length < 12)
						$scope.moredata = false;

					$scope.$broadcast('scroll.infiniteScrollComplete');

					}, function(error){
						$ionicLoading.hide();
					}
				).finally(function() {
					$ionicLoading.hide();
				});
		};

		socket.on('getVisitorsList', function(req) {
			// console.log('getVisitorsList');
			$scope.lists.splice(0, 0, req);
		});
	
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
				//$scope.picData	= imageData;
				//$scope.ftLoad	= true;
				//$localstorage.set('fotoUp', imageData);
				//$ionicLoading.show({template: '사진 촬영.', duration:500});
				//uploadPicture(apiServer+"pictures", imageData);
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
			$ionicLoading.show({template: '겔러리를 호출하지 못했습니다.', duration:500});
		});
	};

	//서버로 파일 업로드
	var uploadPicture = function(url, targetPath){

		//http://stackoverflow.com/questions/30783847/file-upload-error-code-1-in-ng-cordova-filetransfer-plugin
		//var filename = targetPath.split("/").pop();
		//console.log("targetPath:"+targetPath);
		var filename = targetPath.substr(targetPath.lastIndexOf('/')+1);
		var options = {
				fileKey: "filedata",
				fileName: 'image.png',
				chunkedMode: false,
				mimeType: "image/png",
				httpMethod:"POST"
			};
			//console.log(options);
			$cordovaFileTransfer.upload(url+"?token="+localStorage.getItem('authToken'), targetPath, options).then(function(result) {
				//console.log("SUCCESS: " + JSON.stringify(result.response));
				$ionicLoading.show({template: '정상적으로 등록되었습니다.', duration:500});
			}, function(err) {
				$ionicLoading.show({template: '업로드중 에러가 발생하였습니다.', duration:500});
				console.log(err);
				console.log("ERROR: " + JSON.stringify(err));
			}, function (progress) {
				console.log("PROGRESS: " + JSON.stringify(progress));
				//$timeout(function () {
				//	$scope.downloadProgress = (progress.loaded / progress.total) * 100;
				//})
			});
		//$cordovaFileTransfer.upload(url+"?token="+localStorage.getItem('authToken'), fileURL, options)
		
	};
	
});