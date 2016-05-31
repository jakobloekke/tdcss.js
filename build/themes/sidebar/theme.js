/* tdcss.js - v0.8.1 - 2016-05-31
* http://jakobloekke.github.io/tdcss.js/
* Copyright (c) 2016 Jakob Løkke Madsen <jakob@jakobloekkemadsen.com> (http://www.jakobloekkemadsen.com);
* License: MIT */


if (typeof tdcss_theme !== 'function') {

    tdcss_theme = (function () {

        var _private = {

            currentCategorySelector: null,

            beforeReset: function (fragment_types) {
                fragment_types.category = {identifier: "@"};
            },

            beforeFragment: function (that, data, getCommentMetaFn) {
                if (that.type === "category") {
                    that.category_name = data;
                }
            },

            beforeRenderFragment: function (module, fragment) {
                if (fragment.type === "category") {
                    var markup = getCategory(fragment);
                    $('.docked-menu').append(markup);

                    var categoryID = fragment.category_name.toLowerCase().replace(' ', '-').trim();

                    var html = "<div class='category " + encodeURIComponent(categoryID) + "' id='" + encodeURIComponent(categoryID) + "'><div class='tdcss-category-wrap'><div class='tdcss-category'>" +
                                 "<h2 class='tdcss-h2'>" + fragment.category_name + "</h2></div></div></div>";

                    $(module.container).next(".tdcss-elements").append(html);
                }
                
                function getCategory(fragment) {
                    var categoryName = fragment.category_name;
                    var isWorkInProgress = /^wip/i.test($.trim(categoryName));
                    categoryName = isWorkInProgress ? $.trim(categoryName).replace(/^wip/i, '') : categoryName;
                    var categoryHyphenated = encodeURIComponent(categoryName.replace(/\s+/g, '-').toLowerCase());
                    var categoryTitleLink = '<a href="#' + categoryHyphenated + '" class="tdcss-category-title">' + categoryName + '</a>';
                    var categoryGoLink = '<a href="#' + categoryHyphenated + '" class="tdcss-category-go">&#128279;</a>';
                    var categoryKlass = isWorkInProgress ? 'tdcss-nav-category wip' : 'tdcss-nav-category';

                    //We want to be able to find the current category for when we add sub-items later
                    _private.currentCategorySelector = '#' + categoryHyphenated;

                    return '<div class="tdcss-category-title-wrap">' + categoryTitleLink + categoryGoLink + '</div><ul class="' + categoryKlass + '" id="' + categoryHyphenated + '"><li></li></ul>';
                }
            },

            beforeAddNewSection: function (markup, isWorkInProgress, sectionHyphenated, section_name) {
                var sectionTitleKlass = isWorkInProgress ? 'tdcss-section-title wip' : 'tdcss-section-title';

                var html = '<ul class="tdcss-nav ' + sectionHyphenated + '"><li class="' + sectionTitleKlass + '"><a href="#' + sectionHyphenated + '">' + section_name + '</a></li></ul>';

                if (_private.currentCategorySelector) {
                    $(_private.currentCategorySelector + ' > li').append(html);
                } else {
                    $('.docked-menu').append(html);
                }
            },

            makeTopBar: function(module, makeJumpTo, makeHTMLToggle) {
                $('.tdcss-header').show();

                var htmlToggleContainer =
                    '<ul class="tdcss-html-toggle"><li class="tdcss-toggle-link"></li></ul>';
                $('.docked-menu').prepend(htmlToggleContainer);
                $('.tdcss-toggle-link').append(makeHTMLToggle());
            },

            setupAccordian: function (settings) {

                function toggleAccordion(li) {
                    var dur = 250;

                    if (li.hasClass('active')) {
                        li.removeClass('active');
                        $('.tdcss-nav > li', li).slideUp({duration: dur});

                    } else {
                        $('.tdcss-nav-category li.active .tdcss-nav > li').slideUp({duration: dur});
                        $('li.active').removeClass('active');
                        li.addClass('active');
                        $('.tdcss-nav > li', li).slideDown({duration: dur});

                        if (settings.onAccordionActivated !== undefined) {
                            settings.onAccordionActivated(li);
                        }
                    }
                }

                $('.docked-menu .tdcss-category-title').click(function (e) {
                    var sectionLI = $(this).parent().next().find('> li');
                    toggleAccordion(sectionLI);
                    e.preventDefault();
                }).parent().next().find('.tdcss-nav > li').hide();
            },

            _throttle: function(func, wait, options) {
                var context, args, timeout, result;
                var previous = 0;
                var later = function() {
                    previous = new Date;
                    timeout = null;
                    result = func.apply(context, args);
                };
                return function() {
                    var now = new Date;
                    var remaining = wait - (now - previous);
                    context = this;
                    args = arguments;
                    if (remaining <= 0) {
                        clearTimeout(timeout);
                        timeout = null;
                        previous = now;
                        result = func.apply(context, args);
                    } else if (!timeout) {
                        timeout = setTimeout(later, remaining);
                    }
                    return result;
                };
            },


            setupStickySidebar: function(settings) {
                var sidebarMarginTop = 64;

                var headerTop = 120;
                if (settings.headerTop !== undefined) {
                    headerTop = settings.headerTop;
                }
                
                //If the header is using fixed position, we need to add it to the sidebar's margin
                if (settings.useFixedHeader !== undefined) {
                    sidebarMarginTop = sidebarMarginTop + headerTop;
                }

                //Grab the offset locations of links
                var locationsInPage = [];
                $('.tdcss-nav a').each(function () {
                    var href = $(this).attr('href');
                    var locationInPage = $(href).offset().top;
                    locationsInPage.push(locationInPage);
                });

                var scrollingAdjustment = 12;//hack: readjusts margin-top to "catch up" w/user's scrolling
                var extraPadding = scrollingAdjustment + 4;

                var scrollFn = _private._throttle(function() {
                    var that = this;
                    var y = $(this).scrollTop();

                    //Header scrolled off top of screen
                    if (y >= headerTop) {
                        //Fix position the docked sidebar menu and add margin top there. Now that we've fixed positioned
                        $('.docked-menu').addClass('fixed').css('margin-top', sidebarMarginTop);
                    }
                    else {
                        //Switches back to using the tdcss-navigation for margin-top
                        $('.docked-menu').removeClass('fixed').css('margin-top', 0);
                        $('.tdcss-navigation').css('margin-top', sidebarMarginTop);
                    }

                    //The docked-menu sidebar will always need to calculate against its parent esp. when it
                    //becomes fixed positioned thus taken out of flow of document
                    $('.docked-menu').width($('.docked-menu').parent().width());


                    //Now we need to highlight the currently scrolled to active secondary nav link
                    //by comparing our position against that of each of the sidebar link
                    $.each(locationsInPage, function (i, loc) {
                        var y = $(that).scrollTop();

                        var isLast = locationsInPage - 1 === i;

                        //Add the subnav height and scrolling adjustment to current Y so the left nav
                        //active links are updated when the section bar is a few pixels below subnav
                        if (y + extraPadding >= loc - scrollingAdjustment) {
                            $('.tdcss-nav li').removeClass('active').eq(i).addClass('active');
                        }
                    });
                }, 50);

                window.addEventListener('scroll', scrollFn);

                $('.tdcss-category-go').on('click', function (ev) {
                    jumpToLink(this, ev);
                });

                $('.tdcss-section-title a').on('click', function (ev) {
                    jumpToLink(this, ev);
                });

                function jumpToLink(that, ev) {
                    ev.preventDefault();
                    var href = $(that).attr('href');
                    var target = $(href);

                    $('html, body').stop().animate({
                        'scrollTop': target.offset().top
                    }, 600, 'swing', function () {});
                }
            },

            setup: function (settings) {
                var self = this;

                //Wrap the .tdcss-elements and .tdd-navigation (which are adjacent) in container
                $(".tdcss-elements").each(function (index) {
                    $(this).next(".tdcss-navigation").addBack().wrapAll("<div class='tdcss-container' />");
                });

                //Sets up the Accordian / Sticky Sidebar on document loaded
                $(function(){ 
                    _private.setupAccordian(settings);
                    _private.setupStickySidebar(settings);
                });
            }
        };

        var _public = {
            name: 'sidebar',
            use_categories: true,
            use_collapsing: false,
            use_code_copy_button: true,
            use_bookmarkables: true,
            beforeReset: _private.beforeReset,
            beforeFragment: _private.beforeFragment,
            beforeRenderFragment: _private.beforeRenderFragment,
            beforeAddNewSection: _private.beforeAddNewSection,
            setup: _private.setup,
            makeTopBar: _private.makeTopBar,
        };

        return _public;

    })();
}
