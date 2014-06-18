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
				files: ['CS/*.coffee', 'CS/MobileController/*.coffee', '*.coffee'],
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
					'JS/main.js' : 'CS/*.coffee',
					'JS/setup.js' : 'CS/setup.coffee',
					'JS/AudioAnalysisEngine.js' : 'CS/AudioAnalysisEngine.coffee',
					'JS/KeyboardController.js' : 'CS/KeyboardController.coffee',
					'JS/Events.js' : 'CS/Events.coffee',
					'JS/VisualsEngine.js' : 'CS/VisualsEngine.coffee',
					'JS/SocketsVisualiserSide.js' : 'CS/SocketsVisualiserSide.coffee',

					'JS/MobileController/SocketsMobileControllerSide.js' : 'CS/MobileController/SocketsMobileControllerSide.coffee',
					'JS/MobileController/mainMobileController.js' : 'CS/MobileController/*.coffee',

					'server.js' : 'server.coffee',
				},
			},
		},

	});

	grunt.loadNpmTasks('grunt-contrib-stylus');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-coffee');

	grunt.registerTask('default', ['watch']);

};