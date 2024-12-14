import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import HyperlinkCard from "./hyperlinkCard";

import { useRouter } from "next/router";

const CommentConfig = ({ text, tags }) => {
  const {
    originalPostValues,
    setPostValues,
    setTagsFilter,
    setSearchFilter,
    chosenTag,
    setChosenTag,
  } = useContext(UserContext);
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();

  const getClickedHashtag = (htag) => {
    if (router.pathname === "/explore") return;

    setSearchFilter(false);
    setTagsFilter(true);
    if (htag === chosenTag) {
      setChosenTag(null);
      setPostValues(originalPostValues);
    } else {
      setChosenTag(htag);
      const selectedTag = originalPostValues.filter((post) =>
        post.content.toLowerCase().includes(htag.toLowerCase())
      );

      setPostValues(selectedTag);

      if (
        ["/comments/[comments]", "/profile/[user]"].includes(router.pathname)
      ) {
        router.push("/home");
      }
    }
  };

  const renderWord = (word, index) => {
    if (word.startsWith("#")) {
      return (
        <span
          key={index}
          onClick={() => getClickedHashtag(word)}
          className="text-green-500 cursor-pointer"
          style={{ paddingRight: "4px" }}
        >
          {word}
        </span>
      );
    } else if (word.startsWith("@")) {
      return (
        <span
          key={index}
          onClick={() => fullPageReload(`/profile/${word.substring(1)}`)}
          className="text-[#3197fd] font-medium cursor-pointer"
          style={{ paddingRight: "4px" }}
        >
          {word}
        </span>
      );
    } else if (word.startsWith("http")) {
      // Render the HyperlinkCard for URLs
      return (
        <div key={index} style={{ marginTop: "10px" }}>
          <HyperlinkCard url={word} />
        </div>
      );
    } else {
      return (
        <span key={index} style={{ whiteSpace: "pre-wrap" }}>
          {word}
        </span>
      );
    }
  };

  const words = text.split(/(\s+)/).map(renderWord);
  return <span>{words}</span>;
};

export default CommentConfig;