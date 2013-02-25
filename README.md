tdcss.js - Super simple styleguide tool
================

TDCSS aims to help you write solid, maintainable and modular CSS.

It's especially well suited to adopt a test-driven approach to CSS styling - but of course you may just as well use it to build a regular online styleguide.

![tdcss.js in action](https://dl.dropbox.com/u/2886688/web/tdcss.js/demo/preview.png)

What's the benefit over other styleguide tools?
---
- **No server tech dependencies** (no need for node.js, Ruby, PHP, etc.) - TDCSS is just a jQuery plugin that works on flat HTML files.
- **No markup bloat** - TDCSS uses HTML comments for structuring.
- **Hassle-free setup** - Flat files make it super-easy to use TDCSS together with Livereload or similar browser refresh tools for an efficient workflow.

Demo
---
[Introduction presentation from Frontendersdk meetup ...](http://prezi.com/piifihs2ohet/test-driven-css/ "A prezi")

[See it in action ...](https://dl.dropbox.com/u/2886688/web/tdcss.js/index.html "TDCSS.js demo")

In the head:
```html
<!-- Your own CSS -->
<link rel="stylesheet" href="demo/style.css" type="text/css" media="screen">

<!-- TDCSS -->
<link rel="stylesheet" href="src/tdcss.css" type="text/css" media="screen">
<script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/jquery/1.8.1/jquery.min.js"></script>
<script type="text/javascript" src="src/tdcss.js"></script>
<script type="text/javascript">
     $(function(){
         $("#tdcss").tdcss();
     })
</script>
```

The markup:
```html
<div id="tdcss">

	<!-- # Box styles -->
	<!-- & Box styles is a collection of generic boxes. -->
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

	<!-- # Typography -->
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


Usage
---

An html comment with prefix ":" means the start of a fragment:
```html
<!-- : -->
```

The (optional) first text after the prefix becomes the title of the fragment:
```html
<!-- : Element title -->
```

Fix the height of the fragment container by appending a CSS height value after a semicolon.
This is useful for position:absolute type layouts that don't by themselfes expand their container:
```html
<!-- : Element title; 400px -->
```

You can make section dividers by inserting a section comment:
```html
<!-- # Section name -->
```

You may also place description blocks anywhere in your markup:
```html
<!-- & Descriptive text -->
```
