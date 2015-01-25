var hbs = require('express-hbs');
var fs = require('fs');
var slideshows = require('./slideshows.json');

/***
Articles should have a directory defined in slideshows.json or we check for a
directory with the same name as the articleId.
If the file "sprite.jpg" exists in the slideshow directory, it will be used to
make the pagination thumbnails.
***/
registerHelper = function (){
    hbs.registerHelper("slideshow", function(articleId) {
        if (slideshows.articles && slideshows.articles[articleId] &&
            slideshows.articles[articleId].imgDir) {
            var dir = slideshows.rootDir + slideshows.articles[articleId].imgDir;
            var urlPath = slideshows.urlPath + slideshows.articles[articleId].imgDir;
        } else {
            var dir = slideshows.rootDir + articleId + "/";
            var urlPath = slideshows.urlPath + articleId + "/";
        }

        if (!fs.existsSync(dir)) {
            return new hbs.SafeString(' ');
        }

        var dirList = fs.readdirSync(dir);
        if (fs.existsSync(dir + "sprite.jpg")) {
            var out = '<div class="mmi-slideshow"';
                out += 'data-pagination="sprite" data-sprite="' + urlPath + '/sprite.jpg">';
        } else {
            var out = '<div class="mmi-slideshow">';
        }

        for (var i=0, l=dirList.length; i<l; i++) {
            var filePath = dir + dirList[i];
            if (fs.lstatSync(filePath).isDirectory() 
                && dirList[i] !== "sprite.jpg") {
                continue;
            }
            if (i == 0) {
                out += '<ul class="carousel">\n';
                out += '<li class="slide">\n';
                out += '<img src="' + urlPath + dirList[0] + '">\n';
                out += '</li>\n';

            } else {
                out += '<li class="slide">\n';
                out += '<img data-src="' + urlPath + dirList[i] + '">\n';
                out += '</li>\n';
            }
        }
        return new hbs.SafeString(out + '</ul>\n</div>\n');
    });
}

module.exports = registerHelper;
