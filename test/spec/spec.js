jasmine.getFixtures().fixturesPath = 'base/test/spec/javascripts/fixtures/html';
jasmine.getStyleFixtures().fixturesPath = 'base/test/spec/javascripts/fixtures/css';

describe("TDCSS", function () {

    beforeEach(function () {
        this.addMatchers({

            toBeWithin: function (expected, range) {
                var actual = this.actual,
                    low = actual - range / 2,
                    high = actual + range / 2;

                this.message = function () {
                    return "Expected " + actual + " to be within " + range + " from " + expected;
                };


                return (actual >= low) && (actual <= high);
            }

        });
    });

    afterEach(function () {
        window.location.hash = "";
        window.tdcss = null;
    });

    describe("Setup", function () {
        it("should hide the initial HTML inside the .tdcss div", function () {
            loadFixtures('simple.html');
            expect($('#shouldbehidden')).toHaveHtml("This should be hidden");
            expect($('#shouldbehidden').is(":visible")).toBe(true);

            $("#tdcss").tdcss();
            expect($('#shouldbehidden').is(":visible")).toBe(false);

        });

        it("should insert a basic div wrapper for viewing the tests", function () {
            loadFixtures('simple.html');
            $("#tdcss").tdcss();
            expect($('body')).toContain('.tdcss-elements');
        });
    });

    describe("Parsing", function () {
        it("should expose the module 'fragments' array as window.tdcss.fragments", function () {
            loadFixtures('simple.html');
            $("#tdcss").tdcss();

            expect(typeof tdcss[0].fragments).toBe("object");
        });

        it("should collect fragments into fragments array", function () {
            loadFixtures('simple.html');
            $("#tdcss").tdcss();

            expect(tdcss[0].fragments.length).toBe(2);
            expect(tdcss[0].fragments[0].type).toBe("section");
            expect(tdcss[0].fragments[1].type).toBe("snippet");
        });
    });

    describe("Rendering", function () {

        it("should render a row per fragment", function () {
            loadFixtures('simple.html');
            $("#tdcss").tdcss();

            expect($('.tdcss-elements:first')).toContain(".tdcss-fragment");

        });

        it("should render descriptions as description text blocks", function () {
            loadFixtures('description.html');
            $("#tdcss").tdcss();

            expect($(".tdcss-description").length).toBe(1);
        });

        it("should render fragments, even if outside sections", function () {
            loadFixtures('simple-no-meta.html');
            $("#tdcss").tdcss();

            expect($('.tdcss-elements:first > div:first').attr("class")).toBe('tdcss-fragment');
            expect($('.tdcss-elements:first .tdcss-fragment').length).toBe(1);
        });

        describe("fragment layout", function () {
            it("should render the DOM example dom example container", function () {
                loadFixtures('simple.html');
                $("#tdcss").tdcss();

                expect($('.tdcss-elements:first .tdcss-fragment .tdcss-dom-example')[0].innerHTML).toContain("Here's a basic fragment");
            });

            it("should render the fragment HTML in a pre block", function () {
                loadFixtures('simple.html');
                $("#tdcss").tdcss();

                expect($('.tdcss-elements:first pre').html()).toContain('Here\'s a basic fragment');
            });

            it("should render the fragment title in an h3 above the textarea", function () {
                loadFixtures('simple.html');
                $("#tdcss").tdcss();

                expect($('.tdcss-elements:first .tdcss-fragment:first .tdcss-code-example h3').text()).toBe('Basic fragment');
            });

            it("should render section dividers above each set of fragments that belong to a section", function () {
                loadFixtures('multiple-sections.html');
                $("#tdcss").tdcss();

                var elements = $('.tdcss-elements:first');

                expect($('> div:eq(0) h2', elements).text()).toBe("Basic section");

                expect($('> div:eq(0)', elements).attr("class")).toBe("tdcss-section");
                expect($('> div:eq(1)', elements).attr("class")).toBe("tdcss-fragment");
                expect($('> div:eq(2)', elements).attr("class")).toBe("tdcss-fragment");
                expect($('> div:eq(3)', elements).attr("class")).toBe("tdcss-fragment");

                expect($('> div:eq(4) h2', elements).text()).toBe("New section");

                expect($('> div:eq(4)', elements).attr("class")).toBe("tdcss-section");
                expect($('> div:eq(5)', elements).attr("class")).toBe("tdcss-fragment");
                expect($('> div:eq(6)', elements).attr("class")).toBe("tdcss-fragment");

            });

            it("should fix the height of the dom-example container, if a value is specified", function () {
                loadFixtures('multiple-sections.html');
                $("#tdcss").tdcss();

                expect($(".tdcss-elements:first .tdcss-fragment:eq(4)").attr("style")).toContain("500px");
            });

            it("should adapt the height of the code-example container to fit the height of the row", function () {
                loadFixtures('multiple-sections.html');
                $("#tdcss").tdcss();

                var row = $(".tdcss-fragment:first"),
                    code_example = $(".tdcss-code-example", row),
                    h3 = $(".tdcss-h3", row),
                    textarea = $(".tdcss-textarea", row),

                    expected_new_textarea_height = (code_example.height() - h3.outerHeight(true));

                expect(textarea.outerHeight(true)).toBeWithin(expected_new_textarea_height, 5);
            });
        });

    });

    describe("Interaction", function () {
        it("should collapse and expand sections, when section header is clicked", function () {
            loadFixtures('multiple-sections.html');
            $("#tdcss").tdcss();

            var section_header = $('.tdcss-elements:first .tdcss-section:first'),
                section_fragment_1 = $(section_header).next(".tdcss-fragment"),
                section_fragment_2 = $(section_fragment_1).next(".tdcss-fragment"),
                section_fragment_3 = $(section_fragment_2).next(".tdcss-fragment"),
                other_section_fragment = $(".tdcss-elements:first .tdcss-section:eq(1)").next(".tdcss-fragment");

            expect(section_fragment_1.is(":visible")).toBe(true);
            expect(section_fragment_2.is(":visible")).toBe(true);
            expect(section_fragment_3.is(":visible")).toBe(true);

            // Other sections are not collapsed
            expect(other_section_fragment.is(":visible")).toBe(true);

            section_header.click();
            expect(section_fragment_1.is(":visible")).toBe(false);
            expect(section_fragment_2.is(":visible")).toBe(false);
            expect(section_fragment_3.is(":visible")).toBe(false);

            // Other sections are not collapsed
            expect(other_section_fragment.is(":visible")).toBe(true);

            section_header.click();
            expect(section_fragment_1.is(":visible")).toBe(true);
            expect(section_fragment_2.is(":visible")).toBe(true);
            expect(section_fragment_3.is(":visible")).toBe(true);

            // Other sections are not collapsed
            expect(other_section_fragment.is(":visible")).toBe(true);

        });

        it("should also hide any description blocks inside sections", function () {
            loadFixtures('section-with-description.html');
            $("#tdcss").tdcss();

            var section_header = $('.tdcss-elements:first .tdcss-section:first'),
                section_fragment_before_description = $(".tdcss-fragment").eq(1),
                section_fragment_after_description = $(".tdcss-fragment").eq(2);

            section_header.click();
            expect(section_fragment_before_description).toBeHidden();
            expect(section_fragment_after_description).toBeHidden();

        });

        it("should add a css class to section headers, when collapsed", function () {
            loadFixtures('multiple-sections.html');
            $("#tdcss").tdcss();

            var section_header = $('.tdcss-elements:first .tdcss-section:first');

            expect(section_header).not.toHaveClass("is-collapsed");
            section_header.click();
            expect(section_header).toHaveClass("is-collapsed");
            section_header.click();
            expect(section_header).not.toHaveClass("is-collapsed");

        });

        it("should store information on collapsed sections in url fragment", function () {
            loadFixtures('multiple-sections.html');
            $("#tdcss").tdcss();

            var first_section_header = $('.tdcss-elements:first .tdcss-section:first'),
                second_section_header = $('.tdcss-elements:first .tdcss-section:eq(1)');

            first_section_header.click();
            expect(window.location.hash).toContain(first_section_header.attr("id"));

            second_section_header.click();
            expect(window.location.hash).toContain(first_section_header.attr("id"));


        });

        it("should remove information on collapsed sections from url fragment, when they are shown again", function () {
            loadFixtures('multiple-sections.html');

            $("#tdcss").tdcss();

            var first_section_header = $('.tdcss-elements:first .tdcss-section:first'),
                second_section_header = $('.tdcss-elements:first .tdcss-section:eq(1)');

            first_section_header.click();
            second_section_header.click();

            first_section_header.click();
            expect(window.location.hash).toNotContain(first_section_header.attr("id"));

            second_section_header.click();
            expect(window.location.hash).toNotContain(second_section_header.attr("id"));

        });

        it("should restore section collapsed states based on url when loading page", function () {
            loadFixtures('multiple-sections.html');
            window.location.hash = "basic-section;";

            $("#tdcss").tdcss();
            var section_fragment_1 = $('.tdcss-elements:first .tdcss-section:first').next(".tdcss-fragment"),
                section_fragment_2 = $(section_fragment_1).next(".tdcss-fragment"),
                section_fragment_3 = $(section_fragment_2).next(".tdcss-fragment"),
                other_section_fragment = $(".tdcss-elements:first .tdcss-section:eq(1)").next(".tdcss-fragment");

            expect(section_fragment_1.is(":visible")).toBe(false);
            expect(section_fragment_2.is(":visible")).toBe(false);
            expect(section_fragment_3.is(":visible")).toBe(false);
            expect(other_section_fragment.is(":visible")).toBe(true);

        });
    });

    describe("Options", function () {

        describe("diff", function () {
            // Todo ...
        });

        describe("neutralize_background", function () {
            it("should remove any background set on the body element by the project CSS", function () {

                loadStyleFixtures('body-background.css');
                loadFixtures('simple.html');

                expect($("body").css("backgroundColor")).toBe("rgb(255, 0, 0)");
                expect($("body").css("backgroundImage")).toBe("url(data:image/bmp;base64,Qk08AAAAAAAAADYAAAAoAAAAAQAAAAEAAAABABAAAAAAAAYAAAASCwAAEgsAAAAAAAAAAAAA/38AAAAA)");

                $("#tdcss").tdcss({neutralize_background: true});

                expect($("body").css("backgroundColor")).toBe("rgba(0, 0, 0, 0)");
                expect($("body").css("backgroundImage")).toBe("none");

            });
        });
    });




    describe("Control Bar", function () {

        it("should exist", function () {
            loadFixtures('simple.html');

            expect($(".tdcss-control-bar")).not.toExist();

            $("#tdcss").tdcss();

            expect($(".tdcss-control-bar")).toExist();
        });

        it("should contain a link to show/hide html snippet", function () {
            loadFixtures('simple.html');

            $("#tdcss").tdcss();

            // Button exists:
            expect($(".tdcss-control-bar .tdcss-html-snippet-toggle")).toExist();
            expect($(".tdcss-control-bar .tdcss-html-snippet-toggle")).toHaveText("Hide HTML");

            //Html is visible:
            expect($(".tdcss-elements")).not.toHaveClass("tdcss-hide-html");

            $(".tdcss-control-bar .tdcss-html-snippet-toggle").click();
            expect($(".tdcss-elements")).toHaveClass("tdcss-hide-html");
            expect($(".tdcss-control-bar .tdcss-html-snippet-toggle")).toHaveText("Show HTML");

            $(".tdcss-control-bar .tdcss-html-snippet-toggle").click();
            expect($(".tdcss-elements")).not.toHaveClass("tdcss-hide-html");
            expect($(".tdcss-control-bar .tdcss-html-snippet-toggle")).toHaveText("Hide HTML");
        });

        it("should contain a 'jump-to' dropdown html snippet", function () {
            loadFixtures('simple.html');

            $("#tdcss").tdcss();

            // Jump-to dropdown exists:
            expect($(".tdcss-control-bar .tdcss-jump-to")).toExist();
        });
    });

});
