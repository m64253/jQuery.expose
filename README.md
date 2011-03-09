Usage
=====

	$('img').addClass('loading').onExpose(function(){	
		var $img = $(this),
			src = $img.attr('expose-src');
		$img.removeClass('loading').attr('src', src);
	});