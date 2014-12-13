var hbs = require('express-hbs');
var fs = require('fs');
var slideshows = require('./slideshows.json');

registerHelper = function (){
    hbs.registerHelper("slideshow", function(articleId) {
        var dir = slideshows["rootDir"] + slideshows["articles"][articleId]["imgDir"];
        var urlPath = slideshows["urlPath"] + slideshows["articles"][articleId]["imgDir"];
        var dirList = fs.readdirSync(dir);
        var out = '<div class="mmi-slideshow" data-transition="scroll" data-loop="true" data-captions="false" data-dark="true">' 
                + '<ul class="carousel">\n';
            out += '<li class="slide">\n';
            out += '<img src="' + urlPath + dirList[0] + '">\n';
            out += '</li>\n';
        for(var i=1, l=dirList.length; i<l; i++) {
            out += '<li class="slide">\n';
            out += '<img data-src="' + urlPath + dirList[i] + '">\n';
            out += '</li>\n';
        }
        return new hbs.SafeString(out + '</ul>\n</div>\n');
    });
}

module.exports = registerHelper;
