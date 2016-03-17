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
