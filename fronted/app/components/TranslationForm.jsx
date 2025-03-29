// components/TranslationForm.js
'use client';
import { useState, useEffect } from 'react';

export default function TranslationForm() {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [languages, setLanguages] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Fetch languages when component mounts
    fetch('http://localhost:5000/api/languages')
      .then(res => res.json())
      .then(data => setLanguages(data));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await fetch('http://localhost:5000/api/translate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text, target_lang: targetLang }),
      });
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4">Language Translator</h1>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="text" className="block mb-2">Enter Text</label>
          <textarea
            id="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="w-full p-2 border rounded"
            rows="3"
            required
          />
        </div>
        
        <div className="mb-4">
          <label htmlFor="targetLang" className="block mb-2">
            Select Target Language
          </label>
          <select
            id="targetLang"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full p-2 border rounded"
            required
          >
            {Object.entries(languages).map(([code, name]) => (
              <option key={code} value={code}>
                {name}
              </option>
            ))}
          </select>
        </div>
        
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
          disabled={loading}
        >
          {loading ? 'Translating...' : 'Translate'}
        </button>
      </form>
      
      {result && (
        <div className="mt-6 p-4 bg-gray-50 rounded">
          <p className="mb-2">
            <strong>Detected Language:</strong> {result.detected_lang_name}
          </p>
          <p>
            <strong>Translation:</strong> {result.translation}
          </p>
        </div>
      )}
    </div>
  );
}