import React from 'react';

const stickerList = Array.from({ length: 43 }, (_, i) => `/stickers/${i}.webp`);

export default function StickerPicker({ onSelect }) {
  return (
    <div id='scrollbar-remove' className="w-full flex gap-2 overflow-x-auto p-2 bg-transparent whitespace-nowrap scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
  {stickerList.map((src, index) => (
    <img
      key={index}
      src={src}
      alt={`sticker-${index}`}
      className="w-16 h-16 sm:w-24 sm:h-24 cursor-pointer hover:scale-105 transition-transform inline-block"
      onClick={() => onSelect(src)}
    />
  ))}
</div>

  );
}
