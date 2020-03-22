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
				.replace('</body>',`<script src="//code.jquery.com/jquery-3.4.1.min.js" integrity="sha256-CSXorXvZcTkaix6Yvo6HppcZGetbYMGWSFlBw8HfCJo=" crossorigin="anonymous"></script></body>`)
				this.push(updated, "utf8");
				next();
			}
		}))
    }
}

var unblockerConfig = {
    prefix: '/textbooks/',
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
