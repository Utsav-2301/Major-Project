from flask import Flask, render_template, request
from flask_socketio import SocketIO
from random import randint
from threading import Lock
from datetime import datetime

thread = None
thread_lock = Lock()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

def get_current_datetime():
    now = datetime.now()
    return now.strftime("%m/%d/%Y %H:%M:%S")

def background_thread():
    while True:
        dummy_sensor_value = randint(1,100)
        socketio.emit('updateSensorData', {'value': dummy_sensor_value, "date": get_current_datetime()})
        socketio.sleep(1)

@app.route('/')
def index():
    return render_template('temp.html')

@socketio.on('connect')
def connect():
    global thread
    print('Client connected')

    global thread
    with thread_lock:
        if thread is None:
            thread = socketio.start_background_task(background_thread)

@socketio.on('disconnect')
def disconnect():
    print('Client disconnected',  request.sid)

if __name__ == '__main__':
    socketio.run(app)