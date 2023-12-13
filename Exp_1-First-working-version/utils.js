

// This functions takes a list of text (paragraphs).
// If the paragraph does not have p tags then it adds them.
function wrapInPTags(paragraphs) {
  let result = '';

  for (let i = 0; i < paragraphs.length; i++) {
    const paragraph = paragraphs[i];

    if (paragraph.includes('<p>')) {
      result += paragraph;
    } else {
      result += '<p>' + paragraph + '</p>';
    }
  }

  return result;
}



// This function formats the text into paragraphs.
function formatResponse(response) {
	
    // Split the response into lines
    const lines = response.split("\n");

    // Combine the lines into paragraphs
    const paragraphs = [];
    let currentParagraph = "";

    for (const line of lines) {
        if (line.trim()) {  // Check if the line is non-empty
            currentParagraph += line.trim() + " ";
        } else if (currentParagraph) {  // Check if the current paragraph is non-empty
            paragraphs.push(currentParagraph.trim());
            currentParagraph = "";
        }
    }

    // Append the last paragraph
    if (currentParagraph) {
        paragraphs.push(currentParagraph.trim());
    }

	// Some text thats returned has \n character but no <p> tags.
	// Other text has <p> tags that we can use when displaying the text on the page.
	// Here we check each list item (paragraph). If it doesn't have <p> tags then add them.
	// This is also important when we save and then reload the chat history.
	//	If you change this make sure that the saving and reloading also works well.
	formattedResponse = wrapInPTags(paragraphs);
	
	
    // Add HTML tags to separate paragraphs
    //const formattedResponse = paragraphs.map(p => `<p>${p}</p>`).join("");
	
	return formattedResponse;
	
	
}



// Function to create a new message container
function createMessageContainer(message) {
	
  var messageContainer = document.createElement("div");
  messageContainer.classList.add("message-container");
  
  messageContainer.classList.add("w3-animate-opacity");
  

  var messageText = document.createElement("span"); //p
  
  
  // This if statement sets the coour of the name that gets displayed
  if (message.sender == bot_name) {
  
	  messageText.innerHTML = "<span class='set-color1'><b>&#x2022 " + message.sender + "</b></span>" + message.text;
  } else {
  	messageText.innerHTML = "<span class='set-color2'><b>&#x2022 " + message.sender + "</b></span>" + message.text;
	}

 
  messageContainer.appendChild(messageText);
  

  return messageContainer;
}


// Function to add a new message to the chat
function addMessageToChat(message) {
	
  var chat = document.getElementById("chat");
  var messageContainer = createMessageContainer(message);
  
  chat.appendChild(messageContainer);
  
}




// This functions saves the chat to a csv file.
// The system setup message, that defines the bot's behaviour, is part of the chat.
function saveChatHistoryToCsv() {
	
  const rows = [
    ['Role', 'Message']
  ];

  message_list.forEach((message) => {
    rows.push([message.role, message.content]);
  });

  const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");

  const encodedUri = encodeURI(csvContent);
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  
  // Save the config in the file name
  link.setAttribute("download", `temp${temperature}_prespen${presence_penalty}_freqpen${frequency_penalty}_${timestamp}.csv`);
  
  link.style.display = "none";

  // Attach the link to the DOM
  document.body.appendChild(link);

  // Trigger the download in the background
  link.click();

  // Remove the link from the DOM
  document.body.removeChild(link);
}


// This function reads the chat history from a csv file and
// displays the chat content on the page.
function writeCsvFileContentToPage(input_list) {
		
		let my_list = input_list;
		
	    for (let i = 0; i < my_list.length; i++) {
			
			
			// row 0 in the csv file is system message.
			// We don't want to display the system message on the page.
			if (i >= 1) {
				
				let chat_role;
				
				if (my_list[i].role === "assistant") {
					chat_role = bot_name;
				} else {
					chat_role = user_name;
					
				}
		  		
				let input_message = {
				  sender: chat_role,
			  		text: my_list[i].content
				}
				
			    //console.log(response_text);
				
				// Add the message from Maiya to the chat
				addMessageToChat(input_message);
				
				
				// Scroll the page up by cicking on a div at the bottom of the page.
				simulateClick('scroll-page-up');
				
				// Put the cursor in the form input field
				const inputField = document.getElementById("user-input");
				inputField.focus();
			
			}	
		}
	}



  
  
  // This function reads the chat history from the csv file 
  // where it has been saved.
  function loadChatHistoryFromCsv(file) {
  const reader = new FileReader();

  reader.readAsText(file);

  reader.onload = function(event) {
    const csv = event.target.result;
    const rows = csv.split("\n");
    const messages = [];

    rows.forEach(row => {
      const cols = row.split(',');
      const role = cols[0];
      const content = cols.slice(1).join(',').replace(/^"(.*)"$/, '$1');
      messages.push({ role, content });
    });

    // Set the message_list to the loaded messages
    // The first item is the header row. Here we are slicing it out.
    let chat_messages = messages.slice(1);

    // Display the csv file chat history on the page
    writeCsvFileContentToPage(chat_messages);

    // Note: message_list is a global variable
    // This line will change the value of the global variable.
    message_list = chat_messages;
  }
}

  
  
  
  