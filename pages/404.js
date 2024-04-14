import NavBar, { MobileNavBar } from "@/components/navBar";
import { useRouter } from "next/router";

const NotFound = () => {
  const router = useRouter();

  return (
    <main>
      <section className="flex flex-row space-x-2 w-full">
        <div className="w-full space-y-8 flex flex-col justify-center items-center pt-4">
          <div className="flex flex-row w-full justify-center items-center text-center text-logoSize">
            <span id="anime-book-font" className="pr-2 text-pastelGreen">
              Anime
            </span>
            <span id="anime-book-font">bo</span>
            <span className="text-invisible text-white">o</span>
            <span id="anime-book-font">ok</span>
          </div>

          <p>{"Nani! 404 page not found"}</p>
          <div className="flex flex-row space-x-4">
            <span
              onClick={() => {
                router.push("/home");
              }}
              className="cursor-pointer text-sm font-semibold rounded-2xl bg-pastelGreen text-white py-3 w-40 text-center"
            >
              Go to Homepage
            </span>
            <span
              onClick={() => {
                router.push("/");
              }}
              className="cursor-pointer text-sm font-semibold rounded-2xl bg-transparent border border-pastelGreen text-pastelGreen py-3 w-40 text-center"
            >
              Go to Landing page
            </span>
          </div>
        </div>
      </section>
    </main>
  );
};
export default NotFound;
