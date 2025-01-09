import NavBar, { MobileNavBar } from "@/components/navBar";
import animeBookLogo from "@/assets/animeBookLogo.png";
import animationData from "@/assets/kianimation.json";
import Image from "next/image";
import { useEffect, useState, useContext } from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import dynamic from "next/dynamic";
const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

const Leaderboard = () => {
  const { userData, allUsers, darkMode } = useContext(UserContext);
  const [sortedUsers, setSortedUsers] = useState(null);
  const { fullPageReload } = PageLoadOptions();

  const [imgSrcs, setImgSrcs] = useState({});

  const handleImageError = (id) => {
    setImgSrcs((prev) => ({
      ...prev,
      [id]: "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
    }));
  };

  useEffect(() => {
    if (allUsers) {
      const initialSrcs = allUsers.reduce(
        (acc, user) => ({
          ...acc,
          [user.id]:
            user.avatar ||
            "https://onlyjelrixpmpmwmoqzw.supabase.co/storage/v1/object/public/mediastore/animebook/noProfileImage.png",
        }),
        {}
      );
      setImgSrcs(initialSrcs);
      setSortedUsers(allUsers.filter((user) => user.ki > 10).sort((a, b) => b.ki - a.ki));
    }
  }, [allUsers]);

  return (
    sortedUsers &&
    userData && (
      <main>
        <section className="mb-5 flex flex-row space-x-2 w-full">
          <NavBar />
          <div
            className={`${
              darkMode ? "text-white" : "text-black"
            } w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col`}
          >
            <div className="leaderboard">
              <h1 className="flex flex-row items-center justify-center text-center font-bold text-xl mb-4">
                <span>Leaderboard</span>
                <span className="h-10 w-12">
                  <Lottie animationData={animationData} />
                </span>
              </h1>
              <table className="min-w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 px-4 py-2">Rank</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Username
                    </th>
                    <th className="border border-gray-300 px-4 py-2">KI</th>
                    <th className="border border-gray-300 px-4 py-2">
                      Total Earned
                    </th>
                    <th className="border border-gray-300 px-4 py-2">
                      Total Spent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedUsers.map((user, index) => (
                    <tr key={user.id} className="text-center">
                      <td className="border border-gray-300 px-4 py-2">
                        {index + 1}
                      </td>
                      <td
                        onClick={() => {
                          fullPageReload(`/profile/${user.username}`);
                        }}
                        className="flex flex-row space-x-1 items-center justify-start cursor-pointer font-medium border border-gray-300 px-4 py-2"
                      >
                        <span className="relative h-9 w-9 flex">
                          <Image
                            src={imgSrcs[user.id]}
                            alt="user profile"
                            height={35}
                            width={35}
                            className="rounded-full object-cover"
                            onError={() => handleImageError(user.id)}
                          />
                        </span>
                        <span>
                          {user.username || "Anonymous"}
                          {user.username === userData.username && " (You)"}
                        </span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {parseFloat(user.ki).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {parseFloat(user.ki).toFixed(2)}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">0</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <MobileNavBar />
      </main>
    )
  );
};

export default Leaderboard;
