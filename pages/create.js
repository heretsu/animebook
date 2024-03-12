import NavBar, { MobileNavBar } from "@/components/navBar";
import PostContainer from "@/components/postContainer";

const CreatePostPage = () => {

  return (
    <main>
    <section className="mb-5 flex flex-row space-x-2 w-full">
        <NavBar />
        <div className="w-full pb-2 space-y-8 pl-2 lg:pl-lPostCustom pr-4 xl:pr-40 mt-4 lg:mt-8 flex flex-col">
        <PostContainer />
      </div>
    </section>
    <MobileNavBar />
    </main>
  );
};
export default CreatePostPage;
