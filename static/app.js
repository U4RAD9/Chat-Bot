class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button'),
            //added by aman
            micButton: document.querySelector('.mic__button')
        }

        this.state = false;
        this.messages = [];
        this.is_registering = false;
        this.registration_state = 0;
        this.user_data = {};

        let msg2 = {name: "Sam", message: "<div class='prompt'>Greetings! from XRAI Digital!!! We Provide Diagstonics services at your Home.<br><br>Please select an option:<ul><li><span class='btn btn-response'>Book an appointment</li><li><span class='btn btn-response'>Services at home</li><li><span class='btn btn-response'>Request a call-back</li><li><span class='btn btn-response'>About Us</li></ul></div>"}
        this.messages.push(msg2);
        this.updateChatText(document.querySelector('.chatbox__support'));
    }

    display() {
        const {openButton, chatBox, sendButton, micButton} = this.args;

        openButton.addEventListener('click', () => this.toggleState(chatBox))
        sendButton.addEventListener('click', () => this.onSendButton(chatBox))
        micButton.addEventListener('mousedown', () => this.onMicButton(chatBox))

        const node = chatBox.querySelector('#chat-input');
        node.addEventListener("keyup", ({key}) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }
    toggleState(chatbox) {
        this.state = !this.state;

        // show or hides the box
        if(this.state) {
            chatbox.classList.add('chatbox--active')
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    onDateChanged(e) {
        console.log(e)
    }

    onSendButton(chatbox) {
        const {openButton, chatBox, sendButton, micButton} = this.args;
        var textField = chatbox.querySelector('#chat-input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }

        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        if (text1 === "Back" || text1 === "back" || text1 === "Go Back" || text1 === "go back") {
            let msg2 = { name: "Sam", message: "<div class='prompt'>Please select an option:<ul><li><span class='btn btn-response'>Book an appointment</li><li><span class='btn btn-response'>Services at home</li><li><span class='btn btn-response'>Request a call-back</li><li><span class='btn btn-response'>About Us</li></ul></div>"};
            this.messages.push(msg2);
            this.updateChatText(chatbox)
            textField.value = ''
            return;
        }

        if(!this.is_registering) {
            fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: JSON.stringify({ message: text1 }),
                mode: 'cors',
                headers: {
                  'Content-Type': 'application/json'
                },
              })
              .then(r => r.json())
              .then(r => {
                r.answer.forEach((resp) => {
                    let msg2 = { name: "Sam", message: resp };
                    if (resp == 'Enter your name') {
                        this.is_registering = true;
                        this.registration_state = 1;
                    }
                    this.messages.push(msg2);
                });
                this.updateChatText(chatbox)
                textField.value = ''

            }).catch((error) => {
                console.error('Error:', error);
                this.updateChatText(chatbox)
                textField.value = ''
            });
        } else {
            let response = '';
            if (this.registration_state != 6) {
                switch(this.registration_state) {
                    case 0:
                        response = 'Enter your name';
                        break;
                    case 1:
                        response = 'Enter your phone number';
                        this.user_data['name'] = textField.value;
                        break;
                    case 2:
                        response = "<div class='prompt'>Would you like to enter your email? <ul><li><span class='btn btn-response'>Yes</li><li><span class='btn btn-response'>No</li></ul></div>";
                        this.user_data['phone'] = textField.value;
                        break;
                    case 3:
                        if (textField.value == 'Yes' || textField.value == 'yes') {
                            response = 'Enter your email';
                        } else {
                           this.registration_state = 4;
                        response = 'Your request is in progress, please wait...';
                        }
                        break;

                    //Added by aman
                    case 4:
                        response = 'Your request is in progress, please wait...';
                        this.user_data['email'] = textField.value;
                        //this.registration_state = 9;
                        break;
                    //end


                    case 5:
                        break;
                    default:
                        response = "<div class='prompt'>I do not understand...<span class='btn btn-response'>Go Back</span></div>";
                        this.is_registering = false;
                        this.registration_state = 0;
                        this.user_data = {};
                        break;
                }
                let msg3 = { name: "Sam", message: response };
                this.messages.push(msg3);
                this.updateChatText(chatbox);
                textField.value = '';
                if (this.registration_state == 4) {
                    this.bookAppointment(chatbox);
                }else {
                    this.registration_state++;
                }
            } else {
                this.bookAppointment(chatbox);
            }
        }
    }

    //Added by aman


    bookAppointment(chatbox) {
        fetch('http://127.0.0.1:5000/book-appointment', {
                method: 'POST',
                body: JSON.stringify(this.user_data),
                mode: 'cors',
                headers: {
                  'Content-Type': 'application/json'
                },
              })
              .then(r => r.json())
              .then(r => {
                let msg2 = { name: "Sam", message: r.answer };
                this.messages.push(msg2);
                this.updateChatText(chatbox)
                 this.is_registering = false;
                 this.registration_state = 0;
                 this.user_data = {};
            }).catch((error) => {
                console.error('Error:', error);
                this.updateChatText(chatbox)
            });
    }

    updateChatText(chatbox) {
        const {openButton, sendButton} = this.args;

        var html = '';
        this.messages.slice().reverse().forEach(function(item, index) {
            if (item.name === "Sam")
            {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else
            {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
          });

        const chatmessage = chatbox.querySelector('.chatbox__messages');
        chatmessage.innerHTML = html;
        chatmessage.scrollTop = chatmessage.scrollHeight

        const buttons = chatbox.querySelectorAll(".btn-response");
        buttons.forEach((p) => {
            p.addEventListener('click', () => {
                chatbox.querySelector('input').value = p.innerHTML;
                sendButton.click();
            });
        });
    }

    onMicButton(chatbox) {
        const {openButton, chatBox, sendButton, micButton} = this.args;

        var speech = true;
		window.SpeechRecognition = window.SpeechRecognition
						|| window.webkitSpeechRecognition;

		const recognition = new SpeechRecognition();
		recognition.interimResults = true;
//		chatBox.appendChild(p);

		recognition.addEventListener('result', e => {
			const transcript = Array.from(e.results)
				.map(result => result[0])
				.map(result => result.transcript)
				.join('')

			chatBox.querySelector('input').value = transcript;
			console.log(transcript);
		});

		if (speech == true) {
			recognition.start();
			recognition.addEventListener('end', recognition.start);
		}
    }
}


const chatbox = new Chatbox();
chatbox.display();