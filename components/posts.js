import { useEffect, useContext } from "react";
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

  return (
    <div className="space-y-6 pb-2 pt-4">
      {postValues !== null &&
        postValues !== undefined &&
        (postValues.length > 0 ? (
          postValues.map((post) => {
            return <PostCard key={post.id} {...post} myProfileId={userNumId} />;
          })
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
                <div className="space-y-6 pb-2 pt-4">
                  <span>
                    {
                      "Doesn't seem like you follow anyone who has released a post. We will display all other posts"
                    }
                  </span>
                  {originalPostValues.map((post) => {
                    return (
                      <PostCard
                        key={post.id}
                        {...post}
                        myProfileId={userNumId}
                      />
                    );
                  })}
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
