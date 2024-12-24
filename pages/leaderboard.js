import NavBar, { MobileNavBar } from "@/components/navBar";
import animeBookLogo from "@/assets/animeBookLogo.png";
import animationData from "@/assets/kianimation.json";
import Lottie from "lottie-react";
import Image from "next/image";
import { useEffect, useState, useContext, useRef } from "react";
import { UserContext } from "@/lib/userContext";
import supabase from "@/hooks/authenticateUser";
import PageLoadOptions from "@/hooks/pageLoadOptions";

const Leaderboard = () => {
  const { userData, allUsers, darkMode } = useContext(UserContext);
  const [sortedUsers, setSortedUsers] = useState(null);
  const { fullPageReload } = PageLoadOptions();

  useEffect(() => {
    if (allUsers) {
    //   setSortedUsers(allUsers.sort((a, b) => b.ki - a.ki));
    setSortedUsers(allUsers.filter(user => user.ki > 10).sort((a, b) => b.ki - a.ki))
    }
  }, [allUsers]);
  return (
    sortedUsers && userData && (
      <main>
        <section className="mb-5 flex flex-row space-x-2 w-full">
          <NavBar />
          <div className={`${darkMode ? 'text-white' : 'text-black'} w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col`}>
            <div className="leaderboard">
              <h1 className="flex flex-row items-center justify-center text-center font-bold text-xl mb-4">
                <span>Leaderboard</span><span className="h-10 w-12">
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
                            src={user.avatar}
                            alt="user profile"
                            height={35}
                            width={35}
                            className="rounded-full object-cover"
                          />
                        </span>
                        <span>{user.username || "Anonymous"}{user.username === userData.username && " (You)"}</span>
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {parseFloat(parseFloat(user.ki).toFixed(2))}
                      </td>
                      <td className="border border-gray-300 px-4 py-2">
                        {parseFloat(parseFloat(user.ki).toFixed(2))}
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
