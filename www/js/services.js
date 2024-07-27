angular.module('starter.service', [])

	.service('MypageService', function(msRequestFactory, msRestfulApi, popup) {

		this.put = function(params, callback) {

			var request = msRequestFactory.createRequest('mypage','update','');

			request.params = {
				token: localStorage.getItem('authToken'),
				value: params.value,
				type: params.type
			}

			msRestfulApi.post(request, function(res) {
				if (res.success) {
					callback(res.success);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getInfo = function(params, callback) {

			var request = msRequestFactory.createRequest('mypage','me','');

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					if (res.code != 1000) {
						popup.alert('알림',res.message);
						return;
					}
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getCount = function(params, callback) {

			var request = msRequestFactory.createRequest('mypage','count','');

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				}
			}, function(error) {
				console.log('서버 에러');
				return;
			});
		}
	})

	.service('InviteService', function(msRequestFactory, msRestfulApi, popup, $ionicLoading) {

		this.getRequest = function(id, callback) {

			var request = msRequestFactory.createRequest('invite','requestcheck',id);

			$ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.data.success) {
					$ionicLoading.hide();
					callback(res.data);
				} else {
					$ionicLoading.hide();
					popup.alert('알림',res.data.message);
					callback(res.data);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getList = function(params, callback) {

			var request = msRequestFactory.createRequest('invite','list','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.userid = params.userid ? params.userid : '';

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getLists = function(params, callback) {

			var request = msRequestFactory.createRequest('invite','lists','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.inviteType = params.inviteType;
			request.userid = params.userid ? params.userid : '';

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getOne = function(params, callback) {

			var request = msRequestFactory.createRequest('invite','getOne',params.id);

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getRsvps = function(params, callback) {

			var request = msRequestFactory.createRequest('invite','request',params.userid);

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.inviteType = params.inviteType;

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getCount = function(callback) {

			var request = msRequestFactory.createRequest('invite','count','');

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					return;
				}
			}, function(error) {
				console.log('서버 에러');
				return;
			});
		},
		this.putPartner = function(params, callback) {

			var request = msRequestFactory.createRequest('invite','putpartner',params.id);

			request.params = {
				token: localStorage.getItem('authToken')
			}

			msRestfulApi.post(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data, params);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.partnerChk = function(params, callback) {

			var request = msRequestFactory.createRequest('invite','partnerChk',params.id);

			request.params = {
				token: localStorage.getItem('authToken')
			}

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					$ionicLoading.hide();
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				$ionicLoading.hide();
				return;
			});
		}

	})
	
	.service('badgeService', function(msRequestFactory, msRestfulApi, popup, $rootScope, $state) {
		this.getCount = function(callback) {

			var request = msRequestFactory.createRequest('badge','count','');

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					localStorage.setItem('count', JSON.stringify(res.data));
					$rootScope.badgeCount = res.data;
				}
			}, function(error) {
				console.log('서버 에러');
				return;
			});
		}
	})

	.service('MessageService', function(msRequestFactory, msRestfulApi, popup, $ionicLoading) {

		this.getList = function(params, callback) {

			var request = msRequestFactory.createRequest('message','list','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		},
		this.getCheck = function(params, callback) {

			var request = msRequestFactory.createRequest('message','check',params.id);

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});

		},
		this.getListMessage = function(params, callback) {

			var request = msRequestFactory.createRequest('message','listmessage',params.thread_id);

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data,res.toname,res.toUser);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});

		},
		this.deletedCheck = function(params, callback) {

			var request = msRequestFactory.createRequest('message','deletedCheck',params.thread_id);

			request.token = localStorage.getItem('authToken');
			request.toId = params.toId;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});

		}

	})

	.service('VisitorsService', function(msRequestFactory, msRestfulApi, popup, $ionicLoading) {
		this.getList = function(params, callback) {

			var request = msRequestFactory.createRequest('visitors','list','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		},
		this.readProfile = function(params) {
			var request = msRequestFactory.createRequest('visitors','read',params.id);

			request.params = {
				token: localStorage.getItem('authToken')
			}

			msRestfulApi.post(request, function(res) {
				if (!res.success) {
					popup.alert('알림', res.message);
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		}
	})

	.service('ProfileService', function(msRequestFactory, msRestfulApi, popup, $rootScope) {
		this.visit = function(params, callback) {

			var request = msRequestFactory.createRequest('profile','visit',params.id);

			request.token = localStorage.getItem('authToken');
			request.matchId = params.matchId;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});
		}
	})

	.service('UserService', function(msRequestFactory, msRestfulApi, popup, $rootScope) {
		this.neighborhood = function(params, callback) {

			var request = msRequestFactory.createRequest('users','neighborhood','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.type = params.type;
			request.sex = params.sex;
			request.lat = $rootScope.me.profile.latitude;
			request.lng = $rootScope.me.profile.longitude;
			request.filter_s_age = params.filter_s_age;
			request.filter_e_age = params.filter_e_age;
			request.locations = params.locations;
			request.golf_score = params.golf_score;
			request.golf_year = params.golf_year;
			request.golf_frequency = params.golf_frequency;
			request.golf_oversea = params.golf_oversea;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});
		}
	})

	.service('FriendsService', function(msRequestFactory, msRestfulApi, popup, $ionicLoading) {
		this.getList = function(params, callback) {

			var request = msRequestFactory.createRequest('friends','list','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		},
		this.getRequestList = function(params, callback) {

			var request = msRequestFactory.createRequest('friends','request','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		}
	})

	.service('BookingService', function(msRequestFactory, msRestfulApi, popup, $ionicLoading) {
		this.getLists = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','lists','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.inviteType = params.inviteType;
			request.bookingDate = params.bookingDate;
			request.bookingSst = params.bookingSst;
			request.bookingSod = params.bookingSod;
			request.bookingOpen = params.bookingOpen;
			request.active = params.active;

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getClub = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','getclub','');

			request.token = localStorage.getItem('authToken');
			request.region = params.region;

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		},
		this.getClubOne = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','getclubone', params.id);

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		},
		this.getOne = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','getone', params.id);

			request.token = localStorage.getItem('authToken');
			request.booking_id = params.booking_id;

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.putComplete = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','putComplete', params.id);

			request.token = localStorage.getItem('authToken');
			request.booking_id = params.booking_id;

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.success);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getPostsChk = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','getPostsChk', params.booking_id);

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();

				callback(res);

			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.putCompleteCancel = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','putCompleteCancel', params.id);

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();

				callback(res);
				
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.getRsvps = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','request',params.userid);

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.inviteType = params.inviteType;

			// $ionicLoading.show();
			msRestfulApi.get(request, function(res) {
				if (res.success) {
					// $ionicLoading.hide();
					callback(res.data);
				} else {
					// $ionicLoading.hide();
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				// $ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.putManager = function(params, callback) {

			var request = msRequestFactory.createRequest('booking','putManager', params.userid);

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();

				if (res.success) {
					callback(res);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		},
		this.invitationread = function(params, callback) {
			var request = msRequestFactory.createRequest('premium','invitationread',params.list_id);

			request.params = {
				token: localStorage.getItem('authToken')
			}

			msRestfulApi.post(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림', res.message);
					return;
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};
	})

	.service('AuthCheckService', function(msRequestFactory, msRestfulApi, popup, $ionicLoading, $state) {
		this.authCheck = function(params, callback) {

			var request = msRequestFactory.createRequest('auth','token','');

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					// popup.alert('알림',res.message);
					localStorage.removeItem('authToken');
					localStorage.removeItem('me');
					localStorage.removeItem('count');

					$state.go('login');
					return;
				}
			}, function(error) {
				popup.alert('서버 에러',error.statusText);
				return;
			});

		}
	})

	.service('PaymentService', function(msRequestFactory, msRestfulApi, popup) {
		this.Payinsert = function(params, callback) {
			var request = msRequestFactory.createRequest('payment','payinsert','');

			request.params = {
				token: localStorage.getItem('authToken'),
				user_id: params.user_id,
				productId: params.productId,
				productName: params.productName,
				price: params.price,
				type: params.type,
				productType: params.productType,
				signature: params.signature,
				transactionId: params.transactionId,
				receipt: params.receipt,
				users: params.users
			}

			msRestfulApi.post(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림', res.message);
					// 결제취소 프로세서 등록
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};

		this.getLists = function(params, callback) {
			var request = msRequestFactory.createRequest('payment','lists',params.id);

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.type = params.type;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림', res.message);
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};
	})

	.service('NewsService', function(msRequestFactory, msRestfulApi, popup) {
		this.getLists = function(params, callback) {
			var request = msRequestFactory.createRequest('news','lists',params.id);

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림', res.message);
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};
	})

	.service('CompareService', function(msRequestFactory, msRestfulApi, popup, $rootScope, $ionicLoading) {
		this.getLists = function(params, callback) {
			var request = msRequestFactory.createRequest('compare','lists',params.id);

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.lat = $rootScope.me.profile.latitude;
			request.lng = $rootScope.me.profile.longitude;
			request.compareDate = params.compareDate;
			request.compareSst = params.compareSst;
			request.compareSod = params.compareSod;
			request.compareLoc = params.compareLoc;
			request.compareClub = params.compareClub;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림', res.message);
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};
		this.getClub = function(params, callback) {

			var request = msRequestFactory.createRequest('compare','getclub','');

			request.token = localStorage.getItem('authToken');
			request.region = params.region;

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		};
		this.getOne = function(params, callback) {

			var request = msRequestFactory.createRequest('compare','getone',params.id);

			request.token = localStorage.getItem('authToken');

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		};
	})

	.service('NewBookingService', function(msRequestFactory, msRestfulApi, popup, $rootScope, $ionicLoading) {
		this.getLists = function(params, callback) {
			var request = msRequestFactory.createRequest('newbooking','lists',params.id);

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.lat = $rootScope.me.profile.latitude;
			request.lng = $rootScope.me.profile.longitude;
			request.compareDate = params.compareDate;
			request.compareSst = params.compareSst;
			request.compareSod = params.compareSod;
			request.compareLoc = params.compareLoc;
			request.compareClub = params.compareClub;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림', res.message);
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};
		this.getClub = function(params, callback) {

			var request = msRequestFactory.createRequest('newbooking','getclub','');

			request.token = localStorage.getItem('authToken');
			request.region = params.region;

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		};
		this.getOne = function(params, callback) {

			var request = msRequestFactory.createRequest('newbooking','getone',params.id);

			request.token = localStorage.getItem('authToken');
			request.golf_time = params.golf_time;

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		};

		this.getInfo = function(params, callback) {

			var request = msRequestFactory.createRequest('newbooking','getinfo',params.id);

			request.token = localStorage.getItem('authToken');
			request.type = params.type;

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});

		};

		this.Putreservation = function(params, callback) {
			var request = msRequestFactory.createRequest('newbooking','putreservation','');

			request.params = {
				token: localStorage.getItem('authToken'),
				serialnum: params.serialnum,
				golf_club_id: params.golf_club_id, 
				reservation_type: params.reservation_type,
				item_code: params.item_code,
				payment_division: params.payment_division,
				golf_time: params.golf_time,
				cancel_day: params.cancel_day,
				refund_text: params.refund_text,
				courses: params.courses,
				green_fee: params.green_fee,
				explain: params.explain,
				people: params.people,
				payment_type: params.payment_type,
				payment_price: params.payment_price,
				status: params.status,
				id: params.id
			}

			msRestfulApi.post(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림', res.message);
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};
		this.getReservationLists = function(params, callback) {
			var request = msRequestFactory.createRequest('newbooking','reservationlists','');

			request.token = localStorage.getItem('authToken');
			request.limit = params.limit;
			request.offset = params.offset;
			request.tabs = params.tabs;

			msRestfulApi.get(request, function(res) {
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림', res.message);
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};
	})

	.service('LogService', function(msRequestFactory, msRestfulApi, popup, $rootScope, $ionicLoading) {
		this.Insert = function(params, callback) {
			var request = msRequestFactory.createRequest('log','error','');

			request.params = {
				token: localStorage.getItem('authToken'),
				body: params.msg,
				f_1: params.f_1
			}

			msRestfulApi.post(request, function(res) {
				if (res.success) {
				}
			}, function(error) {
				console.log(error.statusText);
				return;
			});
		};
	})

	.service('GolfcubeService', function(msRequestFactory, msRestfulApi, popup, $rootScope, $ionicLoading) {
		this.ajax = function(params, callback) {
			var request = msRequestFactory.createRequest('golfcube','ajax','');

			request.params = {
				token: localStorage.getItem('authToken'),
				type: params.type,
				club: params.club,
				rdate: params.rdate,
				rtime: params.rtime,
				course: params.course
			}

			msRestfulApi.post(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림','연결에 실패하였습니다. 다시시도 하시기 바랍니다')
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				console.log(error.statusText);
				return;
			});
		};
		this.end = function(params) {
			var request = msRequestFactory.createRequest('golfcube','end',params.id);

			request.params = {
				token: localStorage.getItem('authToken')
			}

			msRestfulApi.post(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
				}
			}, function(error) {
				$ionicLoading.hide();
				console.log(error.statusText);
				return;
			});
		};
	})

	.service('PremiumService', function(msRequestFactory, msRestfulApi, popup, $rootScope, $ionicLoading) {
		this.getClubType = function(params, callback) {
			var request = msRequestFactory.createRequest('premium','getClubType','');

			request.token = localStorage.getItem('authToken');
			request.clubType = params.clubType;

			msRestfulApi.get(request, function(res) {
				$ionicLoading.hide();
				if (res.success) {
					callback(res.data);
				} else {
					popup.alert('알림',res.message);
					return;
				}
			}, function(error) {
				$ionicLoading.hide();
				popup.alert('서버 에러',error.statusText);
				return;
			});
		};
	})

	.service("$focusChat", function(){

		this.focusOnBlur = true;

		this.setFocusOnBlur = function(val){
		    this.focusOnBlur = val;
		}

		this.getFocusOnBlur = function(){
		    return this.focusOnBlur;
		}
	})

;