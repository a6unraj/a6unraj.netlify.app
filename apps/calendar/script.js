;( function( $, window, undefined ) {	
	'use strict';
	$.Calendario = function( options, element ) {		
		this.$el = $( element );
		this._init( options );
		
	};

	// the options
	$.Calendario.defaults = {
		weeks : [ 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday' ],
		weekabbrs : [ 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat' ],
		months : [ 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ],
		monthabbrs : [ 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec' ],
		displayWeekAbbr : false,
		displayMonthAbbr : false,
		startIn : 1,
		onDayClick : function( $el, $content, dateProperties ) { return false; }
	};
	$.Calendario.prototype = {
		_init : function( options ) {			
			// options
			this.options = $.extend( true, {}, $.Calendario.defaults, options );
			this.today = new Date();
			this.month = ( isNaN( this.options.month ) || this.options.month == null) ? this.today.getMonth() : this.options.month - 1;
			this.year = ( isNaN( this.options.year ) || this.options.year == null) ? this.today.getFullYear() : this.options.year;
			this.caldata = this.options.caldata || {};
			this._generateTemplate();
			this._initEvents();

		},
		_initEvents : function() {
      var self = this;
			this.$el.on( 'click.calendario', 'div.fc-row > div', function() {
				var $cell = $( this ),
					idx = $cell.index(),
					$content = $cell.children( 'div' ),
					dateProp = {
						day : $cell.children( 'span.fc-date' ).text(),
						month : self.month + 1,
						monthname : self.options.displayMonthAbbr ? self.options.monthabbrs[ self.month ] : self.options.months[ self.month ],
						year : self.year,
						weekday : idx + self.options.startIn,
						weekdayname : self.options.weeks[ idx + self.options.startIn ]
					};
				if( dateProp.day ) {self.options.onDayClick( $cell, $content, dateProp );}
			} );
		},
		_generateTemplate : function( callback ) {

			var head = this._getHead(),	body = this._getBody(),	rowClass;
			switch( this.rowTotal ) {
				case 4 : rowClass = 'fc-four-rows'; break;
				case 5 : rowClass = 'fc-five-rows'; break;
				case 6 : rowClass = 'fc-six-rows'; break;
			}
			this.$cal = $('<div class="fc-calendar '+rowClass+'">').append( head,body );
			this.$el.find( 'div.fc-calendar' ).remove().end().append( this.$cal );
			if( callback ) { callback.call(); }
		},
		_getHead : function() {

			var html = '<div class="fc-head">';		
			for ( var i = 0; i <= 6; i++ ) {
				var pos = i + this.options.startIn,
					j = pos > 6 ? pos - 6 - 1 : pos;
				html += '<div>';
				html += this.options.displayWeekAbbr ? this.options.weekabbrs[ j ] : this.options.weeks[ j ];
				html += '</div>';
			}
			html += '</div>';
			return html;
		},
		_getBody : function() {

			var d = new Date(this.year, this.month+1,0),	monthLength = d.getDate(),firstDay = new Date(this.year,this.month,1);
			this.startingDay = firstDay.getDay();
			var html = '<div class="fc-body"><div class="fc-row">',	day = 1;
			for ( var i = 0; i < 7; i++ ) {
				for ( var j = 0; j <= 6; j++ ) {
					var pos = this.startingDay - this.options.startIn,
						p = pos < 0 ? 6 + pos + 1 : pos,
						inner = '',
						today = this.month === this.today.getMonth() && this.year === this.today.getFullYear() && day === this.today.getDate(),
						content = '';					
					if ( day <= monthLength && ( i > 0 || j >= p ) ) {
						inner += '<span class="fc-date">'+day+'</span><span class="fc-weekday">'+this.options.weekabbrs[j+this.options.startIn>6?j+this.options.startIn-6-1: j+this.options.startIn]+'</span>';
						var strdate = (this.month+1<10?'0'+(this.month+1): this.month+1)+'-'+(day<10?'0'+day: day)+'-'+this.year,dayData = this.caldata[ strdate ];
						if( dayData ) {content = dayData;}
						if( content !== '' ) {inner += '<div>' + content + '</div>';}
						++day;
					}
					var cellClasses = today ? 'fc-today ' : '';
					if( content !== '' ) {cellClasses += 'fc-content';}
					html += cellClasses !== '' ? '<div class="' + cellClasses + '">' : '<div>';
					html += inner;
					html += '</div>';
				}

				// stop making rows if we've run out of days
				if (day > monthLength) {
					this.rowTotal = i + 1;
					break;
				} 
				else {html += '</div><div class="fc-row">';}
			}
			html += '</div></div>';
			return html;
		},
		// based on http://stackoverflow.com/a/8390325/989439
		_isValidDate : function( date ) {

			date = date.replace(/-/gi,'');
			var month = parseInt( date.substring( 0, 2 ), 10 ),
				day = parseInt( date.substring( 2, 4 ), 10 ),
				year = parseInt( date.substring( 4, 8 ), 10 );
			if( ( month < 1 ) || ( month > 12 ) ) {return false;}
			else if( ( day < 1 ) || ( day > 31 ) )  {
				return false;
			}
			else if((( month == 4) || (month == 6) || (month == 9) || (month == 11)) && (day > 30))  {
				return false;
			}
			else if((month == 2) && (((year % 400) == 0) || ((year % 4) == 0)) && ((year % 100) != 0) && (day > 29)) {
				return false;
			}
			else if((month == 2) && ((year % 100) == 0) && (day > 29) )  {return false;}
			return {day : day,month : month,year : year};
		},
		_move : function( period, dir, callback ) {

			if( dir === 'previous' ) {				
				if( period === 'month' ) {
					this.year = this.month > 0 ? this.year : --this.year;
					this.month = this.month > 0 ? --this.month : 11;
				}
				else if( period === 'year' ) {this.year = --this.year;}
			}
			else if( dir === 'next' ) {
				if( period === 'month' ) {
					this.year = this.month < 11 ? this.year : ++this.year;
					this.month = this.month < 11 ? ++this.month : 0;
				}
				else if( period === 'year' ) {this.year = ++this.year;}
			}
			this._generateTemplate( callback );
		},
    getYear : function() {return this.year;},
    getMonth : function() {return this.month + 1;},
		getMonthName : function() {
			return this.options.displayMonthAbbr ? this.options.monthabbrs[ this.month ] : this.options.months[ this.month ];
		},
		getCell : function( day ) {

			var row = Math.floor( ( day + this.startingDay - this.options.startIn ) / 7 ),
				pos = day + this.startingDay - this.options.startIn - ( row * 7 ) - 1;
			return this.$cal.find( 'div.fc-body' ).children( 'div.fc-row' ).eq( row ).children( 'div' ).eq( pos ).children( 'div' );

		},
		setData : function( caldata ) {
			caldata = caldata || {};
			$.extend( this.caldata, caldata );
			this._generateTemplate();

		},
		// goes to today's month/year
		gotoNow : function( callback ) {
			this.month = this.today.getMonth();
			this.year = this.today.getFullYear();
			this._generateTemplate( callback );

		},
		// goes to month/year
		goto : function( month, year, callback ) {
			this.month = month;
			this.year = year;
			this._generateTemplate( callback );
		},
		gotoPreviousMonth : function( callback ) {
			this._move( 'month', 'previous', callback );
		},
		gotoPreviousYear : function( callback ) {
			this._move( 'year', 'previous', callback );
		},
		gotoNextMonth : function( callback ) {
			this._move( 'month', 'next', callback );
		},
		gotoNextYear : function( callback ) {
			this._move( 'year', 'next', callback );
		}
	};
		var logError = function( message ) {
		if ( window.console ) {window.console.error( message );}
	};
		$.fn.calendario = function( options ) {
		var instance = $.data( this, 'calendario' );		
		if ( typeof options === 'string' ) {			
			var args = Array.prototype.slice.call( arguments, 1 );			
			this.each(function() {			
				if ( !instance ) {
					logError( "cannot call methods on calendario prior to initialization; " +
					"attempted to call method '" + options + "'" );
					return;				
				}
				if ( !$.isFunction( instance[options] ) || options.charAt(0) === "_" ) {
					logError( "no such method '" + options + "' for calendario instance" );
					return;				
				}
				instance[ options ].apply( instance, args );			
			});		
		} 
		else {		
			this.each(function() {				
				if ( instance ) {instance._init();}
				else {instance = $.data( this, 'calendario', new $.Calendario( options, this ) );}
			});
		}
		return instance;
	};
})(jQuery,window);

var codropsEvents = {
	'01-01-2013' : '<span>New Year\'s day</span>',
	'11-23-2012' : '<a href="https://tympanus.net/codrops/2012/11/23/three-script-updates/">Three Script Updates</a>',
	'11-21-2012' : '<a href="https://tympanus.net/codrops/2012/11/21/adaptive-thumbnail-pile-effect-with-automatic-grouping/">Adaptive Thumbnail Pile Effect with Automatic Grouping</a>',
	'11-20-2012' : '<a href="https://tympanus.net/codrops/2012/11/20/learning-principles-for-improving-your-css/">Learning Principles for Improving Your CSS</a>',
	'11-19-2012' : '<a href="https://tympanus.net/codrops/2012/11/19/responsive-css-timeline-with-3d-effect/">Responsive CSS Timeline with 3D Effect</a>',
	'11-14-2012' : '<a href="https://tympanus.net/codrops/2012/11/14/creative-css-loading-animations/">Creative CSS Loading Animations</a>',
	'11-13-2012' : '<a href="https://tympanus.net/codrops/2012/11/13/baraja-a-plugin-for-spreading-items-in-a-card-like-fashion/">Baraja: A Plugin for Spreading Items in a Card-Like Fashion</a>',
	'11-12-2012' : '<a href="https://tympanus.net/codrops/2012/11/12/mobile-design-typography-is-vitally-important-and-challenging/">Mobile Design Typography is Vitally Important … and Challenging</a>',
	'11-09-2012' : '<a href="https://tympanus.net/codrops/2012/11/09/responsive-wordpress-theme-giveaway/">Responsive WordPress Theme Giveaway</a>',
	'11-06-2012' : '<a href="https://tympanus.net/codrops/2012/11/06/gamma-gallery-a-responsive-image-gallery-experiment/">Gamma Gallery: A Responsive Image Gallery Experiment</a>',
	'11-02-2012' : '<a href="https://tympanus.net/codrops/2012/11/02/heading-set-styling-with-css/">Heading Set Styling with CSS</a>',			
	'10-30-2012' : '<a href="https://tympanus.net/codrops/2012/10/30/becoming-device-agnostic/">Becoming Device-Agnostic</a>',
	'10-29-2012' : '<a href="https://tympanus.net/codrops/2012/10/29/elastislide-revised/">Elastislide Revised</a>',
	'10-25-2012' : '<a href="https://tympanus.net/codrops/2012/10/25/kick-start-your-project-a-collection-of-handy-css-snippets/">Kick-Start Your Project: A Collection of Handy CSS Snippets</a>',
	'10-24-2012' : '<a href="https://tympanus.net/codrops/2012/10/24/slit-slider-revised/">Slit Slider Revised</a>',
	'10-23-2012' : '<a href="https://tympanus.net/codrops/2012/10/23/basic-ready-to-use-css-styles/">Basic Ready-to-Use CSS Styles</a>',
	'10-22-2012' : '<a href="https://tympanus.net/codrops/2012/10/22/slicebox-revised/">Slicebox Revised</a><a href="https://tympanus.net/codrops/2012/10/22/managewp-giveaway/">ManageWP Giveaway</a>',
	'10-28-2012' : '<a href="https://tympanus.net/codrops/2012/10/18/creating-off-center-balance-using-asymmetry-in-web-design/">Creating Off-Center Balance: Using Asymmetry in Web Design</a>',
	'10-18-2012' : '<a href="https://tympanus.net/codrops/2012/10/18/snackwebsites-giveaway/">SnackWebsites Giveaway</a>',
	'10-17-2012' : '<a href="https://tympanus.net/codrops/2012/10/17/pfold-paper-like-unfolding-effect/">PFold: Paper-Like Unfolding Effect</a>',
	'10-16-2012' : '<a href="https://tympanus.net/codrops/2012/10/16/custom-login-form-styling/">Custom Login Form Styling</a>',
	'10-15-2012' : '<a href="https://tympanus.net/codrops/2012/10/15/the-unwritten-rules-of-a-great-design-critique/">The Unwritten Rules of a Great Design Critique</a>',
	'10-11-2012' : '<a href="https://tympanus.net/codrops/2012/10/11/foobox-wordpress-plugin-giveaway/">FooBox WordPress Plugin Giveaway</a><a href="https://tympanus.net/codrops/2012/10/11/real-time-geolocation-service-with-node-js/">Real-Time Geolocation Service with Node.js</a><a href="https://tympanus.net/codrops/2012/10/11/busting-that-creative-slump-youre-in/">Busting that Creative Slump You&#8217;re In</a>',
	'10-09-2012' : '<a href="https://tympanus.net/codrops/2012/10/09/windy-a-plugin-for-swift-content-navigation/">Windy: A Plugin for Swift Content Navigation</a>',
	'10-04-2012' : '<a href="https://tympanus.net/codrops/2012/10/04/custom-drop-down-list-styling/">Custom Drop-Down List Styling</a>',
	'10-02-2012' : '<a href="https://tympanus.net/codrops/2012/10/02/freebie-application-icon-set-png-psd-csh/">Freebie: Application Icon Set (PNG, PSD, CSH)</a>',
	'10-01-2012' : '<a href="https://tympanus.net/codrops/2012/10/01/vertical-showcase-slider-with-jquery-and-css-transitions/">Vertical Showcase Slider with jQuery and CSS Transitions</a>',
	'09-28-2012' : '<a href="https://tympanus.net/codrops/2012/09/28/stop-look-click-attention-grabbing-elements-in-web-design/">Stop, Look, Click: Attention-Grabbing Elements in Web Design</a>',
	'09-26-2012' : '<a href="https://tympanus.net/codrops/2012/09/26/make-a-statement-with-type/">Make a Statement with Type</a>',
	'09-25-2012' : '<a href="https://tympanus.net/codrops/2012/09/25/3d-restaurant-menu-concept/">3D Restaurant Menu Concept</a>',
	'09-20-2012' : '<a href="https://tympanus.net/codrops/2012/09/20/dashboard-design-elements-for-the-win/">Dashboard Design Elements for the Win</a>',
	'09-19-2012' : '<a href="https://tympanus.net/codrops/2012/09/19/fullscreen-video-slideshow-with-bigvideo-js/">Fullscreen Video Slideshow with BigVideo.js</a>',
	'09-17-2012' : '<a href="https://tympanus.net/codrops/2012/09/17/build-a-color-scheme-the-fundamentals/">Build a Color Scheme: The Fundamentals</a>',
	'09-13-2012' : '<a href="https://tympanus.net/codrops/2012/09/13/button-switches-with-checkboxes-and-css3-fanciness/">Button Switches with Checkboxes and CSS3 Fanciness</a><a href="https://tympanus.net/codrops/2012/09/13/compare-ninja-premium-subscription-giveaway/">Compare Ninja Premium Subscription Giveaway</a>',
	'09-12-2012' : '<a href="https://tympanus.net/codrops/2012/09/12/creative-web-typography-styles/">Creative Web Typography Styles</a>',
	'09-11-2012' : '<a href="https://tympanus.net/codrops/2012/09/11/psd2html-professional-coding-services-giveaway/">PSD2HTML Professional Coding Services Giveaway</a>',
	'09-06-2012' : '<a href="https://tympanus.net/codrops/2012/09/06/do-i-really-need-a-style-guide/">Do I Really Need A Style Guide?</a>',
	'09-04-2012' : '<a href="https://tympanus.net/codrops/2012/09/04/perfectly-paired-using-symmetry-in-web-design/">Perfectly Paired: Using Symmetry in Web Design</a>',
	'09-03-2012' : '<a href="https://tympanus.net/codrops/2012/09/03/bookblock-a-content-flip-plugin/">BookBlock: A Content Flip Plugin</a>',			
	'08-29-2012' : '<a href="https://tympanus.net/codrops/2012/08/29/multiple-area-charts-with-d3-js/">Multiple Area Charts with D3.js</a>',
	'08-27-2012' : '<a href="https://tympanus.net/codrops/2012/08/27/im-creator-lifetime-subscriptions-giveaway/">IM Creator Lifetime Subscriptions Giveaway</a>',
	'08-26-2012' : '<a href="https://tympanus.net/codrops/2012/08/26/happy-birthday-3-years-of-codrops/">Happy Birthday! 3 Years of Codrops</a>',
	'08-23-2012' : '<a href="https://tympanus.net/codrops/2012/08/23/we-are-architects/">We Are Architects</a><a href="https://tympanus.net/codrops/2012/08/23/unfolding-3d-thumbnails-concept/">Unfolding 3D Thumbnails Concept</a>',
	'08-17-2012' : '<a href="https://tympanus.net/codrops/2012/08/17/creative-background-styles-and-trends-in-web-design/">Creative Background Styles and Trends in Web Design</a>',
	'08-16-2012' : '<a href="https://tympanus.net/codrops/2012/08/16/triple-panel-image-slider/">Triple Panel Image Slider</a>',
	'08-15-2012' : '<a href="https://tympanus.net/codrops/2012/08/15/inject-energy-into-your-mobile-design-with-light-effects/">Inject Energy Into Your Mobile Design with Light Effects</a>',
	'08-08-2012' : '<a href="https://tympanus.net/codrops/2012/08/08/circle-hover-effects-with-css-transitions/">Circle Hover Effects with CSS Transitions</a>',
	'08-07-2012' : '<a href="https://tympanus.net/codrops/2012/08/07/mythemeshop-responsive-wordpress-themes-giveaway/">MyThemeShop Responsive WordPress Themes Giveaway</a>',
	'08-04-2012' : '<a href="https://tympanus.net/codrops/2012/08/04/the-designers-web-handbook-giveaway/">The Designer&#8217;s Web Handbook Giveaway</a><a href="https://tympanus.net/codrops/2012/08/04/freebie-soft-ui-kit-psd/">Freebie: Soft UI Kit (PSD)</a>',
	'08-02-2012' : '<a href="https://tympanus.net/codrops/2012/08/02/animated-responsive-image-grid/">Animated Responsive Image Grid</a>',
	'08-01-2012' : '<a href="https://tympanus.net/codrops/2012/08/01/photo-booth-strips-with-lightbox/">Photo Booth Strips with Lightbox</a>',				
	'07-27-2012' : '<a href="https://tympanus.net/codrops/2012/07/27/examples-of-creative-and-modern-effects-in-web-design/">Examples of Creative and Modern Effects in Web Design</a>',
	'07-25-2012' : '<a href="https://tympanus.net/codrops/2012/07/25/modern-block-quote-styles/">Modern Block Quote Styles</a>',
	'07-24-2012' : '<a href="https://tympanus.net/codrops/2012/07/24/i-love-script-fonts-heres-why/">I Love Script Fonts (Here’s Why)</a>',
	'07-23-2012' : '<a href="https://tympanus.net/codrops/2012/07/23/designing-the-dreaded-form-getting-creative/">Designing the Dreaded Form: Getting Creative</a>',
	'07-20-2012' : '<a href="https://tympanus.net/codrops/2012/07/20/3d-flipping-circle-with-css3-and-jquery/">3D Flipping Circle with CSS3 and jQuery</a>',
	'07-12-2012' : '<a href="https://tympanus.net/codrops/2012/07/12/old-school-cassette-player-with-html5-audio/">Old School Cassette Player with HTML5 Audio</a>',
	'07-10-2012' : '<a href="https://tympanus.net/codrops/2012/07/10/tips-tools-for-grid-based-layouts/">Tips &#038; Tools for Grid-based Layouts</a>',
	'07-09-2012' : '<a href="https://tympanus.net/codrops/2012/07/09/themefuse-premium-wordpress-themes-giveaway/">ThemeFuse Premium WordPress Themes Giveaway</a>',
	'07-07-2012' : '<a href="https://tympanus.net/codrops/2012/07/07/freebie-baby-blue-ui-kit-psd/">Freebie: Baby Blue UI Kit (PSD)</a>',
	'07-05-2012' : '<a href="https://tympanus.net/codrops/2012/07/05/designing-the-dreaded-form/">Designing the Dreaded Form</a>',
	'07-02-2012' : '<a href="https://tympanus.net/codrops/2012/07/02/swatch-book-with-css3-and-jquery/">Swatch Book with CSS3 and jQuery</a>',				
	'07-27-2012' : '<a href="https://tympanus.net/codrops/2012/06/27/responsive-3d-panel-layout/">Responsive 3D Panel Layout</a>',
	'06-25-2012' : '<a href="https://tympanus.net/codrops/2012/06/25/timed-notifications-with-css-animations/">Timed Notifications with CSS Animations</a><a href="https://tympanus.net/codrops/2012/06/25/theadstock-giveaway-free-4th-of-july-themed-images/">TheAdStock Giveaway + Free 4th of July Themed Images</a>',
	'06-19-2012' : '<a href="https://tympanus.net/codrops/2012/06/19/themefurnace-premium-wordpress-themes-giveaway/">ThemeFurnace Premium WordPress Themes Giveaway</a><a href="https://tympanus.net/codrops/2012/06/19/line-that-up-proper-alignment-in-web-design/">Line That Up: Proper Alignment in Web Design</a>',
	'06-18-2012' : '<a href="https://tympanus.net/codrops/2012/06/18/3d-thumbnail-hover-effects/">3D Thumbnail Hover Effects</a>',
	'06-13-2012' : '<a href="https://tympanus.net/codrops/2012/06/13/how-web-design-has-changed-print/">How Web Design Has Changed Print</a>',
	'06-12-2012' : '<a href="https://tympanus.net/codrops/2012/06/12/css-only-responsive-layout-with-smooth-transitions/">CSS-Only Responsive Layout with Smooth Transitions</a>',
	'06-11-2012' : '<a href="https://tympanus.net/codrops/2012/06/11/tokokoo-e-commerce-wordpress-themes-giveaway/">Tokokoo E-Commerce WordPress Themes Giveaway</a><a href="https://tympanus.net/codrops/2012/06/11/visual-hierarchy-in-mobile-design/">Visual Hierarchy in Mobile Design</a>',
	'06-07-2012' : '<a href="https://tympanus.net/codrops/2012/06/07/7-elements-of-a-well-converting-subscription-page/">7 Elements of a Well Converting Subscription Page</a><a href="https://tympanus.net/codrops/2012/06/07/book-review-the-designers-web-handbook/">Book Review: “The Designer’s Web Handbook”</a>',
	'06-06-2012' : '<a href="https://tympanus.net/codrops/2012/06/06/image-accordion-with-css3/">Image Accordion with CSS3</a>',
	'06-05-2012' : '<a href="https://tympanus.net/codrops/2012/06/05/fullscreen-slit-slider-with-jquery-and-css3/">Fullscreen Slit Slider with jQuery and CSS3</a>',			
	'05-23-2012' : '<a href="https://tympanus.net/codrops/2012/05/23/understanding-the-rule-of-thirds-in-web-design/">Understanding the Rule of Thirds in Web Design</a>',
	'05-22-2012' : '<a href="https://tympanus.net/codrops/2012/05/22/creating-an-animated-3d-bouncing-ball-with-css3/">Creating an Animated 3D Bouncing Ball with CSS3</a>',
	'05-21-2012' : '<a href="https://tympanus.net/codrops/2012/05/21/elegant-themes-giveaway/">Elegant Themes Giveaway</a><a href="https://tympanus.net/codrops/2012/05/21/animated-3d-bar-chart-with-css3/">Animated 3D Bar Chart with CSS3</a>',
	'05-15-2012' : '<a href="https://tympanus.net/codrops/2012/05/15/making-room-to-breathe-wrapping-text-around-elements/">Making Room to Breathe: Wrapping Text Around Elements</a>',
	'05-14-2012' : '<a href="https://tympanus.net/codrops/2012/05/14/annotation-overlay-effect-with-css3/">Annotation Overlay Effect with CSS3</a>',
	'05-09-2012' : '<a href="https://tympanus.net/codrops/2012/05/09/how-to-create-a-fast-hover-slideshow-with-css3/">How to Create a Fast Hover Slideshow with CSS3</a><a href="https://tympanus.net/codrops/2012/05/09/understanding-the-lingo-typography-glossary/">Understanding the Lingo: Typography Glossary</a>',
	'05-07-2012' : '<a href="https://tympanus.net/codrops/2012/05/07/experimental-page-layout-inspired-by-flipboard/">Experimental Page Layout Inspired by Flipboard</a><a href="https://tympanus.net/codrops/2012/05/07/impressionist-ui-pack-giveaway/">Impressionist UI Pack Giveaway</a>',
	'05-03-2012' : '<a href="https://tympanus.net/codrops/2012/05/03/thrivesolo-giveaway/">ThriveSolo Giveaway</a>',
	'05-02-2012' : '<a href="https://tympanus.net/codrops/2012/05/02/enhance-required-form-fields-with-css3/">Enhance Required Form Fields with CSS3</a>',
	'05-01-2012' : '<a href="https://tympanus.net/codrops/2012/05/01/effective-typography-driven-web-design/">Effective Typography-Driven Web Design</a>',			
	'04-30-2012' : '<a href="https://tympanus.net/codrops/2012/04/30/fluid-css3-slideshow-with-parallax-effect/">Fluid CSS3 Slideshow with Parallax Effect</a><a href="https://tympanus.net/codrops/2012/04/30/im-creator-giveaway/">IM Creator Giveaway</a>',
	'04-25-2012' : '<a href="https://tympanus.net/codrops/2012/04/25/flarethemes-giveaway/">FlareThemes Giveaway</a><a href="https://tympanus.net/codrops/2012/04/25/type-effects-in-web-design-its-all-about-moderation/">Type Effects in Web Design: It&#8217;s All About Moderation</a>',
	'04-24-2012' : '<a href="https://tympanus.net/codrops/2012/04/24/audio-slideshow-with-jplayer/">Audio Slideshow with jPlayer</a>',
	'04-28-2012' : '<a href="https://tympanus.net/codrops/2012/04/18/awwwards-the-best-365-websites-around-the-world-2011-book-giveaway/">Awwwards: The Best 365 Websites Around the World 2011 Book Giveaway</a>',
	'04-17-2012' : '<a href="https://tympanus.net/codrops/2012/04/17/rotating-words-with-css-animations/">Rotating Words with CSS Animations</a><a href="https://tympanus.net/codrops/2012/04/17/web-icon-set-giveaway/">Web Icon Set Giveaway</a><a href="https://tympanus.net/codrops/2012/04/17/the-divine-proportion-and-web-design/">The Divine Proportion and Web Design</a>',
	'04-12-2012' : '<a href="https://tympanus.net/codrops/2012/04/12/animated-content-tabs-with-css3/">Animated Content Tabs with CSS3</a>',
	'04-10-2012' : '<a href="https://tympanus.net/codrops/2012/04/10/successful-web-design-its-all-about-the-details/">Successful Web Design: It&#8217;s All About The Details</a><a href="https://tympanus.net/codrops/2012/04/10/tn3gallery-giveaway/">TN3Gallery Giveaway</a>',
	'04-09-2012' : '<a href="https://tympanus.net/codrops/2012/04/09/direction-aware-hover-effect-with-css3-and-jquery/">Direction-Aware Hover Effect with CSS3 and jQuery</a>',
	'04-05-2012' : '<a href="https://tympanus.net/codrops/2012/04/05/slideshow-with-jmpress-js/">Slideshow with jmpress.js</a>',
	'04-03-2012' : '<a href="https://tympanus.net/codrops/2012/04/03/color-and-emotion-what-does-each-hue-mean/">Color and Emotion: What Does Each Hue Mean?</a>',
	'04-02-2012' : '<a href="https://tympanus.net/codrops/2012/04/02/responsive-horizontal-layout/">Responsive Horizontal Layout</a>',			
	'03-28-2012' : '<a href="https://tympanus.net/codrops/2012/03/28/mightydeals-giveaway/">MightyDeals Giveaway</a><a href="https://tympanus.net/codrops/2012/03/28/add-impact-to-type-driven-projects/">Add Impact to Type-driven Projects</a>',
	'03-27-2012' : '<a href="https://tympanus.net/codrops/2012/03/27/login-and-registration-form-with-html5-and-css3/">Login and Registration Form with HTML5 and CSS3</a>',
	'03-24-2012' : '<a href="https://tympanus.net/codrops/2012/03/24/more-examples-of-fresh-effects-in-web-design/">More Examples of Fresh Effects in Web Design</a>',
	'03-23-2012' : '<a href="https://tympanus.net/codrops/2012/03/23/responsive-content-navigator-with-css3/">Responsive Content Navigator with CSS3</a>',
	'03-21-2012' : '<a href="https://tympanus.net/codrops/2012/03/21/psd2html-giveaway/">PSD2HTML Giveaway</a>',
	'03-20-2012' : '<a href="https://tympanus.net/codrops/2012/03/20/condensed-fonts-the-good-the-bad-the-ugly/">Condensed fonts: The good, the bad, the ugly</a>',
	'03-15-2012' : '<a href="https://tympanus.net/codrops/2012/03/15/parallax-content-slider-with-css3-and-jquery/">Parallax Content Slider with CSS3 and jQuery</a>',
	'03-12-2012' : '<a href="https://tympanus.net/codrops/2012/03/12/wordpressthemeshock-giveaway/">WordPressThemeShock Giveaway</a>',
	'03-07-2012' : '<a href="https://tympanus.net/codrops/2012/03/07/understanding-and-using-type-categories-in-web-design/">Understanding and Using Type Categories in Web Design</a>',				
	'02-28-2012' : '<a href="https://tympanus.net/codrops/2012/02/28/principles-of-color-and-the-color-wheel/">Principles of Color and the Color Wheel</a>',
	'02-21-2012' : '<a href="https://tympanus.net/codrops/2012/02/21/accordion-with-css3/">Accordion with CSS3</a>',
	'02-19-2012' : '<a href="https://tympanus.net/codrops/2012/02/19/establish-a-mood-with-typography/">Establish a Mood with Typography</a>',
	'02-16-2012' : '<a href="https://tympanus.net/codrops/2012/02/16/overcoming-the-user-designer-disease/">Overcoming the &#8220;User Designer&#8221; Disease</a><a href="https://tympanus.net/codrops/2012/02/16/conceptboard-giveaway/">Conceptboard Giveaway</a>',
	'02-09-2012' : '<a href="https://tympanus.net/codrops/2012/02/09/type-effects-and-modification/">Type Effects and Modification</a>',
	'02-06-2012' : '<a href="https://tympanus.net/codrops/2012/02/06/3d-gallery-with-css3-and-jquery/">3D Gallery with CSS3 and jQuery</a>',
	'02-04-2012' : '<a href="https://tympanus.net/codrops/2012/02/04/keys-to-email-creative-success-marketing-and-design/">Keys to Email Creative Success: Marketing and Design</a>',
	'02-01-2012' : '<a href="https://tympanus.net/codrops/2012/02/01/original-wordpress-themes-giveaway-by-themefuse/">Original WordPress Themes Giveaway by ThemeFuse</a><a href="https://tympanus.net/codrops/2012/02/01/how-to-create-animated-tooltips-with-css3/">How to create animated tooltips with CSS3</a>',
	'01-30-2012' : '<a href="https://tympanus.net/codrops/2012/01/30/page-transitions-with-css3/">Page Transitions with CSS3</a>',
	'01-27-2012' : '<a href="https://tympanus.net/codrops/2012/01/27/modular-front-end-development-with-less/">Modular front-end development with LESS</a>',
	'01-26-2012' : '<a href="https://tympanus.net/codrops/2012/01/26/be-less-annoying-reduce-bounce-rates-through-better-web-design/">Be Less Annoying: Reduce Bounce Rates through Better Web Design</a>',
	'01-24-2012' : '<a href="https://tympanus.net/codrops/2012/01/24/arctext-js-curving-text-with-css3-and-jquery/">Arctext.js &#8211; Curving Text with CSS3 and jQuery</a>',
	'01-22-2012' : '<a href="https://tympanus.net/codrops/2012/01/22/how-to-spice-up-your-menu-with-css3/">How to spice up your menu with CSS3</a><a href="https://tympanus.net/codrops/2012/01/22/codrops-giveaway-from-moo-com/">Codrops Giveaway From MOO.com</a>',
	'01-17-2012' : '<a href="https://tympanus.net/codrops/2012/01/17/sliding-image-panels-with-css3/">Sliding Image Panels with CSS3</a>',
	'01-12-2012' : '<a href="https://tympanus.net/codrops/2012/01/12/5-things-every-mobile-design-should-have/">5 Things Every Mobile Design Should Have</a>',
	'01-11-2012' : '<a href="https://tympanus.net/codrops/2012/01/11/css-buttons-with-pseudo-elements/">CSS Buttons with Pseudo-elements</a>',
	'01-10-2012' : '<a href="https://tympanus.net/codrops/2012/01/10/animated-web-banners-with-css3/">Animated Web Banners With CSS3</a>',
	'01-09-2012' : '<a href="https://tympanus.net/codrops/2012/01/09/filter-functionality-with-css3/">Filter Functionality with CSS3</a>',
	'01-05-2012' : '<a href="https://tympanus.net/codrops/2012/01/05/jumping-the-hurdles-of-brainstorming/">Jumping the Hurdles of Brainstorming</a><a href="https://tympanus.net/codrops/2012/01/05/examples-of-fresh-effects-in-web-design/">Examples of Fresh Effects in Web Design</a>',
	'01-04-2012' : '<a href="https://tympanus.net/codrops/2012/01/04/thumbnail-proximity-effect/">Thumbnail Proximity Effect with jQuery and CSS3</a>',
	'01-02-2012' : '<a href="https://tympanus.net/codrops/2012/01/02/fullscreen-background-image-slideshow-with-css3/">Fullscreen Background Image Slideshow with CSS3</a>',
	'12-25-2012' : '<span>Christmas Day</span>',
	'12-31-2012' : '<span>New Year\'s Eve</span>'
};
	
			$(function() {
			
				var transEndEventNames = {
						'WebkitTransition' : 'webkitTransitionEnd',
						'MozTransition' : 'transitionend',
						'OTransition' : 'oTransitionEnd',
						'msTransition' : 'MSTransitionEnd',
						'transition' : 'transitionend'
					},
					transEndEventName = transEndEventNames[ Modernizr.prefixed( 'transition' ) ],
					$wrapper = $( '#custom-inner' ),
					$calendar = $( '#calendar' ),
					cal = $calendar.calendario( {
						onDayClick : function( $el, $contentEl, dateProperties ) {

							if( $contentEl.length > 0 ) {
								showEvents( $contentEl, dateProperties );
							}

						},
						caldata : codropsEvents,
						displayWeekAbbr : true
					} ),
					$month = $( '#custom-month' ).html( cal.getMonthName() ),
					$year = $( '#custom-year' ).html( cal.getYear() );
				$( '#custom-next' ).on( 'click', function() {
					cal.gotoNextMonth( updateMonthYear );
				} );
				$( '#custom-prev' ).on( 'click', function() {
					cal.gotoPreviousMonth( updateMonthYear );
				} );
				function updateMonthYear() {				
					$month.html( cal.getMonthName() );
					$year.html( cal.getYear() );
				}
				// just an example..
				function showEvents( $contentEl, dateProperties ) {

					hideEvents();					
					var $events = $( '<div id="custom-content-reveal" class="custom-content-reveal"><h4>Events for ' + dateProperties.monthname + ' ' + dateProperties.day + ', ' + dateProperties.year + '</h4></div>' ),
						$close = $( '<span class="custom-content-close"></span>' ).on( 'click', hideEvents );
					$events.append( $contentEl.html() , $close ).insertAfter( $wrapper );					
					setTimeout( function() {
						$events.css( 'top', '0%' );
					}, 25 );
				}
				function hideEvents() {
					var $events = $( '#custom-content-reveal' );
					if( $events.length > 0 ) {						
						$events.css( 'top', '100%' );
						Modernizr.csstransitions ? $events.on( transEndEventName, function() { $( this ).remove(); } ) : $events.remove();
					}
				}			
			});