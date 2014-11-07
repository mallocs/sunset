/*!
 * mallocs slider v0.0
 *
 * Copyright 2014 Marcus Ulrich 
 * Released under the MIT license.
 *
 */

;(function( $ ) {

$.widget("mmi.slideshow", {
    version: "0.0",

    /*In JS CSS Class Names*/
    navigationCN: "mmi-navigation",
    footerCN: "mmi-footer",
    previousCN: "mmi-previous",
    previousIconCN: "mmi-icon-previous",
    nextCN: "mmi-next",
    nextIconCN: "mmi-icon-next",
    paginationCN: "mmi-pagination",
    paginationCircleCN: "mmi-circle",
    paginationThumbnailCN: "mmi-thumbnail",
    captionCN: "mmi-caption",
    selectedCN: "mmi-selected",
    disabledCN: "mmi-disabled",
    darkCN: "mmi-dark",
    insideCN: "mmi-inside",                    //This is added when elements that should be layered on top of the carousel instead of around it.
    responsiveCN: "mmi-responsive",      //This is added when elements should behave responsively.

    options: {
                                                                  /*In Markup Selectors*/
        carouselSel: ".mmi-slideshow ul",   // Selector for carousel element.
        slideSel: ".mmi-slideshow li",          // Selector for carousel slides.

        startSlide: 0,                                   // Starting slide.
        buffer: 2,                                        // Number of extra slides to buffer.

        transition: "scroll",                         // What type of transition to use. 
        transitionSpeed: 600,                    // Speed to transition between slides.
        transitionOptions: {},                     // Extra options for transition. See jQuery UI effect options.
        navigation: true,                            // Show the navigation arrows.
        previousText: false,                       // Text for previous slide button.
        nextText: false,                             // Text for next slide button.
        loop: true,                                     // Slides run in a loop.
        captions: true,                               // Show captions.
        autoHideNavigation: false,             // Show/Hide Navigation on mouseIn/Out events
        autoHideFooter: false,                   // Show/Hide Footer on mouseIn/Out events
        dark: false,                                    // Use dark color scheme.
        insideMode: false,                          // Extra elements (Nav, pagination, etc) appear inside the carousel.

        pagination: true,                           // Show pagination.
        sprite: false,                                  // Sprite URL.
        spriteWidth: false,                         // Sprite width. An int measuring pixels.
        spriteHeight: false                        // Sprite height. An int measuring pixels.
    },

    _create: function() { 
        this.options = $.extend({}, this.options, $(this.element).data());
        this.carousel = this.element.children(this.options.carouselSel);
        this.slides = this.carousel.children(this.options.slideSel);
        this.currentSlideNumber = parseInt(this.options.startSlide, 10);
        this.count = this.slides.length;

        this._createWrapper();
        this._createNavigation();
        this._createFooter();
        if (this.options.captions) {
            this._createCaption();
        }
        if (this.options.pagination) {
            this._createPagination();
        }
        this.setCurrentSlide(this.currentSlideNumber);
    },
    
    _createWrapper: function() {
        //two wrappers so we can position things outside but relative to the slideshow carousel, like the navigation arrows.
        this.carouselWrapper = this.carousel.wrap('<div style="position:relative; overflow: hidden;"></div>').parent();
        this.wrapper = this.carouselWrapper.wrap('<div style="position:relative;"></div>').parent();

        this._on(this.wrapper, {
            mouseenter: "_slideshowMouseInEvent",
            mouseout: "_slideshowMouseOutEvent"
        });
    },

    _createFooter: function() {
        this.$footer = $('<div>', {class: this.footerCN});
        if(this.options.autoHideFooter) {
            var widget = this;
            this.$footer.css({display: "none"});

            $(this.element).hover(  
                function() {
                    widget.$footer.show({duration: 300, effect: "fade"});
                }, 
                function() {
                    widget.$footer.hide({duration: 300, effect: "fade"});
                }
            );
        }
        if (this.options.insideMode) {
            this.$footer.addClass(this.insideCN);
            this.$footer.addClass(this.darkCN);
        } else if (this.options.dark) {
            this.$footer.addClass(this.darkCN);
        }
        this.element.append(this.$footer);
    },

    _slideshowMouseInEvent: function(event) {
    },

    _slideshowMouseOutEvent: function(event) {
    },

    _createNavigation: function() {
        this.$previous = $('<span data-slides="previous"></span>');
        this.$previous.addClass(this.navigationCN).addClass(this.previousCN);
        this.options.previousText ? this.$previous.html(this.options.previousText) : this.$previous.addClass(this.previousIconCN);
        this._on(this.$previous, {
            click: "previous"
        });

        this.$next = $('<span data-slides="next"></span>');
        this.$next.addClass(this.navigationCN).addClass(this.nextCN);
        this.options.nextText ? this.$next.html(this.options.nextText) : this.$next.addClass(this.nextIconCN);
        this._on(this.$next, {
            click: "next"
        });

        if(this.options.autoHideNavigation) {
            var widget = this;
            this.$next.css({display: "none"});
            this.$previous.css({display: "none"});

            $(this.element).hover(  
                function() {
                    widget.showNavigation();
                }, 
                function() {
                    widget.hideNavigation();
                }
            );
        }
        if (this.options.insideMode) {
            this.$next.addClass(this.insideCN);
            this.$previous.addClass(this.insideCN);
        } 
        if (this.options.dark || this.options.insideMode) {
            this.$next.addClass(this.darkCN);
            this.$previous.addClass(this.darkCN);
        }
        this.wrapper.append(this.$next, this.$previous);
    },

    _createCaption: function() {
        this.$caption = $("<div>", {class: this.captionCN});
        this.$footer.append(this.$caption);
    },

    _createPagination: function() {
        this.$pagination = $("<ul>", {class: this.paginationCN});

        for (var i=0, len = this.count; i < len; i++) {
            if (this.options.pagination === "numbers") {
                var pageLink = $('<a href="#" data-slide="' + i + '">' + (i+1) + '</a>');
            } else if (this.options.pagination === "sprite" && this.options.sprite) {
                var spriteWidth = (this.options.spriteWidth) ? parseInt(this.options.spriteWidth, 10) : 40;
                var spriteHeight = (this.options.spriteHeight) ? parseInt(this.options.spriteHeight, 10) : 40;

                var pageLink = $('<a href="#" data-slide="' + i + '"></a>').addClass(this.paginationThumbnailCN);
                pageLink.css({
                    width: spriteWidth + "px",
                    height: spriteHeight + "px",
                    background: 'url("' + this.options.sprite + '") no-repeat scroll 0 '  + (-spriteHeight * i) + 'px transparent'
                });
            } else {
                var pageLink = $('<a href="#" data-slide="' + i + '"></a>').addClass(this.paginationCircleCN);
            }

            var pageItem = $('<li></li>');
            pageItem[0].appendChild(pageLink[0]);
            this.$pagination.append(pageItem);
        }
        this._on(this.$pagination, {
            "click a": "_page"
        });
        this.$footer.append(this.$pagination);
        this.pages = this.$pagination.children(this.count);
    },

    _getSlideFromNumber: function(slideNumber) {
        return $(this.slides[ parseInt(slideNumber, 10) ]);
    },

    _page: function(event) {
        event.preventDefault();
        var page = $(event.target).data("slide");
        this.setCurrentSlide(page);
    },

    setPage: function(slideNumber) {
        if (typeof this.pages === "undefined") {
            return;
        }
        var page = $(this.pages[ parseInt(slideNumber, 10) ]);
        this.pages.not(page).find("a").removeClass(this.selectedCN);
        page.find("a").addClass(this.selectedCN);       
    },

    next: function(event) {
        var slideNumber = this.currentSlideNumber + 1;
        if(slideNumber >= this.count) {
            if(this.options.loop) {
                slideNumber = 0;
            } else {
                return;
            }
        }
        this.setCurrentSlide(slideNumber);
    },

    previous: function() {
        var slideNumber = this.currentSlideNumber - 1;
        if (slideNumber < 0) {
            if(this.options.loop) {
                slideNumber = this.count - 1;
            } else {
                return;
            }
        }
        this.setCurrentSlide(slideNumber);
    },

    showNavigation: function(duration) {
        duration = duration || 200;
        this.$next.show("fade", duration);
        this.$previous.show("fade", duration);
    },

    hideNavigation: function(duration) {
        duration = duration || 200;
        this.$next.hide("fade", duration);
        this.$previous.hide("fade", duration);
    },

    setCaption: function(text) {
        text = text ? text : "&nbsp;";
        if (typeof this.$caption !== "undefined" ) {
            this.$caption.html('<p>' + text + '</p>');
        }
    },

    showCaption: function() {
        this.$caption.show();
    },

    hideCaption: function() {
        this.$caption.hide();
    },

    _bufferSlides: function(count) {
        var widget = this;
        this.slides.slice( this.currentSlideNumber + 1, this.currentSlideNumber + count + 1).each(function(index, el) {
            widget._loadSlide.call(widget, $(el));
        });
    },

    setCurrentSlide: function(slideNumber) {

        var slide = this._getSlideFromNumber(slideNumber);
        this._loadSlide(slide);
        var slideTarget = $(slide.children()[0]);
        var transitionSpeed = parseInt(this.options.transitionSpeed, 10);
        var transitionOptions = this.options.transitionOptions;
        var transition = this.options.transition + "";

        var animating = false;

        //First slide when initializing
        if (typeof this.currentSlide === "undefined") {
            slide.show();
            this.carousel.find("li").not(slide).css({display: "none"});

        //Scroll transition
        } else if (transition === "scroll") {
            //If it's already animated, speed up the transition. 
            if (this.carouselWrapper.is(":animated")) {
                this.carouselWrapper.stop();
                transitionSpeed = this.transitionSpeed = this.transitionSpeed/2 || transitionSpeed/2;
                var scroll = this.currentTarget;
                animating = true;
            } else {
                this.carousel.find("li").css({float: "left", display: "list-item"});
                //It's complicated to set the proper width since it changes when new images are loaded.
                //Setting minWidth really high doesn't seem (??) to have drawbacks and is not complicated.
                this.carousel.css({minWidth: "10000em"});
                var scroll = this.currentTarget = slide.position().left + this.carouselWrapper.scrollLeft();
            }
            this.carouselWrapper.animate({
                scrollLeft: scroll
            }, transitionSpeed);

        //Any other transition. 
        } else {
            if (slide.is(":animated")) {
                return;
            }
            if ( slide.find("img")[0] && slide.find("img")[0].complete === false && !this.carouselWrapper.is(":animated") ) {
                this.carousel.width( this.currentSlide.width() );
                this.carousel.height( this.currentSlide.height() );
                var widget;
                // The load function is apparently inconsistent, but seems the best option.
                slide.find("img").load(function() {
                    widget.carousel.removeAttr("width");
                    widget.carousel.removeAttr("height");
                });
            }
            this.carousel.find("li").not(this.currentSlide).css({display: "none", position: "static"});
            slide.show("fade", transitionOptions, transitionSpeed);
            this.currentSlide.css({position: "absolute", top: 0, left: 0});
            this.currentSlide.hide(transition, transitionOptions, transitionSpeed);
        }
        //Done with transitions. 

        if (animating) {
            return;
        }

        this.setCaption(slideTarget.data("caption"));
        this.setPage(slideNumber);
        this.currentSlide = slide;
        this.currentSlideNumber = slideNumber;
        this._bufferSlides( parseInt(this.options.buffer, 10) );
    },

    _loadSlide: function(slide) {
        if (typeof slide.slideIsLoaded !== "undefined" || slide.slideIsLoaded === true) {
            return;
        }
        var slideTarget = $(slide.children()[0]);
        if (slideTarget.is("img")) {
            this._loadImage(slideTarget);
        }
        slide.slideIsLoaded = true;
    },

    _loadImage: function(image) {
        if (image.attr("src") === undefined && image.data("src") !== undefined) {
            image.attr("src", image.data("src"));
        }
    },

    _setOption: function( key, value ) {
        this._super( key, value );

        if (key === "controls") {
            value ? this.showNavigation() : this.hideNavigation();
        }
        if (key === "captions") {
            value ? this.showCaption() : this.hideCaption();
        }

    },

    _destroy: function() {
    }

/**
Functions needed

_createPagingFromSprite

_setPauseOnHover
_setShowNav
_setHideNav
_setShowCaption
_setHideCaption
_setShuffle
_setLoop
_setPlay
_setTransition
_setTransitionSpeed

_checkImgHasLoaded
_showNav
_hideNav
_makePicUrl
_getPicUrl

addSlide
addSlides
play
stop
next

**/



});

}( jQuery ));