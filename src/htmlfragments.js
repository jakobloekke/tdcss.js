(function ($) {
    "use strict";

    var fragment_identifier = "### ";

    function init() {

        var last_section_name;

        $("body").wrapInner("<div id='fragments'></div>").append('<table id="elements"></table>');

        rawFragments().each(function(i, e){

            var section_name = e.nodeValue.split(fragment_identifier)[1],
                fragment_html = $(e).siblings()[i].outerHTML;

            if (section_name !== last_section_name) {
                addNewSection(section_name);
                last_section_name = section_name;
            }

            addNewFragment(fragment_html);

        });
    }

    function rawFragments () {
        return $("body #fragments").contents().filter(
            function(){
                return this.nodeType === 8 && this.nodeValue.match(new RegExp(fragment_identifier));
            }
        );
    }

    function addNewSection (section_name) {
        $("#elements").append('<tr class="section"><td colspan="2"><h2>' + section_name + '</h2></td></tr>');
    }

    function addNewFragment (fragment_html) {
        $("#elements").append('<tr><td>' + fragment_html + '</td><td><textarea readonly>' + fragment_html + '</textarea></td></tr>');
    }

    $(function(){
        init();
    });

}($));

