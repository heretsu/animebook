import wanakana from 'wanakana';
import kuromoji from 'kuromoji';

function splitIntoChunks(text, maxLength = 500) {
  const chunks = [];
  let start = 0;
  while (start < text.length) {
    let end = start + maxLength;
    const lastSpace = text.lastIndexOf(" ", end);
    end = lastSpace > start ? lastSpace : end;
    chunks.push(text.slice(start, end));
    start = end;
  }
  return chunks;
}

function tokenizeJapanese(text) {
  return new Promise((resolve, reject) => {
    kuromoji.builder({ dicPath: 'node_modules/kuromoji/dict' }).build((err, tokenizer) => {
      if (err) return reject(err);
      const tokens = tokenizer.tokenize(text);
      resolve(tokens);
    });
  });
}

function toRomajiWithSpacing(tokens) {
  return tokens
    .map((token) => {
      const reading = token.reading || token.surface_form;
      return wanakana.toRomaji(reading);
    })
    .join(' ');
}

async function translateViaMyMemory(text, sourceLang, targetLang) {
    const chunks = splitIntoChunks(text);
    const translations = [];
    let matchScoreTotal = 0;
  
    for (const chunk of chunks) {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${sourceLang}|${targetLang}`;
      const response = await fetch(url);
      const data = await response.json();
      const translated = data.responseData?.translatedText || chunk;
      const match = parseFloat(data?.match) || 0;
  
      matchScoreTotal += match;
      translations.push(translated);
    }
  
    const averageMatch = matchScoreTotal / chunks.length;
    return { translatedText: translations.join(" "), averageMatch };
  }
  
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let { text, targetLang } = req.body;
  const toRomaji = targetLang === 'ja-romaji';
  if (toRomaji) targetLang = 'ja';

  try {
    // Step 1: Detect original language (via dummy en|en query)
    const detectRes = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|en`
    );
    const detectData = await detectRes.json();
    const detectedLang = detectData.responseData?.detectedSourceLanguage || 'en';

    let translatedText = text;

    // Step 2: If already in target language, no need to translate
    if (detectedLang !== targetLang) {
      // Step 3: Try direct translation
      const firstAttempt = await translateViaMyMemory(text, detectedLang, targetLang);
      translatedText = firstAttempt.translatedText;
      
      if (firstAttempt.averageMatch < 0.8 && detectedLang !== 'en' && targetLang !== 'en') {
        const toEnglish = await translateViaMyMemory(text, detectedLang, 'en');
        const fromEnglish = await translateViaMyMemory(toEnglish.translatedText, 'en', targetLang);
        translatedText = fromEnglish.translatedText;
      }
      
    }

    // Step 5: Romaji conversion (optional)
    if (toRomaji && detectedLang === 'ja') {
      const tokens = await tokenizeJapanese(translatedText);
      translatedText = toRomajiWithSpacing(tokens);
    }

    res.status(200).json({
      translatedText,
      detectedLang,
    });
  } catch (error) {
    console.error("Translation error:", error);
    res.status(200).json({
      translatedText: text,
      detectedLang: 'unknown',
    });
  }
}
