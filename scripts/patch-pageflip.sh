#!/bin/bash
# Patch page-flip library to require dragging 30% past center to complete a flip
# (default is x<=0 which means just crossing the spine)
sed -i.bak 's/t\.x<=0?this\.animateFlippingTo(t,{x:-e\.pageWidth/t.x<=-e.pageWidth*0.6?this.animateFlippingTo(t,{x:-e.pageWidth/' node_modules/page-flip/dist/js/page-flip.module.js
sed -i.bak 's/t\.x<=0?this\.animateFlippingTo(t,{x:-e\.pageWidth/t.x<=-e.pageWidth*0.6?this.animateFlippingTo(t,{x:-e.pageWidth/' node_modules/page-flip/dist/js/page-flip.browser.js
rm -f node_modules/page-flip/dist/js/*.bak
echo "Patched page-flip flip threshold"
