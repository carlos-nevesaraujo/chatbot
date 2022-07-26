$(document).ready(function() {




	var c_resposta = 0;
	var c_nivelresposta = 0;
	//---------------------------------- Add dynamic html bot content(Widget style) ----------------------------
	// You can also add the html content in html page and still it will work!
	// var mybot = '<div class="chatCont" id="chatCont">'+
	// 							'<div class="bot_profile">'+
	// 								'<img src="assets/img/bot2.svg" class="bot_p_img">'+
	// 								'<div class="close">'+
	// 									'<i class="fa fa-times" aria-hidden="true"></i>'+
	// 								'</div>'+
	// 							'</div><!--bot_profile end-->'+
	// 							'<div id="result_div" class="resultDiv"></div>'+
	// 							'<div class="chatForm" id="chat-div">'+
	// 								'<div class="spinner">'+
	// 									'<div class="bounce1"></div>'+
	// 									'<div class="bounce2"></div>'+
	// 									'<div class="bounce3"></div>'+
	// 								'</div>'+
	// 								'<input type="text" id="chat-input" autocomplete="off" placeholder="Digite aqui ..."'+ 'class="form-control bot-txt"/>'+
	// 							'</div>'+
	// 						'</div><!--chatCont end-->'+

	// 						'<div class="profile_div">'+
	// 							'<div class="row">'+
	// 								'<div class="col-hgt">'+
	// 									'<img src="assets/img/bot2.svg" class="img-circle img-profile">'+
	// 								'</div><!--col-hgt end-->'+
	// 								'<div class="col-hgt">'+
	// 									'<div class="chat-txt">'+
	// 										'Chat do Carlos'+
	// 									'</div>'+
	// 								'</div><!--col-hgt end-->'+
	// 							'</div><!--row end-->'+
	// 						'</div><!--profile_div end-->';

	// $("mybot").html(mybot);

	// ------------------------------------------ Toggle chatbot -----------------------------------------------
	$('.profile_div').click(function() {
		$('.profile_div').toggle();
		$('.chatCont').toggle();
		$('.bot_profile').toggle();
		$('.chatForm').toggle();
		document.getElementById('chat-input').focus();
	});

	$('.close').click(function() {
		$('.profile_div').toggle();
		$('.chatCont').toggle();
		$('.bot_profile').toggle();
		$('.chatForm').toggle();
	});


	// Session Init (is important so that each user interaction is unique)--------------------------------------
	var session = function() {
		// Retrieve the object from storage
		if(sessionStorage.getItem('session')) {
			var retrievedSession = sessionStorage.getItem('session');
		} else {
			// Random Number Generator
			var randomNo = Math.floor((Math.random() * 1000) + 1);
			// get Timestamp
			var timestamp = Date.now();
			// get Day
			var date = new Date();
			var weekday = new Array(7);
			weekday[0] = "Sunday";
			weekday[1] = "Monday";
			weekday[2] = "Tuesday";
			weekday[3] = "Wednesday";
			weekday[4] = "Thursday";
			weekday[5] = "Friday";
			weekday[6] = "Saturday";
			var day = weekday[date.getDay()];
			// Join random number+day+timestamp
			var session_id = randomNo+day+timestamp;
			// Put the object into storage
			sessionStorage.setItem('session', session_id);
			var retrievedSession = sessionStorage.getItem('session');
		}
		return retrievedSession;
		// console.log('session: ', retrievedSession);
	}

	// Call Session init
	var mysession = session();


	// on input/text enter--------------------------------------------------------------------------------------
	$('#chat-input').on('keyup keypress', function(e) {
		var keyCode = e.keyCode || e.which;
		var text = $("#chat-input").val();
		if (keyCode === 13) {
			if(text == "" ||  $.trim(text) == '') {
				e.preventDefault();
				return false;
			} else {
				$("#chat-input").blur();
				setUserResponse(text);
				send( c_resposta,c_nivelresposta,text);
				e.preventDefault();
				return false;
			}
		}
	});


	//------------------------------------------- Send request to API.AI ---------------------------------------
	function send(resposta, nivelresposta, text) {

		let baseUrl = $("#baseUrl").val();
		let accessToken = $("#accessToken").val();
		if(baseUrl == "" || accessToken == "")
		{
			setBotResponse("Chaves de API inválidadas !")
			setBotResponse("Atualize as chaves de api e token")

			return;
		}
		$.ajax({
			type: "GET",
			// url: baseUrl+"query="+text+"&lang=en-us&sessionId="+mysession,
			url: baseUrl+"/chatbot/"+resposta +"/"+nivelresposta +"/"+text,
			contentType: "application/json",
			dataType: "json",
			headers: {
				// "Access-Control-Allow-Origin": "*",
				// "Access-Control-Allow-Methods":"GET",
				// "Access-Control-Allow-Headers":"Authorization",
				"Authorization": "Bearer " + accessToken,
			},
			success: function(data) {
				main(data);
				console.log(data);
				
			},
			error: function(e) {
				console.log (e);

				setBotResponse("Chaves de API inválidadas !")
				setBotResponse("Atualize as chaves de api e token")
			}
		});
	}


	//------------------------------------------- Main function ------------------------------------------------
	function main(data) {
	

		if( data.resposta >= 0)
			c_resposta  = data.resposta;
		if(data.nivel >= 0)
			c_nivelresposta = data.nivel;
		
		
		for(i in data.messages)
		{
			setBotResponse(data.messages[i]);
		}
		if(data.options &&  data.options.length > 0 ) { // check if quick replies are there in api.ai
			addSuggestion(data.options);
		}


		if(data.jsonObj)
		{
			addJsonResult(data.jsonObj)
		}

		if(data.reset)
		{
			setTimeout(function(){
				send(c_resposta,c_nivelresposta,"olá");
			}, 900);
		}
	}


	//------------------------------------ Set bot response in result_div -------------------------------------
	function setBotResponse(val) {


		setTimeout(function(){
			if($.trim(val) == '') {
				val = 'I couldn\'t get that. Let\' try something else!'
				var BotResponse = '<p class="botResult">'+val+'</p><div class="clearfix"></div>';
				$(BotResponse).appendTo('#result_div');
			} else {
				val = val.replace(new RegExp('\r?\n','g'), '<br />');
				var BotResponse = '<p class="botResult">'+val+'</p><div class="clearfix"></div>';
				$(BotResponse).appendTo('#result_div');
			}
			scrollToBottomOfResults();
			hideSpinner();
		}, 500);
	}


	//------------------------------------- Set user response in result_div ------------------------------------
	function setUserResponse(val) {
		var UserResponse = '<p class="userEnteredText">'+val+'</p><div class="clearfix"></div>';
		$(UserResponse).appendTo('#result_div');
		$("#chat-input").val('');
		scrollToBottomOfResults();
		showSpinner();
		$('.suggestion').remove();
	}


	//---------------------------------- Scroll to the bottom of the results div -------------------------------
	function scrollToBottomOfResults() {
		var terminalResultsDiv = document.getElementById('result_div');
		terminalResultsDiv.scrollTop = terminalResultsDiv.scrollHeight;
	}


	//---------------------------------------- Ascii Spinner ---------------------------------------------------
	function showSpinner() {
		$('.spinner').show();
	}
	function hideSpinner() {
		$('.spinner').hide();
	}


	//------------------------------------------- Suggestions --------------------------------------------------
	function addSuggestion(options) {
		setTimeout(function() {
			$('<p class="suggestion"></p>').appendTo('#result_div');
			$('<div class="sugg-title">Opções: </div>').appendTo('.suggestion');
			// Loop through options
			for(i=0;i<options.length;i++) {
				$('<span data-resposta="'+options[i].respostaBot+'" data-nivel="'+options[i].nivel+'" class="sugg-options">'+options[i].option+' - ' +  options[i].title + '</span>').appendTo('.suggestion');
			}
			scrollToBottomOfResults();
		}, 1000);
	}

	

	// on click of options get value and send to API
	$(document).on("click", ".suggestion span", function() {
		var text = this.innerText;
		setUserResponse(text);

		c_resposta  = $(this).attr("data-resposta");
		c_nivelresposta  = $(this).attr("data-nivel");
		send(c_resposta,c_nivelresposta,text);
		$('.suggestion').remove();
	});
	// Suggestions end -----------------------------------------------------------------------------------------


//------------------------------------------- Suggestions --------------------------------------------------
function addJsonResult(jsonObj) {
	setTimeout(function() {
		$('<p class="json botResult"></p>').appendTo('#result_div');
		$('<div class="json-title">Resultado: </div>').appendTo('.json');

		let json = JSON.parse(jsonObj)
		for (let x in json) {

			$('<div><b>'+x+'</b>: '+json[x]+'</div>').appendTo('.json');
		 }
		scrollToBottomOfResults();
	}, 1000);
}
	// Suggestions end -----------------------------------------------------------------------------------------
});

