var tdcss = (function ($) {
    "use strict";

    var settings = {
            fragment_identifier: "###",
            fragment_info_splitter: ";"
        },
        module = {
            fragments: []
        };

    function init() {
        setupTestSuite();
        parseRawFragments();
        renderFragments();
        bindSectionCollapseHandlers();
        restoreCollapsedStateFromUrl();
    }

    function setupTestSuite() {
        $("#tdcss")
            .wrapInner("<div id='fragments'></div>")
            .append("<table id='elements'></table>");
    }

    function parseRawFragments() {
        var fragmentIdentifierComments = getFragmentIdentifierComments();

        fragmentIdentifierComments.each(function(){
            var fragment = {
                title: getFragmentTitle(this),
                section: getFragmentSection(this),
                height: getFragmentCustomHeight(this),
                html: getFragmentHTML(this)
            };

            if (fragment.html) {
                module.fragments.push(fragment);
            }
        })
    }

    function getFragmentIdentifierComments() {
        return $("body #fragments").contents().filter(
            function() {
                return this.nodeType === 8 && this.nodeValue.match(new RegExp(settings.fragment_identifier));
            }
        );
    }

    function getFragmentTitle(e) {
        var title = getFragmentMeta(e)[0];
        if (typeof title !== "undefined"){
            return $.trim(title);
        } else {
            return null;
        }
    }

    function getFragmentSection(e) {
        var section = getFragmentMeta(e)[1];
        if (typeof section !== "undefined"){
            return $.trim(section);
        } else {
            return null;
        }
    }

    function getFragmentCustomHeight(e) {
        var height = getFragmentMeta(e)[2];
        if (typeof height !== "undefined"){
            return $.trim(height);
        } else {
            return false;
        }
    }

    function getFragmentMeta(e) {
        var raw_meta = e.nodeValue.split(settings.fragment_identifier)[1];
        return raw_meta.split(settings.fragment_info_splitter);
    }

    function getFragmentHTML(e) {
        // The actual HTML fragment is the comment's nextSibling (a carriage return)'s nextSibling:
        var fragment = e.nextSibling.nextSibling;

        // Check if nextSibling is a comment or a real html fragment to be rendered
        if (fragment.nodeType !== 8) {
            return fragment.outerHTML;
        } else {
            return null;
        }
    }

    function renderFragments() {
        var last_section_name;

        for (var i = 0; i < module.fragments.length; i++) {
            var fragment = module.fragments[i];

            if (fragment.section) {
                if (fragment.section !== last_section_name) {
                    addNewSection(fragment.section);
                    last_section_name = fragment.section;
                }
            }
            addNewFragment(fragment);
        }
    }

    function addNewSection(section_name) {
        $("#elements").append('<tr class="section" id="' + encodeURIComponent(section_name) + '"><td colspan="2"><h2>' + section_name + '</h2></td></tr>');
    }

    function bindSectionCollapseHandlers() {
        $(".section").each(function(){
            new Section(this);
        })
    }

    function restoreCollapsedStateFromUrl() {
        if (window.location.hash) {
            var hash = window.location.hash.split("#")[1],
                collapsedSections = hash.split(";"),
                section,
                selector;

            for (section in collapsedSections) {
                if (collapsedSections[section].length) {
                    selector = "#"+collapsedSections[section];
                    $(selector).click();
                }
            }
        }
    }

    function Section(header_element) {
        var that = this;

        that.header_element = header_element;
        that.state_string = $(header_element).attr("id") + ";";
        that.collapsed = false;
        that.fragments = [];

        that.addFragments = function() {
            function addElementToArrayIfFragment (elem) {
                if ($(elem).hasClass("fragment")) {
                    that.fragments.push($(elem));
                    addElementToArrayIfFragment($(elem).next("tr.fragment"));
                }
            }
            addElementToArrayIfFragment($(that.header_element).next("tr.fragment"));
        };

        that.toggle = function() {
            that.collapsed = that.collapsed ? false : true;

            if (that.collapsed) {
                $(that.fragments).each(function(){$(this).hide();});
                that.setCollapsedStateInUrl();
            } else {
                $(that.fragments).each(function(){$(this).show();});
                that.removeCollapsedStateFromUrl();
            }
        };

        that.setCollapsedStateInUrl = function() {
            var current_hash = window.location.hash;

            if (current_hash.indexOf(that.state_string) === -1) {
                window.location.hash = current_hash + that.state_string;
            }
        };

        that.removeCollapsedStateFromUrl = function() {
            window.location.hash = window.location.hash.replace(that.state_string, "");
        };

        that.addFragments();

        $(that.header_element).on("click", function(){
            that.toggle();
        });

        return that;
    }

    function addNewFragment(fragment) {
        var title = fragment.title || '',
            html = fragment.html,
            height = getFragmentHeightCSSProperty(fragment),
            $row = $("<tr class='fragment'></tr>")
                    .append("<td style='height:" + height + "'><div class='tdcss-fragment-container'>" + html + "</div></td>")
                    .append("<td><h3>" + title + "</h3><textarea readonly>" + html + "</textarea></td>");

        $("#elements").append($row);
    }

    // Factored into separate function in case some special handling is needed in the future
    function getFragmentHeightCSSProperty(fragment) {
        if (fragment.height) {
            return fragment.height;
        } else {
            return "auto";
        }
    }

    module.init = function () {
        init();
    };

    return module;
}($));

