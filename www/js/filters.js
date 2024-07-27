angular.module('starter.filters', [])
	//채팅용 : html을 일반 텍스트로 변경
	.filter('htmlToPlaintext', function() {
		return function(text) {
			return  text ? String(text).replace(/(<([^>]+)>)/gi, "") : '';
		};
	})
	//채팅용 :nl2br
	.filter('nl2br', ['$sanitize', function($sanitize) {
		var tag = (/xhtml/i).test(document.doctype) ? '<br />' : '<br>';
		return function(msg) {
			msg = (msg + '').replace(/(\r\n|\n\r|\r|\n|&#10;&#13;|&#13;&#10;|&#10;|&#13;)/g, tag + '$1');
			return $sanitize(msg);
		};
	}])
	// 골프장 조인의 리플 갯수
	.filter('f_repleCnt', function () {
		return function (input) {
			var rtn_cnt = 0;
			angular.forEach(input, function(value, key) {
				if(value.thread.length == 1) rtn_cnt++;
			});
			return rtn_cnt;
		};
	})
	//썸네일 이미지 관련
	.filter('local_img', function ($http) {
		return function (input) {
			var return_str;
			if(!input){
				return_str = "images/avatars/avatar-unknown.jpg";
			} else {
				if(input.substring(0, 1) == "/") {
					return_str = encodeURI(decodeURIComponent(input.substring(1)));
				} else {
					// return_str = encodeURI(decodeURIComponent(input));
					return_str = input.replace(/%2F/g, "/").replace(/%3A/g, ":").replace(/%3F/g, "?").replace(/%3D/g, "=");
				}


			}
			
			return return_str;
		};
	})
	// 나이 표시
	.filter('f_age', function () {
		return function (input) {
			var out = '';
			
			if(input && input.length == 10){
				var birth = input.split("-");
				var today = new Date();
				var year	= parseInt(today.getFullYear()-1); 
				var month	= parseInt(today.getMonth()+1);
				var day		= parseInt(today.getDate());
				var ck		= parseInt(birth[0]);

				if(ck == 0) return "";

				var age = year - ck;
				var tmd = parseInt(month+''+day);
				var bmd = parseInt(birth[1]+''+birth[2]);

				if (tmd >= bmd) {
					age++;
				}

				out = age;//+1; // 우리나라 나이 표시 +1 더함 
			}
			return out;
		};
	})
	//날짜 표시
	.filter('f_date', function () {
		return function (input) {
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
			return d.getFullYear()+"."+(d.getMonth()+1)+"."+d.getDate();
		};
	})
	//골프장 조인용 디스플레이 날짜
	.filter('f_golfdate', function () {
		return function (input, reserved) {
			var korWeek = ['일', '월', '화', '수', '목', '금', '토'];
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
			switch(reserved){
				case 2:
					return pad((d.getMonth()+1), 2)+"."+pad(d.getDate(), 2)+"("+korWeek[d.getDay()]+") "+pad(d.getHours(), 2)+"시간대";
				break;
				case 'week':
					return d.getDay();
				break;
				default:
					return pad((d.getMonth()+1), 2)+"."+pad(d.getDate(), 2)+"("+korWeek[d.getDay()]+") "+pad(d.getHours(), 2)+":"+pad(d.getMinutes(), 2);
				break;
			}
			
		};
	})
	
	.filter('Zeros', function() {
		return function (n, digits) {
			var zero = '';
			n = n.toString();

			if (n.length < digits) {
				for (var i = 0; i < digits - n.length; i++)
		    		zero += '0';
			}
			return zero + n;
		}
	})
	//날짜 출력
	.filter('f_formatdate', function($filter) {
		return function (input, format) {
			var korWeek = ['일', '월', '화', '수', '목', '금', '토'];
			var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;
			var dateArray = reggie.exec(input); 
			
			if(dateArray && dateArray.length  == 7 ){
				var d = new Date(
					(+dateArray[1]),
					(+dateArray[2])-1, // Careful, month starts at 0!
					(+dateArray[3]),
					(+dateArray[4]),
					(+dateArray[5]),
					(+dateArray[6])
				);
				switch(format){
					case 1://"m/d H:i":
						return pad((d.getMonth()+1), 2)+"."+pad(d.getDate(), 2)+"("+korWeek[d.getDay()]+") "+pad(d.getHours(), 2)+":"+pad(d.getMinutes(), 2);
					break;
					case 'm.dw':
						return pad((d.getMonth()+1), 2)+"."+pad(d.getDate(), 2)+"("+korWeek[d.getDay()]+")";
					break;
					case 'mdw':
						return pad((d.getMonth()+1), 2)+"월 "+pad(d.getDate(), 2)+"일("+korWeek[d.getDay()]+") " + pad(d.getHours(), 2)+ ":" + pad(d.getMinutes(), 2) + "까지";
					break;
					case 'w'://"m/d H:i":
						return d.getDay();
					break;
					case 'H:i'://"m/d H:i":
						return pad(d.getHours(), 2)+":"+pad(d.getMinutes(), 2);
					break;
					case 'Y/m/d'://"m/d H:i":
						return d.getFullYear() + "/" + pad((d.getMonth()+1), 2)+"/"+pad(d.getDate(), 2);
					break;
					case 'Y.m.d':
						return d.getFullYear() + "." + pad((d.getMonth()+1), 2)+"."+pad(d.getDate(), 2);
					break;
					case 'y.m.d':
						var year = d.getFullYear().toString();
						return year.substring(2,4) + "." + pad((d.getMonth()+1), 2)+"."+pad(d.getDate(), 2);
					break;
					case 'm.d':
						return pad((d.getMonth()+1), 2)+"."+pad(d.getDate(), 2);
					break;
					case 'Ymd':
						return d.getFullYear() + pad((d.getMonth()+1), 2)+pad(d.getDate(), 2);
					break;
					case 'Hi':
						return pad(d.getHours(), 2)+pad(d.getMinutes(), 2);
					break;
					default://"m/d H:i":
						return pad((d.getMonth()+1), 2)+"."+pad(d.getDate(), 2)+" "+pad(d.getHours(), 2)+":"+pad(d.getMinutes(), 2);
					break;
				}
			}else if(dateArray == null){//2016-04-25T06:27:32.000Z
				var d = new Date(input);
				var month = $filter('Zeros')(d.getMonth()+1, 2);
				var date = $filter('Zeros')(d.getDate(), 2);

				switch(format){
					case 94:
						return month.toString()+"월 "+date.toString()+"일("+korWeek[d.getDay()]+") " + pad(d.getHours(), 2)+ ":" + pad(d.getMinutes(), 2) + "까지";
					break;
					case 95:
						return month.toString()+"."+date.toString()+"("+korWeek[d.getDay()]+")";
					break;
					case 96:
						return month.toString()+"."+date.toString();
					break;
					case 97:
						return d.getFullYear()+'-'+month.toString()+"-"+date.toString();
					break;
					case 98:
						return month.toString()+"."+date.toString()+"("+korWeek[d.getDay()]+") "+d.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substr(0, 5);
					break;
					case 99:
						if (d.getDay() == 0) var weekend = 'assertive';
						else if (d.getDay() == 6) var weekend = 'positive';
						return "<div class='"+weekend+"'>" + korWeek[d.getDay()] + "<div>" +pad((d.getMonth()+1), 2)+"/"+pad(d.getDate(), 2)+ "</div></div>";
					break;
					case 'Hi':
						return d.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substr(0, 5);
					break;
					case 'm.d':
						return month.toString()+"."+date.toString();
					break;
					case 'YmdHis':
						return d.getFullYear()+month.toString()+date.toString()+pad(d.getHours(), 2)+pad(d.getMinutes(), 2)+pad(d.getSeconds(), 2);
					break;
					case 'date':
						return d.getFullYear()+"-"+month.toString()+"-"+date.toString()+" "+pad(d.getHours(), 2)+":"+pad(d.getMinutes(), 2)+":"+pad(d.getSeconds(), 2);
					break;
					default:
						return month.toString()+"."+date.toString()+" "+d.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, "$1").substr(0, 5);
					break;
				}
				
			}else{
				return "";
			}
			
		};
	})
	//성별 출력
	.filter('f_gender', function () {
		return function (input) {
			switch(input){
				case "male": out 	= '남'; break;
				case "female": out	= '여'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})
	//평균타수
	.filter('f_golfScore', function () {//평균타수
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 2: out = '싱글'; break;
				case 3: out	= '80-90타'; break;
				case 4: out	= '90-100타'; break;
				case 5: out	= '100-110타'; break;
				case 6: out	= '110타 이하'; break;
				case 7: out	= '초보'; break;
				default:out = '미입력'; break;
			};
			
			return out;
		};
	})
	//골플경력
	.filter('f_golfYear', function () {//골프경력
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out	= '1년 이하'; break;
				case 2: out 	= '2-3년'; break;
				case 3: out	= '4-5년'; break;
				case 4: out	= '6-7년'; break;
				case 5: out	= '8-9년'; break;
				case 6: out	= '10년 이상'; break;
				
				default:out = '미입력'; break;
			};
			
			return out;
		};
	})
	
	.filter('f_golfFrequency', function () {//월라운딩 회수
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out	= '1회 이하'; break;
				case 2: out = '1-2회'; break;
				case 3: out	= '2-3회'; break;
				case 4: out	= '4-5회'; break;
				case 5: out	= '6-7회'; break;
				case 6: out	= '8-9회'; break;
				case 7: out	= '10회 이상'; break;
				default:out = '미입력'; break;
			};
			
			return out;
		};
	})
	
	.filter('f_golfOversea', function () {//해외골프회수
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out	= '1회 이하'; break;
				case 2: out = '1-2회'; break;
				case 3: out	= '2-3회'; break;
				case 4: out	= '4-5회'; break;
				case 5: out	= '6-7회'; break;
				case 6: out	= '8-9회'; break;
				case 7: out	= '10회 이상'; break;
				default:out = '미입력'; break;
			};
			
			return out;
		};
	})

	.filter('f_golfMembership', function (golf_membership) {//골프 회원권
		return function (input) {
			
			angular.forEach(golf_membership, function(value, key) {
				if(key == input) out = value;
			});
			
			return out;
		};
	})

	.filter('f_golfPartner', function () {//골프 회원권
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 3: out	= '조인 1명'; break;
				case 9: out = '조인 2명'; break;
				case 7: out	= '부부,커플'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})

	.filter('f_companion', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out	= '초청자'; break;
				case 2: out = '초청자, 남1명'; break;
				case 3: out	= '초청자, 남2명'; break;
				case 4: out	= '초청자, 여1명'; break;
				case 5: out	= '초청자, 여2명'; break;
				case 6: out	= '초청자, 남1여1'; break;
				case 7: out	= '부부'; break;
				case 8: out	= '커플'; break;
				default:out = '초청자'; break;
			};
			
			return out;
		};
	})

	.filter('f_companionJoin', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out	= '등록자'; break;
				case 2: out = '등록자, 남1명'; break;
				case 3: out	= '등록자, 남2명'; break;
				case 4: out	= '등록자, 여1명'; break;
				case 5: out	= '등록자, 여2명'; break;
				case 6: out	= '등록자, 남1여1'; break;
				case 7: out	= '부부'; break;
				case 8: out	= '커플'; break;
				default:out = '등록자'; break;
			};
			
			return out;
		};
	})

	.filter('f_companionBooking', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out	= '조인 1명'; break;
				case 2: out = '조인 2명'; break;
				case 3: out	= '조인 3명'; break;
				case 4: out	= ''; break;
				case 5: out	= ''; break;
				case 6: out	= ''; break;
				case 7: out	= ''; break;
				case 8: out	= '부부&커플'; break;
				default:out = '조인'; break;
			};
			
			return out;
		};
	})

	.filter('f_partner', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out		= '조인 1명'; break;
				case 2: out 	= '조인 2명'; break;
				case 3: out 	= '조인 3명'; break;
				case 4: out		= '여자 1명'; break;
				case 5: out		= '여자 2명'; break;
				case 6: out		= '남자 1명'; break;
				case 7: out		= '남자 2명'; break;
				case 8: out		= '남1, 여1'; break;
				case 9: out		= '부부'; break;
				case 10: out	= '부부&커플'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})

	.filter('f_partnerBooking', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out		= '조인 1명'; break;
				case 2: out 	= '조인 2명'; break;
				case 3: out 	= '조인 3명'; break;
				case 4: out		= ''; break;
				case 5: out		= ''; break;
				case 6: out		= ''; break;
				case 7: out		= ''; break;
				case 8: out		= ''; break;
				case 9: out		= ''; break;
				case 10: out	= '부부&커플'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})

	.filter('f_companion_booking_count', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			var obj = {};
			switch(input){
				case 1: 
					obj = { cnt: 1, sex: [] };
				break;
				case 2: 
					obj = { cnt: 2, sex: ['a'] };
				break;
				case 3: 
					obj = { cnt: 3, sex: ['a','a'] };
				break;
				case 4: 
					obj = { cnt: 2, sex: ['f'] };
				break;
				case 5: 
					obj = { cnt: 3, sex: ['f','f'] };
				break;
				case 6: 
					obj = { cnt: 3, sex: ['m','f'] };
				break;
				case 7:
					obj = { cnt: 2, sex: ['hw'] };
				break;
				case 8: 
					obj = { cnt: 2, sex: ['hw'] };
				break;
				default:
					obj = { cnt: 1, sex: [] };
				break;
			};
			return obj;
		};
	})

	.filter('f_companion_count', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			var obj = {};
			switch(input){
				case 1: 
					obj = { cnt: 1, sex: [] };
				break;
				case 2: 
					obj = { cnt: 2, sex: ['m'] };
				break;
				case 3: 
					obj = { cnt: 3, sex: ['m','m'] };
				break;
				case 4: 
					obj = { cnt: 2, sex: ['f'] };
				break;
				case 5: 
					obj = { cnt: 3, sex: ['f','f'] };
				break;
				case 6: 
					obj = { cnt: 3, sex: ['m','f'] };
				break;
				case 7:
					obj = { cnt: 2, sex: ['hw'] };
				break;
				case 8: 
					obj = { cnt: 2, sex: ['hw'] };
				break;
				default:
					obj = { cnt: 1, sex: [] };
				break;
			};
			return obj;
		};
	})

	.filter('f_partner_count', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			var obj = {};
			var cnt = 0;
			switch(input){
				case 1: 
					obj = { cnt: 1, sex: ['a'] };
				break;
				case 2: 
					obj = { cnt: 2, sex: ['a','a'] };
				break;
				case 3: 
					obj = { cnt: 3, sex: ['a','a','a'] };
				break;
				case 4: 
					obj = { cnt: 1, sex: ['f'] };
				break;
				case 5: 
					obj = { cnt: 2, sex: ['f','f'] };
				break;
				case 6: 
					obj = { cnt: 1, sex: ['m'] };
				break;
				case 7:
					obj = { cnt: 2, sex: ['m','m'] };
				break;
				case 8: 
					obj = { cnt: 2, sex: ['m','f'] };
				break;
				case 9: 
					obj = { cnt: 2, sex: ['hw'] };
				break;
				case 10: 
					obj = { cnt: 2, sex: ['hw'] };
				break;

			};
			return obj;
		};
	})

	.filter('f_invite', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out		= '무관 1명'; break;
				case 2: out 	= '무관 2명'; break;
				case 3: out 	= '무관 3명'; break;
				case 4: out		= '여자 1명'; break;
				case 5: out		= '여자 2명'; break;
				case 6: out		= '남자 1명'; break;
				case 7: out		= '남자 2명'; break;
				case 8: out		= '남1, 여1'; break;
				case 9: out		= '부부'; break;
				case 10: out	= '커플'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})

	//성별 출력
	.filter('f_golf_sex', function () {
		return function (input) {
			switch(input){
				case 1: out = '여성'; break;
				case 2: out	= '남성'; break;
				case 3: out	= '성별 무관'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})

	.filter('f_BookingReqPeople', function () { // 동반자
		return function (input) {
			input	= parseInt(input);
			switch(input){
				case 1: out		= '신청 1명'; break;
				case 2: out 	= '신청 2명'; break;
				case 3: out 	= '부부커플'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})
	
	.filter('numberformat', function () {//숫자 포맷
		return function (input) {
			return accounting.formatNumber(input);
		};
	})
	
	.filter('parentThread', function () {//extract parent thread
		return function (input) {
			return input.substr(0, 1);
		};
	})
	.filter('substr', function() {
		return function(input, length, start) {
			//console.log(input.length);
			if(input != undefined){
				if (length != undefined) {
					return input.substring(start);
				} else {
					return ( input.length >=  length ? input.substring( 0, length ) + '...' : input.substring( length ) );
				}
			} else{ 
				return "";
			}
		};
	})

	.filter('telsubstr', function() {
		return function(input) {
			if (input) input = input.substring(0,3) + '****' + input.substring(input.length-4, input.length);
			else input = '';
			return input;
		}
	})

	.filter('phoneNumber', function() {
		return function(input) {
			if (input) {
				if (input.length == 10) {
					input = input.substring(0,3) + '-' + input.substring(3,6) + '-' + input.substring(input.length-4, input.length);
				} else {
					input = input.substring(0,3) + '-' + input.substring(3,7) + '-' + input.substring(input.length-4, input.length);
				}
			} else {
				input = '';
			}
			return input;
		}
	})

	.filter('getById', function() {
	  return function(input, id) {
	    var i=0, len=input.length;
	    for (; i<len; i++) {
	      if (+input[i].user_id == +id) {
	        // return input[i];
	        return {item: input[i], idx: i};
	      }
	    }
	    return null;
	  }
	})

	.filter('getByNo', function() {
	  return function(input, id) {
	    var i=0, len=input.length;
	    for (; i<len; i++) {
	      if (+input[i].id == +id) {
	        // return input[i];
	        return {item: input[i], idx: i};
	      }
	    }
	    return null;
	  }
	})

	.filter('s_date', function () {
		return function (input) {
			var d = new Date(input.replace(/-/g, '/'));
			return d;
		};
	})

	//성별 출력
	.filter('b_person', function () {
		return function (input) {
			switch(input){
				case 4: out = '4인필수'; break;
				case 3: out	= '3인이상'; break;
				case 2: out	= '2인이상'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})

	.filter('p_golf_type', function () {
		return function (input) {
			switch(input){
				case 2: out	= '국내1박2일'; break;
				case 3: out	= '해외골프'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})

	.filter('PayList', function() {
		return function (input) {
			switch(input){
				case 'n1': 
					out = {title:'일반 1개월', text: '1개월', price:9900, coupon:'일반<br />1개월'};
				break;
				case 'n2': 
					out = {title:'일반 2개월', text: '2개월', price:20000, coupon:'일반<br />2개월'};
				break;
				case 'n3': 
					out	= {title:'일반 3개월', text: '3개월', price:30000, coupon:'일반<br />3개월'};
				break;
				case 'p1': 
					out = {title:'프리미엄 1개월', text: '1개월', price:55000, coupon:'프리미엄<br />1개월'};
				break;
				case 'p2': 
					out = {title:'프리미엄 2개월', text: '2개월', price:99000, coupon:'프리미엄<br />2개월'};
				break;
				case 'p3': 
					out	= {title:'프리미엄 3개월', text: '3개월', price:132000, coupon:'프리미엄<br />3개월'};
				break;
				default: out = ''; break;
			};
			
			return out;
		};
	})

	.filter('BetweenDay', function() {
		return function(edate, type, sdate) {

			var out = '';
			var d = new Date();
			var reggie = /(\d{4})-(\d{2})-(\d{2}) (\d{2}):(\d{2}):(\d{2})/;

			switch(type){
				case 'payment': 
					if (sdate && edate) {
						var sArray = reggie.exec(sdate); 
						var eArray = reggie.exec(edate); 
						var s = new Date(sArray[1],(sArray[2])-1, sArray[3], sArray[4], sArray[5], sArray[6]);
						var e = new Date(eArray[1],(eArray[2])-1, eArray[3], eArray[4], eArray[5], eArray[6]);
						var hab = d.getTime() - s.getTime();
						
						if (hab > 0) {
							var day = Math.floor( ( e.getTime() - d.getTime() )/(1000*60*60*24) );
							var hour = Math.floor( ( e.getTime() - d.getTime() )/(1000*60*60) );
						} else {
							var day = Math.floor( ( e.getTime() - s.getTime() )/(1000*60*60*24) );
							var hour = Math.floor( ( e.getTime() - s.getTime() )/(1000*60*60) );

							// var add = day / 31;

							// if( add >= 2) {
							// 	day += Math.floor(add);
							// } else {
							// 	day += 1;
							// }
							day += 1;
						}
						

						if(day == 0) {
							if(hour > 0) out = "(" + hour +"시간남음)";
							else out = "종료";
						} else if(day < 0) {
							out = "종료";
						} else {
							out = "(잔여일 "+ day +"일)";
						}
					} else {
						out = "종료";
					}
				break;
				case 'day': 
					if (edate) {
						var eArray = reggie.exec(edate); 
						var e = new Date(eArray[1],(eArray[2])-1, eArray[3], eArray[4], eArray[5], eArray[6]);
						var day = Math.floor( ( e.getTime() - d.getTime() )/(1000*60*60*24) );

						out = day;
					} else {
						out = 0;
					}
				break;
				case 'dayCount': 
					if (edate) {
						var eArray = reggie.exec(edate); 
						var e = new Date(eArray[1],(eArray[2])-1, eArray[3], eArray[4], eArray[5], eArray[6]);
						var day = Math.floor( ( d.getTime() - e.getTime() )/(1000*60*60*24) );

						out = day;
					} else {
						out = 0;
					}
				break;
				case 'canceled_time':
					var day = sdate.substring(0,1);
					var eArray = reggie.exec(edate); 
					var e = new Date(eArray[1],(eArray[2])-1, eArray[3]-(parseInt(day)), 17, 0, 0);

					out = e;
				break;
				default: 
					if (edate) {
						var eArray = reggie.exec(edate); 
						var e = new Date(eArray[1],(eArray[2])-1, eArray[3], eArray[4], eArray[5], eArray[6]);
						var day = e.getTime() - d.getTime();

						out = day;
					} else {
						out = 0;
					}
				break;
			};

			return out;

			
		}
	})

	.filter('appr_dtm', function($filter) {
		return function() {

			var out = '';
			var d = new Date();
			var microtime = (Date.now() % 1000) / 1000;

			//out = $filter('f_formatdate')(d, 'YmdHis') + pad(microtime*10000, 4);
			out = $filter('f_formatdate')(d, 'YmdHis') + pad(Math.floor(microtime*10000), 4);

			return out;
		}
	})

	// 무료초대 내용 출력
	.filter('p_sponsor', function () {
		return function (input, type) {
			out = '';
			if (type == 1) {
				switch(input){
					case 1: out = '그린피'; break;
					case 2: out	= '그린피+카트비'; break;
					case 3: out	= '라운드비용 일체(카트, 캐디비 포함)'; break;
					default:out = ''; break;
				};
			} else if (type == 2) {
				switch(input){
					case 1: out = '패키지(카트, 캐디비 불포함)'; break;
					case 2: out	= '패키지비용 일체(카트, 캐디피 포함)'; break;
					case 3: out	= '패키지비용 일체(카트, 캐디피 포함)+항공권 포함'; break;
					default:out = ''; break;
				};
			} else if (type == 3) {
				out = '해외골프비용 일체';
			} else if (type == 4) {
				switch(input){
					case 1: out = '스크린 9홀'; break;
					case 2: out	= '스크린 18홀'; break;
					default:out = ''; break;
				};
			}
			
			return out;
		};
	})

	//무료초대 옵션
	.filter('p_option', function () {
		return function (input, type) {
			if (type == 2) {
				out = '1박2일 골프(숙박&식사)';
			} else if (type == 3) {
				out = '동반 해외골프(숙박&식사,항공)';
			} else if (type == 4) {
				switch(input){
					case 1: out = '스크린'; break;
					case 2: out	= '스크린+식사(커피)'; break;
					case 3: out	= '스크린+소주한잔'; break;
					default:out = ''; break;
				};
			} else {
				switch(input){
					case 1: out = '라운드'; break;
					case 2: out	= '라운드+식사(커피)'; break;
					case 3: out	= '라운드+소주한잔'; break;
					default:out = ''; break;
				};
			}
			
			return out;
		};
	})

	// 국가 설정
	.filter('p_foreign', function () {
		return function (input) {
			out = '';

			if (input) {
				var code = input.substring(0,2);
				switch(code){
					case '10': out = '일본'; break;
					case '11': out = '중국'; break;
					case '12': out = '태국'; break;
					case '13': out = '베트남'; break;
					case '14': out = '필리핀'; break;
					case '15': out = '라오스'; break;
					case '16': out = '말레이시아'; break;
					case '17': out = '대만'; break;
					case '18': out = '미얀마'; break;
					case '19': out = '브루나이'; break;
					case '20': out = '인도네시아'; break;
					case '21': out = '괌'; break;
					case '22': out = '사이판'; break;
					case '23': out = '하와이'; break;
					default:out = ''; break;
				};
			}
			
			return out;
		};
	})	

	//원하는 파트너
	.filter('p_partner_type', function () {
		return function (input) {
			switch(input){
				case 1: out = '골프친구'; break;
				case 2: out	= '골프애인'; break;
				case 3: out	= '비즈니스 소개'; break;
				default:out = ''; break;
			};
			
			return out;
		};
	})

;