/* tdcss.js - v0.8.1 - 2016-11-02
* http://jakobloekke.github.io/tdcss.js/
* Copyright (c) 2016 Jakob Løkke Madsen <jakob@jakobloekkemadsen.com> (http://www.jakobloekkemadsen.com);
* License: MIT */


if (typeof tdcss_theme !== 'function') {

    tdcss_theme = (function () {

        var _private = {

            currentCategorySelector: null,
            isJumping: false,
            currentMousePos: { x: -1, y: -1 },
            sidebarMarginTop: 64,

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

            makeTopBar: function(module, makeJumpTo, makeHTMLToggle, useHtmlToggle) {
                $('.tdcss-header').show();

                if (useHtmlToggle) {
                    var htmlToggleContainer =
                        '<ul class="tdcss-html-toggle"><li class="tdcss-toggle-link"></li></ul>';
                    $('.docked-menu').prepend(htmlToggleContainer);
                    $('.tdcss-toggle-link').append(makeHTMLToggle());
                }
            },


            isFirstAccordian: function(li) {
                var first = $('.tdcss-category-title').first().parent().next().find('> li');
                return $(first).is(li);
            },

            isLastAccordian: function(li) {
                var last = $('.tdcss-category-title').last().parent().next().find('> li');
                return $(last).is(li);
            },

            isMouseInAccordian: function() {
                var left = $('.docked-menu').offset().left;
                var right = parseInt(left + $('.docked-menu').width());
                var x = this.currentMousePos.x;
                var y = this.currentMousePos.y;

                return x > left && x < right && y > this.sidebarMarginTop;
            },

            getActiveAccordian: function() {
                var active = null;
                $('.tdcss-category-title').each(function () {
                    var sectionLI = $(this).parent().next().find('> li');

                    if (sectionLI.hasClass('active')) {
                        active = sectionLI;
                    }
                });
                return active;
            },

            toggleAccordion: function (settings, li) {
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

                _private.adjustScrollingCategory(settings, li); 
            },

            //Provides an affordance that there are more sections available within an
            //open category in the Accordian. Essentially, it will adjust the height
            //such that there's an extra half of a row, giving the user a clue that more
            //sections are available if they scroll (similar to how a carousel player might
            //show half of a thumbnail)
            adjustScrollingCategory: function (settings, li) {

                //We only can adjust the scrollable category accordian area if a row height
                //has been provided.
                if (!settings.rowHeight) {
                    return;
                }

                //Reset min/max heights to their original values
                $('.tdcss-nav-category').css('min-height', 0);

                //This reset must reflect the CSS set in the theme/tdcss.css:
                //.tdcss-navigation ul { max-height: 60% ...
                $('.tdcss-nav-category').css('max-height', '60%');


                // We calculate the scroll height vs. offset height.
                // If greater we have scrollbar and we adjust the min or max
                // height of the list to cause a half row overlap affordance
                setTimeout(function() {
                    var tdcssNavCategory = $(li).parent();
                    var scrollHeight = $(tdcssNavCategory)[0].scrollHeight;
                    var offsetHeight = $(tdcssNavCategory)[0].offsetHeight;

                    if (scrollHeight > offsetHeight) {
                        var height = parseInt( $(tdcssNavCategory).css('height'));

                        // Create a half row extra height
                        var rowHeight = settings.rowHeight;
                        var half = rowHeight/2;
                        var leftover = height % rowHeight;

                        var additional = parseInt (half - leftover);
                        if (leftover > half) {
                            additional = parseInt(leftover - half);
                            $(tdcssNavCategory).css('max-height', height - additional);
                        } else {
                            $(tdcssNavCategory).css('min-height', height + additional);
                        }
                    }
                }, 200);
            },

            setupAccordian: function (settings) {
                var that = this;

                $('.docked-menu .tdcss-category-title').click(function (e) {
                    var sectionLI = $(this).parent().next().find('> li');
                    that.toggleAccordion(settings, sectionLI);
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
                var that = this;
                var sidebarMarginTop;

                //Store mouse positions
                $(document).mousemove(function(event) {
                    that.currentMousePos.x = event.pageX;
                    that.currentMousePos.y = event.pageY;
                });

                var headerTop = 120;
                if (settings.headerTop !== undefined) {
                    headerTop = settings.headerTop;
                }
                
                //If the header is using fixed position, we need to add it to the sidebar's margin
                if (settings.useFixedHeader !== undefined) {
                    that.sidebarMarginTop = sidebarMarginTop + headerTop;
                }

                //Grab the offset locations of section links
                var sectionsInPage = [];
                $('.tdcss-nav a').each(function () {
                    var href = $(this).attr('href');
                    var locationInPage = $(href).offset().top;
                    sectionsInPage.push(locationInPage);
                });

                var scrollingAdjustment = 12;//hack: readjusts margin-top to "catch up" w/user's scrolling
                var extraPadding = scrollingAdjustment + 4;

                var scrollFn = _private._throttle(function() {
                    var y = $(this).scrollTop();

                    //Header scrolled off top of screen
                    if (y >= headerTop) {
                        //Fix position the docked sidebar menu and add margin top there. Now that we've fixed positioned
                        $('.docked-menu').addClass('fixed').css('margin-top', that.sidebarMarginTop);
                    }
                    else {
                        //Switches back to using the tdcss-navigation for margin-top
                        $('.docked-menu').removeClass('fixed').css('margin-top', 0);
                        $('.tdcss-navigation').css('margin-top', that.sidebarMarginTop);
                    }

                    //The docked-menu sidebar will always need to calculate against its parent esp. when it
                    //becomes fixed positioned thus taken out of flow of document
                    $('.docked-menu').width($('.docked-menu').parent().width());
                        

                    var activeCategoryLI = that.getActiveAccordian();

                    var isMouseInAccordian = that.isMouseInAccordian();


                    //If The Accordian is opened and we're not jumping to a link
                    if (activeCategoryLI && !isMouseInAccordian && !that.isJumping) {
                        var href = activeCategoryLI.parent().prev().find('.tdcss-category-title').attr('href');
                        var activeY = $(href).offset().top;

                        var nextCategory = activeCategoryLI.parent().nextAll('.tdcss-nav-category').get(0);
                        var nextCategoryLI = $(nextCategory).find('> li');
                        href = $(nextCategory).prev().find('.tdcss-category-title').attr('href');
                        var nextY = href ? $(href).offset().top : null;

                        var prevCategory = activeCategoryLI.parent().prevAll('.tdcss-nav-category').get(0);
                        var prevCategoryLI = $(prevCategory).find('> li');
                        href = $(prevCategory).prev().find('.tdcss-category-title').attr('href');
                        var prevY = href ? $(href).offset().top : null;

                        // console.log("Y: ", y);
                        // console.log("activeY: ", activeY);
                        // console.log("nextY: ", nextY);
                        // console.log("prevY: ", prevY);

                        var isFirst = that.isFirstAccordian(activeCategoryLI);
                        var isLast = that.isLastAccordian(activeCategoryLI);

                        //Scrolled past active accordian's "next section" and not on last? Open next.
                        if (y > nextY && !isLast) {
                            that.toggleAccordion(settings, activeCategoryLI);
                            that.toggleAccordion(settings, nextCategoryLI);

                        //Scrolled before active section and not on first? Open previous.
                        } else if (y < activeY && !isFirst) {
                            that.toggleAccordion(settings, activeCategoryLI);
                            that.toggleAccordion(settings, prevCategoryLI);
                        } else { /* NOP */ }
                    }

                    //Now we need to highlight the currently scrolled to active secondary nav link
                    //by comparing our position against that of each of the sidebar link
                    $.each(sectionsInPage, function (i, loc) {
                        var isLast = sectionsInPage - 1 === i;

                        //Add the subnav height and scrolling adjustment to current Y so the left nav
                        //active links are updated when the section bar is a few pixels below subnav
                        if (!that.isJumping && y + extraPadding >= loc - scrollingAdjustment) {
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

                function jumpToLink(context, ev) {
                    //We set this so that the Accordian detection doesn't kick in, 
                    //and violently open/close categories :)
                    that.isJumping = true;
                    setTimeout(function() {
                        that.isJumping = false;
                    }, 650);

                    var href = $(context).attr('href');
                    var target = $(href);

                    $('html, body').stop().animate({
                        'scrollTop': target.offset().top
                    }, 600, 'swing', function () {
                        //For jump links, we set isJumping to prevent the scrolling listener from adding
                        //active, so, once we've "landed", we need to add that here.
                        $('.tdcss-nav li').removeClass('active');
                        $(context).parent().addClass('active');
                    });
                }
            },

            setup: function (settings) {
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
