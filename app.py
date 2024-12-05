from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from datetime import datetime
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Configure MySQL Database
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql+pymysql://root:abhi%40123@localhost:3306/time_tracking_app'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# Define TimeEntry Model
class TimeEntry(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    project_name = db.Column(db.String(100), nullable=False)
    task_description = db.Column(db.String(200), nullable=False)
    start_time = db.Column(db.DateTime, nullable=False)
    end_time = db.Column(db.DateTime, nullable=False)

# Initialize Database
with app.app_context():
    db.create_all()

# Utility function to validate datetime
def parse_datetime(date_string):
    try:
        return datetime.strptime(date_string, "%Y-%m-%d %H:%M")
    except ValueError:
        return None

# Create Time Entry
@app.route('/time-entry', methods=['POST'])
def create_time_entry():
    data = request.get_json()
    try:
        # Validate input data
        start_time = parse_datetime(data.get('start_time'))
        end_time = parse_datetime(data.get('end_time'))
        if not start_time or not end_time:
            return jsonify({"error": "Invalid datetime format. Use YYYY-MM-DD HH:MM."}), 400

        if end_time <= start_time:
            return jsonify({"error": "End time must be greater than start time."}), 400

        new_entry = TimeEntry(
            project_name=data.get('project_name'),
            task_description=data.get('task_description'),
            start_time=start_time,
            end_time=end_time
        )
        db.session.add(new_entry)
        db.session.commit()
        return jsonify({"message": "Time entry created successfully!", "id": new_entry.id}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Get All Time Entries
@app.route('/time-entries', methods=['GET'])
def get_time_entries():
    try:
        entries = TimeEntry.query.order_by(TimeEntry.start_time.desc()).all()
        result = [
            {
                "id": entry.id,
                "project_name": entry.project_name,
                "task_description": entry.task_description,
                "start_time": entry.start_time.strftime("%Y-%m-%d %H:%M"),
                "end_time": entry.end_time.strftime("%Y-%m-%d %H:%M")
            }
            for entry in entries
        ]
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Generate Task Report
@app.route('/task-report', methods=['GET'])
def generate_task_report():
    try:
        entries = TimeEntry.query.order_by(TimeEntry.start_time.desc()).all()
        report = [
            {
                "project_name": entry.project_name,
                "task_description": entry.task_description,
                "start_time": entry.start_time.strftime("%Y-%m-%d %H:%M"),
                "end_time": entry.end_time.strftime("%Y-%m-%d %H:%M"),
                "time_spent": str(entry.end_time - entry.start_time)
            }
            for entry in entries
        ]
        return jsonify(report), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Update Time Entry
@app.route('/time-entry/<int:id>', methods=['PUT'])
def update_time_entry(id):
    try:
        entry = TimeEntry.query.get(id)
        if not entry:
            return jsonify({"error": "Time entry not found"}), 404

        data = request.get_json()
        start_time = parse_datetime(data.get('start_time')) if 'start_time' in data else entry.start_time
        end_time = parse_datetime(data.get('end_time')) if 'end_time' in data else entry.end_time

        if end_time <= start_time:
            return jsonify({"error": "End time must be greater than start time."}), 400

        entry.project_name = data.get('project_name', entry.project_name)
        entry.task_description = data.get('task_description', entry.task_description)
        entry.start_time = start_time
        entry.end_time = end_time

        db.session.commit()
        return jsonify({"message": "Time entry updated successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Delete Time Entry
@app.route('/time-entry/<int:id>', methods=['DELETE'])
def delete_time_entry(id):
    try:
        entry = TimeEntry.query.get(id)
        if not entry:
            return jsonify({"error": "Time entry not found"}), 404

        db.session.delete(entry)
        db.session.commit()
        return jsonify({"message": "Time entry deleted successfully!"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Run Server
if __name__ == '__main__':
    app.run(debug=True)
