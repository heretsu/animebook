import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import HyperlinkCard from "./hyperlinkCard";
import { useTranslation } from "react-i18next";

const CommentConfig = ({ translateVersion, setTranslateVersion, username, text }) => {
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const [seeMore, setSeeMore] = useState(false);
  const [translatedText, setTranslatedText] = useState('');
  const maxWords = 20;
  const { i18n } = useTranslation();
  const currentLang = i18n.language;

  // Translation using MyMemory
  useEffect(() => {
    const translateText = async () => {
      if (!translateVersion || !text) {
        setTranslatedText(text);
        return;
      }
  
      try {
        const res = await fetch('/api/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text, targetLang: currentLang }) // currentLang = i18n.language
        });
  
        const data = await res.json();
  
        if (data.detectedLang !== currentLang) {
          setTranslatedText(data.translatedText);
        } else {
          setTranslatedText(text); // already in user’s language
        }
      } catch (err) {
        console.error("Translation error:", err);
        setTranslatedText(text);
      }
    };
  
    translateText();
  }, [translateVersion, text, currentLang]);
  
  const renderWord = (word, index) => {
    if (word.startsWith("#")) {
      return (
        <span
          key={index}
          onClick={() => fullPageReload("/search?" + word)}
          className="leading-tight text-[#EB4463] cursor-pointer pr-1"
        >
          {word}
        </span>
      );
    } else if (word.startsWith("@")) {
      return (
        <span
          key={index}
          onClick={() => fullPageReload(`/profile/${word.substring(1)}`, 'window')}
          className="leading-tight text-[#3197fd] font-bold cursor-pointer pr-1"
        >
          {word}
        </span>
      );
    } else if (word.startsWith("http")) {
      return (
        <div key={index} className="leading-tight mt-2">
          <HyperlinkCard url={word} />
        </div>
      );
    } else {
      return <span key={index} className="leading-tight whitespace-pre-wrap">{word}</span>;
    }
  };

  const words = translatedText ? translatedText.split(/(\s+)/).map(renderWord) : [];

  return (
    <span
      id="scrollbar-remove"
      className="leading-tight word-break break-word whitespace-pre-wrap"
      style={{
        maxHeight: seeMore ? "30vh" : "auto",
        overflowY: "scroll",
        display: "block",
      }}
    >
      {username && <span className="font-semibold">{username}: </span>}

      {router.pathname === "/explore" && words.length > maxWords && !seeMore ? (
        <>
          <span className="lg:hidden">{words.slice(0, maxWords)}</span>
          <span className="hidden lg:block">{words}</span>
        </>
      ) : (
        words
      )}

      {router.pathname === "/explore" && words.length > maxWords && (
        <span
          onClick={() => setSeeMore(!seeMore)}
          className="lg:hidden cursor-pointer font-semibold pl-0.5"
        >
          {seeMore ? "See Less" : "...See More"}
        </span>
      )}

      {translateVersion && (
        <span
          onClick={() => setTranslateVersion(false)}
          className="block cursor-pointer font-semibold pl-0.5"
        >
          See original
        </span>
      )}
    </span>
  );
};

export default CommentConfig;
