import { useRouter } from "next/router";
import { useEffect } from "react";

export const getServerSideProps = async (context) => {
  const { username } = context.params; 
  return {
    props: {
      username,
    },
  };
};

export default function RedirectToProfile({ username }) {
  const router = useRouter();
  useEffect(() => {
    if (username && router) {
      router.replace(`/profile/${username}`);
    }
  }, [username, router]);

  return null
}
