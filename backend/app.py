from flask import Flask, request, jsonify
from flask_cors import CORS
import spacy
import re

app = Flask(__name__)
CORS(app)  # Enable requests from the React frontend

# Load SpaCy NLP model
nlp = spacy.load("en_core_web_sm")

# Store text temporarily
stored_text = ""

@app.route("/store", methods=["POST"])
def store_text():
    global stored_text
    data = request.get_json()
    stored_text = data.get("text", "")
    return jsonify({"message": "Text stored successfully!"})

@app.route("/parse", methods=["GET"])
def parse_text():
    global stored_text
    if not stored_text:
        return jsonify({"error": "No text found to parse!"}), 400

    # Extract relevant information
    parsed_data = parse_information(stored_text)
    return jsonify(parsed_data)

def parse_information(text):
    doc = nlp(text)
    data = {
        "drugs": [],
        "dosage": [],
        "frequency": [],
        "duration": []
    }

    # Extract drug names
    for ent in doc.ents:
        if ent.label_ == "PRODUCT":
            data["drugs"].append(ent.text)

    # Use regex for dosage, frequency, and duration
    data["dosage"] = re.findall(r"\d+mg|\d+ml", text)
    data["frequency"] = re.findall(r"once|twice|thrice|daily|hourly", text, re.IGNORECASE)
    data["duration"] = re.findall(r"\d+\s?(day|week|month)s?", text)

    return data

if __name__ == "__main__":
    app.run(debug=True)
