/*
 * jquery.elementStacks.
 * Stacks elements/images on top of each other with a funky transition.
 *
 * Jquery version of http://mootools.net/forge/p/elementstack
 * by Oskar Krawczyk (http://nouincolor.com).
 *
 * Copyright (c) 2010 Marco Fucci
 * http://www.marcofucci.com/tumblelog/15/mar/2010/elementstack_v1-1/
 *
 * Licensed under MIT
 * http://www.opensource.org/licenses/mit-license.php
 *
 * Launch  : January 2010
 * Version : 1.1
 * Released: 10th Jan, 2010
 */

(function($) {
    var defaultStuckWithItemFunc = function(wrapper, opts) {
        var selector = [opts.itemsSelector, ":"];
        if (opts.stuckWithItem == 'first' || opts.stuckWithItem == 'last') {
            selector.push(opts.stuckWithItem);
        } else {
            selector.push("eq(", opts.stuckWithItem, ")");
        }
        return $(selector.join(""), wrapper)
    };
    
    $.fn.elementStacks = function(options) {
        var opts = $.extend({}, $.fn.elementStacks.defaults, options);

        return this.each(function() {
            var pos, collapsed = false, stackItems = $(opts.itemsSelector, this).css({'z-index': 10});

            var $that = this;
            stackItems
                .each(function(index, img) {
                    $(img)
                        .attr('coords', this.offsetTop + ':' + this.offsetLeft)
                        .css({'top' : this.offsetTop, 'left' : this.offsetLeft });
                })
                .css({'position': 'absolute'})
                .click(function(e) {
                    var $this = $(this);
                    
                    if (!$this.attr('coords')) {
                        return;
                    };
                    
                    collapsed = !collapsed;
                    var target = (collapsed) ?
                        (
                            (opts.stuckWithItem != null) ?
                                $((jQuery.isFunction(opts.stuckWithItem) ?
                                     opts.stuckWithItem : defaultStuckWithItemFunc
                                ).call(this, $that, opts)) : $this
                        ).css({'z-index': 100}) : null;
                    $this.one('stackfinished', function() {
                        if (!target) {
                            stackItems.css({'z-index': 10});
                        }
                    });
                    stackItems.each(function(index, stackItem) {
                        setTimeout(function() {
                            $.fn.elementStacks.reStack.call($this, $(stackItem), collapsed, opts, target, index, index == stackItems.length -1);
                        }, opts.delay * index);
                    });
                });
            
            if (opts.initialCollapse) {
                $(opts.itemsSelector + ":eq(0)", $that).click();
            }
        });
    };
    
    $.fn.elementStacks.defaults = {
        'itemsSelector': 'img',
        'rotationDeg': 20,
        'delay': 40,
        'duration': 900,
        'transaction': 'swing',
        'stuckWithItem': null, //null, 'first', last', function or index of the stuck element (0-based)
        'initialCollapse': false //true if you want the initial state to be collapsed
    };
    
    $.fn.elementStacks.random = function(min, max) {
        return Math.floor(Math.random() * (max - min + 1) + min);
    };
    
    $.fn.elementStacks.reStack = function(stackItem, collapsing, options, target, index, last) {
        var coords = (target ? target : stackItem).attr('coords').split(':');
        var rand = (collapsing ? $.fn.elementStacks.random(-options.rotationDeg, options.rotationDeg) : 0);
    
        var $that = this;
        stackItem.css({
            '-webkit-transform': 'rotate(' + rand + 'deg)',
            '-moz-transform': 'rotate(' + rand + 'deg)'
        }).animate({
                top: parseInt(coords[0]) + rand,
                left: parseInt(coords[1]) + rand
            }, options.duration,
            options.transaction,
           function() {
               if (last) {
                   $that.trigger('stackfinished');
               }
           }
        );
    };
})(jQuery);