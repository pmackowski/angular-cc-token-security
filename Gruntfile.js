'use strict';

module.exports = function(grunt) {

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-karma');

	grunt.initConfig({
        concat: {
            dist: {
                src: ['src/security.js',
                      'src/events.js',
                      'src/roles.js',
                      'src/service.js',
                      'src/interceptor.js',
                      'src/storage.js',
                      'src/LoginController.js',
                      'src/LogoutController.js'
                ],
                dest: 'release/cc-token-security.js'
            }
        },
		jshint: {
			options: {
				//force:          true,
				globalstrict:   true,
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
				src:    'release/cc-token-security.js',
				dest:   'release/cc-token-security.min.js'
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
                        'bower_components/angular-mocks/angular-mocks.js',
                        'bower_components/angular-local-storage/dist/angular-local-storage.js',
                        'release/cc-token-security.js',
                        'test/**/*.js'
                    ]
                }
            }
        }
	});
	
	grunt.registerTask('default', ['concat', 'jshint:beforeconcatQ', 'uglify:build']);
    grunt.registerTask('test', ['concat', 'karma' ]);

};