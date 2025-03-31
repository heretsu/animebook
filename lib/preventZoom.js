import { useEffect } from "react";

const PreventZoom = () => {
  useEffect(() => {
    const metaTag = document.createElement("meta");
    metaTag.name = "viewport";
    metaTag.content = "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no";
    
    document.head.appendChild(metaTag);

    return () => {
      document.head.removeChild(metaTag);
    };
  }, []);

  return null;
};

export default PreventZoom;
