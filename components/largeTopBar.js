import DappLogo from "./dappLogo";
import { useContext, useState } from "react";
import { UserContext } from "@/lib/userContext";
import Relationships from "@/hooks/relationships";
import DbUsers from "@/hooks/dbUsers";
import { useRouter } from "next/router";
import Image from "next/image";
import PageLoadOptions from "@/hooks/pageLoadOptions";

export const TopBarObjects = () => {
  const router = useRouter();
  const { fetchAllPosts } = DbUsers();
  const { fetchFollowing } = Relationships();
  const [openSuggestions, setOpenSuggestions] = useState(null);

  const {
    allUserObject,
    followingPosts,
    setFollowingPosts,
    originalPostValues,
    postValues,
    setPostValues,
    userNumId,
    setSearchFilter,
    setTagsFilter,
    originalExplorePosts,
    setExplorePosts,
  } = useContext(UserContext);
  const searchForItem = (e) => {
    if (router.pathname === "/profile/[user]") {
      setOpenSuggestions(
        allUserObject.filter((user) =>
          user.username.toLowerCase().includes(e.target.value)
        )
      );
    } else if (router.pathname === "/explore") {
      const foundItems = originalExplorePosts.filter(
        (post) =>
          post[0].content.toLowerCase().includes(e.target.value) ||
          post[0].content.toUpperCase().includes(e.target.value) ||
          post[0].users.username.toLowerCase().includes(e.target.value) ||
          post[0].users.username.toUpperCase().includes(e.target.value)
      );
      setTagsFilter(false);
      setSearchFilter(true);
      setExplorePosts(foundItems);
    } else {
      const foundItems = originalPostValues.filter(
        (post) =>
          post.content.toLowerCase().includes(e.target.value) ||
          post.content.toUpperCase().includes(e.target.value) ||
          post.users.username.toLowerCase().includes(e.target.value) ||
          post.users.username.toUpperCase().includes(e.target.value)
      );
      setTagsFilter(false);
      setSearchFilter(true);
      setPostValues(foundItems);
    }
  };

  const changePostsDisplayed = () => {
    fetchFollowing(userNumId).then((res) => {
      let followingPosts = [];
      let i = res.data.length - 1;
      if (res.data !== null && res.data !== undefined) {
        while (i >= 0) {
          followingPosts.push(
            postValues.find(
              (rel) => rel.users.id === res.data[i].following_userid
            )
          );
          i--;
        }
      }
      setPostValues(followingPosts);
      setFollowingPosts(true);
    });
  };

  const getAllPosts = () => {
    fetchAllPosts().then((result) => {
      setPostValues(result.data);
      setFollowingPosts(false);
    });
  };
  return {
    followingPosts,
    changePostsDisplayed,
    getAllPosts,
    searchForItem,
    openSuggestions,
    setOpenSuggestions
  };
};
export const SmallTopBar = ({ middleTab, relationship }) => {
  const {
    followingPosts,
    changePostsDisplayed,
    getAllPosts,
    searchForItem,
    openSuggestions,
    setOpenSuggestions
  } = TopBarObjects();
  const [mobileSearchToggle, setMobileSearchToggle] = useState(false);

  return (
    <div
      id="fixed-topbar"
      className="lg:hidden py-3 px-2 flex flex-row w-full justify-between sm:justify-start space-x-2 bg-white"
    >
      <span className="flex justify-center items-center">
        <DappLogo size={"small"} />
      </span>
      {middleTab && relationship && !mobileSearchToggle && (
        <div className="flex flex-row font-semibold">
          <div
            onClick={getAllPosts}
            className={
              followingPosts
                ? "text-sm md:text-base py-2 px-4 md:py-3 md:px-9 cursor-pointer rounded-l-xl bg-gray-100 flex items-center border border-gray-200 text-gray-500"
                : "text-sm md:text-base py-2 px-4 md:py-3 md:px-9 cursor-pointer flex flex-row bg-pastelGreen text-white items-center rounded-l-xl space-x-1"
            }
          >
            <span>For</span>
            <span>You</span>
          </div>
          <div
            onClick={changePostsDisplayed}
            className={
              followingPosts
                ? "text-sm md:text-base py-2 px-4 md:py-3 md:px-9 cursor-pointer flex flex-row bg-pastelGreen text-white items-center rounded-r-xl space-x-1"
                : "text-sm md:text-base py-2 px-4 md:py-3 md:px-9 cursor-pointer rounded-r-xl bg-gray-100 flex items-center border border-gray-200 text-gray-500"
            }
          >
            Following
          </div>
        </div>
      )}
      {middleTab && relationship ? (
        <>
          {/* search bar 1 out of 4 */}
          <span
            onClick={() => {
              setMobileSearchToggle(true);
            }}
            className={
              mobileSearchToggle
                ? "hidden"
                : "flex sm:hidden flex-row justify-end items-center"
            }
          >
            <svg
              className="w-6 h-6 text-black"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
          </span>
          {/* search bar 2 out of 4 */}
          <span
            className={mobileSearchToggle ? "w-full" : "hidden sm:flex w-full"}
          >
            <span className="py-1 pl-4 w-full flex flex-row items-center rounded-lg bg-gray-100">
              {/* search bar 3 out of 4 */}
              <svg
                className="w-4 h-4 text-gray-500"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
              <input
                onChange={searchForItem}
                type="search"
                className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-400"
                placeholder="Search for users, images, hashtags and more!"
              />
            </span>
          </span>
        </>
      ) : (
        <span className="w-full">
          <span className="py-1 pl-4 w-full flex flex-row items-center rounded-lg bg-gray-100">
            {/* search bar 3 out of 4 */}
            <svg
              className="w-4 h-4 text-gray-500"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 20 20"
            >
              <path
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
              />
            </svg>
            <input
              onChange={searchForItem}
              type="search"
              className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-400"
              placeholder="Search for users, images, hashtags and more!"
            />
          </span>
        </span>
      )}
          {openSuggestions && (
          <span id="mobile-suggests" className="flex flex-col">
            {openSuggestions.length !== 0 &&
              openSuggestions.slice(0,8).map((os) => {
                return (
                  <span key={os.id} onClick={()=>{PageLoadOptions().fullPageReload(`/profile/${os.username}`)}} className="p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium">
                    <span className="relative h-8 w-8 flex">
                      <Image
                        src={os.avatar}
                        alt="user"
                        width={30}
                        height={30}
                        className="border border-white rounded-full"
                      />
                    </span>
                    <span>{os.username}</span>
                  </span>
                );
              })}
          </span>
          
        )}
        {
          openSuggestions && <div
          onClick={() => {setOpenSuggestions(null)}}
          id="clear-overlay"
        ></div>
        }
    </div>
  );
};

const LargeTopBar = ({ relationship }) => {
  const {
    followingPosts,
    changePostsDisplayed,
    getAllPosts,
    searchForItem,
    openSuggestions,
    setOpenSuggestions
  } = TopBarObjects();
  return (
    <div className="flex flex-row w-full space-x-2 bg-white rounded-xl p-2">
      {relationship && (
        <div className="flex flex-row space-x-2 font-semibold">
          <div
            onClick={getAllPosts}
            className={
              followingPosts
                ? "text-sm cursor-pointer py-1 px-4 rounded-xl bg-gray-100 flex items-center border border-gray-200 text-gray-400"
                : "text-sm cursor-pointer flex flex-row bg-pastelGreen text-white py-1 px-4 items-center rounded-xl space-x-1"
            }
          >
            <span>For</span>
            <span>You</span>
          </div>
          <div
            onClick={changePostsDisplayed}
            className={
              followingPosts
                ? "text-sm cursor-pointer flex flex-row bg-pastelGreen text-white py-1 px-4 items-center rounded-xl space-x-1"
                : "text-sm cursor-pointer py-1 px-4 rounded-xl bg-gray-100 flex items-center border border-gray-200 text-gray-400"
            }
          >
            Following
          </div>
        </div>
      )}
      {/* search bar 4 out of 4 */}
      <div className="w-full flex flex-col">
      <div className="py-1 pl-4 w-full flex flex-row items-center rounded-lg bg-gray-100">
        <svg
          className="w-4 h-4 text-gray-500"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 20 20"
        >
          <path
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
          />
        </svg>
        <input
          onChange={searchForItem}
          type="search"
          className="w-full text-sm text-gray-500 bg-transparent border-none focus:ring-0 placeholder-gray-400"
          placeholder="Search for users, images, hashtags and more!"
        />
        
      </div>
      {openSuggestions && (
          <span className="flex flex-col z-10">
            {openSuggestions.length !== 0 &&
              openSuggestions.slice(0,8).map((os) => {
                return (
                  <span key={os.id} onClick={()=>{PageLoadOptions().fullPageReload(`/profile/${os.username}`)}} className="p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium">
                    <span className="relative h-8 w-8 flex">
                      <Image
                        src={os.avatar}
                        alt="user"
                        width={30}
                        height={30}
                        className="border border-white rounded-full"
                      />
                    </span>
                    <span>{os.username}</span>
                  </span>
                );
              })}
          </span>
        )}
        </div>
      {
          openSuggestions && <div
          onClick={() => {setOpenSuggestions(null)}}
          id="clear-overlay"
        ></div>
        }
    </div>
  );
};
export default LargeTopBar;
