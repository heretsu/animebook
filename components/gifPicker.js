import { useState } from "react";

export default function GifPicker({ onGifSelect, darkMode, setShowGifPicker }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [gifs, setGifs] = useState([]);

  const fetchGifs = async () => {
    console.log(searchTerm)
    const response = await fetch(
      `https://api.giphy.com/v1/gifs/search?api_key=${process.env.NEXT_PUBLIC_GIPHY_API_KEY2}&q=${searchTerm}&limit=10`
    );
    const data = await response.json();
    console.log(data.data)
    setGifs(data.data);
  };

  return (
    <span className="gif-picker">
      <input
        type="search"
        placeholder="Search GIFs"
        value={searchTerm}
        onChange={(e) => {
          if (e.target.value === "") {
            setShowGifPicker(false);
            return
          }
          setSearchTerm(e.target.value);
          fetchGifs()
          
        }}
        onKeyDown={(e) => e.key === "Enter" && fetchGifs()}
        className={`text-sm text-start resize-none w-full bg-transparent ${
          darkMode ? "placeholder:text-gray-400 text-white" : "text-black"
        } border-none focus:outline-none focus:ring-0`}
      />

      <span className="gif-grid grid grid-cols-3 gap-4 max-h-24 overflow-y-auto">
        {gifs.map((gif) => (
          <img
            key={gif.id}
            src={gif.images.fixed_height.url}
            alt={gif.title}
            onClick={() => onGifSelect(gif.images.fixed_height.url)}
            className="gif-item w-full h-auto rounded cursor-pointer"
          />
        ))}
      </span>
    </span>
  );
}
