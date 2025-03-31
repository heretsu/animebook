import NavBar, { MobileNavBar } from "@/components/navBar";
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import Image from "next/image";
import { useRouter } from "next/router";
const Reports = () => {
  const { userData, darkMode } = useContext(UserContext);

  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
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

  const [reportsData, setReportsData] = useState(null);

  const fetchAllReports = async () => {
    const { data, error } = await supabase
      .from("reports")
      .select(
        "id, created_at, posts(id, content, media), users(id, useruuid, avatar, username)"
      );

    setReportsData(data);
  };

  const deletePostOfUser = async (postmedia, postid) => {
    if (
      postmedia !== null &&
      postmedia !== undefined
    ) {
      supabase
        .from("deleted_media")
        .insert({
          url: postmedia,
          postid: postid,
        })
        .then((response) => {
          if (response && response.status === 201) {
            supabase
              .from("posts")
              .delete()
              .eq("id", postid)
              .then(() => {
                fetchAllReports();
              })
              .catch((e) => {
                console.log("error in post deletion for media: ", e);
              });
          }
        })
        .catch((e) => {
          console.log("error in outer deletion media: ", e);
        });
    } else {
      supabase
        .from("posts")
        .delete()
        .eq("id", postid)
        .then(() => {
          fetchAllReports();
        })
        .catch((e) => {
          console.log("error: ", e);
        });
    }
  };

  const ignoreReport = async (reportid) => {
    supabase
      .from("reports")
      .delete()
      .eq("id", reportid)
      .then(() => {
        fetchAllReports();
      })
      .catch((e) => {
        console.log("error: ", e);
      });
  };

  useEffect(() => {
    if (userData) {
      checkIfAdmin();
    }
    if (isAdmin) {
      fetchAllReports();
    }
  }, [userData, isAdmin]);
  return (
    userData && (
      <main>
        <section
          className={`${
            darkMode ? "text-white" : "text-black"
          } mb-5 flex flex-row space-x-2 w-full`}
        >
          <NavBar />
          {isAdmin ? (
            <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
              <span className="font-medium">Violation Reports</span>
              {reportsData && reportsData.length > 0 ? (
                <span className="flex flex-col justify-start">
                  {reportsData.map((rd) => {
                    return (
                      <span
                        key={rd.id}
                        className={`border ${
                          darkMode
                            ? "bg-[#1e1f24] border-gray-700 text-white"
                            : "bg-white border-gray-300 text-black"
                        } cursor-pointer w-full flex flex-row justify-between rounded`}
                      >
                        <span className="flex flex-row items-center">
                          {rd.posts && rd.posts.media && (
                            <span
                              onClick={() => {
                                router.push(`/${rd.users.username}/post/${rd.posts.id}`);
                              }}
                            >
                              <Image
                                src={rd.posts.media}
                                alt="post"
                                height={40}
                                width={40}
                                className="rounded-l-sm object-cover"
                              />
                            </span>
                          )}
                          <span className="pl-4 flex text-sm">
                            <span
                              onClick={() => {
                                router.push(`/${rd.users.username}/post/${rd.posts.id}`);
                              }}
                              className={`${
                                darkMode ? "text-gray-200" : "text-gray-500"
                              } text-xs`}
                            >
                              {rd.posts && rd.posts.content}
                            </span>
                          </span>
                        </span>
                        <span className="text-sm flex flex-row space-x-1 justify-center items-center">
                          <span
                            onClick={() => {
                              ignoreReport(rd.id);
                            }}
                            className="h-fit border border-green-500 px-1.5 py-0.5 rounded-lg"
                          >
                            Ignore
                          </span>
                          <span className="flex flex-col px-1 py-1.5 space-y-1.5 text-sm text-center justify-center ">
                            <span
                              onClick={() => {
                                deletePostOfUser(rd.posts.media, rd.posts.id);
                              }}
                              className="border border-red-500 px-1.5 py-0.5 rounded-lg"
                            >
                              Delete post
                            </span>
                            <span onClick={() => {
                                deletePostOfUser(rd.posts.media, rd.posts.id);
                              }} className="border border-red-500 px-1.5 py-0.5 rounded-lg">
                              Restrict user
                            </span>
                          </span>
                        </span>
                      </span>
                    );
                  })}
                </span>
              ) : (
                <span className="w-full justify-center">No reports</span>
              )}
            </div>
          ) : (
            <span className="w-full justify-center">Unauthorized</span>
          )}
        </section>
        <MobileNavBar />
      </main>
    )
  );
};
export default Reports;
