'use client';
import { useState, useEffect } from 'react';

export default function TranslationForm() {
  const [text, setText] = useState('');
  const [targetLang, setTargetLang] = useState('en');
  const [languages, setLanguages] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [langLoading, setLangLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch languages when component mounts
    const fetchLanguages = async () => {
      try {
        const res = await fetch('https://language-translator-1-yths.onrender.com/api/languages');
        if (!res.ok) throw new Error('Failed to fetch languages');
        
        const data = await res.json();
        setLanguages(data);
      } catch (err) {
        setError('Failed to load languages. Please try again.');
      } finally {
        setLangLoading(false);
      }
    };

    fetchLanguages();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('https://language-translator-1-yths.onrender.com/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, target_lang: targetLang }),
      });

      if (!response.ok) throw new Error('Translation failed');

      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
      setResult({ detected_lang_name: 'Unknown', translation: 'Translation error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-black">
      <h1 className="text-2xl font-bold mb-4">Language Translator</h1>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

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
          <label htmlFor="targetLang" className="block mb-2">Select Target Language</label>
          <select
            id="targetLang"
            value={targetLang}
            onChange={(e) => setTargetLang(e.target.value)}
            className="w-full p-2 border rounded"
            required
            disabled={langLoading || !languages}
          >
            {langLoading ? (
              <option>Loading languages...</option>
            ) : languages ? (
              Object.entries(languages).map(([code, name]) => (
                <option key={code} value={code}>{name}</option>
              ))
            ) : (
              <option disabled>No languages available</option>
            )}
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
          <p className="mb-2"><strong>Detected Language:</strong> {result.detected_lang_name}</p>
          <p><strong>Translation:</strong> {result.translation}</p>
        </div>
      )}
    </div>
  );
}
