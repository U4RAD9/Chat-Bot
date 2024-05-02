import random
import json
import torch

from model import NeuralNet
from nltk_utils import bag_of_words, tokenize

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r') as json_data:
    intents = json.load(json_data)

FILE = "data.pth"
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

bot_name = "Sam"

def get_response(msg):
    resparr = []
    sentence = tokenize(msg)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)


    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:
        for intent in intents['intents']:
            if tag == intent["tag"]:
                # toreturn = random.choice(intent['responses'])
                toreturn = intent['responses']
                print(toreturn)
                for resp in toreturn:
                    print(resp)
                    if type(resp) is dict:
                        button = random.choice(resp['buttons'])
                        buttonHtml = "<div class='prompt'> Please select an option: <ul>"
                        for button in resp['buttons']:
                            if (type(button)) is dict:
                                buttonHtml += f"<li><a class='btn' target='_blank' href='{button['payload']}'>{button['title']}</a></li>"
                            else:
                                buttonHtml += f"<li><span class='btn btn-response'>{button}</span></li>"
                        buttonHtml += "</ul></div>"
                        resparr.append(buttonHtml)
                    else:
                        resparr.append(resp)
    if resparr:
        return resparr

    return ["<div class='prompt'>I do not understand...<span class='btn btn-response'>Go Back</span></div>"]

if __name__ == "__main__":
    print("Let's chat! (type 'quit' to exit)")
    while True:
        # sentence = "do you use credit cards?"
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)

