import NavBar, { MobileNavBar } from "@/components/navBar";
import supabase from "@/hooks/authenticateUser";
import { useState, useContext } from "react";
import { UserContext } from "@/lib/userContext";
import PageLoadOptions from "@/hooks/pageLoadOptions";

const SubscriptionPlan = () => {
  const { fullPageReload } = PageLoadOptions();
  const { userData, darkMode } = useContext(UserContext);
  const [errorMsg, setErrorMsg] = useState("");
  const [sub, setSub] = useState("");
  const [saveLoading, setSaveLoading] = useState(false);

  const savePrice = async () => {
    setErrorMsg("");
    setSaveLoading(true);
    if (sub !== "" && !isNaN(sub)) {
      const { error } = await supabase
        .from("users")
        .update({
          subprice: parseFloat(sub).toFixed(2),
        })
        .eq("useruuid", userData.useruuid);
      if (error) {
        setErrorMsg("Something went wrong");
        console.log(error);
        return;
      }
      fullPageReload(`/profile/${userData.username}`);
    } else {
      setErrorMsg("You didn't specify a subscription price");
      setSaveLoading(false);
    }
  };

  return (
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          <div className={`${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-slate-500'} flex flex-col rounded-xl shadow-lg w-full justify-center items-center`}>
            <span className="border-b font-semibold text-lg pt-2">
              Subscription Plan
            </span>
            <span className="text-center py-2 font-medium text-sm">
              {
                "How much should your subscribers pay monthly to access your premium mangas?"
              }
            </span>
            <span className="pt-2 w-full justify-center items-center flex flex-row space-x-1">
              <span className="text-base text-start font-medium">
                {"Price: ($)"}
              </span>
              <input
                value={sub}
                onChange={(e) => {
                  setSub(
                    !isNaN(e.target.value) ? e.target.value : sub
                  );
                }}
                placeholder={userData.subprice ? parseFloat(userData.subprice).toFixed(2) : ""}
                className={`px-4 w-fit rounded-xl resize-none px-2 ${darkMode ? "bg-gray-600" : "bg-gray-200"} border-none focus:outline-none focus:border-gray-500 focus:ring-0`}
              />
              {saveLoading ? (
                <span>saving...</span>
              ) : (
                <span
                  onClick={() => {
                    savePrice();
                  }}
                  className="w-fit mx-auto hover:shadow cursor-pointer px-4 py-1 bg-pastelGreen text-center text-white font-bold rounded-lg"
                >
                  Save
                </span>
              )}
            </span>

            <span className="pt-2 pb-3 flex flex-col">
              {errorMsg !== "" && (
                <span className="text-sm w-full flex flex-row justify-center items-center">
                  <svg
                    fill="red"
                    width="20px"
                    height="20px"
                    viewBox="0 -8 528 528"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <title>{"fail"}</title>
                    <path d="M264 456Q210 456 164 429 118 402 91 356 64 310 64 256 64 202 91 156 118 110 164 83 210 56 264 56 318 56 364 83 410 110 437 156 464 202 464 256 464 310 437 356 410 402 364 429 318 456 264 456ZM264 288L328 352 360 320 296 256 360 192 328 160 264 224 200 160 168 192 232 256 168 320 200 352 264 288Z" />
                  </svg>
                  <p className="text-red-500">{errorMsg}</p>
                </span>
              )}
            </span>
          </div>
        </div>
      </section>
      <MobileNavBar />
    </main>
  );
};
export default SubscriptionPlan;
