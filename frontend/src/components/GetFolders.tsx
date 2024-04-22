import { fetchFiles } from "@/hooks/fetchFiles";
import React, { useEffect, useState } from "react";
import { AiFillFolder } from "react-icons/ai";
import { BsThreeDotsVertical } from "react-icons/bs";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { fetchAllFiles } from "@/hooks/fetchAllFiles";
import FileDropDown from "./FileDropDown";
import Rename from "./Rename";
import { fetchFolders } from "@/hooks/fetchFolders";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DotLoader } from "react-spinners";

function GetFolders({
  parentFolderId,
  select,
}: {
  parentFolderId: string;
  select: string;
}) {
  const [folderList, setFolderList] = useState<FolderListProps[]>([]);
  const router = useRouter();
  const [folderId, setfolderId] = useState<string | null>(parentFolderId);

  const [isVisible, setIsVisible] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [selectedfolderId, setSelectedfolderId] = useState<string | null>(
    parentFolderId,
  );

  const GetFolders = async () => {
    try {
      const response = await fetch(
        folderId
          ? `http://localhost:8888/folders/${folderId}`
          : `http://localhost:8888/folders`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const allFoldrs = await response.json();
      // console.log("under folder component", allFoldrs);

      setFolderList(
        folderId ? allFoldrs?.data?.folders : allFoldrs?.data?.folders,
      );
      setIsLoading(false);
    } catch (error) {
      console.error("Error Getting Folders:", error);
    }
  };

  useEffect(() => {
    console.log({vv: localStorage?.getItem('loader')})
    if (localStorage?.getItem('loader')) {
      GetFolders();
      localStorage.removeItem('loader')
    }
  }, [localStorage?.getItem('loader')])

  useEffect(() => {
    GetFolders();
  }, [folderId]);


  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!e.target.closest(".context-menu")) {
        setIsVisible(false);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const handleRightClick = (e: any) => {
    e.preventDefault();
    setIsVisible(true);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <DotLoader color="#b8c2d7" size={60} />
      </div>
    );
  }

  const renderFolder = (folder: FolderListProps): JSX.Element => {
    return (
      <>
        <div
          key={folder._id}
          onClick={() => {
            setfolderId(folder._id), router.push("/drive/" + folder._id);
            //window.location.href="/drive/" + folder._id;
          }}
          onContextMenu={(e) => {
            handleRightClick(e);
            setSelectedfolderId(folder._id);
          }}
          className="relative mb-4 mr-4 flex items-center justify-between rounded-xl bg-darkC2 p-3 hover:bg-darkC"
          style={{ maxWidth: "13.75rem", cursor: "pointer" }}
        >
          <div className="flex items-center space-x-2">
            <AiFillFolder className="h-6 w-6" />
            <span className="w-32 truncate text-sm font-medium text-textC">
              {folder.name}
            </span>
          </div>
          {/* {
            // rename toggle
            renameToggle === folder._id && (
              <Rename
                setRenameToggle={setRenameToggle}
                fileId={folder._id}
                fileName={folder.name}
                // isFolder={folder.isFolder}
                isFolder={true}
                fileExtension=""
              />
            )
          } */}
        </div>

        {/* {showFolderList && (
          <div
            style={{ zIndex: "999" }}
            className="absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-25"
          >
            <div
              className="absolute left-0 top-0 h-full w-full  bg-opacity-25"
              onClick={() => setShowFolderList(false)}
            ></div>
            <div
              className="rounded-md border border-gray-200 bg-white p-4 shadow-md"
              style={{ width: "300px" }}
            >
              <div className="mb-2">
                <h2 className="text-lg font-semibold">Select Folder</h2>
              </div>
              <hr className="my-1 border-gray-200" />
              <ul>
                {allFolderList.map((folder, index) => (
                  <li className="flex items-center">
                    <div className="flex items-center space-x-2">
                      <AiFillFolder className="h-6 w-6" />
                      <span className="w-32 truncate text-sm font-medium text-textC">
                        {folder.name}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )} */}

        {/* {isSharePopupOpen && (
          <div className="fixed left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-50">
            <div className="rounded-lg bg-white p-4 shadow-lg">
              <h2 className="mb-4 text-xl font-bold">Share Folder</h2>
              <input
                type="text"
                placeholder="Add people, groups, calendar events..."
                className="mb-4 w-full rounded-md border border-gray-300 p-2"
              />
              <div className="mb-4">
                <h3 className="font-semibold">General Access</h3>
                <div>
                  <input
                    type="radio"
                    id="restricted"
                    name="access"
                    value="restricted"
                  />
                  <label htmlFor="restricted" className="ml-2 mr-4">
                    Restricted
                  </label>

                  <input type="radio" id="full" name="access" value="full" />
                  <label htmlFor="full" className="ml-2">
                    Anyone with the link
                  </label>
                </div>
              </div>
              <button className="mr-2 rounded-md bg-blue-500 px-4 py-2 text-white">
                Share
              </button>
              <button
                className="rounded-md bg-gray-300 px-4 py-2 text-gray-700"
                onClick={() => setIsSharePopupOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )} */}

        <ToastContainer />
      </>
    );
  };

  return (
    <div className="flex flex-wrap">
      {(folderList || [])?.map((folder) => renderFolder(folder))}
    </div>
  );
}

export default GetFolders;
