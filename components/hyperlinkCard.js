import { useState, useEffect } from "react";
import Image from "next/image";
import PageLoadOptions from "@/hooks/pageLoadOptions";

const HyperlinkCard = ({ url }) => {
  const { fullPageReload } = PageLoadOptions();
  const [metadata, setMetadata] = useState(null);

  useEffect(() => {
    if (url) {
      fetch(`/api/linkpreview?url=${encodeURIComponent(url)}`)
        .then((response) => response.json())
        .then((data) => {
          setMetadata(data);
        })
        .catch((error) => {
          console.log(error);
          console.error("Error fetching metadata:", error);
        });
    }
  }, [url]);

  if (!metadata) {
    return <div onClick={()=>{ fullPageReload(url, "_blank")}} className="text-blue-500 font-medium cursor-default">{url}</div>;
  }

  return (
    <div
      onClick={() => {
        fullPageReload(url, "_blank");
      }}
      className="cursor-pointer border border-gray-400 px-2 py-1 rounded-lg"
    >
      <div className="text-sm flex flex-row items-center justify-start space-x-1">
        {metadata.images?.[0] ? (
          <span className="w-8 h-8">
            <Image
              src={metadata.images[0]}
              alt="Preview"
              height={80}
              width={80}
              className="rounded-l-sm object-cover"
            />
          </span>
        ) : (
          metadata.favicons?.[0] && (
            <span className="w-8 h-8">
              <Image
                src={metadata.favicons[0]}
                alt="Preview"
                height={50}
                width={50}
                className="rounded-l-sm object-cover"
              />
            </span>
          )
        )}
        <span>{metadata.title}</span>
        <p>{metadata.description}</p>
      </div>
      <p className="pt-1 text-xs font-semibold text-blue-400">{url}</p>
    </div>
  );
};

export default HyperlinkCard;
