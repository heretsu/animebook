import NavBar, { MobileNavBar } from "@/components/navBar";
import EditProfileContainer from "@/components/editProfileContainer";
import supabase from "@/hooks/authenticateUser";
import ConnectionData from "@/lib/connectionData";
import { useRouter } from "next/router";
import LargeTopBar, { SmallTopBar } from "@/components/largeTopBar";
import PlusIcon from "@/components/plusIcon";
import Image from "next/image";
import onePiece from "@/assets/onePiece.jpg";
import { useContext, useEffect, useRef, useState } from "react";
import NewCommunityContainer from "@/components/newCommunityContainer";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import SideBar from "@/components/sideBar";
import DappLibrary from "@/lib/dappLibrary";
import loadscreen from "@/assets/loadscreen.json";
import darkloadscreen from "@/assets/darkloadscreen.json";
import dynamic from "next/dynamic";
import LargeRightBar from "@/components/largeRightBar";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Communities = () => {
  const [cValue, setCValue] = useState("");
  const [defaultCommunities, setDefaultCommunities] = useState(null);
  const { getUserFromId } = DappLibrary();
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const { userData, communities, setCommunities, sideBarOpened, darkMode } =
    useContext(UserContext);
  const [addCommunity, setAddCommunity] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [openRequests, setOpenRequests] = useState(false);
  const [communityRequests, setCommunityRequests] = useState(null);

  const [animeCommunities, setAnimeCommunities] = useState(null);
  const [cryptoCommunities, setCryptoCommunities] = useState(null);
  const [otherCommunities, setOtherCommunities] = useState(null);

  const [expansion, setExpansion] = useState("");
  const fetchCommunityRequests = async () => {
    const { data } = await supabase
      .from("community_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setCommunityRequests(data);
  };

  const checkIfAdmin = () => {
    if (
      // userData.useruuid === "69436932-d1e0-43a6-92bb-1ee4644331b2" ||
      userData.useruuid === "6db1f631-b204-499e-a1e2-fcf77647e14f" ||
      userData.useruuid === "222a3ecf-d715-43ba-9aec-ee97a8b8bed6" ||
      userData.useruuid === "e58cd906-1a25-43fc-bffb-67e3c1689c26" ||
      userData.useruuid === "7adc69a6-84ea-4893-a74f-4977d060a235" ||
      userData.useruuid === "a5ad109b-e701-4752-9fa8-47a6ec913e37" ||
      userData.useruuid === "222a3ecf-d715-43ba-9aec-ee97a8b8bed6" ||
      userData.useruuid === "e58cd906-1a25-43fc-bffb-67e3c1689c26" ||
      userData.useruuid === "881ee2e4-3edc-4a75-82e5-a55972ce09a8"
    ) {
      setIsAdmin(true);
      return "admin";
    } else {
      setIsAdmin(false);
      return "not admin";
    }
  };

  // const uploadToBucket = async (file, storagePath) => {
  //   const newName = Date.now() + file.name;
  //   try {
  //     const result = await supabase.storage
  //       .from("mediastore")
  //       .upload(storagePath + newName, file);

  //     if (result.error) {
  //       throw result.error;
  //     }

  //     return (
  //       process.env.NEXT_PUBLIC_SUPABASE_URL +
  //       "/storage/v1/object/public/mediastore/" +
  //       result.data.path
  //     ); // Adjust according to the actual result data structure
  //   } catch (err) {
  //     console.log(err.message);
  //     console.error(err);
  //     throw err;
  //   }
  // };

  const approveCommunity = async (
    coverFile,
    avatarFile,
    bio,
    owner,
    animeName,
    id
  ) => {
    let coverUrl = coverFile;
    let avatarUrl = avatarFile;

    if (coverUrl === null || avatarUrl === null) {
      return;
    }

    const { error } = await supabase.from("communities").insert({
      cover: coverUrl,
      avatar: avatarUrl,
      bio: bio,
      owner: owner,
      name: animeName
        .trim()
        .toLowerCase()
        .replace(/\s+(?!\s*$)/g, "+"),
    });

    if (!error) {
      setCommunityRequests(
        communityRequests.filter((cr) => {
          return cr.id !== id;
        })
      );
      const { error } = await supabase
        .from("community_requests")
        .delete()
        .eq("id", id);
    }
  };

  const rejectCommunity = async (id) => {
    setCommunityRequests(
      communityRequests.filter((cr) => {
        return cr.id !== id;
      })
    );
    const { error } = await supabase
      .from("community_requests")
      .delete()
      .eq("id", id);
  };

  const fetchCommunities = async () => {
    const { data } = await supabase
      .from("communities")
      .select("*")
      .order("created_at", { ascending: false });

    const members = await supabase.from("community_relationships").select("*");

    if (data) {
      const communityMembersCountMap = new Map();
      members.data.forEach((member) => {
        const communityId = member.communityid;
        communityMembersCountMap.set(
          communityId,
          (communityMembersCountMap.get(communityId) || 0) + 1
        );
      });
      const communitiesWithMembers = data.map((community) => ({
        ...community,
        membersLength: communityMembersCountMap.get(community.id) || 0,
      }));
      const sortedCommunities = [...communitiesWithMembers].sort(
        (a, b) => b.membersLength - a.membersLength
      );
      setCommunities(sortedCommunities);
    }
    setLoading(false);
  };

  const formatGroupName = (text) => {
    return text
      .split("+") // Split the string at '+'
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" ");
  };

  const [activeIndex, setActiveIndex] = useState(0); // Change this to update active step
  const totalDots = 5;

  const scrollContainerRef = useRef(null);
  const handleScroll = () => {
    if (scrollContainerRef.current) {
      if(scrollContainerRef.current.scrollLeft === 0){
        setActiveIndex(0)
      } else{
        setActiveIndex(2)
      }
    }
  };

  useEffect(() => {
    if (userData) {
      checkIfAdmin();
    }

    if (communities && !defaultCommunities) {
      setDefaultCommunities(
        communities.filter(
          (community) =>
            community.type !== "other" &&
            community.type !== "crypto" &&
            community.type !== "nft"
        )
      );
      setAnimeCommunities(
        communities.filter(
          (community) =>
            community.type !== "other" &&
            community.type !== "crypto" &&
            community.type !== "nft"
        )
      );
      setCryptoCommunities(
        communities.filter((community) => community.type === "crypto")
      );
      setOtherCommunities(
        communities.filter((community) => community.type === "other")
      );
      setLoading(false);
    }
  }, [userData, communities, defaultCommunities]);
  return (
    <main className={`${darkMode ? "bg-[#17181C]" : "bg-[#F9F9F9]"}`}>
      <div className="hidden lg:block block z-40 sticky top-0">
        <LargeTopBar relationship={false} />
      </div>
      <section className="relative mb-5 flex flex-row justify-between lg:flex-row lg:space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 pr-4 lg:pl-[16rem] lg:pr-[18rem] xl:pl-[18rem] xl:pr-[20rem] flex flex-col">
          <SmallTopBar relationship={false} />

          {openRequests ? (
            <div className="flex flex-col items-center space-y-1.5 w-full">
              <span className="w-full justify-start">
                <svg
                  onClick={() => {
                    setOpenRequests(false);
                  }}
                  width="35px"
                  height="35px"
                  viewBox="0 0 48 48"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="mb-2 cursor-pointer"
                >
                  <rect
                    width={48}
                    height={48}
                    fill="white"
                    fillOpacity={0.01}
                  />
                  <path
                    d="M31 36L19 24L31 12"
                    stroke="gray"
                    strokeWidth={4}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {loading ? (
                <span className="h-screen">
                  <Lottie
                    animationData={darkMode ? darkloadscreen : loadscreen}
                  />
                </span>
              ) : communityRequests && communityRequests.length > 0 ? (
                communityRequests.map((request) => {
                  return (
                    <span
                      key={request.id}
                      className={`${
                        darkMode
                          ? "bg-[#1e1f24] text-white"
                          : "bg-white text-black"
                      } cursor-pointer w-full justify-between flex flex-row rounded border border-gray-300`}
                    >
                      <Image
                        src={request.avatar}
                        alt="post"
                        height={80}
                        width={80}
                        className="rounded-l-sm object-cover"
                      />
                      <span className="pl-4 flex flex-col py-2 text-sm">
                        <span>
                          <span className="font-bold">
                            {formatGroupName(request.name)}
                          </span>
                          <span className="text-xs font-semibold text-gray-500">
                            {" "}
                            From {getUserFromId(request.owner).username}
                          </span>
                        </span>
                        <span className="text-gray-500 text-xs">
                          {request.bio}
                        </span>
                      </span>
                      {false ? (
                        <span className="flex text-gray-500 text-sm font-semibold flex-col items-center justify-center px-2 space-y-1">
                          Added
                        </span>
                      ) : (
                        <span className="flex text-white text-sm font-semibold flex-col items-center justify-center px-2 space-y-1">
                          <span
                            onClick={() => {
                              approveCommunity(
                                request.cover,
                                request.avatar,
                                request.bio,
                                request.owner,
                                request.name,
                                request.id
                              );
                            }}
                            className="cursor-default px-2 py-0.5 text-center bg-[#EB4463] w-full rounded-md flex flex-row items-center justify-center"
                          >
                            {"Approve"}
                          </span>
                          <span
                            onClick={() => {
                              rejectCommunity(request.id);
                            }}
                            className="cursor-default py-0.5 text-center bg-gray-400 w-full rounded-md flex flex-row items-center justify-center"
                          >
                            {"Reject"}
                          </span>
                        </span>
                      )}
                    </span>
                  );
                })
              ) : (
                <span
                  className={`darkMode ? 'text-gray-200' : 'text-gray-900'} text-sm text-start w-full`}
                >
                  No new community requests
                </span>
              )}
            </div>
          ) : addCommunity ? (
            <div className="w-full space-y-5 mt-1 lg:mt-20 flex flex-col">
              <svg
                onClick={() => {
                  setAddCommunity(false);
                }}
                width="35px"
                height="35px"
                viewBox="0 0 48 48"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="my-2 cursor-pointer"
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
              <NewCommunityContainer isAdmin={isAdmin} />
            </div>
          ) : (
            <div className="w-full space-y-3 mt-1 lg:mt-20 flex flex-col">
              <span
                className={`font-normal border rounded ${
                  darkMode
                    ? "bg-[#1E1F24] border-[#292C33] text-white"
                    : "bg-white border-[#EEEDEF] text-black"
                } py-2 px-3.5 flex flex-col space-y-1 lg:flex-row lg:space-y-0 w-full justify-between items-center text-sm`}
              >
                <span className="text-xs flex flex-col lg:flex-row lg:space-x-2.5 items-center">
                  <span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="15.637"
                      height="15.615"
                      viewBox="0 0 23.637 23.615"
                      fill={darkMode ? "white" : "black"}
                    >
                      <path
                        id="about"
                        d="M12.808,1A11.791,11.791,0,0,0,2.416,18.393l-1.36,4.533a1.312,1.312,0,0,0,1.257,1.69,1.337,1.337,0,0,0,.378-.055L7.223,23.2A11.808,11.808,0,1,0,12.808,1Zm0,5.248A1.312,1.312,0,1,1,11.5,7.56,1.312,1.312,0,0,1,12.808,6.248Zm1.312,13.12H12.808A1.312,1.312,0,0,1,11.5,18.055V12.808a1.312,1.312,0,1,1,0-2.624h1.312A1.312,1.312,0,0,1,14.12,11.5v5.248a1.312,1.312,0,1,1,0,2.624Z"
                        transform="translate(-1 -1)"
                      />
                    </svg>
                  </span>
                  <span>
                    {
                      "Didn't find the community you're looking for? Request to add it now!"
                    }
                  </span>
                </span>
                {isAdmin && (
                  <span
                    onClick={() => {
                      fetchCommunityRequests();
                      setOpenRequests(true);
                    }}
                    className="mr-2 flex items-center justify-center rounded-lg py-1 px-2 bg-blue-400 text-white cursor-pointer"
                  >
                    Requests
                  </span>
                )}
                {isAdmin ? (
                  <span
                    onClick={() => {
                      setAddCommunity(true);
                    }}
                    className="flex flex-row space-x-1 cursor-pointer bg-[#EB4463] text-white p-2.5 rounded-lg"
                  >
                    <span>Add</span>
                    <span>a</span> <span>community</span>
                  </span>
                ) : (
                  <span
                    onClick={() => {
                      setAddCommunity(true);
                    }}
                    className="flex flex-row space-x-1 cursor-pointer cursor-pointer bg-[#EB4463] text-white py-1 px-4 rounded"
                  >
                    <span>Request</span> <span>a</span> <span>community</span>
                  </span>
                )}
              </span>
              <span className="w-full space-x-1 text-sm flex flex-row justify-between items-center">
                <span
                  className={`${
                    darkMode ? "text-white" : "text-black"
                  } font-semibold`}
                >
                  {"Anime & Manga"}
                </span>

                <span
                  className={`${
                    darkMode ? "text-white" : "text-gray-500"
                  } flex items-center space-x-2`}
                >
                  <span className={darkMode ? "text-white" : "text-gray-500"}>
                    Sort by:
                  </span>

                  <select
                    onChange={(e) => {
                      if (!animeCommunities || animeCommunities.length === 0) {
                        return;
                      }
                      const value = e.target.value;
                      setAnimeCommunities((prevCommunities) => {
                        let sortedCommunities = [...prevCommunities];

                        if (value === "most_recent") {
                          sortedCommunities.sort(
                            (a, b) =>
                              new Date(b.created_at) - new Date(a.created_at)
                          );
                        } else if (value === "most_joined") {
                          sortedCommunities.sort(
                            (a, b) => b.membersLength - a.membersLength
                          );
                        } else {
                          sortedCommunities.sort(
                            (a, b) => b.membersLength - a.membersLength
                          );
                        }
                        return sortedCommunities;
                      });
                    }}
                    className="text-sm font-medium bg-transparent w-fit pr-0 border-none focus:outline-none focus:ring-0 focus:ring-none appearance-none"
                  >
                    <option value="default">Default</option>
                    <option value="most_recent">Recent</option>
                    <option value="most_joined">Members</option>
                  </select>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8.582"
                    height="9.821"
                    viewBox="0 0 8.582 9.821"
                  >
                    <g id="up-arrow" transform="translate(0)">
                      <g
                        id="Gruppe_3153"
                        data-name="Gruppe 3153"
                        transform="translate(0)"
                      >
                        <path
                          id="Pfad_1769"
                          data-name="Pfad 1769"
                          d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                          transform="translate(-32.307 0)"
                          fill="#292c33"
                        />
                      </g>
                    </g>
                  </svg>
                </span>
              </span>

              <div className="relative space-y-0.5 flex flex-col space-y-0">
                <div
                  id="scrollbar-remove"
                  ref={scrollContainerRef}
      onScroll={handleScroll}
                  className="h-fit flex flex-row overflow-x-scroll lg:grid gap-2 grid-cols-3"
                >
                  {loading ? (
                    <span className="h-screen">
                      <Lottie
                        animationData={darkMode ? darkloadscreen : loadscreen}
                      />
                    </span>
                  ) : animeCommunities && animeCommunities.length > 0 ? (
                    animeCommunities
                      .slice(
                        0,
                        expansion === "anime" ? animeCommunities.length : 6
                      )
                      .map((community) => {
                        return (
                          <span
                            key={community.id}
                            onClick={() => {
                              fullPageReload(
                                `/communities/${community.name}`.replace(
                                  " ",
                                  "+"
                                )
                              , "window");
                            }}
                            className="cursor-pointer flex-shrink-0 lg:flex-shrink rounded-2xl relative flex h-[150px] sm:h-[120px] w-[60vw] lg:w-full"
                          >
                            <span>
                              <Image
                                src={community.cover}
                                alt="user profile"
                                fill={true}
                                className="border border-black rounded-2xl object-cover"
                              />
                            </span>

                            <span className="text-xs md:text-sm absolute inset-0 flex flex-col justify-end text-white">
                              <span className="border border-black rounded-b-xl bg-black bg-opacity-30 backdrop-blur-md w-full pb-1 flex flex-col space-y-0.5 items-center justify-center border-t border-black">
                                <span className="relative h-10 w-10 flex -mt-5 mx-auto">
                                  <Image
                                    src={community.avatar}
                                    alt="user profile"
                                    width={55}
                                    height={55}
                                    className="border border-black rounded-full"
                                  />
                                </span>
                                <span className="rounded-b-xl text-xs font-semibold">
                                  {formatGroupName(community.name)}
                                </span>
                              </span>
                            </span>
                          </span>
                        );
                      })
                  ) : (
                    <span
                      className={`${
                        darkMode ? "text-gray-200" : "text-gray-900"
                      } text-sm text-start w-full`}
                    >
                      No communities found
                    </span>
                  )}
                </div>
                {animeCommunities && animeCommunities.length > 2 && (
                  <span className="lg:hidden text-sm px-2 w-full flex flex-row justify-between items-center">
                    <span className="flex space-x-1">
                      {Array.from({ length: totalDots }).map((_, index) => (
                        <span
                          key={index}
                          className={`h-1 rounded-full ${
                            index === activeIndex
                              ? "w-4 bg-[#EB4463]"
                              : "w-1.5 bg-gray-400"
                          }`}
                        ></span>
                      ))}
                    </span>
                    <span
                      className={`${darkMode ? "text-white" : "text-black"}`}
                    >
                      Swipe to view more
                    </span>
                  </span>
                )}
              </div>

              <span
                onClick={() => {
                  if (expansion === "anime") {
                    setExpansion("");
                  } else {
                    setExpansion("anime");
                  }
                }}
                className="cursor-pointer underline text-xs text-[#EB4463]"
              >
                {expansion !== "anime"
                  ? "View more Anime & Manga communities"
                  : "Collapse"}
              </span>

              <span
                className={`border-t ${
                  darkMode ? "border-[#292C33]" : "border-[#EEEDEF]"
                } mt-1 pt-2 w-full space-x-1 text-sm flex flex-row justify-between items-center`}
              >
                <span
                  className={`${
                    darkMode ? "text-white" : "text-black"
                  } font-semibold`}
                >
                  {"Crypto & NFTs"}
                </span>

                <span
                  className={`${
                    darkMode ? "text-white" : "text-gray-500"
                  } flex items-center space-x-2`}
                >
                  <span className={darkMode ? "text-white" : "text-gray-500"}>
                    Sort by:
                  </span>

                  <select
                    onChange={(e) => {
                      if (
                        !cryptoCommunities ||
                        cryptoCommunities.length === 0
                      ) {
                        return;
                      }
                      const value = e.target.value;
                      setCryptoCommunities((prevCommunities) => {
                        let sortedCommunities = [...prevCommunities];

                        if (value === "most_recent") {
                          sortedCommunities.sort(
                            (a, b) =>
                              new Date(b.created_at) - new Date(a.created_at)
                          );
                        } else if (value === "most_joined") {
                          sortedCommunities.sort(
                            (a, b) => b.membersLength - a.membersLength
                          );
                        } else {
                          sortedCommunities.sort(
                            (a, b) => b.membersLength - a.membersLength
                          );
                        }
                        return sortedCommunities;
                      });
                    }}
                    className="text-sm font-medium bg-transparent w-fit pr-0 border-none focus:outline-none focus:ring-0 focus:ring-none appearance-none"
                  >
                    <option value="default">Default</option>
                    <option value="most_recent">Recent</option>
                    <option value="most_joined">Members</option>
                  </select>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8.582"
                    height="9.821"
                    viewBox="0 0 8.582 9.821"
                    fill={darkMode ? "white" : "black"}
                  >
                    <g id="up-arrow" transform="translate(0)">
                      <g
                        id="Gruppe_3153"
                        data-name="Gruppe 3153"
                        transform="translate(0)"
                      >
                        <path
                          id="Pfad_1769"
                          data-name="Pfad 1769"
                          d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                          transform="translate(-32.307 0)"
                          fill="#292c33"
                        />
                      </g>
                    </g>
                  </svg>
                </span>
              </span>

              <div
                id="scrollbar-remove"
                className="h-fit flex flex-row overflow-x-scroll lg:grid gap-2 grid-cols-3"
              >
                {loading ? (
                  <span className="h-screen">
                    <Lottie
                      animationData={darkMode ? darkloadscreen : loadscreen}
                    />
                  </span>
                ) : cryptoCommunities && cryptoCommunities.length > 0 ? (
                  cryptoCommunities
                    .slice(
                      0,
                      expansion === "crypto" ? cryptoCommunities.length : 3
                    )
                    .map((community) => {
                      return (
                        <span
                          key={community.id}
                          onClick={() => {
                            fullPageReload(
                              `/communities/${community.name}`.replace(" ", "+")
                            , "window");
                          }}
                          className="cursor-pointer flex-shrink-0 lg:flex-shrink rounded-2xl relative flex h-[150px] sm:h-[120px] w-[60vw] lg:w-full"
                        >
                          <span>
                            <Image
                              src={community.cover}
                              alt="user profile"
                              fill={true}
                              className="border border-black rounded-2xl object-cover"
                            />
                          </span>

                          <span className="text-xs md:text-sm absolute inset-0 flex flex-col justify-end text-white">
                            <span className="border border-black rounded-b-xl bg-black bg-opacity-30 backdrop-blur-md w-full pb-1 flex flex-col space-y-0.5 items-center justify-center border-t border-black">
                              <span className="relative h-10 w-10 flex -mt-5 mx-auto">
                                <Image
                                  src={community.avatar}
                                  alt="user profile"
                                  width={55}
                                  height={55}
                                  className="border border-black rounded-full"
                                />
                              </span>
                              <span className="rounded-b-xl text-xs font-semibold">
                                {formatGroupName(community.name)}
                              </span>
                            </span>
                          </span>
                        </span>
                      );
                    })
                ) : (
                  <span
                    className={`${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    } text-sm text-start w-full`}
                  >
                    No communities found
                  </span>
                )}
              </div>
              <span
                onClick={() => {
                  if (expansion === "crypto") {
                    setExpansion("");
                  } else {
                    setExpansion("crypto");
                  }
                }}
                className="cursor-pointer underline text-xs text-[#EB4463]"
              >
                {expansion !== "crypto"
                  ? "View more Crypto & NFTs communities"
                  : "Collapse"}
              </span>

              <span
                className={`border-t ${
                  darkMode ? "border-[#292C33]" : "border-[#EEEDEF]"
                } mt-1 pt-2 w-full space-x-1 text-sm flex flex-row justify-between items-center`}
              >
                <span
                  className={`${
                    darkMode ? "text-white" : "text-black"
                  } font-semibold`}
                >
                  {"Other topics"}
                </span>
                <span
                  className={`${
                    darkMode ? "text-white" : "text-gray-500"
                  } flex items-center space-x-2`}
                >
                  <span className={darkMode ? "text-white" : "text-gray-500"}>
                    Sort by:
                  </span>

                  <select
                    onChange={(e) => {
                      if (!otherCommunities || otherCommunities.length === 0) {
                        return;
                      }
                      const value = e.target.value;
                      setOtherCommunities((prevCommunities) => {
                        let sortedCommunities = [...prevCommunities];

                        if (value === "most_recent") {
                          sortedCommunities.sort(
                            (a, b) =>
                              new Date(b.created_at) - new Date(a.created_at)
                          );
                        } else if (value === "most_joined") {
                          sortedCommunities.sort(
                            (a, b) => b.membersLength - a.membersLength
                          );
                        } else {
                          sortedCommunities.sort(
                            (a, b) => b.membersLength - a.membersLength
                          );
                        }
                        return sortedCommunities;
                      });
                    }}
                    className="text-sm font-medium bg-transparent w-fit pr-0 border-none focus:outline-none focus:ring-0 focus:ring-none appearance-none"
                  >
                    <option value="default">Default</option>
                    <option value="most_recent">Recent</option>
                    <option value="most_joined">Members</option>
                  </select>

                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8.582"
                    height="9.821"
                    viewBox="0 0 8.582 9.821"
                    fill={darkMode ? "white" : "black"}
                  >
                    <g id="up-arrow" transform="translate(0)">
                      <g
                        id="Gruppe_3153"
                        data-name="Gruppe 3153"
                        transform="translate(0)"
                      >
                        <path
                          id="Pfad_1769"
                          data-name="Pfad 1769"
                          d="M40.829,5.667,36.736,9.761a.2.2,0,0,1-.29,0l-4.08-4.094a.2.2,0,0,1,.145-.349h2.25V.2a.2.2,0,0,1,.2-.2h3.273a.2.2,0,0,1,.2.2V5.318h2.241a.2.2,0,0,1,.144.349Z"
                          transform="translate(-32.307 0)"
                          fill="#292c33"
                        />
                      </g>
                    </g>
                  </svg>
                </span>
              </span>

              <div
                id="scrollbar-remove"
                className="h-fit flex flex-row overflow-x-scroll lg:grid gap-2 grid-cols-3"
              >
                {loading ? (
                  <span className="h-screen">
                    <Lottie
                      animationData={darkMode ? darkloadscreen : loadscreen}
                    />
                  </span>
                ) : otherCommunities && otherCommunities.length > 0 ? (
                  otherCommunities
                    .slice(
                      0,
                      expansion === "other" ? otherCommunities.length : 3
                    )
                    .map((community) => {
                      return (
                        <span
                          key={community.id}
                          onClick={() => {
                            fullPageReload(
                              `/communities/${community.name}`.replace(" ", "+"), "window"
                            );
                          }}
                          className="cursor-pointer flex-shrink-0 lg:flex-shrink rounded-2xl relative flex h-[150px] sm:h-[120px] w-[60vw] lg:w-full"
                        >
                          <span>
                            <Image
                              src={community.cover}
                              alt="user profile"
                              fill={true}
                              className="border border-black rounded-2xl object-cover"
                            />
                          </span>

                          <span className="text-xs md:text-sm absolute inset-0 flex flex-col justify-end text-white">
                            <span className="border border-black rounded-b-xl bg-black bg-opacity-30 backdrop-blur-md w-full pb-1 flex flex-col space-y-0.5 items-center justify-center border-t border-black">
                              <span className="relative h-10 w-10 flex -mt-5 mx-auto">
                                <Image
                                  src={community.avatar}
                                  alt="user profile"
                                  width={55}
                                  height={55}
                                  className="border border-black rounded-full"
                                />
                              </span>
                              <span
                                onClick={() => {
                                  setExpansion("other");
                                }}
                                className="rounded-b-xl text-xs font-semibold"
                              >
                                {formatGroupName(community.name)}
                              </span>
                            </span>
                          </span>
                        </span>
                      );
                    })
                ) : (
                  <span
                    className={`${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    } text-sm text-start w-full`}
                  >
                    No communities found
                  </span>
                )}
              </div>

              <span
                onClick={() => {
                  if (expansion === "other") {
                    setExpansion("");
                  } else {
                    setExpansion("other");
                  }
                }}
                className="cursor-pointer underline text-xs text-[#EB4463]"
              >
                {expansion !== "anime" ? "View more communities" : "Collapse"}
              </span>

              <div className="flex flex-col items-center space-y-1.5 w-full">
                {/* <span
                  className={`${
                    darkMode
                      ? "bg-zinc-800 text-white"
                      : "border border-gray-300 bg-gray-100 text-gray-500"
                  } px-2 py-0 mb-1 w-full flex flex-row items-center rounded-xl`}
                >
                  <svg
                    className="w-3 h-3 text-slate-400"
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
                    value={cValue}
                    onChange={(e) => {
                      setCValue(e.target.value);
                      if (e.target.value) {
                        setCommunities(
                          defaultCommunities.filter((c) => {
                            return (
                              c.name
                                .toLowerCase()
                                .includes(e.target.value.toLowerCase()) ||
                              c.bio
                                .toLowerCase()
                                .includes(e.target.value.toLowerCase())
                            );
                          })
                        );
                      } else {
                        if (defaultCommunities) {
                          setCommunities(defaultCommunities);
                        }
                      }
                    }}
                    className="w-full text-xs bg-transparent border-none focus:ring-0 placeholder-gray-400"
                    placeholder="Search Communities"
                  />
                </span> */}
                {/* {loading ? (
                  <span className="h-screen">
                    <Lottie
                      animationData={darkMode ? darkloadscreen : loadscreen}
                    />
                  </span>
                ) : communities && communities.length > 0 ? (
                  communities.map((community) => {
                    return (
                      <span
                        key={community.id}
                        onClick={() => {
                          fullPageReload(
                            `/communities/${community.name}`.replace(" ", "+"), "window"
                          );
                        }}
                        className={`border ${
                          darkMode
                            ? "bg-[#1e1f24] border-gray-700 text-white"
                            : "bg-white border-gray-300 text-black"
                        } cursor-pointer w-full flex flex-row rounded`}
                      >
                        <Image
                          src={community.avatar}
                          alt="post"
                          height={80}
                          width={80}
                          className="rounded-l-sm object-cover"
                        />
                        <span className="pl-4 flex flex-col py-2 text-sm">
                          <span className="font-bold">
                            {formatGroupName(community.name)}
                          </span>
                          <span
                            className={`${
                              darkMode ? "text-gray-200" : "text-gray-500"
                            } text-xs`}
                          >
                            {community.bio.slice(0, 110).trim().concat("...")}
                          </span>
                          <span className="text-textGreen text-[0.8rem]">
                            {`${community.membersLength} ${
                              community.membersLength === 1
                                ? "Member"
                                : "Members"
                            }`}
                          </span>
                        </span>
                      </span>
                    );
                  })
                ) : (
                  <span
                    className={`${
                      darkMode ? "text-gray-200" : "text-gray-900"
                    } text-sm text-start w-full`}
                  >
                    No communities found
                  </span>
                )} */}
              </div>
            </div>
          )}
        </div>
        <div className="hidden lg:block sticky right-2 top-20 heighto">
            <LargeRightBar />
          </div>
      </section>
      {sideBarOpened && <SideBar />}
      <MobileNavBar />
    </main>
  );
};
export default Communities;
