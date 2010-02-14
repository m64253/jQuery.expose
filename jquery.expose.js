(function($){
	
	var $win = $(window),
		$doc = $(document),
		$tracked = $([]),
		aRegions = [],
		aCallbacks = [],
		sExposeEventName = 'expose';
	
	/**
	 * Describe what this method does
	 * @private
	 * @param {jQuery-Collection-Object|String} mSelector Describe this parameter
	 * @param {function} fCallback Describe this parameter
	 * @returns Describe what it returns
	 * @type jQuery-object
	 */
	function expose(mSelector, fCallback) {
		
		if (!$.isFunction(fCallback)) {
			throw 'jQuery.expose: No callback function provided';
		}
		
		var $els = $(mSelector);
		
		$els.bind(sExposeEventName, fCallback);
		
		return $;
	}
		
		
	/**
	 * Loop watched items and trigger callback on those that are in view
	 */
	function process() {
		
		var oViewerRegion = $win.getRegion();
		
		$tracked.each(function(i, item){
			inView(item, oViewerRegion, i);
			// Trigger event
		});
	}
	
	/**
	 * Describe what this method does
	 * @private
	 * @param {DOMNode} item
	 * @param {Object} oViewerRegion
	 * @param {integer} i
	 * @returns Checks if the supplied item is in view
	 * @type Boolean
	 */
	function inView(item, oViewerRegion, i) {
		
		oViewerRegion = oViewerRegion || $win.getRegion();
		
		i = i || -1;
		
		var $item = $(item),
			oWatchedRegion = aRegions[i] || $item.getRegion(),
			bInRegion = $item.inRegion(oViewerRegion, false, oWatchedRegion);
				
		// Cache watched region
		if (i !== -1) {
			aRegions[i] = oWatchedRegion;
		}
		
		// In region
		if (bInRegion) {
			if (i !== -1) {
				// Remove cached region
				aRegions.splice(i, 1);
				
				// Removed form tracked
				$tracked = $tracked.not(item);
			}
			
			// Trigger event
			setTimeout(function(){
				$item.trigger(sExposeEventName);
			}, 0)
			
			return true;
		}
		
		return false;
	}
	
	/**
	 * On document:ready initalize
	 */
	$(function($){
		// Listen for window resize events
		$win.bind('resize', process);
		
		// Listen for window scroll events
		$win.bind('scroll', process);
		
		// Process
		process();
	});
	
		
	/**
	 * Extend jQuery
	 */
	$.extend({ 
		expose: function(mSelector, fCallback) {
			$(function($){
				expose(mSelector, fCallback);
			});
			return $;
		}
	});
			
	/**
	 * Extend jQuery collections
	 */
	$.fn.extend({
		onExpose: function(fCallback) {
			expose(this, fCallback);
			return this;
		}
	});
	
	/**
	 * Add Expose Special Event
	 */
	$.extend($.event.special, {
		expose: {
			setup: function() {
				
				if (!inView(this)) {
					$tracked = $tracked.add($(this));
				}
				
				return false;
			},
			teardown: function() {
				
			}
		}
	});
	
	/**
	 * Get Region, borrowed-ish from YUI3
	 */
	$.fn.extend({
		getRegion: function() {
		
			// If window
			if (this[0] === window) {
				return $.getViewportRegion();
			}
			
			var iHeight = this.outerHeight(),
				iWidth = this.outerWidth(),
				oPos = this.offset();

			return {
				'left': oPos.left,
				'right': oPos.left + iWidth,
				'top': oPos.top,
				'bottom': oPos.top + iHeight,
				'height': iHeight,
				'width': iWidth
			};
		},
		inRegion: function(el, bFull, oCachedRegion) {
		
			var oRegion1,
	            oRegion2 = oCachedRegion || this.getRegion();

	        if (el.tagName || (el.attr && el.attr('tagName'))) {
	            oRegion1 = jQuery(el).getRegion();
	        } else if (typeof(el) === 'object') {
	            oRegion1 = el;
	        } else {
	            return false;
	        }

	        if (bFull) {
	            return (oRegion2['left'] >= oRegion1['left'] && oRegion2['right'] <= oRegion1['right'] && oRegion2['top'] >= oRegion1['top'] && oRegion2['bottom'] <= oRegion1['bottom']);
	        } else {
	            if (Math.min(oRegion1['bottom'], oRegion2['bottom']) >= Math.max(oRegion1['top'], oRegion2['top']) && Math.min(oRegion1['right'], oRegion2['right']) >= Math.max(oRegion1['left'], oRegion2['left'])) {
	                return true;
	            } else {
	                return false;
	            }
	        }
		}
	});
	
	/**
	 * Get Viewport Region, borrowed-ish from YUI3
	 */
	$.extend({
		getViewportRegion: function() {
			var $el = jQuery(window),
				iHeight = $el.height(),
				iWidth = $el.width(),
				scrollTop = $el.scrollTop(),
				scrollLeft = $el.scrollLeft();
		
			return {
				'left': scrollLeft,
				'right': scrollLeft + iWidth,
				'top': scrollTop,
				'bottom': scrollTop + iHeight,
				'height': iHeight,
				'width': iWidth
			};
		}
	});
	
})(jQuery);