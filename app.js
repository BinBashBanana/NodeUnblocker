/***************
 * node-unblocker: Web Proxy for evading firewalls and content filters,
 * similar to CGIProxy or PHProxy
 *
 *
 * This project is hosted on github:  https://github.com/nfriedly/nodeunblocker.com
 *
 * By Nathan Friedly - http://nfriedly.com
 * Released under the terms of the Affero GPL v3
 */

var url = require('url');
var querystring = require('querystring');
var express = require('express');
var unblocker = require('unblocker');
var Transform = require('stream').Transform;
var app = express();

function injectScript(data) {
    if (data.contentType == 'text/html') { // https://nodejs.org/api/stream.html#stream_transform
		data.stream = data.stream.pipe(
			new Transform({
				decodeStrings: false,
				transform: function(chunk, encoding, next) {
				const updated = chunk
				.toString()
				.replace('_blank','_self')
				.replace('_parent','_self')
				.replace('_top','_self')
				.replace('</body>',`<script src="//code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script><script>
eval(unescape(atob("dmFyIG92ZXJsYXk9ITA7JChkb2N1bWVudCkua2V5ZG93bihmdW5jdGlvbihlKXt2YXIgbD10b3A7IjE3Ij09ZS53aGljaD9jbnRybElzUHJlc3NlZD0hMDo3Nz09ZS53aGljaCYmY250cmxJc1ByZXNzZWQ/KCJub25lIiE9PWwuZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoInJ1c2ljLW1vZGFsIikuc3R5bGUuZGlzcGxheT8obC5kb2N1bWVudC5nZXRFbGVtZW50QnlJZCgicnVzaWMtbW9kYWwiKS5zdHlsZS5kaXNwbGF5PSJub25lIiwhMD09PW92ZXJsYXkmJihsLmRvY3VtZW50LmdldEVsZW1lbnRzQnlDbGFzc05hbWUoIm92ZXJsYXkiKVswXS5zdHlsZS5kaXNwbGF5PSJub25lIikpOihsLmRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCJydXNpYy1tb2RhbCIpLnN0eWxlLmRpc3BsYXk9ImluaXRpYWwiLCEwPT09b3ZlcmxheSYmKGwuZG9jdW1lbnQuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSgib3ZlcmxheSIpWzBdLnN0eWxlLmRpc3BsYXk9ImluaXRpYWwiKSksY250cmxJc1ByZXNzZWQ9ITEpOmNudHJsSXNQcmVzc2VkPSExfSk7")));
function gcloak() { var link = document.querySelector("link[rel*='icon']") || document.createElement('link'); link.type = 'image/x-icon'; link.rel = 'shortcut icon'; link.href = 'https://google.com/favicon.ico'; document.title = 'Google'; document.getElementsByTagName('head')[0].appendChild(link) }; gcloak();setInterval(gcloak, 1000); 
</script></body>`)
				this.push(updated, "utf8");
				next();
			}
		}))
    }
}

var unblockerConfig = {
    prefix: '/%3E/',
 	responseMiddleware: [
		injectScript
	]
};



// this line must appear before any express.static calls (or anything else that sends responses)
app.use(unblocker(unblockerConfig));

// serve up static files *after* the proxy is run
app.use('/', express.static(__dirname + '/public'));

// this is for users who's form actually submitted due to JS being disabled or whatever
app.get("/no-js", function(req, res) {
    // grab the "url" parameter from the querystring
    var site = querystring.parse(url.parse(req.url).query).url;
    // and redirect the user to /proxy/url
    res.redirect(unblockerConfig.prefix + site);
});

// for compatibility with gatlin and other servers, export the app rather than passing it directly to http.createServer
module.exports = app;
