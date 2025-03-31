import { useEffect, useRef, useState, useContext, useCallback, use } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";

export default function ExploreActions({id, myProfileId, ownerDetails}){
    const [likes, setLikes] = useState(null)
    const {commentValues, setCommentValues, openComments, setOpenComments, setPostOwnerDetails} = useContext(UserContext)
    const [views, setViews] = useState(null)
    const [bookmarks, setBookmarks] = useState(null)
    const [liked, setLiked] = useState(false)
    const [bookmarked, setBookmarked] = useState(false)
    const [reentry, setReentry] = useState(false)
    const [bookmarkReentry, setBookmarkReentry] = useState(false)


    const addBookmark = () => {
        if (bookmarkReentry) {
          setBookmarkReentry(false);
          if (bookmarked) {
            supabase
              .from("bookmarks")
              .delete()
              .eq("postid", id)
              .eq("userid", myProfileId)
              .then(() => {
                fetchBookmarkStatus();
              })
              .catch((e) => console.log(e));
          } else {
            supabase
              .from("bookmarks")
              .insert({ postid: id, userid: myProfileId })
              .then(() => {
                fetchBookmarkStatus();
              })
              .catch((e) => console.log(e));
          }
        }
      };
      const fetchBookmarkStatus = () => {
        supabase
          .from("bookmarks")
          .select()
          .eq("postid", id)
          .then((res) => {
            if (res.data !== undefined && res.data !== null) {
            setBookmarks(res.data.length)
              setBookmarked(!!res.data.find((bk) => bk.userid === myProfileId));
              setBookmarkReentry(true);
            }
          });
      };
    
      const likePost = () => {
        if (reentry) {
          setReentry(false);
          if (liked) {
            setLiked(false);
            setLikes(
              likes.filter((lk) => {
                return lk.userid !== myProfileId;
              })
            );
            supabase
              .from("likes")
              .delete()
              .eq("postid", id)
              .eq("userid", myProfileId)
              .then(async () => {
                setReentry(true);
                // fetchLikes();
                
              });
          } else {
            setLiked(true);
            setLikes([
              ...likes,
              {
                postid: id,
                userid: myProfileId,
              },
            ]);
            supabase
              .from("likes")
              .insert({ postid: id, userid: myProfileId })
              .then(async () => {
                setReentry(true);
                // fetchLikes();
                
              });
          }
        }
      };
    
      const fetchLikes = () => {
        supabase
          .from("likes")
          .select()
          .eq("postid", id)
          .then((res) => {
            if (res.data !== undefined && res.data !== null) {
              setLikes(res.data);
              setLiked(!!res.data.find((lk) => lk.userid === myProfileId));
              setReentry(true);
            }
          });
      };

      const addView = () => {
        
            supabase
              .from("views")
              .insert({ postid: id, userid: myProfileId })
              .then(() => {
                
              })
              .catch((e) => console.log(e));
          
      };

      const fetchViews = () => {
        supabase
          .from("views")
          .select()
          .eq("postid", id)
          .then((res) => {
            if (res.data !== undefined && res.data !== null) {
              setViews(res.data.length);
              
            }
          })
          .catch((e) => console.log(e));
      };

      const [comments, setComments] = useState(null)
      const fetchComments = () => {
        supabase
          .from("comments")
          .select(
            "id, created_at, content, posts(id), users(id, avatar, username), parentid, media"
          )
          .eq("postid", id)
          .order("created_at", { ascending: false })
          .then((res) => {
            if (res.data !== undefined && res.data !== null) {
                console.log(res.data)
               setComments(res.data);
            }
          });
      };
      const [loaded, setLoaded] = useState(false)
    
      useEffect(()=>{
        console.log(loaded)
        if (!loaded){
            addView()
            fetchComments()
            fetchLikes()
            fetchBookmarkStatus()
            fetchViews()
            setLoaded(true)
        }
        if (views === null){
            fetchViews()
        }
    }, [loaded, views])
    return <span className="flex flex-col justify-center items-center space-y-8">
    <span className="flex flex-col items-center justify-center">
      <svg
      onClick={likePost}
        id="shadowthis"
        className="cursor-pointer"
        fill={liked ? "#EB4463" : "white"}
        xmlns="http://www.w3.org/2000/svg"
        width="35"
        height="35"
        viewBox="0 0 18.365 16.178"
      >
        <path
          id="heart_1_"
          data-name="heart (1)"
          d="M18.365,6.954A5.271,5.271,0,0,1,16.8,10.719L9.767,17.564a.847.847,0,0,1-1.169,0L1.569,10.727A5.33,5.33,0,1,1,9.1,3.181l.083.083.083-.083a5.33,5.33,0,0,1,9.1,3.773Z"
          transform="translate(0 -1.62)"
          fill={liked ? "#EB4463" : "white"}
        />
      </svg>
      <span id="shadowthis">{likes && likes.length}</span>
    </span>
    <span className="flex flex-col items-center justify-center">
      <svg onClick={()=>{setCommentValues(comments); setOpenComments(true); setPostOwnerDetails(ownerDetails)}}
        id="shadowthis"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 16.18 16.178"
      >
        <path
          id="comment"
          d="M.679,11.324.01,15.317a.751.751,0,0,0,.206.647.74.74,0,0,0,.522.213.756.756,0,0,0,.125-.007L4.856,15.5a7.95,7.95,0,0,0,3.235.677A8.089,8.089,0,1,0,0,8.089,7.95,7.95,0,0,0,.679,11.324Z"
          fill="#fff"
        />
      </svg>
      <span id="shadowthis">{comments && comments.length}</span>
    </span>

    <span className="flex flex-col items-center justify-center">
      <svg
      onClick={addBookmark}
        id="shadowthis"
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 14.508 16.179"
      >
        <path
          id="bookmark"
          d="M16.508,2.206V15.443a.734.734,0,0,1-.476.669.858.858,0,0,1-.862-.118L9.254,11.274,3.338,15.995a.868.868,0,0,1-.864.117A.736.736,0,0,1,2,15.443V2.206A2.326,2.326,0,0,1,4.418,0H14.09a2.326,2.326,0,0,1,2.418,2.206Z"
          transform="translate(-2)"
          fill={bookmarked ? "#04dbc4" : "white"}
        />
      </svg>
      <span id="shadowthis">{bookmarks && bookmarks}</span>
    </span>

    <span className="flex flex-col items-center justify-center">
      <svg
        id="shadowthis"
        xmlns="http://www.w3.org/2000/svg"
        width="30"
        height="30"
        viewBox="0 0 16.176 16.178"
      >
        <g
          id="noun-sharingan-5340043"
          transform="translate(-27.476 -27.489)"
        >
          <path
            id="Pfad_4724"
            data-name="Pfad 4724"
            d="M39.553,28.542A8.088,8.088,0,1,0,42.6,39.561,8.088,8.088,0,0,0,39.553,28.542Zm1.764,11.8a4,4,0,0,0-.212-1.049.388.388,0,0,0-.586-.187h0a1.394,1.394,0,0,1-1.319.1,5.138,5.138,0,0,1-7.186.09,1.387,1.387,0,0,1-.507.129,3.512,3.512,0,0,1-2.935-1.207,3.916,3.916,0,0,0,1.02.334.392.392,0,0,0,.449-.417h0a1.39,1.39,0,0,1,.553-1.193,5.145,5.145,0,0,1,3.593-6.324,1.351,1.351,0,0,1,.147-.5,3.513,3.513,0,0,1,2.547-1.9,3.952,3.952,0,0,0-.812.719.388.388,0,0,0,.126.6h0a1.376,1.376,0,0,1,.719,1.078,5.141,5.141,0,0,1,3.794,4.951,5.256,5.256,0,0,1-.151,1.243,1.383,1.383,0,0,1,.359.359A3.554,3.554,0,0,1,41.317,40.345Z"
            transform="translate(0)"
            fill="white"
          />
          <path
            id="Pfad_4725"
            data-name="Pfad 4725"
            d="M43.245,37.92a1.593,1.593,0,0,1-.072.162,1.383,1.383,0,0,1-2.515-.162,4.534,4.534,0,0,0-3.09,5.461.945.945,0,0,1,.176-.025A1.383,1.383,0,0,1,38.9,45.609a4.523,4.523,0,0,0,6.187-.083,1.436,1.436,0,0,1-.1-.14,1.387,1.387,0,0,1,.406-1.915,1.358,1.358,0,0,1,.981-.2,4.514,4.514,0,0,0-3.129-5.35Zm-1.3,6.284a1.944,1.944,0,1,1,1.944-1.944A1.944,1.944,0,0,1,41.945,44.2Z"
            transform="translate(-6.376 -6.683)"
            fill="white"
          />
        </g>
      </svg>
      <span id="shadowthis">{views && views}</span>
    </span>
  </span>
}