export default function PageLoadOptions(){
    const fullPageReload = (page) => {
        window.location.href = page
    }
    return {fullPageReload}
}