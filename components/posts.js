import { useEffect, useState, useContext, useCallback } from "react";
import { UserContext } from "@/lib/userContext";
import PostCard from "./postCard";
import DbUsers from "@/hooks/dbUsers";
import Spinner from "./spinner";

const Posts = () => {
  const {
    originalPostValues,
    setOriginalPostValues,
    postValues,
    setPostValues,
    userNumId,
    storiesFilter,
    imagesFilter,
    videosFilter,
    tagsFilter,
    searchFilter,
    followingPosts,
  } = useContext(UserContext);

  const [visiblePosts, setVisiblePosts] = useState([]); // Posts currently visible
  const [chunkSize] = useState(10); // Number of posts to load at a time
  const [currentChunk, setCurrentChunk] = useState(1); // Tracks the chunk to load

  const loadMorePosts = useCallback(() => {
    const nextChunk = (postValues || originalPostValues).slice(0, currentChunk * chunkSize);
    setVisiblePosts(nextChunk);
  }, [postValues, originalPostValues, currentChunk, chunkSize]);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >=
        document.documentElement.offsetHeight - 50
      ) {
        setCurrentChunk((prev) => prev + 1);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  // Updating visible posts when currentChunk changes
  useEffect(() => {
    loadMorePosts();
  }, [currentChunk, loadMorePosts]);

  return (
    <div className="space-y-2">
      {postValues !== null &&
        postValues !== undefined &&
        (postValues.length > 0 ? 
          (
          <>
            {visiblePosts.map((post) => (
              <PostCard key={post.id} {...post} myProfileId={userNumId} />
            ))}
            {visiblePosts.length < postValues.length && (
              <div style={{ textAlign: "center", margin: "20px 0" }}>
                <p>Loading more posts...</p>
              </div>
            )}
          </>
        ) : (
          
          <div className="w-full text-center text-slate-800">
            {storiesFilter ? (
              ""
            ) : imagesFilter ? (
              "Image filter result not found. No image posts yet"
            ) : videosFilter ? (
              "Video filter result not found. No video posts yet"
            ) : tagsFilter ? (
              <span className="flex flex-col justify-center items-center">
                <p>Hashtag does not exist.</p>
                <p>Perhaps it has been deleted by creators</p>
              </span>
            ) : searchFilter ? (
              "Search not found. ない!"
            ) : followingPosts ? (
              originalPostValues.length > 0 ? (
                <div className="space-y-2">
                  <span>
                    {
                      "Doesn't seem like you follow anyone who has released a post. We will display all other posts"
                    }
                  </span>
                  {visiblePosts.map((post) => (
                    <PostCard key={post.id} {...post} myProfileId={userNumId} />
                  ))}
                  {visiblePosts.length < originalPostValues.length && (
                    <div style={{ textAlign: "center", margin: "20px 0" }}>
                      <p>Loading more posts...</p>
                    </div>
                  )}
                </div>
              ) : (
                "Doesn't seem like you follow anyone who has released a post"
              )
            ) : (
              <span className="text-gray-500 w-full mx-auto">
                {"Nanimonai! No posts found"}
              </span>
            )}
          </div>
        ))}
    </div>
  );
};
export default Posts;
