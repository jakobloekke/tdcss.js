if (typeof tdcss_theme !== 'function') {

    tdcss_theme = (function () {

        // private
        var _private = {
            beforeAddNewSection: function (markup, isWorkInProgress, sectionHyphenated, section_name) {
            },
            setup: function () {
            },
            makeTopBar: function(module, makeJumpTo, makeHTMLToggle) {
                $(module.container).after("<div class='tdcss-control-bar'>" +
                    "<h1 class='tdcss-title'></h1>" +
                    "<div class='tdcss-controls'></div>" +
                    "</div>");

                $(".tdcss-title").text($("title").text());
                $(".tdcss-controls")
                    .append(makeJumpTo())
                    .append(makeHTMLToggle()); 
            },
        };

        var _public = {
            name: 'original',
            beforeAddNewSection: _private.beforeAddNewSection,
            setup: _private.setup,
            makeTopBar: _private.makeTopBar,
        };

        return _public;

    })();
}
