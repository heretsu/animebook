import NavBar, { MobileNavBar } from "@/components/navBar";
import EditProfileContainer from "@/components/editProfileContainer";
import supabase from "@/hooks/authenticateUser";
import ConnectionData from "@/lib/connectionData";
import { useRouter } from "next/router";
import { SmallTopBar } from "@/components/largeTopBar";
import PlusIcon from "@/components/plusIcon";
import Image from "next/image";
import onePiece from "@/assets/onePiece.jpg";
import { useContext, useEffect, useState } from "react";
import NewCommunityContainer from "@/components/newCommunityContainer";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import SideBar from "@/components/sideBar";
import DappLibrary from "@/lib/dappLibrary";
import loadscreen from "@/assets/loadscreen.json";
import darkloadscreen from "@/assets/darkloadscreen.json"
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Communities = () => {
  const [cValue, setCValue] = useState('')
  const [defaultCommunities, setDefaultCommunities] = useState(null)
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

  const fetchCommunityRequests = async () => {
    const { data } = await supabase
      .from("community_requests")
      .select("*")
      .order("created_at", { ascending: false });

    setCommunityRequests(data);
  };

  const checkIfAdmin = () => {
    if (
      userData.useruuid === "69436932-d1e0-43a6-92bb-1ee4644331b2" ||
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

  useEffect(() => {
    if (userData) {
      checkIfAdmin();
    }

    if (communities && !defaultCommunities) {
      setDefaultCommunities(communities)
      setLoading(false);
    }
  }, [userData, communities, defaultCommunities]);
  return (
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          <SmallTopBar middleTab={true} />

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
                  <Lottie animationData={darkMode ? darkloadscreen : loadscreen} />
                </span>
              ) : communityRequests && communityRequests.length > 0 ? (
                communityRequests.map((request) => {
                  return (
                    <span
                      key={request.id}
                      className={`${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-black'} cursor-pointer w-full justify-between flex flex-row rounded border border-gray-300`}
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
                            className="cursor-default px-2 py-0.5 text-center bg-pastelGreen w-full rounded-md flex flex-row items-center justify-center"
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
                <span className={`darkMode ? 'text-gray-200' : 'text-gray-900'} text-sm text-start w-full`}>
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
            <div className="w-full space-y-5 mt-2 lg:mt-20 flex flex-col">
              
              <span className="flex flex-row w-full justify-end text-sm">
                {isAdmin && (
                  <span
                    onClick={() => {
                      fetchCommunityRequests();
                      setOpenRequests(true);
                    }}
                    className="mr-2 flex items-center justify-center rounded-lg py-1 px-2 bg-blue-400 font-bold text-white cursor-pointer"
                  >
                    Requests
                  </span>
                )}
                {isAdmin ? (
                  <span
                    onClick={() => {
                      setAddCommunity(true);
                    }}
                    className="font-bold cursor-pointer bg-pastelGreen text-white py-1 px-2 rounded-lg"
                  >
                    Add community
                  </span>
                ) : (
                  <span
                    onClick={() => {
                      setAddCommunity(true);
                    }}
                    className="cursor-pointer font-bold cursor-pointer bg-pastelGreen text-white py-1 px-2 rounded-lg"
                  >
                    Request community
                  </span>
                )}
              </span>
              <div className="flex flex-col items-center space-y-1.5 w-full">
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
              value={cValue}
              onChange={(e)=> {
                setCValue(e.target.value)
                if (e.target.value){
                  setCommunities(defaultCommunities.filter((c)=> {return (c.name.toLowerCase().includes(e.target.value.toLowerCase()) || c.bio.toLowerCase().includes(e.target.value.toLowerCase()))}))
                } else{
                  if (defaultCommunities){
                    setCommunities(defaultCommunities)
                  }
                }
              }}
              className="w-full text-sm bg-transparent border-none focus:ring-0 placeholder-gray-400"
              placeholder="Search Communities"
            />
          </span>
                {loading ? (
                  <span className="h-screen">
                    <Lottie animationData={darkMode ? darkloadscreen : loadscreen} />
                  </span>
                ) : communities && communities.length > 0 ? (
                  communities.map((community) => {
                    return (
                      <span
                        key={community.id}
                        onClick={() => {
                          fullPageReload(
                            `/communities/${community.name}`.replace(" ", "+")
                          );
                        }}
                        className={`border ${darkMode ? 'bg-[#1e1f24] border-gray-700 text-white' : 'bg-white border-gray-300 text-black'} cursor-pointer w-full flex flex-row rounded`}
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
                          <span className={`${darkMode ? 'text-gray-200' : 'text-gray-500'} text-xs`}>
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
                  <span className={`${darkMode ? 'text-gray-200' : 'text-gray-900'} text-sm text-start w-full`}>
                    No communities found
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      {sideBarOpened && <SideBar />}
      <MobileNavBar />
    </main>
  );
};
export default Communities;
