(function($) {
    "use strict";

    var fragment_identifier = "### ";

    function init() {

        var last_section_name,
            section_name;

        $("body")
            .wrapInner("<div id='fragments'></div>")
            .append('<table id="elements"></table>');

        /*  
         *  Main loop.
         *  Grabs each fragment, identified by a comment block
         *  that has the fragment identifier prefix ('###' by default).
         *  Then gets the succeeding html fragment and renders it if it contains actual elements.
         */
        rawFragments().each(function(i, e) {

            section_name = e.nodeValue.split(fragment_identifier)[1];

            // Make new section when needed:
            if (section_name !== last_section_name) {
                addNewSection(section_name);
                last_section_name = section_name;
            }

           addNewFragment( getFragmentHTML(e) );

        });
    }

    function rawFragments() {
        return $("body #fragments").contents().filter(
            function() {
                return this.nodeType === 8 && this.nodeValue.match(new RegExp(fragment_identifier));
            }
        );
    }

    function addNewSection(section_name) {
        $("#elements").append('<tr class="section"><td colspan="2"><h2>' + section_name + '</h2></td></tr>');
    }

    function addNewFragment(fragment_html) {
        if (typeof fragment_html !== "undefined") {
            $("#elements").append('<tr><td>' + fragment_html + '</td><td><textarea readonly>' + fragment_html + '</textarea></td></tr>');
        }
    }

    function getFragmentHTML(e) {
        var fragment = e.nextSibling.nextSibling;

        // Check if next sibling is a comment or a real html fragment to be rendered
        if (fragment.nodeType !== 8) {
            return fragment.outerHTML;
        } else {
            return false;
        }
    }

    $(function() {
        init();
    });

} ($));

