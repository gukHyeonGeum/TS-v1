
//naver start

angular.module('oauth.naver', ['oauth.utils'])
	.factory('$naver', naver);

function naver($q, $http, $cordovaOauthUtility) {
	return { signin: oauthNaver };

	function oauthNaver(clientId, client_secret, state, options) {
	var deferred = $q.defer();
	if(window.cordova) {
		if($cordovaOauthUtility.isInAppBrowserInstalled()) {
		var redirect_uri = "http://localhost/callback";
		if(options !== undefined) {
			if(options.hasOwnProperty("redirect_uri")) {
			redirect_uri = options.redirect_uri;
			}
		}
		//login
		var flowUrl = "https://nid.naver.com/oauth2.0/authorize?response_type=code&client_id=" + clientId + "&redirect_uri=" + redirect_uri + "&state="+state;
		var browserRef = window.cordova.InAppBrowser.open(flowUrl, "_blank", "location=no,clearsessioncache=yes,clearcache=yes");
		browserRef.addEventListener("loadstart", function(event) {
			if((event.url).indexOf(redirect_uri) === 0) {
			var requestCode = (event.url).split("code=")[1];
			var requestToken = requestCode.split("&")[0];
			$http.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
			
			//request access_token
			//you must start emulate without option -l (ionic run ios)
			var url ="https://nid.naver.com/oauth2.0/token?grant_type=authorization_code&client_id=" + clientId+"&client_secret="+client_secret + "&code=" + requestToken+"&state="+state;
			$http({method: "get", url: url })
				.success(function(data) {
					deferred.resolve(data);
				})
				.error(function(data, status) {
					deferred.reject("Problem authenticating");
				})
				.finally(function() {
					setTimeout(function() {
						browserRef.close();
					}, 10);
			});
			
			
			}
		});
		browserRef.addEventListener('exit', function(event) {
			deferred.reject("The sign in flow was canceled");
		});
		} else {
		deferred.reject("Could not find InAppBrowser plugin");
		}
	} else {
		deferred.reject("Cannot authenticate via a web browser");
	}

	return deferred.promise;
	}
}

naver.$inject = ['$q', '$http', '$cordovaOauthUtility'];
//naver end






angular.module("oauth.providers", [
	
	'oauth.naver'
	
	])
	.factory("$cordovaOauth", cordovaOauth);

function cordovaOauth(
	$q, $http, $cordovaOauthUtility, $naver) {

	return {
	
	naver: $naver.signin
	};
}

cordovaOauth.$inject = [
	"$q", '$http', "$cordovaOauthUtility",
	
	'$naver'
];

angular.module("ngCordovaOauth", [
	"oauth.providers",
	"oauth.utils"
]);

angular.module("oauth.utils", [])
	.factory("$cordovaOauthUtility", cordovaOauthUtility);

function cordovaOauthUtility($q) {
	return {
	isInAppBrowserInstalled: isInAppBrowserInstalled,
	createSignature: createSignature,
	createNonce: createNonce,
	generateUrlParameters: generateUrlParameters,
	parseResponseParameters: parseResponseParameters,
	generateOauthParametersInstance: generateOauthParametersInstance
	};

	/*
	 * Check to see if the mandatory InAppBrowser plugin is installed
	 *
	 * @param
	 * @return	 boolean
	 */
	function isInAppBrowserInstalled() {
	var cordovaPluginList = cordova.require("cordova/plugin_list");
	var inAppBrowserNames = ["cordova-plugin-inappbrowser", "org.apache.cordova.inappbrowser"];

	if (Object.keys(cordovaPluginList.metadata).length === 0) {
		var formatedPluginList = cordovaPluginList.map(
		function(plugin) {
			return plugin.pluginId;
		});

		return inAppBrowserNames.some(function(name) {
		return formatedPluginList.indexOf(name) != -1 ? true : false;
		});
	} else {
		return inAppBrowserNames.some(function(name) {
		return cordovaPluginList.metadata.hasOwnProperty(name);
		});
	}
	}

	/*
	 * Sign an Oauth 1.0 request
	 *
	 * @param	string method
	 * @param	string endPoint
	 * @param	object headerParameters
	 * @param	object bodyParameters
	 * @param	string secretKey
	 * @param	string tokenSecret (optional)
	 * @return	 object
	 */
	function createSignature(method, endPoint, headerParameters, bodyParameters, secretKey, tokenSecret) {
	if(typeof jsSHA !== "undefined") {
		var headerAndBodyParameters = angular.copy(headerParameters);
		var bodyParameterKeys = Object.keys(bodyParameters);

		for(var i = 0; i < bodyParameterKeys.length; i++) {
		headerAndBodyParameters[bodyParameterKeys[i]] = encodeURIComponent(bodyParameters[bodyParameterKeys[i]]);
		}

		var signatureBaseString = method + "&" + encodeURIComponent(endPoint) + "&";
		var headerAndBodyParameterKeys = (Object.keys(headerAndBodyParameters)).sort();

		for(i = 0; i < headerAndBodyParameterKeys.length; i++) {
		if(i == headerAndBodyParameterKeys.length - 1) {
			signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]]);
		} else {
			signatureBaseString += encodeURIComponent(headerAndBodyParameterKeys[i] + "=" + headerAndBodyParameters[headerAndBodyParameterKeys[i]] + "&");
		}
		}

		var oauthSignatureObject = new jsSHA(signatureBaseString, "TEXT");

		var encodedTokenSecret = '';
		if (tokenSecret) {
		encodedTokenSecret = encodeURIComponent(tokenSecret);
		}

		headerParameters.oauth_signature = encodeURIComponent(oauthSignatureObject.getHMAC(encodeURIComponent(secretKey) + "&" + encodedTokenSecret, "TEXT", "SHA-1", "B64"));
		var headerParameterKeys = Object.keys(headerParameters);
		var authorizationHeader = 'OAuth ';

		for(i = 0; i < headerParameterKeys.length; i++) {
		if(i == headerParameterKeys.length - 1) {
			authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '"';
		} else {
			authorizationHeader += headerParameterKeys[i] + '="' + headerParameters[headerParameterKeys[i]] + '",';
		}
		}

		return { signature_base_string: signatureBaseString, authorization_header: authorizationHeader, signature: headerParameters.oauth_signature };
	} else {
		return "Missing jsSHA JavaScript library";
	}
	}

	/*
	* Create Random String Nonce
	*
	* @param	integer length
	* @return	 string
	*/
	function createNonce(length) {
	var text = "";
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

	for(var i = 0; i < length; i++) {
		text += possible.charAt(Math.floor(Math.random() * possible.length));
	}

	return text;
	}

	function generateUrlParameters(parameters) {
	var sortedKeys = Object.keys(parameters);
	sortedKeys.sort();

	var params = "";
	var amp = "";

	for (var i = 0 ; i < sortedKeys.length; i++) {
		params += amp + sortedKeys[i] + "=" + parameters[sortedKeys[i]];
		amp = "&";
	}

	return params;
	}

	function parseResponseParameters(response) {
	if (response.split) {
		var parameters = response.split("&");
		var parameterMap = {};

		for(var i = 0; i < parameters.length; i++) {
			parameterMap[parameters[i].split("=")[0]] = parameters[i].split("=")[1];
		}

		return parameterMap;
	}
	else {
		return {};
	}
	}

	function generateOauthParametersInstance(consumerKey) {
	var nonceObj = new jsSHA(Math.round((new Date()).getTime() / 1000.0), "TEXT");
	var oauthObject = {
		oauth_consumer_key: consumerKey,
		oauth_nonce: nonceObj.getHash("SHA-1", "HEX"),
		oauth_signature_method: "HMAC-SHA1",
		oauth_timestamp: Math.round((new Date()).getTime() / 1000.0),
		oauth_version: "1.0"
	};
	return oauthObject;
	}
}

cordovaOauthUtility.$inject = ['$q'];
