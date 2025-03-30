from flask import Flask, request, jsonify
from flask_cors import CORS
from langdetect import detect, DetectorFactory
from deep_translator import GoogleTranslator
import os

# Ensure consistent language detection
DetectorFactory.seed = 0

app = Flask(__name__)
CORS(app)

# Define supported languages manually (deep_translator doesn't have a LANGUAGES dictionary)
SUPPORTED_LANGUAGES = GoogleTranslator().get_supported_languages(as_dict=True)


def detect_and_translate(text, target_lang):
    """Detects language and translates text"""
    try:
        detected_lang = detect(text)
    except Exception as e:
        print("Language Detection Error:", e)
        return "unknown", "Language detection failed"

    try:
        translator = GoogleTranslator(source='auto', target=target_lang)
        translated_text = translator.translate(text)
    except Exception as e:
        print("Translation Error:", e)
        return detected_lang, "Translation failed"

    return detected_lang, translated_text


@app.route("/api/languages", methods=['GET'])
def get_languages():
    """Returns available languages"""
    return jsonify(SUPPORTED_LANGUAGES)


@app.route("/api/translate", methods=['POST'])
def translate_api():
    """Handles translation requests"""
    try:
        data = request.json
        text = data.get('text', '').strip()
        target_lang = data.get('target_lang', 'en').lower()

        if not text:
            return jsonify({'error': 'Text input is required'}), 400

        if target_lang not in SUPPORTED_LANGUAGES:
            return jsonify({'error': 'Unsupported language'}), 400

        detected_lang, translation = detect_and_translate(text, target_lang)
        
        return jsonify({
            'detected_lang': detected_lang,
            'detected_lang_name': SUPPORTED_LANGUAGES.get(detected_lang, 'Unknown'),
            'translation': translation,
            'target_lang': target_lang,
            'target_lang_name': SUPPORTED_LANGUAGES.get(target_lang, 'Unknown')
        })

    except Exception as e:
        print("API Error:", e)
        return jsonify({'error': 'Internal Server Error', 'details': str(e)}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
