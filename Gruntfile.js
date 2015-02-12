'use strict';

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        meta: {
            banner: [
                '/**',
                ' * <%= pkg.description %>',
                ' * @version v<%= pkg.version %> - <%= grunt.template.today("yyyy-mm-dd") %>',
                ' * @link <%= pkg.homepage %>',
                ' * @author <%= pkg.author %>',
                ' * @license MIT License, http://www.opensource.org/licenses/MIT',
                ' */'
            ].join('\n')
        },
        concat: {
            options: {
                banner: '<%= meta.banner %>' + '\n' +
                    '(function ( window, angular, undefined ) {' + '\n',
                footer: '})( window, window.angular );'
            },
            dist: {
                src: ['src/security.js',
                      'src/events.js',
                      'src/service.js',
                      'src/interceptor.js',
                      'src/storage.js',
                      'src/provider.js',
                      'src/LoginController.js',
                      'src/LogoutController.js'
                ],
                dest: 'release/angular-cc-token-security.js'
            }
        },
		jshint: {
			options: {
				//force:          true,
				globalstrict:   false,
				//sub:            true,
				node: true,
				loopfunc: true,
				browser:        true,
				devel:          true,
				globals: {
					angular:    false,
					$:          false,
					moment:		false,
					Pikaday: false,
					module: false,
					forge: false
				}
			},
			beforeconcat:   {
				options: {
					force:	false,
					ignores: ['**.min.js']
				},
				files: {
					src: []
				}
			},
			//quick version - will not fail entire grunt process if there are lint errors
			beforeconcatQ:   {
				files: {
					src: ['src/**.js']
				}
			}
		},
		uglify: {
			build: {
				files:  {},
				src:    'release/angular-cc-token-security.js',
				dest:   'release/angular-cc-token-security.min.js'
			}
		},
        karma: {
            unit: {
                options: {
                    frameworks: ['jasmine'],
                    singleRun: true,
                    browsers: ['PhantomJS'],

                    // possible values: LOG_DISABLE || LOG_ERROR || LOG_WARN || LOG_INFO || LOG_DEBUG
                    logLevel: grunt.LOG_DEBUG,
                    files: [
                        'bower_components/angular/angular.js',
                        'bower_components/angular-resource/angular-resource.js',
                        'bower_components/angular-mocks/angular-mocks.js',
                        'bower_components/angular-local-storage/dist/angular-local-storage.js',
                        'bower_components/angular-ui-router/release/angular-ui-router.js',
                        'release/angular-cc-token-security.js',
                        'test/**/*.js',

                        'test/views/*.html'
                    ],
                    preprocessors: {
                        //location of templates
                        'test/views/*.html': ['html2js']
                    }
                    /*ngHtml2JsPreprocessor: {

                    }*/
                }
            }
        }
	});
	
	grunt.registerTask('default', ['concat', 'jshint:beforeconcatQ', 'uglify:build']);
    grunt.registerTask('test', ['concat', 'karma' ]);

};