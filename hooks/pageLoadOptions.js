export default function PageLoadOptions(){
    const fullPageReload = (page, target) => {
        if (target === "_blank"){
            window.open(page, "_blank");
        } else{
            window.location.href = page
        }
    }
    return {fullPageReload}
}