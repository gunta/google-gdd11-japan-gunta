var Options = {
	twitterUrl: "http://api.twitter.com/1/statuses/user_timeline.json?screen_name=%@&count=30&include_entities=true&trim_user=true&callback=?",
//	twitterUrl: "http://g.atag.jp//p/quamquam/tete/server/user_timeline.php?screen_name=%@&callback=?",
	yahooUrl: "http://jlp.yahooapis.jp/KeyphraseService/V1/extract?callback=?&output=json&appid=CUt5tS6xg64GQ57PweGlaElYe46CqIkY_LM15MG7mh_MRGGuGe.DpoKpVbUVkvmxPauZzFlR_A--&sentence=%@",
	animation: true,
	stats: false,
	cursor: true,
	twitterCount: 23,
	twitterUser: "googledevjp"
}

/**
 * Analyzes the text using Yahoo service, based on already filtered text
 *  @param {Object} filtered Object containing filteredText and url. 
 */
function analyzeJapanese(filtered, tweetId) {
	var text = filtered.filteredText,
	tweetUrl = filtered.url;
	
	var yahooUrl = utils.sprintf(Options.yahooUrl, text);
	
	$.getJSON(yahooUrl, function(data) {
		if (data !== undefined && data !== null && utils.isObject(data)) {
		//	console.log("We got data from Yahoo!");
			
			insertAnalyzedText(text, data, tweetUrl, tweetId);
		}
	});
}

/**
 * Insert analyzed text in the DOM
 *  @param {string} text The text already analyzed
 *  @param {Object} analyzed The object containing the analized words with priorities
 *  @param {string} tweetUrl The url contained in the tweet, if any. Optional. 
 */
function insertAnalyzedText(text, analyzed, tweetUrl, tweetId) {
	var analyzedText = text;
	
//	console.group("Priority");
	
	var biggestPriority = 0;
	var biggestWord = "";
	
	for (var word in analyzed) {
		var priority = analyzed[word];
		//console.log(word + ":" + priority);
		
		if (priority > biggestPriority) {
			biggestPriority = priority;
			biggestWord = word;
		}
		
		var re = new RegExp(word, "im");
		analyzedText = analyzedText.replace(re, '<span class="p-' + priority + '">' + word + '</span>');
	}
	
//	console.groupEnd("Priority");

	var analyzed_html = '<div class="analyzed-tweet-container" id="tweet-'+tweetId+'" style="display: none;">\n';
	analyzed_html    += '<div class="analyzed-tweet">\n';
	if (tweetUrl != "")
		analyzed_html 	 += '<a href="'+tweetUrl+'" rel="external" target="_blank">\n';
	else
		analyzed_html 	 += '<a>\n';
	analyzed_html 	 += analyzedText;
	analyzed_html 	 += '</a>\n';
	analyzed_html 	 += '</div>\n';	
	analyzed_html 	 += '</div>\n';
	
	var biggest_html = '<div class="p-biggest" id="biggest-'+tweetId+'" style="display: none;">'+biggestWord+'</div>\n';

	//console.group("Analyzed HTML");
	//console.log(analyzed_html);
	//console.groupEnd("Analyzed HTML");
	
	$('#tweet_container2').append(analyzed_html);
	$('#tweet_biggest_container').append(biggest_html);
	
	insertAnalyzedTextFinished();
}

function getLastTweets(user, maxCount) {
	var twitterUrl = utils.sprintf(Options.twitterUrl, user);

	$.getJSON(twitterUrl, function(data) {
		console.log("Got data from twitter!");
		//console.log(data);
		
		var count;
		if (maxCount) {
			count = (data.length >= maxCount) ? maxCount : data.length;
		} else {
			count = data.length;
		}

		for (var i=0; i < count; ++i) {
			parseTweet(data[i], i+1);
		}
		
		// NOTE: This would be better when the yahoo parsing finishes
		console.log("Going to animate...");
		if (Sprite3D.isSupported() && Options.animation) {
			anim.init();
		}
	});
}

function parseTweet(tweet, tweetId) {
	if (tweet === undefined && tweet.text === undefined)
		return false;
	
	// Calculate how many hours ago was the tweet posted
    var date_tweet = new Date(tweet.created_at);
    var date_now   = new Date();
    var date_diff  = date_now - date_tweet;
    var hours      = Math.round(date_diff/(1000*60*60));
	
	var tweet_html = '<div class="tweet-text">';
    tweet_html    += tweet.text;
	tweet_html    += '<\/div>';
    tweet_html    += '<div class="tweet-hours">'
	tweet_html    += hours + ' hours ago';
    tweet_html    += '<\/div>';

	//$('#tweet_container').append(tweet_html);

	filterTweet(tweet, tweetId);
}

function filterTweet(tweet, tweetId) {
	var text = tweet.text,
	data = {
		url: "",
		filteredText: ""
	},
	options = {
		removeHashtags: true,
		removeUsermentions: false,
		removeUrls: true
	},
	indicesToRemove = [];
	
	
	// start index
	indicesToRemove.push(0);
	
	// remove and store urls
	if (options.removeUrls) {
		var urls = tweet.entities.urls;
		for (var i=0, il=urls.length; i < il; ++i) {
			data.url = urls[i].url;
		
			indicesToRemove.push(urls[i].indices[0]);
			indicesToRemove.push(urls[i].indices[1]);
		}
	}
	
	// remove hashtags
	if (options.removeHashtags) {
		var hashtags = tweet.entities.hashtags;
		for (var i=0, il=hashtags.length; i < il; ++i) {	
			indicesToRemove.push(hashtags[i].indices[0]);
			indicesToRemove.push(hashtags[i].indices[1]);
		}
	}
	
	// remove user mentions
	if (options.removeUsermentions) {
		var user_mentions = tweet.entities.user_mentions;
		for (var i=0, il=user_mentions.length; i < il; ++i) {	
			indicesToRemove.push(user_mentions[i].indices[0])
			indicesToRemove.push(user_mentions[i].indices[1]);
		}
	}
	
	// sort indices
	indicesToRemove.sort(function(a, b) {
		return a - b;
	});
	
	// end index
	indicesToRemove.push(-1);
	
	// remove text based on indices
	for (var i=0, il=indicesToRemove.length; i < il; i=i+2) {	
		//console.log("indexToRemove: " + indicesToRemove[i]);
		// the last element in the array
		if (indicesToRemove[i] == -1) 
			break;
		// the last pair in the array, next one will be the last element
		if (indicesToRemove[i+1] == -1) {
			data.filteredText += text.substring(indicesToRemove[i]);
			break;
		}
		// finally extract only the required substrings!
		data.filteredText += text.substring(indicesToRemove[i], indicesToRemove[i+1])
	}
	
	//console.log("data.filteredText: " + data.filteredText);
	//console.log("data.url: " + data.url);
	
	analyzeJapanese(data, tweetId);
}

function insertAnalyzedTextFinished() {
	//console.log("Now we can animate!");
	utils.loading(false);
	
}


(function(){
	utils.loading(true);
	document.addEventListener('DOMContentLoaded', function () {
	    init()
	}, false);

	function init() {

		//getMousePosition(100);
		
		var user = utils.getParameter("user") || Options.twitterUser;
		getLastTweets(user, Options.twitterCount);
		
		
		//var gddtrianglesvg = document.getElementById("gddtrianglesvg");
		//console.log(gddtrianglesvg.contentDocument.documentElement);
	
	}
	window.counter = 0.5;
	window.counterY = 1;

})();


function svgOpenTriangle(id) {
	//window.event.preventDefault();
	console.log("svgOpenTriangle: " + id);
	
	// tweet
	if (anim.lastOpenedTweet != null) {
		anim.lastOpenedTweet.style.display = "none";
	}
	var tweetId = id.replace("triangle", "tweet");
	var tweetDiv = document.getElementById(tweetId);	
	if (tweetDiv != undefined) {
		tweetDiv.style.display = "block";
		anim.lastOpenedTweet = tweetDiv;
	}	
	
	// biggest
	if (anim.lastOpenedBiggest != null) {
		anim.lastOpenedBiggest.style.display = "none";
	}
	var biggestId = id.replace("triangle", "biggest");
	var biggestDiv = document.getElementById(biggestId);	
	if (biggestDiv != undefined) {
		biggestDiv.style.display = "block";
		anim.lastOpenedBiggest = biggestDiv;
	}
	
	Tween.get(anim.image).to({
		x: Math.abs(Math.floor( Math.random() * 10 - 5) + 5),
		rotationX: Math.abs(Math.round( Math.random() ) * 30),
		//rotationY: y *2,
	//	z: 800,
	//	moveZ: 1000,
	},1000, Easing.Exponential.EaseInOut)
}

/*
function svgOverTriangle(id) {
	console.log("svgOverTriangle: " + id);
	console.dir($("#triangle-15"))
}*/


