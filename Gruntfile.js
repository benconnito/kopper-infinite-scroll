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
			all: ['test/**/*.html']
		}
	});

	grunt.loadNpmTasks('grunt-umd');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');

	grunt.registerTask('build', ['umd:all', 'uglify:all']);
	grunt.registerTask('test', ['build', 'qunit:all']);
};
