import { useContext, useState } from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import HyperlinkCard from "./hyperlinkCard";
import { useRouter } from "next/router";

const CommentConfig = ({ username, text}) => {
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const [seeMore, setSeeMore] = useState(false);
  const maxWords = 20;

  const renderWord = (word, index) => {
    if (word.startsWith("#")) {
      return (
        <span
          key={index}
          onClick={() => fullPageReload("/search?".concat(word))}
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

  const words = text.split(/(\s+)/).map(renderWord);

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
      {username !== null && username !== undefined && <span className="font-semibold p">{username}:{" "}</span>}
      {router.pathname === "/explore" && words.length > maxWords && !seeMore
        ? (
          <span>
            <span className="lg:hidden">{words.slice(0, maxWords)}</span>
            <span className="hidden lg:block">{words}</span>
          </span>
        )
        : words}

      {router.pathname === "/explore" && words.length > maxWords && (
        <span
          onClick={() => setSeeMore(!seeMore)}
          className="lg:hidden cursor-pointer font-semibold pl-0.5"
        >
          {seeMore ? "See Less" : "...See More"}
        </span>
      )}
    </span>
  );
};


export default CommentConfig;
