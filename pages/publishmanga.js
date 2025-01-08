import NavBar, { MobileNavBar } from "@/components/navBar";
import supabase from "@/hooks/authenticateUser";
import { useRouter } from "next/router";
import { useState, useContext } from "react";
import { UserContext } from "@/lib/userContext";
import CloudSvg from "@/components/cloudSvg";
import Image from "next/image";
import PageLoadOptions from "@/hooks/pageLoadOptions";
import Spinner from "@/components/spinner";

const PublishManga = () => {
  const {fullPageReload} = PageLoadOptions()
  const { userData, userNumId, darkMode } = useContext(UserContext);
  const router = useRouter();
  const [selectedMangaCover, setSelectedMangaCover] = useState(null);
  const [coverFile, setCoverFile] = useState(null);
  const [mangaFiles, setMangaFiles] = useState([]);
  const [errorMsg, setErrorMsg] = useState("");
  const [desc, setDesc] = useState("");
  const [mangaName, setMangaName] = useState("");
  const [mangaPrice, setMangaPrice] = useState("");
  const [numberOfPages, setNumberOfPages] = useState(null);
  const [mangaUrlTable, setMangaUrlTable] = useState({});
  const [publishLoading, setPublishLoading] = useState(false)

  const coverChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setCoverFile(e.target.files);
      setSelectedMangaCover(URL.createObjectURL(file));
    }
  };
  const grabMangaFiles = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      let table = {};
      setNumberOfPages(e.target.files.length);
      setMangaFiles(e.target.files);

      Array.from(e.target.files).forEach((a, index) => {
        table[a.name] = URL.createObjectURL(e.target.files[index]);
      });
      setMangaUrlTable(table);
    }
  };

  const uploadToBucket = async (file, storagePath) => {
    const newName = Date.now() + file.name;
    try {
      const result = await supabase.storage
        .from("mediastore")
        .upload(storagePath + newName, file);

      if (result.error) {
        throw result.error;
      }
      return (
        process.env.NEXT_PUBLIC_SUPABASE_URL +
        "/storage/v1/object/public/mediastore/" +
        result.data.path
      ); // Adjust according to the actual result data structure
    } catch (err) {
      setErrorMsg("Failed to upload. Check internet connection and try again");
      console.error(err);
      throw err;
    }
  };

  const publishManga = async () => {
    setErrorMsg("");
    setPublishLoading(true)

    if (
      userData &&
      coverFile &&
      mangaFiles &&
      desc !== "" &&
      mangaName !== "" &&
      mangaPrice !== "" &&
      !isNaN(mangaPrice)
    ) {
      let coverUrl = null;
      let mangaUrls = [];
      for (const file of coverFile) {
        console.log(file);
        coverUrl = await uploadToBucket(file, "manga/cover/");
      }
      for (const file of mangaFiles) {
        console.log(file);
        let r = await uploadToBucket(file, "manga/");
        console.log(r)
        mangaUrls.push(r);
      }

      const {error, data} = await supabase
        .from("mangas")
        .insert({
          userid: userNumId,
          name: mangaName,
          description: desc,
          price: parseFloat(mangaPrice).toFixed(2),
          cover: coverUrl,
          pages: numberOfPages,
          filepaths: mangaUrls,
        })
        .eq("userid", userNumId);

        console.log(data);
      if (error) {
        setErrorMsg("Something went wrong");
        console.log(error);
        
        window.location.reload();
        return;
      }
      
      fullPageReload(`/profile/${userData.username}`);
    } else {
      setErrorMsg("Fill all fields to publish");
    }
    setPublishLoading(false)
  };

  const onDragEnd = (result) => {
    if (!result.destination) return;
    const items = Array.from(mangaFiles);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    items.forEach((i, index) => (i.id = index));
    setMangaFiles(items);
  };
  return (
    <main>
      <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
          <div className={`${darkMode ? 'bg-[#1e1f24] text-white' : 'bg-white text-gray-600'} flex flex-col space-y-4 rounded-xl shadow-lg w-full justify-center items-center`}>
            {selectedMangaCover ? (
              <label
                htmlFor="input-file"
                className="text-black w-full flex justify-center relative h-[150px] sm:h-[200px]"
              >
                <Image
                  src={selectedMangaCover}
                  alt="Invalid manga cover image. Click to change"
                  fill={true}
                  className="rounded-t-xl object-cover"
                />
                <span className="p-2 rounded-t-xl absolute inset-0 flex-col w-full bg-black bg-opacity-50 text-white">
                  <span className="flex flex-col h-full justify-end items-start space-y-1">
                    {mangaName !== "" && (
                      <span className="font-semibold">{mangaName}</span>
                    )}
                    {desc !== "" && (
                      <span className="break-words overflow-auto">{desc}</span>
                    )}
                  </span>
                </span>
                <input
                  onChange={coverChange}
                  className="hidden"
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                  id="input-file"
                />
              </label>
            ) : (
              <label
                htmlFor="input-file"
                className="text-white h-[150px] cursor-pointer w-full bg-slate-900 flex flex-col justify-center items-center rounded-t-xl"
              >
                <CloudSvg pixels={"80px"} />
                <span className="font-semibold text-sm">
                  {"Set the front page of your manga (manga cover)"}
                </span>
                <input
                  onChange={coverChange}
                  className="hidden"
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                  id="input-file"
                />
              </label>
            )}
            <span className="flex flex-col px-4 w-full space-y-2">
              <span className="space-y-1">
                <span className="text-start font-medium w-full">
                  {"Manga name"}
                </span>
                <input
                  value={mangaName}
                  onChange={(e) => {
                    setMangaName(e.target.value);
                  }}
                  maxLength={50}
                  className={`${darkMode ? 'bg-gray-500' : 'bg-gray-200'} px-4 h-15 rounded-xl resize-none w-full px-2 border-none focus:outline-none focus:border-gray-500 focus:ring-0`}
                />
              </span>

              <span className="space-y-1">
                <span className="text-start font-medium w-full">
                  Describe your manga series
                </span>
                <textarea
                  maxLength={160}
                  value={desc}
                  onChange={(e) => {
                    setDesc(e.target.value);
                  }}
                  className={`${darkMode ? 'bg-gray-500' : 'bg-gray-200'} px-4 h-15 rounded-xl resize-none w-full px-2 border-none focus:outline-none focus:border-gray-500 focus:ring-0`}
                />
              </span>

              <span className="space-y-1">
                <span className="text-start font-medium w-full">
                  {"Manga price ($)"}
                </span>
                <input
                  value={mangaPrice}
                  onChange={(e) => {
                    setMangaPrice(!isNaN(e.target.value) ? e.target.value : mangaPrice);
                  }}
                  className={`${darkMode ? 'bg-gray-500' : 'bg-gray-200'} px-4 h-15 rounded-xl resize-none w-full px-2 border-none focus:outline-none focus:border-gray-500 focus:ring-0`}
                />
              </span>

              <span className="space-y-1 flex flex-col">
                <span className="text-start font-medium w-full">
                  {"Upload the full story (Select all manga images)"}
                </span>
                <span className="text-sm">
                  {
                    "Here is a tip: Use cmd + a or ctrl + a when selecting multiple manga images from a folder. Ensure they are already in order. e.g(anime1, anime2)"
                  }
                </span>
                <input
                  onChange={(e) => {
                    grabMangaFiles(e);
                  }}
                  type="file"
                  accept="image/jpeg, image/png, image/jpg, image/svg, image/gif"
                  multiple
                />
              </span>
              {mangaFiles.length > 0 && (
                <span className="flex flex-row space-x-1 overflow-x-auto items-start">
                  {Array.from(mangaFiles).map((m) => {
                    return (
                      <span
                        key={m.name}
                        className="relative cursor-pointer flex-shrink-0 flex flex-col"
                      >
                        <Image
                          src={mangaUrlTable[m.name]}
                          alt="Invalid manga cover image. Click to change"
                          width={500}
                          height={500}
                        />
                        <span className="font-semibold">{m.name}</span>
                      </span>
                    );
                  })}
                </span>
              )}

              <span className="pt-2 pb-3 flex flex-col">
              {publishLoading ? <span className="flex flex-col justify-center items-center text-sm mx-auto">
                <span>It can take a few seconds to publish</span>
              <Spinner spinnerSize={"medium"}/>
            </span>
:
                <span
                  onClick={() => {
                    publishManga();
                  }}
                  className="w-fit mx-auto hover:shadow cursor-pointer px-7 py-2 bg-pastelGreen text-center text-white font-bold rounded-lg"
                >
                  Publish
                </span>}
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
            </span>
          </div>
        </div>
      </section>
      <MobileNavBar />
    </main>
  );
};
export default PublishManga;
