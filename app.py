from flask import Flask, render_template, request, jsonify
from chat import get_response
from flask_mysqldb import MySQL
import mysql.connector
from twilio.rest import Client
import MySQLdb
from flask_cors import CORS, cross_origin

app = Flask(__name__)

#Added by aman
CORS(app, support_credentials=True)

@app.route("/login")
@cross_origin(supports_credentials=True)
def login():
  return jsonify({'success': 'ok'})

if __name__ == "__main__":
  app.run(host='0.0.0.0', port=8000, debug=True)

app.config['MYSQL_HOST'] = '127.0.0.1'
app.config['MYSQL_USER'] = 'root'
app.config['MYSQL_PASSWORD'] = 'your_current_password'
app.config['MYSQL_DB'] = 'chatbot'
mysql = MySQL(app)

@app.get("/")
def index_get():
    return render_template("base.html")

@app.post('/book-appointment')
def book_appointment():
    name = request.get_json().get("name")
    phone = request.get_json().get("phone")
    email = request.get_json().get("email")

    cur = mysql.connection.cursor()
    cur.execute("INSERT INTO xraiuser(name, phone, email) VALUES (%s, %s, %s)", (name, phone, email))
    mysql.connection.commit()

    #added by aman
    client = Client(account_sid, auth_token)

    message = client.messages.create(
        from_='whatsapp:+14155238886',
        body=f"New call-back request by Name: {name}, Patient Contact Info Phone Number: {phone}, Email: {email}. please contact...",
        to='whatsapp:+918587075085'
    )

    print(message.sid)

    return jsonify({"answer": f"Dear {name} Thanks for showing your interest in our services, Your request has been received our representative will contact you, feel free to Call us on 18002702900 for any help...Thanks! XRAi digital"})

@app.post("/predict")
def predict():
    text = request.get_json().get("message")
     # TODO: check if text is valid
    print(text)
    response = get_response(text)
    message = {"answer": response}
    return jsonify(message)


# # Initialize the Twilio client
# client = Client(account_sid, auth_token)
#
# # Define a route to handle incoming requests
# @app.route('/send-message', methods=['POST'])
# def send_message():
#     # Connect to the MySQL database
#     mydb = mysql.connector.connect(
#         host="127.0.0.1",
#         user="root",
#         password="your_current_password",
#         database="chatbot"
#     )
#
#     # Retrieve the data you want to send
#     mycursor = mydb.cursor()
#     mycursor.execute("SELECT name, email, phone FROM users")
#     data = mycursor.fetchall()
#
#     # Format the data into a message
#     message = "Here are the customers:\n"
#     for row in data:
#         message += f"{row[0]} ({row[1]})\n"
#
#     # Send the message using the Twilio API
#     from_number = '+13203027652'
#     to_number = request.form['+919122878369']  # the recipient's WhatsApp number
#     client.messages.create(
#         body=message,
#         from_=from_number,
#         to=to_number
#     )
#
#     return 'Message sent successfully'
###############################################################################33
@app.route('/testdb')
def testdb():
    try:
        # Establish a connection to MySQL database
        conn = MySQLdb.connect(host='127.0.0.1',
                               user='root',
                               password='your_current_password',
                               db='chatbot')
        # Close the connection
        conn.close()
        return 'Database connection successful!'
    except:
        return 'Database connection unsuccessful!'





if __name__ == "__main__":
    app.run(debug=True)