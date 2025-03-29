from flask import Flask, request, jsonify
from flask_cors import CORS
from langdetect import detect, DetectorFactory
from googletrans import Translator, LANGUAGES
import os

# Ensure consistent language detection
DetectorFactory.seed = 0

app = Flask(__name__)
CORS(app)

def detect_and_translate(text, target_lang):
    """Detects language and translates text"""
    try:
        detected_lang = detect(text)
    except:
        detected_lang = "unknown"

    translator = Translator()
    translate_text = translator.translate(text, dest=target_lang).text
    return detected_lang, translate_text

@app.route("/api/languages", methods=['GET'])
def get_languages():
    """Returns available languages"""
    return jsonify(LANGUAGES)

@app.route("/api/translate", methods=['POST'])
def translate_api():
    """Handles translation requests"""
    data = request.json
    text = data.get('text', '').strip()
    target_lang = data.get('target_lang', 'en').lower()

    if not text:
        return jsonify({'error': 'Text input is required'}), 400

    detected_lang, translation = detect_and_translate(text, target_lang)

    return jsonify({
        'detected_lang': detected_lang,
        'detected_lang_name': LANGUAGES.get(detected_lang, 'Unknown'),
        'translation': translation,
        'target_lang': target_lang,
        'target_lang_name': LANGUAGES.get(target_lang, 'Unknown')
    })

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
