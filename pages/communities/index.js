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
const Communities = () => {
  const { fullPageReload } = PageLoadOptions();
  const router = useRouter();
  const { userData, communities, setCommunities } = useContext(UserContext);
  const [addCommunity, setAddCommunity] = useState(false);
  // const [communities, setCommunities] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [requestCommunity, setRequestCommunity] = useState(false);
  const [sentRequest, setSentRequest] = useState(false);

  const [suggestionName, setSuggestionName] = useState("");
  const [suggestionDescription, setSuggestionDescription] = useState("");

  const checkIfAdmin = () => {
    if (
      userData.useruuid === "69436932-d1e0-43a6-92bb-1ee4644331b2" ||
      userData.useruuid === "6db1f631-b204-499e-a1e2-fcf77647e14f" ||
      userData.useruuid === "222a3ecf-d715-43ba-9aec-ee97a8b8bed6" ||
      userData.useruuid === "e58cd906-1a25-43fc-bffb-67e3c1689c26"
    ) {
      setIsAdmin(true);
      return "admin";
    } else {
      setIsAdmin(false);
      return "not admin";
    }
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
      setCommunities(communitiesWithMembers);
    }
    setLoading(false);
  };

  const formatGroupName = (text) => {
    return text
      .split("+") // Split the string at '+'
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1)) // Capitalize each word
      .join(" ");
  };

  const newRequest = () => {
    setSentRequest(true);
  };

  useEffect(() => {
    if (userData) {
      checkIfAdmin();
    }
    if (communities){
      setLoading(false)
    }
  }, [userData, communities]);
  return (
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          <SmallTopBar middleTab={true} />
          {addCommunity ? (
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
              <NewCommunityContainer />
            </div>
          ) : requestCommunity ? (
            <div className="space-y-5 mt-2 lg:mt-20 flex flex-col">
              <svg
                onClick={() => {
                  setRequestCommunity(false);
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
              <span className="text-center my-auto w-full font-medium">
                {"What community would you like to see on AnimeBook?"}
              </span>

              <span>
                <span className="text-start font-medium w-full">
                  Community name
                </span>
                <input
                  value={suggestionName}
                  onChange={(e) => {
                    setSuggestionName(e.target.value);
                  }}
                  placeholder={"One piece community"}
                  className="bg-white px-4 h-15 rounded-xl w-full px-2 bg-gray-200 border-none focus:outline-none focus:border-gray-500 focus:ring-0"
                />

                <span className="text-start font-medium w-full">
                  Description
                </span>
                <textarea
                  value={suggestionDescription}
                  onChange={(e) => {
                    setSuggestionDescription(e.target.value);
                  }}
                  placeholder={
                    "Tell us about this community and why it is needed"
                  }
                  className="bg-white px-4 h-40 rounded-xl resize-none w-full px-2 bg-gray-200 border-none focus:outline-none focus:border-gray-500 focus:ring-0"
                />
              </span>
              {sentRequest ? (
                <span className="flex flex-col space-y-3">
                  <span
                    onClick={() => {}}
                    className="cursor-not-allowed shadow-xl border-2 border-gray-500 font-semibold mx-auto w-fit py-1 px-3 rounded-lg bg-transparent text-textGreen"
                  >
                    Request Submitted
                  </span>
                  <span className="text-center italic text-sm">
                    Your community suggestion is saved and will be considered
                  </span>
                </span>
              ) : userData ? (
                <a
                  href={`mailto:AnimeBookLuffy@gmail.com?subject=communityRequestFrom${userData.id}${suggestionName}&body=${suggestionDescription}`}
                  onClick={() => {
                    () => {
                      newRequest();
                    };
                  }}
                  className="cursor-pointer shadow-xl font-medium mx-auto w-fit py-1 px-3 rounded-lg bg-pastelGreen text-white"
                >
                  Request Community
                </a>
              ) : (
                <span
                  onClick={() => {
                    fullPageReload("/signin");
                  }}
                  className="cursor-pointer shadow-xl border-2 border-gray-500 font-semibold mx-auto w-fit py-1 px-3 rounded-lg bg-transparent text-gray-500"
                >
                  {"Login to request"}
                </span>
              )}
            </div>
          ) : (
            <div className="w-full space-y-5 mt-2 lg:mt-20 flex flex-col">
              <span className="flex flex-row w-full justify-end text-sm">
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
                      setRequestCommunity(true);
                    }}
                    className="cursor-pointer font-bold cursor-pointer bg-pastelGreen text-white py-1 px-2 rounded-lg"
                  >
                    Request community
                  </span>
                )}
              </span>
              <div className="flex flex-col items-center space-y-1.5 w-full">
                {loading ? (
                  <span className="text-gray-900 text-sm text-start w-full">
                    fetching communities...
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
                        className="cursor-pointer w-full flex flex-row bg-white rounded border border-gray-300"
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
                          <span className="text-gray-500 text-xs">
                            {community.bio.slice(0,110).trim().concat("...")}
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
                  <span className="text-gray-900 text-sm text-start w-full">
                    No communities found
                  </span>
                )}
              </div>
            </div>
          )}
        </div>
      </section>
      <MobileNavBar />
    </main>
  );
};
export default Communities;
