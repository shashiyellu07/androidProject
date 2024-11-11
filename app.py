from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import shutil
from androguard.misc import AnalyzeAPK
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Directory to store uploaded APK files
UPLOAD_FOLDER = './uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Increase maximum file size to 500MB
app.config['MAX_CONTENT_LENGTH'] = 500 * 1024 * 1024  # 500MB in bytes

# Configure upload settings
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_PATH'] = 500 * 1024 * 1024  # Also set max content path

@app.route('/api/upload', methods=['POST'])
def upload_file():
    try:
        if 'apk_file' not in request.files:
            return jsonify({'error': 'No file provided'}), 400
        
        file = request.files['apk_file']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        if not file.filename.endswith('.apk'):
            return jsonify({'error': 'Invalid file type. Please upload an APK file'}), 400
        
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Save the file in chunks to handle large files
        chunk_size = 8192  # 8KB chunks
        with open(filepath, 'wb') as f:
            while True:
                chunk = file.stream.read(chunk_size)
                if not chunk:
                    break
                f.write(chunk)
        
        return jsonify({'message': 'File uploaded successfully', 'filename': filename})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/analyze', methods=['POST'])
def analyze():
    try:
        data = request.json
        if not data or 'filename' not in data:
            return jsonify({'error': 'No filename provided'}), 400
        
        filename = secure_filename(data['filename'])
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        if not os.path.exists(filepath):
            return jsonify({'error': 'File not found'}), 404
        
        # Analyze the APK with Androguard
        a, d, dx = AnalyzeAPK(filepath)
        
        # Extract relevant information
        analysis = {
            "app_name": a.get_app_name(),
            "package_name": a.get_package(),
            "permissions": list(a.get_permissions()),
        }
        
        # Generate mitigations based on permissions
        mitigations = []
        for perm in analysis["permissions"]:
            if "INTERNET" in perm:
                mitigations.append("Ensure secure transmission with HTTPS.")
            if "ACCESS_FINE_LOCATION" in perm or "ACCESS_COARSE_LOCATION" in perm:
                mitigations.append("Alert users when accessing location data.")
            if "READ_CONTACTS" in perm:
                mitigations.append("Limit access to contacts to only necessary features.")
            if "READ_SMS" in perm or "SEND_SMS" in perm:
                mitigations.append("Inform users if app accesses or sends SMS messages.")
            if "CAMERA" in perm:
                mitigations.append("Implement proper camera access controls and user notifications.")
            if "RECORD_AUDIO" in perm:
                mitigations.append("Implement proper audio recording controls and user notifications.")
        
        if not mitigations:
            mitigations = ["No specific mitigations needed based on permissions."]
        
        # Clean up the uploaded file
        try:
            os.remove(filepath)
        except Exception as e:
            print(f"Error removing file: {e}")
        
        return jsonify({
            "analysis": analysis,
            "permissions": analysis["permissions"],
            "mitigations": list(set(mitigations))  # Remove duplicates
        })
        
    except Exception as e:
        if os.path.exists(filepath):
            try:
                os.remove(filepath)
            except:
                pass
        return jsonify({'error': str(e)}), 500

@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)