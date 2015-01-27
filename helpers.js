var hbs = require('express-hbs');
var fs = require('fs');
var path = require('path');

/***
Articles should have a directory defined in slideshows.json or we check for a
directory with the same name as the articleId.
If the file "sprite.jpg" exists in the slideshow directory, it will be used to
make the pagination thumbnails.
***/
registerHelper = function (){
    hbs.registerHelper("slideshow", function(articleId) {
        try {
            var slideshows = require('./slideshows.json');
        } catch (ex) {
            console.log("Couldn't open slideshow.json");
            return;
        }
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
        var sprite = fs.existsSync(dir + "sprite.jpg")  ? 
                     ' data-pagination="sprite" data-sprite="' + 
                       urlPath + 'sprite.jpg"' : '';

        var out = '<div class="mmi-slideshow"' + sprite + '>';

        out += '<ul class="carousel">\n';
        for (var i=0, first=true, l=dirList.length; i<l; i++) {
            var fileName = dirList[i];
            var filePath = dir + fileName;
            var ext = path.extname(fileName).toLowerCase();
            //only print for jpg, gif, or png files
            if (isImagePath(filePath) && fileName !== 'sprite.jpg') {
                if (first) {
                    out += getSlideLI(urlPath + fileName, false, false);
                    first = false;
                } else {
                    out += getSlideLI(urlPath + fileName, true, false);
                }
            }
        }
        return new hbs.SafeString(out + '</ul>\n</div>\n');
    });
}

function isImagePath(filePath) {
    var ext = path.extname(filePath).toLowerCase();
    if (!fs.lstatSync(filePath).isDirectory() &&
        (ext === '.jpg' || ext === '.gif' || ext === '.png')) {
        return true;
    } else {
        return false;
    }
}

function getSlideLI(imgURL, dataSRC, caption) {
    if (dataSRC !== false) {
        var src = ' data-src="' + imgURL + '"';
    } else {
        var src = ' src="' + imgURL + '"';
    }

    if (caption !== false) {
        var caption = ' data-caption="' + caption + '"';
    } else {
        var caption = '';

    }
    return '<li class="slide">\n' +
           '\t<img' + src + caption + '>\n' +
           '</li>\n';
}
module.exports = registerHelper;
