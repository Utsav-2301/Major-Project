from flask import Flask, render_template, request, jsonify, send_file
from flask_socketio import SocketIO
from threading import Lock, Event
import csv

thread = None
voltage = 0
current = 0
resistance = 0
voltage_values = []
Plot_Graph = False
thread_lock = Lock()
plot_event = Event()

app = Flask(__name__)
socketio = SocketIO(app, cors_allowed_origins='*')

@app.route('/receive-data', methods=['POST'])
def receive_data():
    try:
        data = request.get_json()
        current_value = data.get('current_value')
        resistance_value = data.get('resistance_value')
        plt_graph = data.get('plot_graph')

        global current, resistance, Plot_Graph
        current = int(current_value)
        resistance = int(resistance_value)
        Plot_Graph = bool(plt_graph)

        # Signal the background thread that the value is updated else it will not display the graph because the background thread is 
        # parallely running side by side
        plot_event.set()

        return jsonify({'message': 'Data received successfully'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def background_thread():
    while True:
        plot_event.wait()

        with thread_lock:
            plot = Plot_Graph

        if plot:
            voltage = current * resistance
            voltage_values.append(voltage)
            socketio.emit('updateSensorData', {'value': voltage})
            socketio.sleep(1)
        else:
            socketio.sleep(1)

@app.route('/download-data', methods=['GET'])
def download_data():
    with open('voltage_data.txt', 'w', newline='') as file:
        writer = csv.writer(file)
        writer.writerows([[voltage] for voltage in voltage_values])
    return send_file('voltage_data.txt', as_attachment=True)

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
    print('Client disconnected', request.sid)

if __name__ == '__main__':
    socketio.run(app)
