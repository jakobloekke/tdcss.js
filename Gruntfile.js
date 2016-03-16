/*global module:false*/
module.exports = function (grunt) {

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-karma');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-contrib-clean');
    grunt.loadNpmTasks('grunt-recess');

    // Default task.
    grunt.registerTask('default', ['clean', 'jshint', 'concat'/*, 'recess'*/, 'karma']);

    // Travis CI task.
    grunt.registerTask('travis', 'concat', 'karma');

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),

        banner: '/* <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
        '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
        '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;\n' +
        '* License: <%= pkg.license %> */\n\n\n',

        src: {
            js: ['src/tdcss.js', 'node_modules/prismjs/prism.js', 'node_modules/html2canvas/dist/html2canvas.js', 'src/vendors/resemble-modified.js'],
            prismcss: 'node_modules/prismjs/themes/prism.css',
            themes: {
                original: 'src/themes/original/tdcss.css',
                sidebar: 'src/themes/sidebar/tdcss.css'
            },
        },


        // Task configuration.

        watch: {
            files: ['src/**/*', 'test/**/*'],
            tasks: ['default'],
            options: {
                livereload: false
            }
        },

        clean: {build: ['build']},

        recess: {
            dist: {
                options: {
                    compile: true,
                    banner: '<%= banner %>',
                    stripBanners: true
                },
                files: [{
                    expand: true,
                    dest: 'build/',
                    cwd: 'src',      // Src matches are relative to this path.
                    src: ['themes/**/*.css'],
                    ext: '.css'
                }]
            }
        },
        concat: {
            options: {
                banner: '<%= banner %>',
                stripBanners: true
            },
            css: {
              files: {
                'build/themes/original/tdcss.css': ['<%= src.themes.original %>', '<%= src.prismcss %>'],
                'build/themes/sidebar/tdcss.css':  ['<%= src.themes.sidebar %>', '<%= src.prismcss %>'] 
              },
            },
            js: {
                src: '<%= src.js %>',
                dest: 'build/tdcss.js',
            }
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc',
                ignores: ['test/**/*']
            },
            src: 'src/tdcss.js'
        },
        karma: {
            unit: {
                configFile: 'karma.conf.js'
            }
        }
    });
};
