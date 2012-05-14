tdcss.js - Test-driven CSS
================

A very small framework for structured/TDD-style HTML/CSS development.

Inspired by the modular approach of OOCSS and SMACSS.
Meant to help frontend-developers write solid and modular code by styling design elements in isolation.

How to use
---

Inside a div with the id #tdcss, insert an html comment with the text "###" to denote a fragment.

The first text after the prefix is the title of the fragment.

Then, if you insert a semi-colon, you can specify what *section* thefragment belongs to.

And finally, if you insert another semicolon, you can fix the height of the fragment container. This is useful for position:absolute type layouts.

<div id="tdcss">

<!-- ### Demo element -->
<div class="some-structure">
    <p>This is a demo element.</p>
</div>

<!-- ### Another demo elements -->
<a href="#">This is a demo link.</a>


<!-- ### H1; typography -->
<h1>This is a test.</h1>

<!-- ### H2; typography -->
<h2>This is a test.</h2>

<!-- ### H3; typography -->
<h3>This is a test.</h3>


<!-- ### Some element that needs a lot of space; Custom height; 500px -->
<h3>This is a test.</h3>

</div>


In the header, insert a reference to tdcss.js and jQuery, then call tdcss.init() on dom ready:

<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>

<script type="text/javascript" src="src/tdcss.js"></script>

<script type="text/javascript">
     $(function(){
         tdcss.init();
     })
</script>


tdcss.js will interpret the comments and present your design elements in a nice, structured way.
The point is to help you make your design elements context independent.

![How it looks](https://github.com/jakobloekke/htmlfragments.js/raw/master/demo/preview.png)