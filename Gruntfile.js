'use strict';

module.exports = function(grunt) {

    // Config
    var sunset = {
        port: '2368'    // Ghost Port #
    };

    grunt.initConfig({

        sunset: sunset,

        pkg: grunt.file.readJSON('package.json'),
        banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
                '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
                '* http://<%= pkg.homepage %>/\n' +
                '* Copyright (c) <%= grunt.template.today("yyyy") %> ' +
                '<%= pkg.author.name %>; Licensed MIT */\n',

        // Watch files for changes for livereload and sass
        watch: {
            sass: {
                files: 'assets/sass/**/*.{scss,sass}',
                tasks: ['sass', 'autoprefixer']
            },
            scripts: {
                files: 'assets/js/*.js',
                options:{
                    livereload: true
                }
            },
            html: {
                files: ['*.hbs', 'partials/*.hbs'],
                options: {
                    livereload: true
                }
            },
            livereload: {
                options: {
                    livereload: true
                },
                files: 'assets/css/*.css'
            }
        },

        // Add a banner to minified javascript.
        uglify: {
            options: {
                banner: '<%= banner %>',
                preserveComments: 'some'
            }
        },

        // Add a banner to minified css.
        cssmin: {
            options: {
                banner: '<%= banner %>',
                preserveComments: 'some'
            }
        },

        // Clean up for new build
        clean: {
            production: ['.tmp', 'production']
        },

        // Move files over for production release
        copy: {
            production: {
                files: [
                    {
                        src: ['*.js*', '*.hbs'],
                        dest: 'production/'
                    },
                    {
                        src: 'partials/*.hbs',
                        dest: 'production/'
                    },
                    {
                        src: ['assets/**/*', '!assets/css/**/*', '!assets/js/**/*', '!assets/sass/**/*'],
                        dest: 'production/'
                    }
                ]
            }
        },

        // Compile .scss files
        sass: {
            production: {
                files: [
                    {
                        expand: true,
                        cwd: 'assets/sass',
                        src: '*.scss',
                        dest: '.tmp/assets/css',
                        ext: '.css'
                    }
                ]
            }
        },

        // Add vendor prefixed styles
        autoprefixer: {
            options: {
                browsers: 'last 2 versions'
            },
            production: {
                files: [{
                    expand: true,
                    cwd: '.tmp/assets/css',
                    src: '{,*/}*.css',
                    dest: 'assets/css'
                }]
            }
        },

        // Rename files for browser caching purposes
        rev: {
            production: {
                files: {
                    src: [
                        'production/assets/css/vendor.css',
                        'production/assets/images/background/*.{gif,jpeg,jpg,png,svg}',
                        'production/assets/fonts/{,*/}*.*',
                        'production/assets/js/{,*/}*.js'
                    ]
                }
            }
        },

        // The following *-min tasks produce minified files in the release folder
        imagemin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'assets/images',
                    src: '{,*/}*.{gif,jpeg,jpg,png}',
                    dest: 'production/assets/images'
                }]
            }
        },

        svgmin: {
            dist: {
                files: [{
                    expand: true,
                    cwd: 'assets/images',
                    src: '{,*/}*.svg',
                    dest: 'production/assets/images'
                }]
            }
        },

        // Concat & minify assets
        useminPrepare: {
            html: 'default.hbs',
            options: {
                dest: 'production'
            }

        },
        usemin: {
            html: 'production/default.hbs',
            css: ['production/assets/css/{,*/}*.css']
        },

        concurrent: {
            production: [
                'clean:production',
                'sass',
                'imagemin',
                'svgmin'
            ]
        },

        // Open ghost page for development
        open: {
            dev: {
                path: 'http://127.0.0.1:<%= sunset.port %>'
            }
        }

    });

    // livereload for development mode
    grunt.registerTask('start', [
        'sass',
        'autoprefixer',
        'open',
        'watch'
    ]);

    // Update assets
    grunt.registerTask('update', [
        'sass',
        'autoprefixer'
    ]);

    // Build release
    grunt.registerTask('build', [
        'concurrent:production',
        'autoprefixer',
        'useminPrepare',
        'concat',
        'uglify',
        'cssmin',
        'copy:production',
        'rev',
        'usemin'
    ]);

    // Same as update
    grunt.registerTask('default', [
        'sass',
        'autoprefixer'
    ]);

    grunt.loadNpmTasks('grunt-autoprefixer');
    grunt.loadNpmTasks('grunt-concurrent');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-contrib-cssmin');
    grunt.loadNpmTasks('grunt-contrib-imagemin');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-open');
    grunt.loadNpmTasks('grunt-rev');
    grunt.loadNpmTasks('grunt-sass');
    grunt.loadNpmTasks('grunt-svgmin');
    grunt.loadNpmTasks('grunt-usemin');

}
