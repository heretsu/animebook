import { useState, useEffect, useRef } from "react";
export default function PostInViewport(options) {
    const [isBeingViewed, setIsBeingViewed] = useState(false);
    const ref = useRef();
  
    useEffect(() => {
      const observer = new IntersectionObserver(([entry]) => {
        if (entry.isIntersecting){
            setIsBeingViewed(true)
        }
      }, options);
  
      if (ref.current) {
        observer.observe(ref.current);
      }
      
      return () => {
        observer.disconnect();
      };
    }, [ref, options]);
  
    return [ref, isBeingViewed];
}