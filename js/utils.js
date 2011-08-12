var utils = {
	loadingStack: [],
	loading: function(show) {
		if (show) {
			this.loadingStack.push(true);
			$('#utils-loading').show();
		} else {
			this.loadingStack.pop();
			if (this.loadingStack.length == 0) {
				$('#utils-loading').hide();
			}
		}
	},
	error: function(title, explanation) {
		if (explanation !== undefined) {
			console.error('Error: '+ title + " - " + explanation);
			this.loading(false);
			$('#utils-error .utils-msg-title').html(title);
			$('#utils-error .utils-msg-explanation').html(explanation);
			$('#utils-error').show();
			$('#utils-print').hide();
			$('#utils-success').hide();
		} else {
			console.error('Error: '+ title);
			this.loading(false);
			$('#utils-error .utils-msg-title').html(title);
			$('#utils-error').show();
			$('#utils-print').hide();
			$('#utils-success').hide();
		}
	},
	print: function(title, explanation) {		
		if (explanation !== undefined) {
			console.log('Print: '+ title + " - " + explanation);
			$('#utils-print .utils-msg-title').html(title);
			$('#utils-print .utils-msg-explanation').html(explanation);
			$('#utils-print').show();
			$('#utils-error').hide();
			$('#utils-success').hide();
		} else {
			console.log('Print: '+ title);
			$('#utils-print .utils-msg-title').html(title);
			$('#utils-print').show();
			$('#utils-error').hide();
			$('#utils-success').hide();
		}
	},
	statusClear: function() {
		$('#utils-error').hide();
		$('#utils-print').hide();
		$('#utils-success').hide('');
		$('#utils-error').html('');
		$('#utils-print').html('');
		$('#utils-success').html('');
	},
	sprintf: function(str) {
		for (var i = 1, il = arguments.length; i < il; ++i) {
		//	console.assert(arguments[i] !== null, 'i18n: one argument was not specified');
			
			str = str.replace(/%@/, arguments[i]);
		}
		return str;
	},
	isObjectType: function(obj, type) {
	    return !!(obj && type && type.prototype && obj.constructor == type.prototype.constructor);
	},
	isObject: function(obj) {
	    return !!(obj && Object && Object.prototype && obj.constructor == Object.prototype.constructor);
	},
	getParameter: function(paramName) {
		var searchString = window.location.search.substring(1),
			val, 
			params = searchString.split("&");

	  	for (var i=0, il=params.length; i<il; ++i) {
	    	val = params[i].split("=");
	    	if (val[0] == paramName) {
	      		return unescape(val[1]);
	    	}
	  	}
	  	return null;
	},
	getMousePosition: function(timeoutMilliSeconds) {
	    // "one" attaches the handler to the event and removes it after it has executed once 
	    $(document).one("mousemove", function(event) {
	        window.mouseXPos = event.pageX;
	        window.mouseYPos = event.pageY;
	        // set a timeout so the handler will be attached again after a little while
	        requestTimeout("utils.getMousePosition(" + timeoutMilliSeconds + ")", timeoutMilliSeconds);
	    });
	},
	/**
	 * Future proofing i18n, including sprintf functionality
	 */
	i18n: function(str) {
		for (var i=1, il=arguments.length; i < il; ++i) {
			console.assert(arguments[i] !== null, 'i18n: one argument was not specified');
			
			str = str.replace(/%@/, arguments[i]);
		}
		return str;
	},
	cap: function(value, min, max) {
		return Math.min(Math.max(value, min), max);
	},
	random: function(min, max) {
		return Math.random() * (max - min) + min;
	}
};

/**
 * Globals 
 */
var __ = utils.i18n;
