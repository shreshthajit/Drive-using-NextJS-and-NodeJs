import Head from "next/head";
import GetFiles from "@/components/GetFiles";
import GetFolders from "@/components/GetFolders";
import FileHeader from "@/components/FileHeader";
import { useEffect, useState } from "react";
import { fetchFiles } from "@/hooks/fetchFiles";
import { DotLoader } from "react-spinners";
import SignIn from "@/pages/auth/signin";

export default function Home({ needLoader}: any) {
  const [isFolder, setIsFolder] = useState(false);
  const [isFile, setIsFile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);

  const list = fetchFiles("");
  useEffect(() => {
    const hasFolders = list.some((item) => item.folder);
    const hasFiles = list.some((item) => !item.folder);

    setIsFolder(hasFolders);
    setIsFile(hasFiles);

    setLoggedIn(localStorage.getItem('token'));
    if (loggedIn) {
      setAuth(true);
    }
    else {
      setAuth(false);
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 2200);
  }, [list, setLoggedIn]);


  return (
    <>
      {auth && <>

        <Head>
          <title>My Drive - Google Drive</title>
          <meta name="description" content="This is a google drive clone!" />
          <link rel="icon" href="/favicon.ico" />
        </Head>
        <div>
          <FileHeader headerName={"My Drive"} />

          <div className="h-[75vh] w-full overflow-y-auto p-5">
            {/* If the list is loading, display the loading state */}
            {!isFile && !isFolder && isLoading ? (

              <div className="flex h-full items-center justify-center">
                <DotLoader color="#b8c2d7" size={60} />
              </div>
            ) : (
              <>
              <div className="mb-5 flex flex-col space-y-4">
                <h2>Folders</h2>
                <div className="flex flex-wrap justify-start gap-x-3 gap-y-5 text-textC">
                  <GetFolders parentFolderId="" select="" />
                </div>
              </div>


              <div className="mb-5 flex flex-col space-y-4">
                <h2>Files</h2>
                <div className="flex flex-wrap justify-start gap-x-3 gap-y-5 text-textC">
                  <GetFiles folderId="" select="" />
                </div>
              </div>
            </>
            )}
          </div>
        </div></>
      }

      {!auth && <>
        <SignIn />
      </>

      }



    </>
  );
}

//[...nextauth].ts