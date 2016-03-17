/* tdcss.js - v0.8.1 - 2016-03-16
* http://jakobloekke.github.io/tdcss.js/
* Copyright (c) 2016 Jakob Løkke Madsen <jakob@jakobloekkemadsen.com> (http://www.jakobloekkemadsen.com);
* License: MIT */


if (typeof tdcss_theme !== 'function') {

    tdcss_theme = (function () {

        // private
        var _private = {

            beforeAddNewSection: function (markup, isWorkInProgress, sectionHyphenated, section_name) {
                var sectionTitleKlass = isWorkInProgress ? 'tdcss-section-title wip' : 'tdcss-section-title';
                $('.docked-menu').append('<ul class="tdcss-nav ' + sectionHyphenated + '"><li class="' + sectionTitleKlass + '"><a href="#' + sectionHyphenated + '">' + section_name + '</a></h2></div>');
            },

            setup: function () {

                //Wrap the .tdcss-elements and .tdd-navigation (which are adjacent) in container
                $(".tdcss-elements").each(function (index) {
                    $(this).next(".tdcss-navigation").addBack().wrapAll("<div class='tdcss-container' />");
                });

                //Sticky Sidebar
                $(document).ready(function () {
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
                });



            }
        };

        var _public = {
            name: 'sidebar',
            beforeAddNewSection: _private.beforeAddNewSection,
            setup: _private.setup
        };

        return _public;

    })();
}
