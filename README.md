htmlfragments.js
================

A very small framework for structured/TDD-style HTML/CSS development.

Inspired by the modular approach of OOCSS and SMACSS. Meant to help frontend-developers write more solid and modular code by styling design elements iin isolation.

Usage
---

Insert an html comment with the name of the section of the design element (eg. "menu" or "widget").
Then, after the comment, add the html needed for the particular design element.

<!-- ### Demo elements -->
<p>This is a demo element.</p>

htmlfragments.js will use the comment to present your design elements in a nice, structured way - which is also useful as a reference when communicating with designers or other developers on your team.