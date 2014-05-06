/**
 * Author: Focus43
 * https://github.com/SuperRunt/jquery-ajaxify-form
 * jQuery plugin for making all forms with a 
 * certain selector submit via AJAX.
 * @param {Object} $
 */
(function($){
	
	$.fn.ajaxifyForm = function( _options ){
		
		var _settings = $.extend({
			submitUrl: null,
			method: 'POST',
			expectBack: 'json',
			showFeedback: true,
			hideFeedbackAfter: false,
			sendWithData: {}
		}, _options);


		
		// assemble the response message html; depends on bootstrap's .alert classes
		function responseOutput( _respData ){
            console.log(_respData)
			var alertClass = _respData.code == 1 ? 'alert-success' : 'alert-error';
	            $output    = $('<div class="message alert info '+alertClass+'"><a class="close" data-dismiss="alert">×</a><ul></ul></div>');
	            
	        $('ul', $output).append(function(){
	            var list = '';
	            $.each( _respData.messages, function(idx, msg){
	                list += '<li>'+msg+'</li>';
	            });
	            return list;
	        });
	        
	        return $output;
		}
		
		
		// setup a listener on the DOCUMENT for only the selector
		$(document).on('submit', this.selector, {defaults: _settings}, function( _submitEvent ){
			_submitEvent.preventDefault();

			// the form in the DOM being submitted
			var $form = $(this);
			
			// setup configs AGAIN - allows for overriding settings with form tag attributes
			var _config = $.extend(_submitEvent.data.defaults, {
				submitUrl: $form.attr('action') || _submitEvent.data.defaults.submitUrl,
				method: $form.attr('method') || _submitEvent.data.defaults.method,
				showFeedback: ($form.attr('data-show-feedback') === 'true') || _submitEvent.data.defaults.showFeedback,
				hideFeedbackAfter: +($form.attr('data-hide-feedback-after')) || _submitEvent.data.defaults.hideFeedbackAfter
			});
				
			// get the form data, and append any more from _config.sendWithData
			var _data = (function( _extraData ){
				var formData = $form.serializeArray();
				if( !($.isEmptyObject(_extraData)) ){
					for( var key in _extraData ){
						formData.push({name: key, value: _extraData[key]});
					}
				}
				return formData;
			}( _config.sendWithData ));
				
			
			// send it!
			$.ajax( _config.submitUrl, {
				data: _data,
				type: _config.method,
				dataType: _config.expectBack,
				success: function( _respData ){
					
					// show the response message? uses automatic output template in showResponse()
					if( _config.showFeedback && _config.expectBack == 'json' ){
						$output = responseOutput(_respData);
						$form.prepend( $output );
						
						// remove the feedback automatically after a set time?
						if( _config.hideFeedbackAfter >= 1 ){
							setTimeout(function( $feedback ){
								$feedback.remove();
							}, _config.hideFeedbackAfter, $output);
						}
					}
					
					// fire custom event
					$form.trigger('ajaxify_complete', [_respData, _config]);
					
				},
				beforeSend: function(){
					
					// if a message was already appended to the screen, remove it before submit
					$('.message', $form).remove();
					
				}
			});
			
		});
		
	}
	
})(jQuery);
