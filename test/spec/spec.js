describe("TDCSS", function() {

    beforeEach(function() {
        
    });

    afterEach(function() {
        window.location.hash = "";
    });

    describe("Setup", function() {
        it("should hide the initial HTML inside the .tdcss div", function() {
            loadFixtures('simple.html');
            expect($('#shouldbehidden')).toHaveHtml("This should be hidden");
            expect($('#shouldbehidden').is(":visible")).toBe(true);

            $(function(){
                $("#tdcss").tdcss();
                expect($('#shouldbehidden').is(":visible")).toBe(false);
            });

        });

        it("should insert a basic div wrapper for viewing the tests", function(){
            loadFixtures('simple.html');
            $(function(){
                $("#tdcss").tdcss();
                expect($('body')).toContain('.tdcss-elements');
            });

        });
    });



    describe("Parsing", function() {
        it("should expose the module 'fragments' array as window.tdcss.fragments", function(){
            loadFixtures('simple.html');
            $(function(){
                $("#tdcss").tdcss();
                expect(typeof tdcss[0].fragments).toBe("object");
                expect(tdcss[0].fragments[0].html).toContain("Here's a basic fragment");
            });
        })
    });



    describe("Rendering", function() {
        it("should render a row per fragment", function() {
            loadFixtures('simple.html');
            $(function(){
                $("#tdcss").tdcss();
                expect($('.tdcss-elements:first')).toContain(".tdcss-fragment");
            });
        });

        it("should render the DOM example dom example container", function() {
            loadFixtures('simple.html');
            $(function(){
                $("#tdcss").tdcss();
                expect($('.tdcss-elements:first .tdcss-fragment .tdcss-dom-example')[0].innerHTML).toContain("Here's a basic fragment");
            });
        });

        it("should render the fragment HTML in a textarea", function() {
            loadFixtures('simple.html');
            $(function(){
                $("#tdcss").tdcss();
                expect($('.tdcss-elements:first textarea')[0].value).toBe('<div class="basic_fragment">Here\'s a basic fragment</div>');
            });
        });

        it("should render the fragment title in an h3 above the textarea", function() {
            loadFixtures('simple.html');
            $(function(){
                $("#tdcss").tdcss();
                expect($('.tdcss-elements:first .tdcss-fragment:first .tdcss-code-example h3').text()).toBe('Basic fragment');
            });
        });

        it("should render section dividers above each set of fragments that belong to a section", function() {
            loadFixtures('multiple-sections.html');
            $(function(){
                $("#tdcss").tdcss();

                var elements = $('.tdcss-elements:first');

                expect(tdcss[0].fragments[0].section).toBe("Basic section");
                expect($('> div:eq(0) h2', elements).text()).toBe("Basic section");

                expect($('> div:eq(0)', elements).attr("class")).toBe("tdcss-section");
                expect($('> div:eq(1)', elements).attr("class")).toBe("tdcss-fragment");
                expect($('> div:eq(2)', elements).attr("class")).toBe("tdcss-fragment");
                expect($('> div:eq(3)', elements).attr("class")).toBe("tdcss-fragment");

                expect(tdcss[0].fragments[4].section).toBe("New section");
                expect($('> div:eq(4) h2', elements).text()).toBe("New section");

                expect($('> div:eq(4)', elements).attr("class")).toBe("tdcss-section");
                expect($('> div:eq(5)', elements).attr("class")).toBe("tdcss-fragment");
                expect($('> div:eq(6)', elements).attr("class")).toBe("tdcss-fragment");

            });

        });

        it("should fix the height of the dom-example container, if a value is specified", function() {
            loadFixtures('multiple-sections.html');
            $(function(){
                $("#tdcss").tdcss();
                expect($(".tdcss-elements:first .tdcss-fragment:eq(4)").attr("style")).toContain("500px");
            });

        });

        it("should render fragment rows, even if no sections are specified", function() {
            loadFixtures('simple-no-meta.html');
            $(function(){ $("#tdcss").tdcss(); });

            expect($('.tdcss-elements:first > div:first').attr("class")).toBe('tdcss-fragment');
            expect($('.tdcss-elements:first .tdcss-fragment').length).toBe(1);
        });
    });

    describe("Interaction", function() {
        it("should collapse and expand sections, when section header is clicked", function() {
            loadFixtures('multiple-sections.html');
            $(function(){
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
        });

        it("should store information on collapsed sections in url fragment", function() {
            loadFixtures('multiple-sections.html');
            $(function(){
                $("#tdcss").tdcss();

                var first_section_header = $('.tdcss-elements:first .tdcss-section:first'),
                    second_section_header = $('.tdcss-elements:first .tdcss-section:eq(1)');

                first_section_header.click();
                expect(window.location.hash).toContain( first_section_header.attr("id") );

                second_section_header.click();

                expect(window.location.hash).toContain( first_section_header.attr("id") );

            });


        });

        it("should remove information on collapsed sections from url fragment, when they are shown again", function() {
            loadFixtures('multiple-sections.html');
            $(function(){
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


        });

        it("should restore section collapsed states based on url when loading page", function() {
            loadFixtures('multiple-sections.html');
            window.location.hash = "Basic%20section;";
            $(function(){
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

    })

});