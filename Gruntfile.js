module.exports = function (grunt) {
	grunt.initConfig({
		umd: {
			all: {
				src: 'lib/*.js',
				dest: 'dist/kopper-infinite-scroll.js',
				objectToExport: 'KopperInfiniteScroll',
				deps: {
					'default': ['$', '_', 'Promise'],
					amd: ['jquery', 'underscore', 'bluebird'],
					cjs: ['jquery', 'underscore', 'bluebird'],
				}
			}
		},
		uglify: {
			all: {
				files: {
					'dist/kopper-infinite-scroll.min.js': ['dist/kopper-infinite-scroll.js']
				}
			}
		},
		qunit: {
			options: {
				coverage: {
					disposeCollector: true,
					src: ['lib/kopper-infinite-scroll.js'],
					instrumentedFiles: 'lib-lcov',
					lcovReport: 'coverage-results'
				}
			},
			all: ['test/**/*.html']
		},
		coveralls: {
			upload: {
				src: 'coverage-results/lcov.info'
			}
		},
		release: {
			options: {
				additionalFiles: ['bower.json'],
				indentation: '\t'
			}
		}
	});

	grunt.loadNpmTasks('grunt-umd');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-qunit-istanbul');
	grunt.loadNpmTasks('grunt-coveralls');
	grunt.loadNpmTasks('grunt-release');

	grunt.registerTask('build', ['umd:all', 'uglify:all']);
	grunt.registerTask('test', ['qunit:all']);
	grunt.registerTask('publish', ['build', 'test', 'release']);
};
