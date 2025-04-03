import { useRouter } from "next/router";

export default function PageLoadOptions(){
    const router = useRouter()
    const fullPageReload = (page, target) => {
        if (target === "window"){
            window.location.href = page
        }
        else if (target === "_blank"){
            window.open(page, "_blank");
        } else{
            window.location.href = page
            // router.push(page)
        }
    }
    return {fullPageReload}
}