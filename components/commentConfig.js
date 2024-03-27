import { useContext } from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
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
    if (router.pathname === "/explore"){
      return
    }
    
    setSearchFilter(false);
    setTagsFilter(true);
    if (htag === chosenTag) {
      setChosenTag(null);
      setPostValues(originalPostValues);
    } else {
      setChosenTag(htag);
      const selectedTag = originalPostValues.filter(
        (post) =>
          post.content.toLowerCase().includes(htag.toLowerCase())
      );

      setPostValues(selectedTag);
      
      if (
        router.pathname === "/comments/[comments]" ||
        router.pathname === "/profile/[user]"
      ) {
        router.push("/");
      }
    }
  };

  if (tags) {
    const words = text.split(/(\s+)/).map((word, index) => {
      if (word.startsWith("#")) {
        return (
          <span
            onClick={() => {
              getClickedHashtag(word);
            }}
            key={index}
            className="text-green-500"
          >
            {word}
          </span>
        );
      }
      return word;
    });
    return <span>{words}</span>;
  } else {
    const words = text.split(/(\s+)/).map((word, index) => {
      if (word.startsWith("@")) {
        return (
          <span
            onClick={() => {
              fullPageReload(`/profile/${word}`);
            }}
            key={index}
            className="font-medium"
          >
            {word}
          </span>
        );
      }
      return word;
    });
    return <span>{words}</span>;
  }
};

export default CommentConfig;
