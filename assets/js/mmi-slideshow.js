/*! mmi-slideshow - v0.0.0 - 2015-01-29
* https://github.com/mallocs/mmi-slideshow
* Copyright (c) 2015 Marcus Ulrich; Licensed MIT */
;(function( $ ) {

$.widget("mmi.slideshow", {
    version: "0.0.0",

    /*In JS CSS Class Names*/
    CN: {
        navigation: "mmi-navigation",
        footer: "mmi-footer",
        previous: "mmi-previous",
        previousIcon: "mmi-icon-previous",
        next: "mmi-next",
        nextIcon: "mmi-icon-next",
        pagination: "mmi-pagination",
        paginationCircle: "mmi-circle",
        paginationThumbnail: "mmi-thumbnail",
        caption: "mmi-caption",
        selected: "mmi-selected",
        disabled: "mmi-disabled",
        dark: "mmi-dark",
        inside: "mmi-inside",                    //This is added when elements that should be layered on top of the carousel instead of around it.
        responsive: "mmi-responsive"             // This is added when elements should behave responsively.
    },

    /**NOTE: Slides are numbered starting from 1. **/
    options: {
                                                /**In Markup Selectors**/
        carouselSel: ".mmi-slideshow ul",       // Selector for carousel element.
        slideSel: ".mmi-slideshow li",          // Selector for carousel slides.

        startSlide: 1,                          // Starting slide. Count from 1.
        buffer: 2,                              // Number of extra slides to buffer.
        
        width: true,                            // Carousel will resize according to the size of the slide or 
        height: true,                           // a fixed width/height.

        transition: "scroll",                   // What type of transition to use. 
        transitionSpeed: 600,                   // Speed to transition between slides.
        transitionOptions: {},                  // Extra options for transition. See jQuery UI effect options.
        navigation: true,                       // Show the navigation arrows.
        previousText: false,                    // Text for previous slide button.
        nextText: false,                        // Text for next slide button.
        loop: true,                             // Slides run in a loop.
        captions: true,                         // Show captions.
        autoHideNavigation: false,              // Show/Hide Navigation on mouseIn/Out events
        autoHideFooter: false,                  // Show/Hide Footer on mouseIn/Out events
        dark: false,                            // Use dark color scheme.
        inside: false,                          // Extra elements (Nav, pagination, etc) appear inside the carousel.
        insideNavigation: false,                // Just the previous and next arrows appear inside the carousel.
        responsive: false,                      // Images will automatically be size responsibly to carousel width.

        pagination: true,                       // Show pagination.
        sprite: false,                          // Sprite URL.
        spriteWidth: false,                     // Sprite width. An int measuring pixels.
        spriteHeight: false                     // Sprite height. An int measuring pixels.
    },

    _create: function() { 
        this.options = $.extend({}, this.options, $(this.element).data());
        this.carousel = this.element.children(this.options.carouselSel);
        this.slides = this.carousel.children(this.options.slideSel);
        this.currentSlideNumber = parseInt(this.options.startSlide, 10);
        this.count = this.slides.length;

        this._createWrapper();
        if (this.options.navigation) {
            this._createNavigation();
        }
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
        this.$footer = $('<div>', {class: this.CN.footer});
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
        if (this.options.inside) {
            this.$footer.addClass(this.CN.inside);
            this.$footer.addClass(this.CN.dark);
        } else if (this.options.dark) {
            this.$footer.addClass(this.CN.dark);
        }
        this.element.append(this.$footer);        
        
    },

    _slideshowMouseInEvent: function() {
    },

    _slideshowMouseOutEvent: function() {
    },

    _createNavigation: function() {
        this.$previous = $('<span data-slides="previous"></span>');
        this.$previous.addClass(this.CN.navigation).addClass(this.CN.previous);
        this.options.previousText ? this.$previous.html(this.options.previousText) : this.$previous.addClass(this.CN.previousIcon);
        this._on(this.$previous, {
            click: "previous"
        });

        this.$next = $('<span data-slides="next"></span>');
        this.$next.addClass(this.CN.navigation).addClass(this.CN.next);
        this.options.nextText ? this.$next.html(this.options.nextText) : this.$next.addClass(this.CN.nextIcon);
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
        if (this.options.inside || this.options.insideNavigation) {
            this.$next.addClass(this.CN.inside);
            this.$previous.addClass(this.CN.inside);
        } 
        if (this.options.dark || this.options.inside || this.options.insideNavigation) {
            this.$next.addClass(this.CN.dark);
            this.$previous.addClass(this.CN.dark);
        }
        this.wrapper.append(this.$next, this.$previous);
    },

    _createCaption: function() {
        this.$caption = $("<div>", {class: this.CN.caption});
        this.$footer.append(this.$caption);
    //should change this so the caption is attached to the image.    
   //     this.carouselWrapper.append(this.$caption);
    },

    _createPagination: function() {
        this.$pagination = $("<ul>", {class: this.CN.pagination});

        for (var i=1, length=this.count, pageLink; i<=length; i++) {
            if (this.options.pagination === "numbers") {
                pageLink = $('<a href="#" data-slide="' + i + '">' + i + '</a>');
            } else if (this.options.pagination === "sprite" && this.options.sprite) {
                var spriteWidth = (this.options.spriteWidth) ? parseInt(this.options.spriteWidth, 10) : 40;
                var spriteHeight = (this.options.spriteHeight) ? parseInt(this.options.spriteHeight, 10) : 40;

                pageLink = $('<a href="#" data-slide="' + i + '"></a>').addClass(this.CN.paginationThumbnail);
                pageLink.css({
                    width: spriteWidth + "px",
                    height: spriteHeight + "px",
                    background: 'url("' + this.options.sprite + '") no-repeat scroll 0 '  + (-spriteHeight * (i-1)) + 'px transparent'
                });
            } else {
                pageLink = $('<a href="#" data-slide="' + i + '"></a>').addClass(this.CN.paginationCircle);
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
        return $(this.slides[ parseInt(slideNumber, 10) - 1 ]);
    },

    _page: function(event) {
        event.preventDefault();
        var page = $(event.target).data("slide");
        this.setCurrentSlide(page);
    },

    _setPage: function(slideNumber) {
        if (typeof this.pages === "undefined") {
            return;
        }
        var page = $(this.pages[ parseInt(slideNumber, 10) - 1 ]);
        this.pages.not(page).find("a").removeClass(this.CN.selected);
        page.find("a").addClass(this.CN.selected);       
    },

    next: function() {
        var nextSlideNumber = this.currentSlideNumber + 1;
        if(nextSlideNumber > this.count) {
            if(this.options.loop) {
                nextSlideNumber = 1;
            } else {
                return;
            }
        }
        this.setCurrentSlide(nextSlideNumber);
    },

    previous: function() {
        var previousSlideNumber = this.currentSlideNumber - 1;
        if (previousSlideNumber < 1) {
            if(this.options.loop) {
                previousSlideNumber = this.count;
            } else {
                return;
            }
        }
        this.setCurrentSlide(previousSlideNumber);
    },

    showNavigation: function(duration) {
        duration = arguments.length === 1 ? parseInt(duration, 10) : 200;  
        this.$next.show("fade", duration);
        this.$previous.show("fade", duration);
    },

    hideNavigation: function(duration) {
        duration = arguments.length === 1 ? parseInt(duration, 10) : 200;  
        this.$next.hide("fade", duration);
        this.$previous.hide("fade", duration);
    },

    setCaption: function(text) {
        text = typeof text !== "undefined" ? text : "&nbsp;";
        if (typeof this.$caption !== "undefined" ) {
            this.$caption.html("<p>" + text + "</p>");
        }
    },

    showCaption: function() {
        this.$caption.show();
    },

    hideCaption: function() {
        this.$caption.hide();
    },

    setCurrentSlide: function(slideNumber) {
        var slide = this._getSlideFromNumber(slideNumber);
        this._loadSlide(slide);
        var slideTarget = $(slide.children()[0]);
        var transitionSpeed = parseInt(this.options.transitionSpeed, 10);
        var transitionOptions = this.options.transitionOptions;
        var transition = this.options.transition + "";
        
        //First slide when initializing
        if (typeof this.currentSlide === "undefined") {
            slide.show();
            this.carousel.find("li").not(slide).css({display: "none"});
            
        //Scroll transition
        } else if (transition === "scroll") {
            var scroll;
            //If it's already animated, speed up the transition. 
            if (this.carouselWrapper.is(":animated")) {
                this.carouselWrapper.stop();
                transitionSpeed = this.transitionSpeed = this.transitionSpeed/2 || transitionSpeed/2;
                scroll = this.currentTarget;
            } else {
                this.carousel.find("li").css({float: "left", position: "static", display: "list-item"});
                //It's complicated to set the proper width since it changes when new images are loaded.
                //Setting minWidth really high doesn't seem (??) to have drawbacks and is not complicated.
                this.carousel.css({minWidth: "10000em"});
            }
            this.carouselWrapper.animate({
                scrollLeft: slide.position().left + this.carouselWrapper.scrollLeft()
            }, transitionSpeed);

        //Any other transition. 
        } else {
            this.carousel.find("li")
                         .not(this.currentSlide)
                         .css({display: "none", position: "static", bottom: "", left: "", width: ""});            
            slide.show("fade", transitionOptions, transitionSpeed);
            //need to set the currentSlide to absolute positioning so it doesn't get in the way
            //of the new slide.
            this.currentSlide.css({position: "absolute", bottom: 0, left: 0, width: this.currentSlide.width() + "px"});
            this.currentSlide.hide(transition, transitionOptions, transitionSpeed);
        }
        this._setDimensions(slide, this.options.width, this.options.height);
        
        this.setCaption(slideTarget.data("caption"));
        this._setPage(slideNumber);
        this.currentSlide = slide;
        this.currentSlideNumber = slideNumber;
        this._bufferSlides( parseInt(this.options.buffer, 10) );
    },
    
    _setDimensions: function(slide, width, height) {
        var widget = this;
        slide = slide || this.currentSlide;
        if (slide.find("img").length && slide.find("img")[0].complete  !== true) {
            //what if slide img never loads?
            slide.find("img").load( function() { widget._setDimensions(slide, width, height); } );
            return;
        } 
        
        width = width === true ? slide.width() : width;
        if (typeof width !== "undefined") {
            this.wrapper.width(width);
            this.$footer.width(width);
        }
      
        height = height === true ? slide.height() : height;
        if (arguments.length === 3 && typeof height !== "undefined") {
            this.carouselWrapper.height(height);  
        }
        
        if (this.options.responsive) {
            var carouselAspectRatio = this.wrapper.width()/this.carouselWrapper.height();
            var el = slide.find("img")[0];  
            var elAspectRatio = $(el).width()/$(el).height();
            if (elAspectRatio >= carouselAspectRatio) {
                $(el).css({width: "100%"});    
                this.carouselWrapper.height($(el).height());
            } else {
                $(el).css({position: "static", height: this.carouselWrapper.height() + "px", width: "auto"});                                   
            }
                          
        }

    },
    
    _bufferSlides: function(count) {
        var widget = this;
        this.slides.slice( this.currentSlideNumber, this.currentSlideNumber + count).each(function(index, el) {
            widget._loadSlide.call(widget, $(el));
        });
    },

    _loadSlide: function($slide) {
        if ($slide.attr("slideIsLoaded") !== undefined || $slide.attr("slideIsLoaded") === true) {
            return;
        }
        var $slideTarget = $($slide.children()[0]);
        if ($slideTarget.is("img")) {
            this._loadImage($slideTarget);
        }
        $slide.attr("slideIsLoaded", true);
    },

    _loadImage: function($image) {
        if ($image.attr("src") === undefined && $image.data("src") !== undefined) {
            $image.attr("src", $image.data("src"));
        }
    },

    _setOption: function( key, value ) {
        
        if (key === "navigation") {
            value ? this.showNavigation() : this.hideNavigation();
        }
        if (key === "captions") {
            value ? this.showCaption() : this.hideCaption();
        }
        if (key === "buffer") {
            this._bufferSlides( parseInt(value, 10) );
        }
        if (key === "nextText") {
            if (value) {
                this.$next.removeClass(this.CN.nextIcon);
                this.$next.html(value);
            } else {
                this.$next.html("");
                this.$next.addClass(this.CN.nextIcon);
            }        
        }
        if (key === "previousText") {
            if (value) {
                this.$previous.removeClass(this.CN.previousIcon);
                this.$previous.html(value);
            } else {
                this.$previous.html("");
                this.$previous.addClass(this.CN.previousIcon);
            }        
        }
        this._super( key, value );
    },
    
/***Options

        transition: "scroll",                   // What type of transition to use. 
        loop: true,                             // Slides run in a loop.
        autoHideNavigation: false,              // Show/Hide Navigation on mouseIn/Out events
        autoHideFooter: false,                  // Show/Hide Footer on mouseIn/Out events
        dark: false,                            // Use dark color scheme.
        inside: false,                      // Extra elements (Nav, pagination, etc) appear inside the carousel.

        pagination: true,                       // Show pagination.
        sprite: false,                          // Sprite URL.
        spriteWidth: false,                     // Sprite width. An int measuring pixels.
        spriteHeight: false                     // Sprite height. An int measuring pixels.
**/

    _destroy: function() {
    }

});

}( jQuery ));

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