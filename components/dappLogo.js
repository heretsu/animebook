export default function DappLogo({size}) {
  return (
    size === "small" ? 
    <div className="flex flex-row w-full justify-center items-center text-center text-3xl">
      <span id="anime-book-font" className="pr-1.5 text-pastelGreen">
        A
      </span>
      <span id="anime-book-font">B</span>
    </div>
    :
    <div className="ml-2 flex flex-row w-fit items-center text-center text-3xl">
      <span id="anime-book-font" className="pr-2 text-pastelGreen">
        Anime
      </span>
      <span id="anime-book-font">Bo</span>
      <span className="text-invisible text-white">o</span>
      <span id="anime-book-font">ok</span>
    </div>
  )
}