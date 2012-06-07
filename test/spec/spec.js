describe("TDCSS", function() {

    beforeEach(function() {
        
    });

    afterEach(function() {
        window.location.hash = "";
    });

    describe("Setup", function() {
        it("should hide the initial HTML inside the #tdcss div", function() {
            loadFixtures('simple.html');
            expect($('#shouldbehidden')).toHaveHtml("This should be hidden");
            expect($('#shouldbehidden').is(":visible")).toBe(true);

            $(function(){ $("#tdcss").tdcss(); });

            expect($('#shouldbehidden').is(":visible")).toBe(false);
        });

        it("should insert a basic div wrapper for viewing the tests", function(){
            loadFixtures('simple.html');
            $(function(){ $("#tdcss").tdcss(); });

            expect($('body')).toContain('#elements');
        });
    });



    describe("Rendering", function() {
        it("should render a row per fragment", function() {
            loadFixtures('simple.html');
            $(function(){
                $("#tdcss").tdcss();
                console.log($("#tdcss"));
                expect($('#elements')).toContain(".fragment");
            });


        });

        it("should render the DOM example in an iframe", function() {
            loadFixtures('simple.html');
            $(function(){ $("#tdcss").tdcss(); });

            var iframe = $('#elements .fragment iframe')[0].contentDocument;
            expect(iframe.body.innerHTML).toContain("Here's a basic fragment");

        });

        it("should render the fragment HTML in a textarea", function() {
            loadFixtures('simple.html');
            $(function(){ $("#tdcss").tdcss(); });

            expect($('#elements .fragment textarea').text()).toBe('<div class="basic_fragment">Here\'s a basic fragment</div>');
        });

        it("should render the fragment title in an h3 above the textarea", function() {
            loadFixtures('simple.html');
            $(function(){ $("#tdcss").tdcss(); });

            expect($('#elements .fragment:first .code-example h3').text()).toBe('Basic fragment');
        });

        it("should render section dividers above each set of fragments that have similar section names specified", function() {
            loadFixtures('multiple-sections.html');
            $(function(){ $("#tdcss").tdcss(); });

            expect(tdcss.fragments[0].section).toBe("Basics");
            expect($('#elements div:eq(0) h2').text()).toBe("Basics");

            expect($('#elements > div:eq(0)').attr("class")).toBe("section");
            expect($('#elements > div:eq(1)').attr("class")).toBe("fragment");
            expect($('#elements > div:eq(2)').attr("class")).toBe("fragment");
            expect($('#elements > div:eq(3)').attr("class")).toBe("fragment");

            expect(tdcss.fragments[4].section).toBe("New section");
            expect($('#elements > div:eq(4) h2').text()).toBe("New section");

            expect($('#elements > div:eq(4)').attr("class")).toBe("section");
            expect($('#elements > div:eq(5)').attr("class")).toBe("fragment");
            expect($('#elements > div:eq(6)').attr("class")).toBe("fragment");
        });

        it("should fix the height of the dom-example container, if a value is specified", function() {
            loadFixtures('multiple-sections.html');
            $(function(){ $("#tdcss").tdcss(); });

            expect($('#elements > div:eq(6) .dom-example').attr("style")).toContain("500px");
        });

        it("should render fragment rows, even if no sections are specified", function() {
            loadFixtures('simple-no-meta.html');
            $(function(){ $("#tdcss").tdcss(); });

            expect($('#elements > div:first').attr("class")).toBe('fragment');
            expect($('#elements .fragment').length).toBe(1);
        });
    });

    describe("Interaction", function() {
        it("should collapse and expand sections, when section header is clicked", function() {
            loadFixtures('multiple-sections.html');
            $(function(){ $("#tdcss").tdcss(); });

            var section_header = $('#elements .section:first'),
                section_fragment_1 = $(section_header).next(".fragment"),
                section_fragment_2 = $(section_fragment_1).next(".fragment"),
                section_fragment_3 = $(section_fragment_2).next(".fragment"),
                other_section_fragment = $("#elements .section:eq(1)").next(".fragment");

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
            $(function(){ $("#tdcss").tdcss(); });

            var first_section_header = $('#elements .section:first'),
                second_section_header = $('#elements .section:eq(1)');

            first_section_header.click();
            expect(window.location.hash).toContain( decodeURIComponent(first_section_header.attr("id")) );

            second_section_header.click();

            expect(window.location.hash).toContain( decodeURIComponent(first_section_header.attr("id")) );

        });

        it("should remove information on collapsed sections from url fragment, when they are shown again", function() {
            loadFixtures('multiple-sections.html');
            $(function(){ $("#tdcss").tdcss(); });

            var first_section_header = $('#elements .section:first'),
                second_section_header = $('#elements .section:eq(1)');

            first_section_header.click();
            second_section_header.click();

            first_section_header.click();
            expect(window.location.hash).toNotContain(first_section_header.attr("id"));

            second_section_header.click();
            expect(window.location.hash).toNotContain(second_section_header.attr("id"));

        });

        it("should restore section collapsed states based on url when loading page", function() {
            loadFixtures('multiple-sections.html');
            window.location.hash = "Basics;";
            $(function(){ $("#tdcss").tdcss(); });

            var section_fragment_1 = $('#elements .section:first').next(".fragment"),
                section_fragment_2 = $(section_fragment_1).next(".fragment"),
                section_fragment_3 = $(section_fragment_2).next(".fragment"),
                other_section_fragment = $("#elements .section:eq(1)").next(".fragment");

            expect(section_fragment_1.is(":visible")).toBe(false);
            expect(section_fragment_2.is(":visible")).toBe(false);
            expect(section_fragment_3.is(":visible")).toBe(false);
            expect(other_section_fragment.is(":visible")).toBe(true);

        });

    })

});