var hbs = require('express-hbs');
var fs = require('fs');
var path = require('path');

/***
Articles should have a directory defined in slideshows.json or we check for a
directory with the same name as the articleId.
The slideshow can have a slides.json file which can include captions,
photographer, and organization.
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
            var dir = slideshows.rootDir + articleId;
            var urlPath = slideshows.urlPath + articleId;
        }
        dir = path.resolve(dir);
        if (dir.substr(dir.length - 1) !== '/') {
            dir += '/';
        } 
        if (urlPath.substr(urlPath.length - 1) !== '/') {
            urlPath += '/';
        } 

        if (!fs.existsSync(dir)) {
            return new hbs.SafeString(' ');
        }

        var sprite = fs.existsSync(dir + "sprite.jpg")  ? 
                     ' data-pagination="sprite" data-sprite="' + 
                       urlPath + 'sprite.jpg"' : '';

        try {
            var slideshow = require(dir + 'slides.json'); 
            var out = '<div class="mmi-slideshow"' + sprite + ' data-captions="true">\n';
            out += getULFromJson(slideshow, urlPath);
        } catch (ex) {
            var out = '<div class="mmi-slideshow"' + sprite + '>\n';
            out += getULFromDir(dir, urlPath);
        }      
        out += '</div>\n';
        return new hbs.SafeString(out);
    });
}

function getULFromDir(dir, urlPath) {
    var dirList = fs.readdirSync(dir);
    var ul = '<ul class="carousel">\n';
    for (var i=0, first=true, l=dirList.length; i<l; i++) {
        var fileName = dirList[i];
        var filePath = dir + fileName;
        var ext = path.extname(fileName).toLowerCase();
        //only print for jpg, gif, or png files
        if (isImagePath(filePath) && fileName !== 'sprite.jpg') {
            if (first) {
                ul += getSlideLI(urlPath + fileName, false, false);
                first = false;
            } else {
                ul += getSlideLI(urlPath + fileName, true, false);
            }
        }
    }
    return ul + '</ul>\n';
}

function getULFromJson(slideshow, urlPath) {
    var ul = '<ul class="carousel">\n';
    for (var i=0, first=true, l=slideshow.slides.length; i<l; i++) {
        var slide = slideshow.slides[i];
        var fileName = slide.filename;
        var caption = slide.caption
        if (first) {
            ul += getSlideLI(urlPath + fileName, false, caption);
            first = false;
        } else {
            ul += getSlideLI(urlPath + fileName, true, caption);
        }
    }
    return ul + '</ul>\n';
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

    if (caption === false || caption === '') {
        var caption = '';
    } else {
        var caption = ' data-caption="' + caption + '"';
    }

    return '<li class="slide">\n' +
           '\t<img' + src + caption + '>\n' +
           '</li>\n';
}
module.exports = registerHelper;
