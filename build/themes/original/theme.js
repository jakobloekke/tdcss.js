/* tdcss.js - v0.8.1 - 2016-03-16
* http://jakobloekke.github.io/tdcss.js/
* Copyright (c) 2016 Jakob Løkke Madsen <jakob@jakobloekkemadsen.com> (http://www.jakobloekkemadsen.com);
* License: MIT */


if (typeof tdcss_theme !== 'function') {

    tdcss_theme = (function () {

        // private
        var _private = {
            beforeAddNewSection: function (markup, isWorkInProgress, sectionHyphenated, section_name) {
            },
            setup: function () {
            }
        };

        var _public = {
            name: 'original',
            beforeAddNewSection: _private.beforeAddNewSection,
            setup: _private.setup
        };

        return _public;

    })();
}
