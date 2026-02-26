import { useContext } from "react";
import { UserContext } from "../lib/userContext";
import CommunityPostCard from "./communityPostCard";

const CommunityPosts = ({posts, community, globalCommunityComments, fetchCommunityDetails}) => {
  const {
    userNumId,
  } = useContext(UserContext);

  return (
    <div className="space-y-2 pb-2 pt-4">
      {posts !== null &&
        posts !== undefined &&
        (posts.length > 0 ? (
          posts.map((post) => {
               return <CommunityPostCard key={post.id} {...post} fetchCommunityDetails={fetchCommunityDetails} myProfileId={userNumId} community={community} comments={globalCommunityComments.filter(c => c.community_posts.id === post.id)} />;
          })
        ) : (
          <div className="w-full text-center text-slate-800">
            
              <span className="text-gray-500 w-full mx-auto">
                {"Nanimonai! No posts found"}
              </span>
            
          </div>
        ))}
    </div>
  );
};
export default CommunityPosts;
