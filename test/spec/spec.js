var module = tdcss;

describe("TDCSS module", function() {
    beforeEach(function() {
        expect(typeof module).toBe("object");
        module.fragments.length = 0; //Reset the module
        window.location.hash = "";
    });

    it("should self-instantiate as a js object", function() {
        expect(typeof module).toBe("object");
    });

    describe("Setup", function() {
        it("should hide the initial HTML inside the #tdcss div", function() {
            loadFixtures('simple.html');
            expect($('#shouldbehidden')).toHaveHtml("This should be hidden");
            expect($('#shouldbehidden').is(":visible")).toBe(true);
            tdcss.init();
            expect($('#shouldbehidden').is(":visible")).toBe(false);
        });

        it("should insert a basic html table structure for viewing the tests", function(){
            loadFixtures('simple.html');
            tdcss.init();
            expect($('body')).toContain('table#elements');
        });
    });

    describe("Parsing", function() {
        it("should expose an object for containing fragment data", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect(typeof tdcss.fragments).toBe("object");
        });

        it("should identify fragments by the fragment identifier in comments (###)", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect(tdcss.fragments.length).toBe(1);
        });

        it("should interpret the first part of the comment text as the fragment title", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect(tdcss.fragments[0].title).toBe("Basic fragment");
        });

        it("should interpret the second part of the comment text as the fragment section", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect(tdcss.fragments[0].section).toBe("Basics");
        });

        it("should interpret the third part of the comment text as the fragment height", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect(tdcss.fragments[0].height).toBe("300px");
        });

        it("should work when no meta info is defined", function() {
            loadFixtures('simple-no-meta.html');
            tdcss.init();
            expect(tdcss.fragments[0].title).toBeFalsy();
            expect(tdcss.fragments[0].section).toBeFalsy();
            expect(tdcss.fragments[0].height).toBeFalsy();
            expect(tdcss.fragments[0].html).toContain('<div class="basic_fragment">');
        });

        it("should work when no section is defined", function() {
            loadFixtures('simple-no-section.html');
            tdcss.init();
            expect(tdcss.fragments[0].section).toBeFalsy();
        });

        it("should ignore fragments with no html", function() {
            loadFixtures('simple-no-html.html');
            tdcss.init();
            expect(tdcss.fragments.length).toBe(2);
        });
    });

    describe("Rendering", function() {
        it("should render a table row per fragment", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect($('#elements')).toContain("tr.fragment");
        });

        it("should render the DOM example in the left side td", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect($('#elements tr.fragment:first td:first')).toContain("div.basic_fragment");
            expect($('#elements tr.fragment:first td:first').text()).toBe("Here's a basic fragment");
        });

        it("should render the fragment HTML in the right side textarea", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect($('#elements tr.fragment:first td:eq(1) textarea').text()).toBe('<div class="basic_fragment">Here\'s a basic fragment</div>');
        });

        it("should render the fragment title in an h3 above the right side textarea", function() {
            loadFixtures('simple.html');
            tdcss.init();
            expect($('#elements tr.fragment:first td:eq(1) h3').text()).toBe('Basic fragment');
        });

        it("should render section dividers above each set of fragments with the same section specified", function() {
            loadFixtures('multiple-sections.html');
            tdcss.init();

            expect(tdcss.fragments[0].section).toBe("Basics");
            expect($('#elements tr:eq(0) h2').text()).toBe("Basics");

            expect($('#elements tr:eq(0)').attr("class")).toBe("section");
            expect($('#elements tr:eq(1)').attr("class")).toBe("fragment");
            expect($('#elements tr:eq(2)').attr("class")).toBe("fragment");
            expect($('#elements tr:eq(3)').attr("class")).toBe("fragment");

            expect(tdcss.fragments[4].section).toBe("New section");
            expect($('#elements tr:eq(4) h2').text()).toBe("New section");

            expect($('#elements tr:eq(4)').attr("class")).toBe("section");
            expect($('#elements tr:eq(5)').attr("class")).toBe("fragment");
            expect($('#elements tr:eq(6)').attr("class")).toBe("fragment");
        });

        it("should fix the height of the left td, if a value is specified", function() {
            loadFixtures('multiple-sections.html');
            tdcss.init();

            expect($('#elements tr:eq(6) td:first').attr("style")).toContain("500px");
        });

        it("should render fragment rows, even if no sections are specified", function() {
            loadFixtures('simple-no-meta.html');
            tdcss.init();
            expect($('#elements tr.fragment:first').attr("class")).toBe('fragment');
            expect($('#elements tr.fragment').length).toBe(1);
        });
    });

    describe("Interaction", function() {
        it("should collapse and expand sections, when section header is clicked", function() {
            loadFixtures('multiple-sections.html');
            tdcss.init();

            var section_header = $('#elements tr.section:first'),
                section_fragment_1 = $(section_header).next("tr.fragment"),
                section_fragment_2 = $(section_fragment_1).next("tr.fragment"),
                section_fragment_3 = $(section_fragment_2).next("tr.fragment"),
                other_section_fragment = $("#elements tr.section:eq(1)").next("tr.fragment");

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

        it("should store information on collapsed sections in url fragment", function() {
            loadFixtures('multiple-sections.html');
            tdcss.init();

            var first_section_header = $('#elements tr.section:first'),
                second_section_header = $('#elements tr.section:eq(1)');

            first_section_header.click();
            expect(window.location.hash).toContain("Basics");

            second_section_header.click();
            expect(window.location.hash).toContain("New%20section");

        });

        it("should remove information on collapsed sections from url fragment, when they are shown again", function() {
            loadFixtures('multiple-sections.html');
            tdcss.init();

            var first_section_header = $('#elements tr.section:first'),
                second_section_header = $('#elements tr.section:eq(1)');

            first_section_header.click();
            second_section_header.click();

            first_section_header.click();
            expect(window.location.hash).toNotContain("Basics");

            second_section_header.click();
            expect(window.location.hash).toNotContain("New%20section");

        });

        it("should restore section collapsed states based on url when loading page", function() {
            loadFixtures('multiple-sections.html');
            window.location.hash = "Basics;";
            tdcss.init();

            var section_fragment_1 = $('#elements tr.section:first').next("tr.fragment"),
                section_fragment_2 = $(section_fragment_1).next("tr.fragment"),
                section_fragment_3 = $(section_fragment_2).next("tr.fragment"),
                other_section_fragment = $("#elements tr.section:eq(1)").next("tr.fragment");

            expect(section_fragment_1.is(":visible")).toBe(false);
            expect(section_fragment_2.is(":visible")).toBe(false);
            expect(section_fragment_3.is(":visible")).toBe(false);
            expect(other_section_fragment.is(":visible")).toBe(true);

        });

    })

});