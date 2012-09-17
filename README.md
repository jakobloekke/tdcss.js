tdcss.js - Test-driven CSS development
================

TDCSS is a jQuery plugin that helps you write solid and reusable HTML and CSS.

You can use it just as a styleguide tool, but it's especially well suited to adopt a test-driven approach to styling.



What's the benefit over other styleguide tools?
---
- *No server dependencies* (no node.js, Ruby, PHP, etc.) - TDCSS is a simple to use jQuery plugin.
- *No markup bloat!* TDCSS uses HTML comments for structuring.
- *Snappy workflow.* Flat files makes it super-easy to use TDCSS together with Livereload or similar browser refresh tools for an efficient workflow.


Demo
---
Here's the markup that produces the screenshot below:
```html
<div id="tdcss">


	<!-- # Box styles -->

	<!-- : Basic box -->
	<div class="box">
	    <p>This is a basic box.</p>
	</div>

	<!-- : Notice box -->
	<div class="box-notice">
	    <p>This is a notice box.</p>
	</div>

	<!-- : Warning box -->
	<div class="box-warning">
	    <p>This is a warning box.</p>
	</div>

	<!-- : Alert box -->
	<div class="box-alert">
	    <p>This is an alert box.</p>
	</div>


	<!-- # typography -->

	<!-- : H1 -->
	<h1>This is an H1 header.</h1>
	<!-- : H2 -->
	<h2>This is an H2 header</h2>
	<!-- : H3 -->
	<h3>This is an H3 header</h3>



	<!-- # Custom height -->

	<!-- : Some element that needs a lot of space; 700px -->
	<h3>This is a test.</h3>



</div>
```

![How it looks](https://github.com/jakobloekke/tdcss.js/raw/master/demo/preview.png)


How to use
---

Insert a reference to jQuery and the tdcss files, then apply $.tdcss() on the container holding your fragments:
```html
<link rel="stylesheet" href="src/tdcss.css" type="text/css" media="screen">

<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js"></script>
<script type="text/javascript" src="src/tdcss.js"></script>

<script type="text/javascript">
     $(function(){
         $("#tdcss").tdcss();
     })
</script>
```

Also, you need to reference the stylesheet(s) that you will be testing:
```html
<!-- Project CSS -->
<link rel="stylesheet" href="demo/style.css" type="text/css" media="screen">
```

Inside a div with the id #tdcss, insert an html comment with the text ":" to denote a fragment:
```html
<!-- : -->
```

The first text after the prefix becomes the title of the fragment:
```html
<!-- : Element title -->
```

You can fix the height of the fragment container by appending a CSS height value after a semicolon.
This is useful for position:absolute type layouts that don't by themselfes force the container to expand:
```html
<!-- : Element title; 400px -->
```

You can order your fragments into sections by inserting a section comment:
```html
<!-- # Section name -->
```

You can customize the syntax by passing a settings object to $.tdcss():
```javascript
$("#my-fragments").tdcss({
	section_identifier: "#",
	fragment_identifier: ":",
	fragment_info_splitter: ";"
});
```


Requirements
---
tdcss.js works in all modern browsers.