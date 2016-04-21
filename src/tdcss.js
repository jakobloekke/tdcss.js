/**
 * tdcss.js: Super-simple styleguide tool
 * MIT License http://www.opensource.org/licenses/mit-license.php/
 * @author Jakob Løkke Madsen
 * @url http://www.jakobloekkemadsen.com
 */

(function ($) {
    "use strict";

    $.fn.tdcss = function (options) {

        var settings = $.extend({
                diff: false,
                fragment_types: {
                    section: {identifier: "#"},
                    snippet: {identifier: ":"},
                    jssnippet: {identifier: "_"},
                    coffeesnippet: {identifier: "->"},
                    no_snippet: {identifier: "="},
                    description: {identifier: "&"}
                },
                fragment_info_splitter: ";",
                replacementContent: "...",
                hideTextContent: false,
                setCollapsedStateInUrl: true,
                hideTheseAttributesContent: [
                    'src',
                    'href'
                ],
                hide_html: false,
                use_categories: false,
                use_bookmarkables: false,
                use_collapsing: true,
                neutralize_background: false,
                internalize_background_color: true,
                afterFragmentsRendered: null,
                control_bar_text: {
                    show_html: "Show HTML",
                    hide_html: "Hide HTML"
                }
            }, options),
            module = {
                container: null,
                fragments: [],
                snippet_count: 0,
                theme: window.tdcss_theme
            },
            jump_to_menu_options = '<option>Jump To Section:</option>';

        return this.each(function (i) {
            module.container = this;

            setupThemeSettings();
            reset();
            setup();
            parse();
            render();

            if (settings.use_collapsing) {
                bindSectionCollapseHandlers();
            }

            restoreCollapsedSectionsFromUrl();
            highlightSyntax();
            makeTopBar();

            if (settings.diff) {
                diff();
            }

            if (settings.internalize_background_color) {
                internalizeBackgroundColor();
            }

            if (settings.neutralize_background) {
                neutralizeBackground();
            }

            if (module.theme.setup !== undefined) {
                module.theme.setup(settings);
            }

            window.tdcss = window.tdcss || [];
            window.tdcss[i] = module;

            if (settings.onLoaded) {
                settings.onLoaded();
            }
        });


        function setupThemeSettings() {
            if (module.theme.useCategories !== undefined & module.theme.useCategories) {
                settings.use_categories = true;
            }

            if (module.theme.use_bookmarkables !== undefined & module.theme.use_bookmarkables) {
                settings.use_bookmarkables = true;
            }

            if (module.theme.use_collapsing !== undefined & module.theme.use_collapsing === false) {
                settings.use_collapsing = false;
            }
        }

        function reset() {
            if (module.theme.beforeReset !== undefined) {
                module.theme.beforeReset(settings.fragment_types);
            }
            module.fragments.length = 0;
        }

        function setup() {
            $(module.container)
                .addClass("tdcss-fragments")
                .after("<div class='tdcss-elements'></div><div class='tdcss-navigation'><div class='docked-menu'></div></div>");
        }

        function parse() {
            var comments = $(module.container).contents().filter(
                function () {
                    return this.nodeType === 8;
                }
            );

            if (comments.length === 0) {
                $(".tdcss-elements").append("<div class='tdcss-no-fragments'>" +
                    "<strong>Boom!</strong> You're ready to build a styleguide." +
                    "<p>&#9786;</p>" +
                    "</div>");
            } else {
                comments.each(function () {
                    var fragment = new Fragment(this);
                    
                    if (fragment) {
                        module.fragments.push(new Fragment(this));
                    }
                });
            }

            $(module.container).empty(); // Now we can empty the container to avoid having duplicate DOM nodes in the background
        }

        function Fragment(raw_comment_node) {
            var that = this;

            that.raw_comment_node = raw_comment_node;
            that.type = getFragmentType();

            if (!that.type) return false;

            var data = $.trim(getCommentMeta(that.raw_comment_node)[0]
                    .split(settings.fragment_types[that.type].identifier)[1]);

            if (that.type === "section") {
                that.section_name = data;
            }

            if (that.type === "description") {
                that.description_text = data;
            }

            if (that.type === "snippet") {
                that.snippet_title = data;
                that.custom_height = $.trim(getCommentMeta(that.raw_comment_node)[1]);
                that.html = getFragmentHTML(that.raw_comment_node);
            }

            if (that.type === "jssnippet") {
                that.snippet_title = data;
                that.raw_script = getFragmentScriptHTML(that.raw_comment_node);
                that.html = getFragmentHTML(that.raw_comment_node);
            }

            if (that.type === "coffeesnippet") {
                if (!window.CoffeeScript) throw new Error("Include CoffeeScript Compiler to evaluate CoffeeScript with tdcss.");
                that.snippet_title = data;
                that.raw_script = getFragmentCoffeeScriptHTML(that.raw_comment_node);
                that.html = getFragmentHTML(that.raw_comment_node);
            }

            if (that.type === "no_snippet") {
                that.snippet_title = data;
                that.custom_height = $.trim(getCommentMeta(that.raw_comment_node)[1]);
                that.html = getFragmentHTML(that.raw_comment_node);
            }

            if (module.theme.beforeFragment !== undefined) {
                module.theme.beforeFragment(that, data, getCommentMeta);
            }

            return that;

            function getFragmentType() {
                var found_type = "";
                for (var fragment_type in settings.fragment_types) {
                    if (settings.fragment_types.hasOwnProperty(fragment_type)) {
                        var identifier = settings.fragment_types[fragment_type].identifier;

                        //Only match if it's at beginning of comment or preceeded by spaces
                        var regex = new RegExp('^\\s*' + identifier);
                        if (that.raw_comment_node.nodeValue.match(regex)) {
                            found_type = fragment_type;
                        }
                    }
                }
                return found_type;
            }
        }

        function getCommentMeta(elem) {
            return elem.nodeValue.split(settings.fragment_info_splitter);
        }

        function getFragmentScriptHTML(elem) {
            return $(elem).nextAll('script[type="text/javascript"]').html().trim();
        }

        function getFragmentCoffeeScriptHTML(elem) {
            return $(elem).nextAll('script[type="text/coffeescript"]').html().trim();
        }

        function getFragmentHTML(elem) {
            // The actual HTML fragment is the comment's nextSibling (a carriage return)'s nextSibling:
            var fragment = elem.nextSibling.nextSibling;

            // Check if nextSibling is a comment or a real html fragment to be rendered
            if (fragment.nodeType !== 8) {
                return fragment.outerHTML;
            } else {
                return null;
            }
        }

        function render() {
            var sectionCount = 0, insertBackToTop;

            for (var i = 0; i < module.fragments.length; i++) {
                var fragment = module.fragments[i];

                if (module.theme.beforeRenderFragment !== undefined) {
                    module.theme.beforeRenderFragment(module, fragment);
                }

                if (fragment.type === "section") {
                    //Don't insert the "Back to Top" for very first section
                    insertBackToTop = sectionCount > 0 ? true : false;
                    addNewSection(fragment.section_name, insertBackToTop);
                    jump_to_menu_options += '<option class="tdcss-jumpto-section" href="#' + encodeURIComponent(_spacesToLowerCasedHyphenated(fragment.section_name)) + '">' + fragment.section_name + '</option>';
                    sectionCount++;
                }

                if (fragment.type === "snippet" || fragment.type === 'jssnippet' || fragment.type === 'coffeesnippet') {
                    module.snippet_count++;
                    addNewSnippet(fragment);
                }

                if (fragment.type === "no_snippet") {
                    module.snippet_count++;
                    addNewNoSnippet(fragment);
                }

                if (fragment.type === "description") {
                    addNewDescription(fragment);
                }

            }

            if (settings.afterFragmentsRendered) {
                settings.afterFragmentsRendered();
            }
        }

        function _spacesToLowerCasedHyphenated(str) {
            str = str.replace(/\s+/g, '-').toLowerCase();
            return str;
        }

        function addNewSection(section_name, insertBackToTop) {
            var markup, backToTop;

            //Check if our trimmed section name contains case-insensitive 'wip'
            var isWorkInProgress = /^wip/i.test($.trim(section_name));

            //Remove WIP from name as we only want to add class for styling
            section_name = isWorkInProgress ? $.trim(section_name).replace(/^wip/i, '') : section_name;

            //Section boiler-plate markup
            var sectionHyphenated = encodeURIComponent(_spacesToLowerCasedHyphenated(section_name));

            //If work in progress we add the 'wip' class so strikethrough or similar can be applied
            var sectionKlass = isWorkInProgress ? 'tdcss-section wip' : 'tdcss-section';
            markup = '<div class="' + sectionKlass + '" id="' + encodeURIComponent(sectionHyphenated) + '"><h2 class="tdcss-h2">' + section_name + '</h2></div>';

            if (settings.use_bookmarkables) {
                markup = '<div class="' + sectionKlass + '" id="' + encodeURIComponent(sectionHyphenated) + '">' +
                            '<a class="tdcss-bookmarkable" href="#' + encodeURIComponent(sectionHyphenated) + '">&#128279;</a><h2 class="tdcss-h2">' + section_name + '</h2></div>';
            } else {
                markup = '<div class="' + sectionKlass + '" id="' + encodeURIComponent(sectionHyphenated) + '"><h2 class="tdcss-h2">' + section_name + '</h2></div>';
            }

            if (insertBackToTop) {
                //prepend the back to top link to section markup
                backToTop = '<div class="tdcss-top"><a class="tddcss-top-link" href="#">Back to Top</a></div>';
                markup = backToTop + markup;
            }

            if (module.theme.beforeAddNewSection !== undefined) {
                module.theme.beforeAddNewSection(markup, isWorkInProgress, sectionHyphenated, section_name);
            }

            if (settings.use_categories) {
                $(module.container).next('.tdcss-elements').find('.category:last-child').append(markup);
            } else {
                $(module.container).next('.tdcss-elements').append(markup);
            }
        }

        function _addFragment(fragment, renderSnippet) {
            var title = fragment.snippet_title || '', html = fragment.html;

            //If type coffeescript or jssnippet we want to escape the raw script
            var escaped_html = '';
            if (fragment.type === 'coffeesnippet' || fragment.type === 'jssnippet') {
                escaped_html = htmlEscape(fragment.raw_script);
            } else {
                escaped_html = htmlEscape(html);
            }

            var height = getFragmentHeightCSSProperty(fragment),
                $row = $("<div style='height:" + height + "' class='tdcss-fragment' id='fragment-" + module.snippet_count + "'><h3 class='tdcss-fragment-title'>" + title + "</h3></div>"),
                $dom_example = $("<div class='tdcss-dom-example'>" + html + "</div>"),
                $code_example = $("<div class='tdcss-code-example'><pre><code class='language-markup'>" + escaped_html + "</code></pre></div>");

            if (renderSnippet) {
                $row.append($dom_example, $code_example);
            } else {
                $row.append($dom_example);
            }


            if (settings.use_categories) {
                $(module.container).next('.tdcss-elements').find('.category:last-child').append($row);
            } else {
                $(module.container).next('.tdcss-elements').append($row);
            }

            //We wait until here since we've now appended the $row to our module container
            if (fragment.type === 'coffeesnippet' && window.CoffeeScript) {
                window.CoffeeScript.eval(fragment.raw_script);
            }


            adjustCodeExampleHeight($row, fragment.type);

            function getFragmentHeightCSSProperty(fragment) {
                if (fragment.custom_height) {
                    return fragment.custom_height;
                } else {
                    return "auto";
                }
            }

            function adjustCodeExampleHeight($row, type) {
                var h3 = $(".tdcss-h3", $row),
                    textarea = $("pre", $row),
                    new_textarea_height = $(".tdcss-dom-example", $row).height();

                if (type === 'jssnippet' || type === 'coffeesnippet') {
                    textarea.height('auto');
                } else if (fragment.custom_height === "") {
                    textarea.height(new_textarea_height);
                } else {
                    textarea.height(fragment.custom_height);
                }
            }

            function htmlEscape(html) {
                return String(html)
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            }
        }

        function addNewNoSnippet(fragment) {
            _addFragment(fragment, false);
        }

        function addNewSnippet(fragment) {
            _addFragment(fragment, true);
        }

        function addNewDescription(fragment) {
            var description = $("<div class='tdcss-description'>" + fragment.description_text + "</div> ");

            if (settings.use_categories) {
                $(module.container).next('.tdcss-elements').find('.category:last-child').append(description);
            } else {
                $(module.container).next('.tdcss-elements').append(description);
            }
        }

        function bindSectionCollapseHandlers() {
            $.fn.makeCollapsible = function () {
                var that = this;
                return that.each(function () {
                    var that = this;
                    that.header_element = $(that);
                    that.state_string = $(that).attr("id") + ";";
                    that.collapsed = false;
                    that.fragments_in_section = that.header_element.nextUntil(".tdcss-section");

                    that.toggle = function () {
                        that.collapsed = that.collapsed ? false : true;

                        if (that.collapsed) {
                            $(that.header_element).addClass("is-collapsed");
                            $(that.fragments_in_section).hide();
                            if (settings.setCollapsedStateInUrl) {
                                that.setCollapsedStateInUrl();
                            }
                        } else {
                            $(that.header_element).removeClass("is-collapsed");
                            $(that.fragments_in_section).show();
                            if (settings.setCollapsedStateInUrl) {
                                that.removeCollapsedStateFromUrl();
                            }
                        }
                    };

                    that.setCollapsedStateInUrl = function () {
                        var current_hash = window.location.hash;
                        if (current_hash.indexOf(that.state_string) === -1) {
                            window.location.hash = current_hash + that.state_string;
                        }
                    };

                    that.removeCollapsedStateFromUrl = function () {
                        window.location.hash = window.location.hash.replace(that.state_string, "");
                    };

                    $(that).on("click", function (ev) {
                        //If they've clicked on a bookmarkable then let that behave as anchor click
                        var isBookmark = $(ev.target).hasClass('tdcss-bookmarkable');
                        if (!isBookmark) {
                            ev.preventDefault();
                            that.toggle();
                        }
                    });

                    return that;
                });
            };
            $(".tdcss-section").makeCollapsible();
        }

        function restoreCollapsedSectionsFromUrl() {
            if (window.location.hash) {
                var hash = window.location.hash.split("#")[1],
                    collapsedSections = hash.split(";");

                for (var section in collapsedSections) {
                    if (collapsedSections.hasOwnProperty(section)) {
                        if (collapsedSections[section].length) {
                            var matching_section = document.getElementById(collapsedSections[section]);
                            $(matching_section).click(); //TODO: Using click() smells a little. Find a better way.
                        }
                    }
                }
            }
        }

        function highlightSyntax() {
            /**
             * http://stackoverflow.com/questions/13792910/is-there-an-alternative-to-jquery-sizzle-that-supports-textnodes-as-first-clas?lq=1
             */
            jQuery.fn.getTextNodes = function (val, _case) {
                var nodes = [],
                    noVal = typeof val === "undefined",
                    regExp = !noVal && jQuery.type(val) === "regexp",
                    nodeType, nodeValue;
                if (!noVal && _case && !regExp) val = val.toLowerCase();
                this.each(function () {

                    if ((nodeType = this.nodeType) !== 3 && nodeType !== 8) {
                        jQuery.each(this.childNodes, function () {
                            if (this.nodeType === 3) {
                                nodeValue = _case ? this.nodeValue.toLowerCase() : this.nodeValue;
                                if (noVal || (regExp ? val.test(nodeValue) : nodeValue === val)) nodes.push(this);
                            }
                        });
                    }
                });
                return this.pushStack(nodes, "getTextNodes", val || "");
            };

            try {

                window.Prism.highlightAll(false, function () {
                    var that = this;

                    if (settings.hideTextContent) {
                        replaceNodes($(this));
                    }

                    $(settings.hideTheseAttributesContent).each(function () {
                        replaceNodes($(".token.attr-name:contains('" + this + "')", that).next(".attr-value"));
                    });
                });


            } catch (err) {
                console.log(err);
            }
        }

        function replaceNodes(selector, threshold, replaceWithText) {
            threshold = (typeof threshold === "undefined") ? 0 : threshold;
            replaceWithText = (typeof replaceWithText === "undefined") ? settings.replacementContent : replaceWithText;

            selector.getTextNodes().each(function () {
                var text = $.trim($(this).text());

                if (text.length > threshold) {
                    $(this).replaceWith(replaceWithText);
                }
            });
        }

        function makeTopBar() {
            module.theme.makeTopBar(module, makeJumpTo, makeHTMLToggle);
        }

        function makeJumpTo() {
            var dropdown = $("<select class='tdcss-jump-to'>" + jump_to_menu_options + "</select>");

            $(dropdown).change(function () {
                var href = $("option:selected", this).attr('href');
                var target = $(href);

                //Ignore the top option "Jump to Selection:"
                if (this.selectedIndex > 0) {

                    $('html, body').stop().animate({
                        'scrollTop': target.offset().top - 50 //accounts for top control bar
                    }, 600, 'swing', function () {
                        //window.location.hash = href;
                    });
                }
            });
            return dropdown;
        }

        function makeHTMLToggle() {
            var default_text,
                alternate_text,
                html_snippet_toggle;

            if (settings.hide_html) {
                default_text = settings.control_bar_text.show_html;
                alternate_text = settings.control_bar_text.hide_html;
                $(".tdcss-elements").addClass("tdcss-hide-html");
            } else {
                default_text = settings.control_bar_text.hide_html;
                alternate_text = settings.control_bar_text.show_html;
            }

            html_snippet_toggle = $("<a href='#' class='tdcss-html-snippet-toggle'>" + default_text + "</a>");

            html_snippet_toggle.click(
                function (e) {
                    //prevent scroll top behavior
                    e.preventDefault();
                    var text = $(this).text() === alternate_text ? default_text : alternate_text;

                    $(this).text(text);
                    $(".tdcss-elements").toggleClass("tdcss-hide-html");
                }
            );

            return html_snippet_toggle;
        }

        function diff() {
            try {
                $(".tdcss-dom-example").each(function () {

                    var fragment = this,
                        row = $(this).parent(".tdcss-fragment"),
                        id = row.attr("id"),
                        current_image_data,
                        stored_image_data;


                    window.html2canvas([fragment], {
                        onrendered: function (canvas) {
                            current_image_data = canvas.toDataURL('png');

                            if (!localStorage.getItem(id)) {
                                localStorage.setItem(id, current_image_data);
                            } else {
                                stored_image_data = localStorage.getItem(id);
                            }

                            window.resemble(current_image_data).compareTo(stored_image_data).onComplete(function (data) {
                                if (data.misMatchPercentage > 0) {
                                    var diff_image = $("<img />").addClass("tdcss-diff-image").attr("src", data.getImageDataUrl()),
                                        diff_stats = $("<div />").addClass("tdcss-diff-stats").text(data.misMatchPercentage + "% mismatch"),
                                        diff_warning = $("<div />").addClass("tdcss-diff-warning").text("Mismatch detected!"),
                                        diff_clear_btn = $("<a />").attr("href", "#").text("Clear").click(function () {
                                            localStorage.clear();
                                            location.reload();
                                            return false;
                                        });

                                    row.prepend(diff_image);
                                    row.addClass("tdcss-has-diff");
                                    row.append(diff_stats);

                                    diff_warning.append(diff_clear_btn);

                                    $(".tdcss-elements").prepend(diff_warning);
                                }
                            });

                        }
                    });
                });
            } catch (err) {
                console.log(err);
            }
        }

        function neutralizeBackground() {
            $("body").css({"background": "none"});
        }

        /**
         * Set the background color of DOM examples to the project background color.
         */
        function internalizeBackgroundColor() {
            var background_color = $('body').css('backgroundColor');
            $(".tdcss-dom-example").css('backgroundColor', background_color);
        }

    };
})($);


