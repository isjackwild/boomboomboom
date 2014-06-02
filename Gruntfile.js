module.exports = function(grunt){


	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		watch: {

			options: {
				dateFormat: function(time) {
					grunt.log.writeln('The watch finished');
					grunt.log.writeln('waiting...');
				},
			},

			css: {
				files: 'Styl/*.styl',
				tasks: ['stylus'],
				options: {
					livereload: true,
				},
			},

			js: {
				files: 'CS/*.coffee',
				tasks: ['coffee'],
				options: {
					livereload: true,
				},
			},

		},

		stylus: {
			options: {
				compress: false,
				paths: ['Styl/*styl'],
			},
			compile: {
				files: {
					'CSS/style.css' : 'Styl/main.styl',
				},
			},
		},

		coffee: {
			compile: {
				files: {
					'JS/AudioAnalysisEngine.js' : 'CS/AudioAnalysisEngine.coffee',
				},
			},
		},

	});

	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-coffee');

	grunt.registerTask('default', ['watch']);

};