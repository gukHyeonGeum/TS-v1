
//버젼 비교용 자바스크립트 시작
function assert(x) {
	if (!x) {
		alert("Assert failed");
		//debugger;
	}
}

function isPositiveInteger(x) {
	// http://stackoverflow.com/a/1019526/11236
	return /^\d+$/.test(x);
}

function compareVersionNumbers(v1, v2){
	var v1parts = v1.split('.');
	var v2parts = v2.split('.');
	
	// First, validate both numbers are true version numbers
	function validateParts(parts) {
		for (var i = 0; i < parts.length; ++i) {
			if (!isPositiveInteger(parts[i])) {
				return false;
			}
		}
		return true;
	}
	if (!validateParts(v1parts) || !validateParts(v2parts)) {
		return NaN;
	}
	
	for (var i = 0; i < v1parts.length; ++i) {
		if (v2parts.length === i) {
			return 1;
		}
		
		if (v1parts[i] === v2parts[i]) {
			continue;
		}
		if (v1parts[i] > v2parts[i]) {
			return 1;
		}
		return -1;
	}
	
	if (v1parts.length != v2parts.length) {
		return -1;
	}
	
	return 0;
}

//버젼 비교용 자바스크립트 끝



function pad(n, width, z) {
	z = z || '0';
	n = n + '';
	return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

