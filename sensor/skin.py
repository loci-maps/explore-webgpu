import os, csv, time, serial
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "http://127.0.0.1:5000"}})
PORT = serial.Serial('/dev/cu.usbserial-A7045P1K', baudrate=57600)

def parseData(dataIn):
    batteryLevelInt = None
    voltageBiasInt = None
    voltageOutputInt = None

    try:
        if dataIn is not None:
            begin = dataIn[0:2]
            if begin != b"AA":
                raise Exception(f"String should start with 'AA', instead it was: {begin}")
        
            tmpStr = dataIn[2:4]
            size = int(tmpStr, 16)
            
            tmpStr = dataIn[6:10]
            id = int(tmpStr, 16)
            
            tmpStr = dataIn[14:16]
            serial = int(tmpStr, 16)
            
            tmpStr = dataIn[22:24]
            batteryLevelInt = int(tmpStr, 16)
            batteryLevel = batteryLevelInt * 0.012464135808848989 + 0.0063781751018856239 + 0.20000000000000001
            batteryLevel = (batteryLevelInt * 3) / 255
            
            tmpStr = dataIn[30:34]
            voltageBiasInt = int(tmpStr, 16)
            voltageBias = (voltageBiasInt * 3) / 1023
            
            tmpStr = dataIn[34:38]
            voltageOutputInt = int(tmpStr, 16)
            voltageOutput = (voltageOutputInt * 3) / 1023

            if voltageOutputInt == voltageBiasInt:
                conductanceMicroS = 0.0
            else:
                conductanceMicroS = (voltageBias - voltageOutput) / (batteryLevel - voltageBias)
            
            if conductanceMicroS < 0.0:
                if abs(batteryLevel - voltageBias) < 0.0029296875:
                    conductanceMicroS = abs(conductanceMicroS)
                elif abs(voltageOutput - voltageBias) < 0.0050000000000000001:
                    conductanceMicroS = abs(conductanceMicroS)
                else:
                    conductanceMicroS = abs(conductanceMicroS)
        
        batteryLevel /= 5
        voltageBias /= 5
        voltageOutput /= 5
        conductanceMicroS /= 3

        return batteryLevel, voltageBias, voltageOutput, conductanceMicroS
    
    except ValueError as ve:
        raise Exception(f"Bad number format:\n{ve}")

@app.route('/parse-data', methods=['GET'])
def parse_data():
    sensorData = []
    try:
        print("Starting data gathering")
        start_time = time.time()
        while time.time() - start_time < 150:
            data = PORT.readline()
            batteryLevel, voltageBias, voltageOutput, conductanceMicroS = parseData(data)
            print("Time: {a}".format(a=time.time() - start_time))
            print(batteryLevel, voltageBias, voltageOutput, conductanceMicroS)
            sensorData.append([time.time(), batteryLevel, voltageBias, voltageOutput, conductanceMicroS])
        PORT.close()
        print("Finished gathering data")

        # Write data to CSV file
        csv_filename = 'data.csv'
        csv_path = os.path.join('data', csv_filename)
        with open(csv_path, 'w', newline='') as csvfile:
            writer = csv.writer(csvfile)
            writer.writerow(['Timestamp', 'Battery Level', 'Voltage Bias', 'Voltage Output', 'Conductance'])
            writer.writerows(sensorData)

        headers = {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
                'Content-Disposition': 'attachment;filename=data.csv',
                'Content-Type': 'text/csv'
        }
        return jsonify(csvfile, headers=headers)
    
    except Exception as e:
        return str(e), 500

if __name__ == '__main__':
    app.run()