import Image from "next/image";
import Head from "next/head";
import LargeRightBar from "@/components/largeRightBar";
import NavBar, { MobileNavBar } from "@/components/navBar";
import { useContext, useState, useEffect } from "react";
import { UserContext } from "@/lib/userContext";
import Posts from "@/components/posts";
import DbUsers from "@/hooks/dbUsers";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import { useRouter } from "next/router";

const Search = () => {
  const router = useRouter()

  const {
    originalPostValues,
    setPostValues,
    postValues,
    allUserObject,
    setAllUserObject,
    darkMode
  } = useContext(UserContext);
  const [searchedHash, setSearchedHash] = useState('')
  const [searchInitialized, setSearchInitialized] = useState(false)
  const [hashtagList, setHashtagList] = useState(null);
  const [topicSelected, setTopicSelected] = useState(false);
  const [openSuggestions, setOpenSuggestions] = useState(null);
  const { fetchAllUsers, fetchAllPosts } = DbUsers();
  const { fullPageReload } = PageLoadOptions();

  const getSelectedHashTag = (htag) => {
    const selectedTag = originalPostValues.filter((post) =>
      {return post.content.toLowerCase().includes(htag.toLowerCase())}
    );
    console.log(htag, selectedTag)
    setPostValues(selectedTag);
    setTopicSelected(true);
  };

  const fetchAllHashTags = () => {
    const allTagsCount = {};

    originalPostValues.forEach((post) => {
      const tags = post.content ? (post.content.toLowerCase().match(/#\w+/g) || []) : [];
      const uniqueTags = [...new Set(tags)];

      uniqueTags.forEach((tag) => {
        allTagsCount[tag] = (allTagsCount[tag] || 0) + 1;
      });
    });

    const trendingAllTags = Object.entries(allTagsCount).sort(
      (a, b) => b[1] - a[1]
    );
    setHashtagList(trendingAllTags);
  };

  const getAllSearchData = () => {
    if (!postValues) {
      fetchAllPosts()
        .then((result) => {
          setPostValues(result.data);
        })
        .catch((e) => console.log(e, "search.js file error"));
    }

    if (!allUserObject) {
      // setDisableUsersReentry(true);
      fetchAllUsers()
        .then((res) => {
          setAllUserObject(res.data);
        })
        .catch((e) => console.log(e, "search.js file users error"));
    }
  };

  const searchForItem = (e) => {
    setSearchInitialized(true)
    setSearchedHash(e.target.value)
    if (e.target.value !== "") {
      if (!postValues || !allUserObject || !originalPostValues) {
        getAllSearchData();
      }
      const foundPosts = originalPostValues
        ? originalPostValues.filter((post) =>
            {
                return post.content.trim().toLowerCase().includes(e.target.value.trim().toLowerCase())
            } 
          )
        : [];

      const foundUsers = allUserObject
        ? allUserObject.filter((user) =>
            {return user.username.trim().toLowerCase().includes(e.target.value.trim().toLowerCase())}
          )
        : [];

      setOpenSuggestions({
        foundPosts: foundPosts,
        foundUsers: foundUsers,
      });
    } else {
      setOpenSuggestions(null);
    }
  };

  useEffect(() => {
    if (!searchInitialized) {
       const hash = router.asPath.split('#')[1];

       const queryP = router.asPath.split('/search?')[1]
 
       if (hash && originalPostValues) {
         console.log('Hash:', hash);
         setSearchedHash('#'.concat(hash));
         getSelectedHashTag(hash); 
       } else if (queryP && originalPostValues) {
         setSearchedHash(queryP);
         getSelectedHashTag(queryP);
       }
    }
    
    
    if (originalPostValues !== null && originalPostValues !== undefined) {
      fetchAllHashTags();
    }
    if (allUserObject === null || allUserObject === undefined) {
      fetchAllUsers()
        .then((res) => {
          setAllUserObject(res.data);
        })
        .catch((e) => console.log(e, "useEffect in search tab users error"));
    }
  }, [searchInitialized, router, originalPostValues, allUserObject]);

  return (
    <main>
      <Head>
        <title>Animebook Search</title>
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/assets/animeBcc.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/assets/animeBcc.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/assets/animeBcc.png"
        />
        <meta name="theme-color" content="#000" />
        <meta
          name="description"
          content="Search trending topics and mangas on Animebook"
        />
        <meta property="og:image" content="/assets/animeBcc.png" />
      </Head>
      <section className="mb-5 flex flex-row px-1 w-full">
        <NavBar />
        <div className="w-full py-2 lg:pl-[13.9rem] flex flex-col">
          <span className={`${darkMode ? 'bg-zinc-800 text-white' : 'border-[1.5px] border-gray-300 bg-gray-100 text-gray-500'} px-2 py-1 w-full flex flex-row items-center rounded-3xl`}>
            <svg
              className="w-4 h-4 text-slate-400"
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
              type="search"
              value={searchedHash}
              onChange={searchForItem}
              className="w-full text-sm bg-transparent border-none focus:ring-0 placeholder-gray-400"
              placeholder="Search"
            />
          </span>

          {openSuggestions !== null && (
            <span className="w-full flex flex-col">
              {openSuggestions !== null && (
                <span className={`${darkMode ? 'text-white' : 'text-black'} w-full flex flex-col`}>
                  <span
                    id="anime-book-font"
                    className={`${darkMode ? 'text-white' : 'text-gray-700 '} text-xl font-bold pt-1`}
                  >
                    Search results
                  </span>
                  <span
                    onClick={() => {
                      // setPostValues(openSuggestions.foundPosts);
                      // setOpenSuggestions(null);
                      // setTopicSelected(true);
                      fullPageReload(`/search?${searchedHash}`, 'window')
                    }}
                    className="p-2 flex flex-row items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium"
                  >
                    {`${openSuggestions.foundPosts.length} posts found`}
                  </span>
                </span>
              )}
              {openSuggestions.foundUsers !== undefined &&
                openSuggestions.foundUsers !== null &&
                openSuggestions.foundUsers.length !== 0 && (
                  <span className={darkMode ? "text-white" : 'text-black'}>
                    <span
                      id="anime-book-font"
                      className={`${darkMode ? 'text-white' : 'text-gray-700'} text-xl font-bold py-1`}
                    >
                      People
                    </span>
                    {openSuggestions.foundUsers.map((os) => {
                      return (
                        <span
                          key={os.id}
                          onClick={() => {
                            fullPageReload(`/profile/${os.username}`);
                          }}
                          className="p-2 flex flex-row space-x-1 items-center cursor-pointer hover:bg-pastelGreen hover:text-white font-medium"
                        >
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
            </span>
          )}

          {topicSelected ? (
            <span className="mt-2 space-y-2 flex flex-col">
              <svg
                onClick={() => {
                  setSearchInitialized(true)
                  setTopicSelected(false);
                  setPostValues(originalPostValues);
                  
                }}
                width="30px"
                height="30px"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="cursor-pointer"
              >
                <rect width={48} height={48} fill="white" fillOpacity={0.01} />
                <path
                  d="M31 36L19 24L31 12"
                  stroke="gray"
                  strokeWidth={4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <Posts />
            </span>
          ) : (
            hashtagList !== null &&
            hashtagList !== undefined &&
            hashtagList.length > 0 && (
              <span className="px-2 lg:px-0">
                {hashtagList.map((tag, index) => {
                  return (
                    <div
                      key={tag}
                      onClick={() => {
                        getSelectedHashTag(tag[0]);
                      }}
                      className={`${darkMode ? 'text-white' : 'text-black'} cursor-default py-2.5 border-b border-gray-300 text-sm flex flex-col justify-between`}
                    >
                      <span className="font-bold">
                        {index + 1} {" . "}
                        {tag[0].replace(/#/g, "").charAt(0).toUpperCase() +
                          tag[0].replace(/#/g, "").slice(1)}
                      </span>
                      <span className="text-xs font-medium text-gray-400">{`${
                        tag[1]
                      } ${tag[1] > 1 ? "posts" : "post"}`}</span>
                    </div>
                  );
                })}
              </span>
            )
          )}
        </div>

        <div className="hidden lg:block sticky right-2 top-20 heighto">
          <LargeRightBar />
        </div>
      </section>
      <MobileNavBar />
    </main>
  );
};
export default Search;
