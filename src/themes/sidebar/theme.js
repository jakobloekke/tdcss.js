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

            beforeRenderFragment: function (fragment, isWorkInProgress) {
                if (fragment.type === "category") {
                    var markup = getCategory(fragment);
                    $('.docked-menu').append(markup);
                }

                function getCategory(fragment) {
                    var categoryName = fragment.category_name;
                    var isWorkInProgress = /^wip/i.test($.trim(categoryName));
                    categoryName = isWorkInProgress ? $.trim(categoryName).replace(/^wip/i, '') : categoryName;
                    var categoryHyphenated = encodeURIComponent(categoryName.replace(/\s+/g, '-').toLowerCase());
                    var categoryKlass = isWorkInProgress ? 'tdcss-nav-category wip' : 'tdcss-nav-category';

                    //We want to be able to find the current category for when we add sub-items later
                    _private.currentCategorySelector = '#' + categoryHyphenated;

                    return '<ul class="' + categoryKlass + '" id="' + categoryHyphenated + '"><li><a href="#" class="tdcss-category-title">' + categoryName + '</a></li></ul>';
                }
            },

            beforeAddNewSection: function (markup, isWorkInProgress, sectionHyphenated, section_name) {
                var sectionTitleKlass = isWorkInProgress ? 'tdcss-section-title wip' : 'tdcss-section-title';

                var markup = '<ul class="tdcss-nav ' + sectionHyphenated + '"><li class="' + sectionTitleKlass + '"><a href="#' + sectionHyphenated + '">' + section_name + '</a></li></ul>';

                if (_private.currentCategorySelector) {
                    $(_private.currentCategorySelector + ' > li').append(markup);
                } else {
                    $('.docked-menu').append(markup);
                }
            },

            makeTopBar: function(module, makeJumpTo, makeHTMLToggle) {
                $('.tdcss-header').show();
                $('.tdcss-subheader-nav').show();

                var htmlToggleContainer =
                    '<ul class="tdcss-html-toggle"><li class="tdcss-toggle-link"></li></ul>';
                $('.docked-menu').prepend(htmlToggleContainer);
                $('.tdcss-toggle-link').append(makeHTMLToggle());
            },

            setupAccordian: function () {

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
                    }
                }

                $('.docked-menu .tdcss-category-title').click(function (ev) {
                    var sectionLI = $(this).parent();
                    toggleAccordion(sectionLI);
                }).parent().find('.tdcss-nav > li').hide();

                $('.docked-menu li').click(function (e) {
                    e.preventDefault();
                });

            },

            setupStickySidebar: function() {
                var sidebarMarginTop = 64;
                var headerTop = 120;
                var subheaderHeight = 40;

                //Grab the offset locations of links
                var locationsInPage = [];
                $('.tdcss-nav a').each(function () {
                    var href = $(this).attr('href');
                    var locationInPage = $(href).offset().top;
                    locationsInPage.push(locationInPage);
                });

                var scrollingAdjustment = 12;//hack: readjusts margin-top to "catch up" w/user's scrolling

                $(window).scroll(function (event) {
                    var that = this;
                    var y = $(this).scrollTop();

                    //Header scrolled off top of screen
                    if (y >= headerTop) {
                        // Subheader primary navbar fixed when top header scrolled off
                        $('.tdcss-subheader-nav').addClass('fixed');

                        //Add margin top on first section so it roughly lines up with sidebar
                        $('.tdcss-section').first().css('margin-top', sidebarMarginTop + subheaderHeight - scrollingAdjustment);

                        //Fix position the docked sidebar menu and add margin top there. Now that we've fixed positioned
                        //the tdcss-subheader-nav, tdcss-navigation's margin top is useless.
                        $('.docked-menu').addClass('fixed').css('margin-top', sidebarMarginTop + subheaderHeight);
                    }
                    else {
                        $('.tdcss-subheader-nav').removeClass('fixed');
                        $('.tdcss-section').first().css('margin-top', sidebarMarginTop);
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
                        var extraPadding = scrollingAdjustment + 4;
                        if (y + subheaderHeight + extraPadding >= loc - scrollingAdjustment) {
                            $('.tdcss-nav li').removeClass('active').eq(i).addClass('active');
                        }
                    });
                });

                $('.tdcss-section-title a').on('click', function (ev) {
                    ev.preventDefault();

                    var href = $(this).attr('href');
                    var   target = $(href);
                    $('html, body').stop().animate({
                        'scrollTop': target.offset().top - 50
                    }, 600, 'swing', function () {});
                });
            },

            setup: function () {
                var self = this;

                //Wrap the .tdcss-elements and .tdd-navigation (which are adjacent) in container
                $(".tdcss-elements").each(function (index) {
                    $(this).next(".tdcss-navigation").addBack().wrapAll("<div class='tdcss-container' />");
                });

                //Sets up the Accordian / Sticky Sidebar on document loaded
                $(function(){ 
                    _private.setupAccordian();
                    _private.setupStickySidebar();
                });
            }
        };

        var _public = {
            name: 'sidebar',
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
