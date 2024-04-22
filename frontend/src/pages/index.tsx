import { useRouter } from "next/router";
import { useEffect } from "react";

export default function Index({ needLoader, key}: any) {
  const router = useRouter();

  useEffect(() => {
   router.push("/drive/my-drive");
  //  router.push({
  //   pathname: '/drive/my-drive',
  //   query: { needLoader: needLoader }
  //  })
  //  window.location.href="/drive/my-drive"
  }, []);
}
