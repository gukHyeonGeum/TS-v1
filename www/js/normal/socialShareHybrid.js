
Kakao.init('d4121d1d25060425010a7d8c13b2ac89');

function sendSns(sns, url, txt)
{
	var o;
	var _url = encodeURIComponent(url);
	var _txt = encodeURIComponent(txt);
	var _br  = encodeURIComponent('\r\n');
	
	switch(sns)
	{
		
		case 'kakaotalk':

			Kakao.Link.sendTalkLink({
				label: $("#kakao-label").val(),
				image: {
					src: $("#kakao-src").val(),
					width: '300',
					height: '200'
				},
				webButton: {
					text: '티샷',
					url: 'http://localhost/fields/1163' // 앱 설정의 웹 플랫폼에 등록한 도메인의 URL이어야 합니다.
				}
			});
			break;
		
		case 'kakaostory':
				Kakao.Story.share({
				  url: url,
				  text: txt
				});
			break;
		
		case 'band':
			
			o = {
				method:'web2app',
				param:'create/post?text=' + _txt + _br + _url,
				a_store:'itms-apps://itunes.apple.com/app/id542613198?mt=8',
				a_proto:'bandapp://',
				g_store:'market://details?id=com.nhn.android.band',
				g_proto:'scheme=bandapp;package=com.nhn.android.band'
			};
			break;
		
		default:
			alert('지원하지 않는 SNS입니다.');
			return false;
			break;
	}

	switch(o.method)
	{
		case 'popup':
			window.open(o.url);
			break;
		
		case 'web2app':
			if(navigator.userAgent.match(/android/i))
			{
				//action: WebIntent.ACTION_VIEW,
				window.plugins.webintent.startActivity(
					{
						action: window.plugins.webintent.ACTION_VIEW,
						url: 'geo:0,0?q=' + 'new york'
					}, 
					function() {}, 
					function(e) {
						alert(e);

					}
				);
				 
			}
				else if(navigator.userAgent.match(/(iphone)|(ipod)|(ipad)/i))
			{
					console.log(window.cordova);	
					setTimeout(function(){ 	
					
					}, 200);
					
					var browserRef = window.cordova.InAppBrowser.open(o.a_proto + o.param, '_blank', 'location=no,clearsessioncache=yes,clearcache=yes');
					browserRef.addEventListener("loadstart", function(event) {
						console.log(event);
					});
					
				}
			else
			{
				alert('이 기능은 모바일에서만 사용할 수 있습니다.');
			}
			break;
	}
}