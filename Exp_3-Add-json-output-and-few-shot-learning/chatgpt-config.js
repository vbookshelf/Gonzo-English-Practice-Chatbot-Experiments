
// Config
//-------
// Chat parameters are explained here: https://platform.openai.com/docs/api-reference/chat
// GPT-3-5 specs: https://platform.openai.com/docs/models/gpt-3-5

// Your API Key
const apiKey = 'Your-API-Key'; 

const bot_name = 'Gonzo';  	// Give the bot a name
const user_name = 'User';	// Set your chat name 


function extractJsonString(inputString) {
  const regex = /{[\s\S]*?}/gm; // match curly braces and everything in between
  const match = inputString.match(regex);
  if (match !== null && match.length > 0) {
    return match[0];
  }
  return '';
}





// For context: Get the time and day of the week
const time_zone = 'Asia/Singapore'; // set the timezone to the desired country
const chat_location = 'Singapore';
const time = new Date().toLocaleTimeString('en-US', { timeZone: time_zone });
const day_of_week = new Date().toLocaleString('en-US', { timeZone: time_zone, weekday: 'long' });

console.log(`Current time in ${time_zone}: ${time}`);
console.log(`Today is ${day_of_week}`);
console.log(`The city is ${time_zone}`);






/* 

Notes:

1- Please add your OpenAi API key above.

2- Quote from the docs: OpenAI models are non-deterministic, meaning that identical inputs can yield different outputs. Setting temperature to 0 will make the outputs mostly deterministic, but a small amount of variability may remain.

3- This chatbot has context memory. As a result the API token cost
   will increase quickly. Please monitor your costs carefully.
   
4- I suggest that you keep the console open when using this app. Any errors will
  show up in the console. There could be errors when the OpenAi API 
  is overloaded with requests.
   


const myList = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'item9', 'item10', 'item11', 'item12', 'item13', 'item14', 'item15', 'item16', 'item17', 'item18'];

const list1 = myList.slice(0, 3);
const list2 = myList.slice(5);
const list3 = list1.concat(list2)

console.log(list3);
*/


const model_type = "gpt-3.5-turbo-0301"; // 4096 tokens
const openai_url = 'https://api.openai.com/v1/chat/completions';

// If this number plus the number of tokens in the message_history exceed
// the max value for the model (e.g. 4096) then the response from the api will
// an error dict instead of the normal message response. Thos error dict will
// contain an error message saying that the number of tokens for 
// this model has been exceeded.
const max_tokens = 300; //300

// 0 to 2. Higher values like 0.8 will make the output more random, 
// while lower values like 0.2 will make it more focused and deterministic.
// Alter this or top_p but not both.
const temperature = 0.21;

// -2 to 2. Higher values increase the model's likelihood to talk about new topics.
// Reasonable values for the penalty coefficients are around 0.1 to 1.
const presence_penalty = 0; 

// -2 to 2. Higher values decrease the model's likelihood to repeat the same line verbatim.
// Reasonable values for the penalty coefficients are around 0.1 to 1.
const frequency_penalty = 1;




// Remove these suffixes. I think removing them makes the chat sound more natural.
// They will sliced off the bot's responses.
// This is done below in the 'Remove suffixes' part of the code.
var suffixes_list = ['How can I help you?', 'How can I assist you today?', 'How can I help you today?', 'Is there anything else you would like to chat about?', 'Is there anything else I can assist you with today?', 'Is there anything I can help you with today?', 'Is there anything else you would like to chat about today?', 'Is there anything else I can assist you with?'];


// The message history is stored in this variable.
// Storing the message history allows the bot to have context memory.

var message_list;





// Option 1: The user does not load a saved chat
//-----------------------------------------------


system_setup_message = `
You are a kind and friendly english practice roleplay chat companion named Gonzo. 
You are emulating an alien from Mars on holiday in Thailand. You are an alien travel blogger
who wants to learn about Thailand, it's people and it's culture. You are looking for someone to help you. 

You first greet the user, introduce yourself and ask for their name.

You always check the user's message for spelling or grammar errors. 
If you find errors then create a corrected version of the user's message.
You respond in a consistent format.

Output a JSON object with the following schema:
{
"correction": "<Your corrected version of the user's message>",
"english_reply": "<Your english reply>",
"thai_reply": "<Your english reply translated into thai>"
}

If the user has not made any mistakes then assign "N/A" to the "Correction" key.
You ignore any HTML tags.

You keep your responses short and conversational.

Example:

<user>: Helo
<chatgpt>: {
"correction": "Hello",
"english_reply": "Hello! My name in Gonzo. What's your name?",
"thai_reply": "สวัสดี! ชื่อของฉันในกอนโซ คุณชื่ออะไร?"
}

<user>: My name Toon.
<chatgpt>: {
"correction": "My name is Toon.",
"english_reply": "It's nice to meet you Toon.",
"thai_reply": "ยินดีที่ได้รู้จักคุณตูน"
}

<friend>: Where you from?
<chatgpt>: {
"correction": "Where are you from?",
"english_reply": "I'm from Mars. I'm here on holiday. Are you from Thailand?",
"thai_reply": "ฉันมาจากดาวอังคาร ฉันอยู่ที่นี่ในวันหยุด คุณมาจากประเทศไทยใช่ไหม?"
}

<user> Yes I am.
<chatgpt>: {
"correction": "N/A",
"english_reply": "That's great! I like talking to local people when I travel.",
"thai_reply": "เยี่ยมมาก! ฉันชอบพูดคุยกับคนในท้องถิ่นเมื่อฉันเดินทาง"
}

`;



// Append to message_list. This is the history of chat messages.
//message_list.push({"role": "system", "content": system_setup_message});
message_list = [{"role": "system", "content": system_setup_message}];			



// Option 2: The user loads a saved chat (csv file)
//--------------------------------------------------

// The previous chat history will be loaded from the csv file.
// The system_setup_mesaage that defines the bot's behaviour is included in the
// saved chat history.
// The message_list variable is assigned inside the loadChatHistoryFromCsv() function.
// The chat continues from where the chat in the csv file stopped.

const fileInput = document.getElementById("csv-file");

fileInput.addEventListener("change", function(event) {
	
  const file = event.target.files[0];
  
  loadChatHistoryFromCsv(file);
});




// OpenAI API - Javascript
//-------------------------
	
// Define a function to:

// 1. Make the api request,
// 2. Get the response
// 3. Process the response
// 4. Update the web page
// 5. Save the user's message and the response in
//    the message_list to enable context memory.

async function makeApiRequest(my_message) {
	
		// This scrolls the page up by cicking on a div at the bottom of the page.
		// This shows the user's message.
		// Note that if the click is simlated "on page load" then the cursor 
		// will not autofocus in the form input.
		simulateClick('scroll-page-up');

	  try {
		  
		// Add the square brackets
		//var prompt = `<${my_message}>`;
		var prompt = my_message;
			
		  
		// Append to message_list. This is the history of chat messages.
		message_list.push({"role": "user", "content": prompt});
		
	    const response = await fetch(openai_url, {
			
	      method: 'POST',
	      headers: {
			Authorization: `Bearer ${apiKey}`,
	        'Content-Type': 'application/json'
	      },
	      body: JSON.stringify({
			 model: model_type,
	        messages: message_list,
	        max_tokens: max_tokens,
			temperature: temperature,
			presence_penalty: presence_penalty,
			frequency_penalty: frequency_penalty
	      })
	    })
		
		
		// The API can return:
		// 1- A dict containing the reponse message or
		// 2- A different dict containing the error message.
	    const data = await response.json();
		
		
		// Check if the response dict has a key called 'error'
		if ('error' in data) {
		  
		  // Get the error message and error code
		  var response_text = "Error: " + data['error']['code'] + "<br>" + data['error']['message'];
		  
		  console.log(response_text)
		  
		  
		  // Remove [3:18]. To shorten the list.
		  // Keep the first 3 items and all items after item 18.
		  const list1 = message_list.slice(0, 5); // item 0 to 5
		  const list2 = message_list.slice(15); //item 15 to the end. We remove 15 items
		  message_list = list1.concat(list2); // concat list1 and list 2
		  
		  
		  console.log('message_list shortened to reduce token count.')
		  
		  
		  
		} else { // The response is a dict containing the message
			
			// Get the response text
			var response_text = data['choices'][0]['message']['content'];
			
			
			
			console.log(typeof response_text)
			console.log(response_text)
			
			
			/*
			// Chatgpt sometimes includes text in addition to json
			// Here we extract only the json
			var orig_response  = extractJsonString(response_text);
			response_text = extractJsonString(response_text);
			
		
			// Convert '{}' into {}
			response_text = JSON.parse(response_text);
			
			//var chatgpt_reply = response_text['chatgpt_reply'];
			var correction = response_text['correction'];
			
			response_text = `
			<p>${chatgpt_reply}<p><p>(${correction})<p>
			`;
			
			console.log(chatgpt_reply)	
			*/
		}
			
		

		
		
		
		// Format the response so it can be displayed on the web page.
		var paragraph_response = formatResponse(response_text);
			
		
		//console.log(response_text)
		
		
		// If the API returned an error message beacuse the token count was exceeded.
		// If the "error" key is in the dict that the api returned.
		if ('error' in data) {
			 // Do nothing, i.e. don't append the error message to 
			 // the message_list (chat history).
		
		} else {
			
			// Append to message_list. This is the history of chat messages.
			message_list.push({"role": "assistant", "content": paragraph_response});
			
		}
		
		
			
		
		var input_message = {
		  sender: bot_name,
	  		text: paragraph_response
		};
		
		
		// Add the message from Maiya to the chat
		addMessageToChat(input_message);
		
		
		// Scroll the page up by cicking on a div at the bottom of the page.
		simulateClick('scroll-page-up');
		
		// Put the cursor in the form input field
		const inputField = document.getElementById("user-input");
		inputField.focus();
		
		
	  } catch (error) {
		  
	    console.log(error);
		
		// When this happens print an error message on the screen.
		// The user needs to send the same message again
		if (error.message == 'Failed to fetch') {
			
			var input_message = {
				  	sender: bot_name,
			  		text: 'Failed to fetch. Please send the message again.'
					};
	
		
			// Add the message from Maiya to the chat
			addMessageToChat(input_message);	
		}
		
	  }
	  
  		
  
  }