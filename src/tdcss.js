(function($){
    $.fn.tdcss = function( options ) {

        "use strict";

        var settings = $.extend({
                section_identifier: "#",
                fragment_identifier: ":",
                fragment_info_splitter: ";"
            }, options),
            module = {
                container: null,
                fragments: []
            };

        return this.each(function(i){

            module.container = this;

            reset();
            setup();
            parse();
            render();
            bindSectionCollapseHandlers();
            restoreCollapsedStateFromUrl();

            window.tdcss = window.tdcss || [];
            window.tdcss[i] = module;

        });

        function reset() {
            module.fragments.length = 0;
        }

        function setup() {
            $(module.container)
                .addClass("tdcss-fragments")
                .after("<div class='tdcss-elements'></div>");
        }

        function parse() {
            var comments = getComments(),
                section_name,
                fragment;

            comments.each(function(){
                if ( commentIsSection(this) ) {
                    section_name = getSectionName(this);
                }
                else if ( commentIsFragment(this) ) {
                    fragment = {
                        title: getFragmentTitle(this),
                        section: section_name || null,
                        height: getFragmentCustomHeight(this),
                        html: getFragmentHTML(this)
                    };

                    if (fragment.html) {
                        module.fragments.push(fragment);
                    }
                }
            })
        }

        function getComments() {
            return $(module.container).contents().filter(
                function() {
                    return this.nodeType === 8;
                }
            );
        }

        function commentIsSection(comment) {
            return !!comment.nodeValue.match(new RegExp(settings.section_identifier));
        }

        function commentIsFragment(comment) {
            return !!comment.nodeValue.match(new RegExp(settings.fragment_identifier))
        }

        function getSectionName(e) {
            var title = getCommentMeta( e )[0].split( settings.section_identifier )[1];
            if (typeof title !== "undefined"){
                return $.trim(title);
            } else {
                return null;
            }
        }

        function getFragmentTitle(e) {
            var title = getCommentMeta( e )[0].split( settings.fragment_identifier )[1];
            if (typeof title !== "undefined"){
                return $.trim(title);
            } else {
                return null;
            }
        }

        function getFragmentCustomHeight(e) {
            var height = getCommentMeta(e)[1];
            if (typeof height !== "undefined"){
                return $.trim(height);
            } else {
                return false;
            }
        }

        function getCommentMeta(e) {
            return e.nodeValue.split(settings.fragment_info_splitter);
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

        function render() {
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
            $(module.container).next(".tdcss-elements").append('<div class="tdcss-section" id="' + encodeURIComponent(section_name) + '"><h2 class="tdcss-h2">' + section_name + '</h2></div>');
        }

        function addNewFragment(fragment) {
            var title = fragment.title || '',
                html = fragment.html,
                height = getFragmentHeightCSSProperty(fragment),
                $row = $("<div style='height:" + height + "' class='tdcss-fragment'></div>"),
                $dom_example = $("<div class='tdcss-dom-example'>" + html + "</div>"),
                $code_example = $("<div class='tdcss-code-example'><h3 class='tdcss-h3'>" + title + "</h3><textarea class='tdcss-textarea' readonly>" + html + "</textarea></div>");

            $row.append($dom_example);
            $row.append($code_example);

            $(module.container).next(".tdcss-elements").append($row);

            adjustCodeExampleHeight($row);

        }

        function adjustCodeExampleHeight($row) {
            var h3 = $(".tdcss-h3", $row),
                textarea = $(".tdcss-textarea", $row),
                new_textarea_height = $row.outerHeight(false) - h3.outerHeight(false);

            textarea.height(new_textarea_height);

        }

        // Factored into separate function in case some special handling is needed in the future
        function getFragmentHeightCSSProperty(fragment) {
            if (fragment.height) {
                return fragment.height;
            } else {
                return "auto";
            }
        }

        function bindSectionCollapseHandlers() {
            $(".tdcss-section").each(function(){
                new Section(this);
            })
        }

        function restoreCollapsedStateFromUrl() {
            if (window.location.hash) {
                var hash = window.location.hash.split("#")[1],
                    collapsedSections = hash.split(";");

                for (var section in collapsedSections) {
                    if (collapsedSections.hasOwnProperty(section)) {
                        if (collapsedSections[section].length) {
                            var matching_section = document.getElementById(collapsedSections[section]);
                            $(matching_section).click();
                        }
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
                    if ($(elem).hasClass("tdcss-fragment")) {
                        that.fragments.push($(elem));
                        addElementToArrayIfFragment($(elem).next(".tdcss-fragment"));
                    }
                }
                addElementToArrayIfFragment($(that.header_element).next(".tdcss-fragment"));
            };

            that.toggle = function() {
                that.collapsed = that.collapsed ? false : true;

                if (that.collapsed) {
                    $(that.header_element).addClass("is-collapsed");
                    $(that.fragments).each(function(){$(this).hide();});
                    that.setCollapsedStateInUrl();
                } else {
                    $(that.header_element).removeClass("is-collapsed");
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
    }
})($);



