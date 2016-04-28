/* tdcss.js - v0.8.1 - 2016-04-28
* http://jakobloekke.github.io/tdcss.js/
* Copyright (c) 2016 Jakob Løkke Madsen <jakob@jakobloekkemadsen.com> (http://www.jakobloekkemadsen.com);
* License: MIT */


if (typeof tdcss_theme !== 'function') {

    tdcss_theme = (function () {

        // private
        var _private = {
            makeTopBar: function(module, makeJumpTo, makeHTMLToggle) {
                $(module.container).after("<div class='tdcss-control-bar'>" +
                    "<h1 class='tdcss-title'></h1>" +
                    "<div class='tdcss-controls'></div>" +
                    "</div>");

                $(".tdcss-title").text($("title").text());
                $(".tdcss-controls")
                    .append(makeJumpTo())
                    .append(makeHTMLToggle()); 
            }
        };

        var _public = {
            name: 'original',
            makeTopBar: _private.makeTopBar,
        };

        return _public;

    })();
}
