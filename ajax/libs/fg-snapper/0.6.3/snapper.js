/* snapper css snap points carousel */
;(function( w, $ ){
	var pluginName = "snapper";
	$.fn[ pluginName ] = function(){
		var testProp = "scroll-snap-type";
		var snapSupported = w.CSS && w.CSS.supports && ( w.CSS.supports( testProp, "mandatory") || w.CSS.supports("-webkit-" + testProp, "mandatory")  || w.CSS.supports("-ms-" + testProp, "mandatory") );

		// optional: include overthrow.toss() in your page to get a smooth scroll, otherwise it'll just jump to the slide
		function goto( elem, x, nothrow ){
			if( typeof w.overthrow !== "undefined" && !nothrow ){
				w.overthrow.toss( elem, { left: x } );
			}
			else {
				elem.scrollLeft = x;
			}
		}

		return this.each(function(){
			var self = this;
			var addNextPrev = $( self ).is( "[data-" + pluginName + "-nextprev]" );
			var $slider = $( "." + pluginName + "_pane", self );
			var enhancedClass = pluginName + "-enhanced";
			var $itemsContain = $slider.find( "." + pluginName + "_items" );
			var $items = $itemsContain.children();
			var numItems = $items.length;
			var $nav = $( "." + pluginName + "_nav", self );
			var navSelectedClass = pluginName + "_nav_item-selected";

			$( self ).addClass( enhancedClass );
			$itemsContain.css( "width", numItems * 100 + "%" );
			$items.css( "width", 100 / numItems + "%" );

			if( addNextPrev ){
				var	$nextprev = $( '<ul class="snapper_nextprev"><li class="snapper_nextprev_item"><a href="#prev" class="snapper_nextprev_prev">Prev</a></li><li class="snapper_nextprev_item"><a href="#next" class="snapper_nextprev_next">Next</a></li></ul>' );
				$nextprev.appendTo( self );
			}

			// even if CSS snap is supported, this click binding will allow deep-linking to slides without causing the page to scroll to the carousel container
			$( "a", this ).bind( "click", function( e ){
				var slideID = $( this ).attr( "href" );
				var currScroll = $slider[ 0 ].scrollLeft;
				var width = $itemsContain.width();
				var itemWidth = $items.eq(0).width();

				if( $( this ).is( ".snapper_nextprev_next" ) ){
					e.preventDefault();
					if( currScroll === width - itemWidth ){
						return first();
					}
					else {
						return next();
					}
				}
				if( $( this ).is( ".snapper_nextprev_prev" ) ){
					e.preventDefault();
					if( currScroll === 0 ){
						return last();
					}
					else {
						return prev();
					}
				}
				if( slideID.indexOf( "#" ) === -1 ){
					// only local anchor links
					return;
				}
				e.preventDefault();
				var $slide = $( slideID, self );
				goto( $slider[ 0 ], $slide[ 0 ].offsetLeft );
				if( "replaceState" in w.history ){
					w.history.replaceState( {}, document.title, slideID );
				}
			});


			// snap to nearest slide
			function snapScroll(){
				var currScroll = $slider[ 0 ].scrollLeft;
				var width = $itemsContain.width();
				var itemWidth = $items.eq(0).width();
				var roundedScroll = Math.round(currScroll/itemWidth)*itemWidth;
				if( roundedScroll > width ){
					roundedScroll = width;
				}
				if( roundedScroll !== currScroll ){
					goto( $slider[ 0 ], roundedScroll );
				}
			}

			// retain snapping on resize (necessary even in scroll-snap supporting browsers, unfortunately)
			var startSlide;
			var afterResize;
			function snapStay(){
				var currScroll = $slider[ 0 ].scrollLeft;
				var numItems = $items.length;
				var width = $itemsContain.width();
				if( startSlide === undefined ){
					startSlide = Math.round(  ( currScroll / width * numItems ) );
				}
				if( afterResize ){
					clearTimeout( afterResize );
				}
				afterResize = setTimeout( function(){
					goto( $slider[ 0 ], $items[ startSlide ].offsetLeft, true );
					startSlide = afterResize = undefined;
				}, 50 );
			}
			$( w ).bind( "resize", snapStay );

			function next(){
				goto( $slider[ 0 ], $slider[ 0 ].scrollLeft + $slider[ 0 ].offsetWidth );
			}

			function prev(){
				goto( $slider[ 0 ], $slider[ 0 ].scrollLeft - $slider[ 0 ].offsetWidth );
			}

			function first(){
				goto( $slider[ 0 ], 0 );
			}

			function last(){
				goto( $slider[ 0 ], $itemsContain.width() );
			}

			$( this )
				.attr( "tabindex", "0" )
				.bind( "keyup", function( e ){
					if( e.keyCode === 37 || e.keyCode === 38 ){
						e.preventDefault();
						prev();
					}
					if( e.keyCode === 39 || e.keyCode === 40 ){
						e.preventDefault();
						next();
					}
				} );

			// update thumbnail state on pane scroll
			if( $nav.length ){
				function activeItem(){
					var currScroll = $slider[ 0 ].scrollLeft;
					var width = $itemsContain.width();
					var activeIndex = Math.round( currScroll / width * numItems );
					$nav
						.children().removeClass( navSelectedClass )
						.eq( activeIndex )
						.addClass( navSelectedClass );
				}
				// set active item on scroll
				$slider.bind( "scroll", activeItem );
				// set active item on init
				activeItem();
			}

			// apply snapping after scroll, in browsers that don't support CSS scroll-snap
			function polyfillSnap(){
				var scrollStop;
				$slider.bind( "scroll", function(){
					if( scrollStop ){
						clearTimeout( scrollStop );
					}
					scrollStop = setTimeout( snapScroll, 50 );
				});
			}

			// polyfill if unsupported
			if( !snapSupported ){
				polyfillSnap();
			}
		});
	};

	// auto-init
	$( document ).bind( "enhance", function( e ){
		$( "." + pluginName, e.target ).add( e.target ).filter( "." + pluginName )[ pluginName ]();
	});
}( this, jQuery ));
