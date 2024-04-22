import Head from "next/head";
import GetFiles from "@/components/GetFiles";
import GetFolders from "@/components/GetFolders";
import FileHeader from "@/components/FileHeader";
import { useEffect, useState } from "react";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { fetchFiles } from "@/hooks/fetchFiles";
import { DotLoader } from "react-spinners";
import SignIn from "@/pages/auth/signin";
import { useRouter } from "next/router";

export default function Home() {
  const [isFolder, setIsFolder] = useState(false);
  const [isFile, setIsFile] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [loggedIn, setLoggedIn] = useState<string | null>(null);
  const [auth, setAuth] = useState(false);
  const [email, setEmail] = useState("") || "";


  const router = useRouter();

  const id = router.query.id as string;


  console.log("THisis id", id);

  //const { Folder = '' } = router.query;

  useEffect(() => {
    setEmail(localStorage.getItem('email')!);
    // Use the email variable as needed
  }, []);

  //console.log("This is all FolderList",Folder);

  const [fileList, setFileList] = useState<FileListProps[]>([]);
  const [folderList, setFolderList] = useState<FolderListProps[]>([]);

  console.log("This is myfiles", fileList);


  // useEffect(() => {
  //   const GetFiles = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:8888/folders`, {
  //         method: 'GET',
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         },
  //       });
  //       const files = await response.json();
  //       setFileList(files?.data?.files);
  //       setFolderList(files?.data?.folders);

  //     } catch (error) {
  //       console.error('Error Getting Folders:', error);
  //     }
  //   };
  //   GetFiles();
  // }, []);


  // useEffect(() => {
  //   const GetFolders = async () => {
  //     try {
  //       const response = await fetch(`http://localhost:8888/folders`, {
  //         method: 'GET',
  //         headers: {
  //           'Authorization': `Bearer ${localStorage.getItem('token')}`
  //         },
  //       });
  //       const allFoldrs = await response.json();
  //       setFolderList(allFoldrs.data.folders);

  //     } catch (error) {
  //       console.error('Error Getting Folders:', error);
  //     }
  //   };
  //   GetFolders();
  // }, []);



  console.log("THis is folderList", folderList);
  //const { data: session } = useSession();

  // Fetch the list of files and folders
  const list = fetchFiles("");
  ///const list: any = [];

  useEffect(() => {
    // Determine if there are folders and files in the list
    const hasFolders = list.some((item) => item.folder && !item.isTrashed);
    const hasFiles = list.some((item) => !item.folder && !item.isTrashed);

    //Update the state based on the results
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

  //alert(loggedIn);

  return (
    <>
      {auth && <>  <Head>
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
                    <GetFolders parentFolderId={id} select="" />
                  </div>
                </div>

                <div className="mb-5 flex flex-col space-y-4">
                  <h2>Files</h2>
                  <div className="flex flex-wrap justify-start gap-x-3 gap-y-5 text-textC">
                    <GetFiles folderId={id} select="" />
                  </div>
                </div>

              </>
              // <>
              //    {list.length || folderList.length ? (
              //     <>
              //       {folderList && (
              //          <div className="mb-5 flex flex-col space-y-4">
              //           <h2>Folders</h2>
              //           <div className="flex flex-wrap justify-start gap-x-3 gap-y-5 text-textC">
              //             <GetFolders parentFolderId={id} select="" />
              //           </div>
              //         </div>
              //       )}
              //       { (
              //          <div className="mb-5 flex flex-col space-y-4">
              //           <h2>Files</h2>
              //           <div className="flex flex-wrap justify-start gap-x-3 gap-y-5 text-textC">
              //             <GetFiles folderId={id} select="" />
              //           </div>
              //         </div>
              //       )}
              //     </>
              //   ) : (
              //     <div className="flex h-full flex-col items-center justify-center">
              //       <h2 className="mb-5 text-xl font-medium text-textC">
              //         A place for all of your files
              //       </h2>
              //       <Image
              //         draggable={false}
              //         src="/empty_state_drive.png"
              //         width={500}
              //         height={500}
              //         alt="empty-state"
              //         className="w-full max-w-2xl object-cover object-center"
              //       />
              //     </div>
              //   )}
              // </>
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