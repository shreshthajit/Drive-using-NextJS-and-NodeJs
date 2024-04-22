import React, { useEffect, useState } from "react";
import Image from "next/image";
import fileIcons from "@/components/fileIcons";
import { BsThreeDotsVertical } from "react-icons/bs";

import { useRouter } from "next/router";
import { AiFillFolder } from "react-icons/ai";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { DotLoader } from "react-spinners";
import { useSelector } from "react-redux";
import { RootState } from "@/GlobalRedux/store";

function GetFiles({ folderId, select }: { folderId: string; select: string }) {
  const [openMenu, setOpenMenu] = useState("");
  const [renameToggle, setRenameToggle] = useState("");
  const router = useRouter();

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [showFolderList, setShowFolderList] = useState(false);
  const [folderList, setFolderList] = useState<FolderListProps[]>([]);
  const [allFolderList, setAllFolderList] = useState<FolderListProps[]>([]);
  const [isSharePopupOpen, setIsSharePopupOpen] = useState(false);

  const [fileList, setFileList] = useState<FileListPropsTest[]>([]);

  const [selectedfileId, setSelectedfileId] = useState<string | null>("");
  const [destinationFolder, setDestinationFolder] = useState<string | null>("");
  const [isLoading, setIsLoading] = useState(true);
 
  const count = useSelector((state:RootState)=> state.counter.value);

  //console.log("Now Counting",count);



  folderId = router.query.id as string;

  useEffect(() => {
    const GetFiles = async () => {
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
        const allFiles = await response.json();
        setFileList(folderId ? allFiles?.data?.files : allFiles.data?.files);
        setIsLoading(false);
      } catch (error) {
        console.error("Error uploading file:", error);
      }
    };
    GetFiles();
  }, [folderId,count]);

  const openFile = (fileLink: string, fileName: string) => {
    console.log("This is fileLink", fileLink);
    const extension = fileName.split(".").pop();
    if (extension === "mov" || extension === "mp4") {
      const videoWindow = window.open("", "_blank");
      if (videoWindow) {
        videoWindow.document.body.innerHTML = `<video controls autoplay style="max-width: 100%; max-height: 100%;"><source src="${fileLink}" type="video/mp4"></video>`;
      } else {
        console.error("Failed to open video in new tab");
      }
    } else {
      window.open(fileLink, "_blank");
    }
  };

  const handleMenuToggle = (fileId: string) => {
    // Toggle the dropdown for the given file
    setRenameToggle("");
    setOpenMenu((prevOpenMenu) => (prevOpenMenu === fileId ? "" : fileId));
  };

  const GetAllFolders = async () => {
    try {
      const response = await fetch(`http://localhost:8888/folders/all`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      const allFoldrs = await response.json();
      console.log("all Folders", allFoldrs);

      setAllFolderList(allFoldrs?.data);
    } catch (error) {
      console.error("Error Getting Folders:", error);
    }
  };
  useEffect(() => {
    GetAllFolders();
  }, []);

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
    setPosition({ x: e.clientX, y: e.clientY });
    setIsVisible(true);
  };

  const handleDelete = () => {
    const DeleteFiles = async () => {
      try {
        const response = await fetch(
          `http://localhost:8888/files/${selectedfileId}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const result = await response.json();
      } catch (error) {
        console.error("Error Deleting File:", error);
      }
    };
    DeleteFiles();
    setIsVisible(false);
  };

  const handleMoveTo = async () => {
    setShowFolderList(!showFolderList);
    setIsVisible(false);
  };

  const handleFolderClick = async (destFolderId: string) => {
    try {
      console.log("I am under handleFolderClick", destFolderId);
      setDestinationFolder(destFolderId);
      const response = await fetch(
        `http://localhost:8888/files/${selectedfileId}/move`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ folder: destFolderId }),
        },
      );

      if (!response.ok) {
        throw new Error("Failed to move file");
      }
      const data = await response.json();

      if (response.ok) {
        //setDestinationFolder(destFolderId);
        GetAllFolders();
      }

      console.log("Move to response:", data);
    } catch (error) {
      console.error("Error moving file:", error);
    }
  };

  const handleShare = () => {
    // Handle share action
    setIsSharePopupOpen(true);
    setIsVisible(false);
  };

  const handleCopyLink = async () => {
    // const folderLink = `${window.location.origin}/drive/${folderId}`;

    try {
      const response = await fetch(
        `http://localhost:8888/files/${selectedfileId}/share`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );

      const data = await response.json();

      console.log("Thisis link response", response);

      await navigator.clipboard.writeText(data.data.link);
      toast.success("Link copied to clipboard!", {
        position: "bottom-right",
      });
    } catch (error) {
      toast.error("Failed to copy link!", {
        position: "bottom-right",
      });
      console.error("Failed to copy link:", error);
    }

    setIsVisible(false);
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <DotLoader color="#b8c2d7" size={60} />
      </div>
    );
  }

  const list = (fileList || []).map((file) => {
    // getting the icon for the file

    // const fileExtension = file.name.split('.')[1] || "";

    //console.log("file name and url", file.name, " ", file.url);
    const fileExtension: any = file.name.split(".").pop();

    const icon =
      fileIcons[fileExtension as keyof typeof fileIcons] ?? fileIcons["any"];
    { console.log({icon, fileExtension, v: fileIcons[fileExtension as keyof typeof fileIcons]})}

    const img = ["jpg", "ico", "webp", "png", "jpeg", "gif", "jfif"].includes(
      fileExtension,
    ) ? (
      <Image
        src={file.url}
        alt={file.name}
        height="500"
        width="500"
        draggable={false}
        className="h-full w-full rounded-sm object-cover object-center"
      />
    ) : file.fileExtension === "mp3" ? (
      <div className="flex flex-col items-center justify-center">
        <div className="h-24 w-24 ">{icon}</div>
        <audio controls className="w-44">
          <source src={file.url} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      </div>
    ) : file.fileExtension === "mp4" ? (
      <video controls>
        <source src={file.url} type="audio/mpeg" />
        <div className="h-36 w-36 ">{icon}</div>
      </video>
    ) : (
      <div className="h-36 w-36 ">{icon}</div>
    );

    let condition = true;

    if (select === "starred") condition = !file?.folder;
    else if (select === "trashed") condition = !file?.folder;

    return (
      <>
        <div
          key={file._id}
          onDoubleClick={() => openFile(file.url, file.name)}
          onContextMenu={(e) => {
            handleRightClick(e);
            setSelectedfileId(file._id);
          }}
          className="relative mb-4 mr-4 flex items-center justify-between rounded-xl bg-darkC2 p-3 hover:bg-darkC"
          style={{ maxWidth: "13.75rem", cursor: "pointer" }}
        >
          <div
            className="flex w-full flex-col items-center justify-center
         overflow-hidden rounded-xl bg-darkC2 px-2.5 hover:bg-darkC"
          >
            <div className="relative flex w-full items-center justify-between px-1 py-3">
              <div className="flex items-center space-x-4">
                <div className="h-6 w-6">{icon}</div>
                <span className="w-32 truncate text-sm font-medium text-textC">
                  {file.name}
                </span>
              </div>
              <BsThreeDotsVertical
                onClick={() => handleMenuToggle(file._id)}
                className="h-6 w-6 cursor-pointer rounded-full p-1 hover:bg-[#ccc]"
              />
              {
                /* drop down */
                // openMenu === file.id && (
                //   <FileDropDown
                //     file={file}
                //     setOpenMenu={setOpenMenu}
                //     isFolderComp={false}
                //     select={select}
                //     folderId=""
                //     setRenameToggle={setRenameToggle}
                //   />
                // )
              }
              {/* {
                // rename toggle
                renameToggle === file.id && (
                  <Rename
                    setRenameToggle={setRenameToggle}
                    fileId={file.id}
                    isFolder={file.isFolder}
                    fileName={file.fileName}
                    fileExtension={file.fileExtension}
                  />
                )
              } */}
            </div>
            <div className="flex h-44 w-48 items-center justify-center pb-2.5">
              {img}
            </div>
          </div>
        </div>

        {isVisible && (
          <div
            className="context-menu fixed z-10 rounded-md border border-gray-200 bg-white p-2 shadow-md"
            style={{
              top: position.y,
              left: position.x,
              transition: "opacity 0.3s, transform 0.3s",
              opacity: 1,
              transform: "scale(1)",
              width: "300px",
            }}
            onAnimationEnd={() => {
              if (isVisible) {
                setTimeout(() => {
                  setIsVisible(false);
                }, 1000);
              }
            }}
          >
            <button
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={handleDelete}
            >
              Delete
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              className="relative block w-full px-4 py-2 text-left transition duration-300 hover:bg-gray-100"
              onClick={handleMoveTo}
            >
              Move To
              <span
                className="absolute right-4 top-1/2 -translate-y-1/2 transform"
                style={{ color: "black !important" }}
              >
                &#9654;
              </span>
            </button>
            <button
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={handleShare}
            >
              Share
            </button>
            <hr className="my-1 border-gray-200" />
            <button
              className="block w-full px-4 py-2 text-left hover:bg-gray-100"
              onClick={handleCopyLink}
            >
              Copy Link
            </button>
          </div>
        )}

        {showFolderList && (
          <div className=" absolute left-0 top-0 flex h-full w-full items-center justify-center bg-black bg-opacity-25">
            <div
              className="absolute left-0 top-0 h-full w-full  bg-opacity-25"
              onClick={() => setShowFolderList(false)}
            ></div>
            <div
              className="z-50 rounded-md border border-gray-200 bg-white p-4 shadow-md"
              style={{ width: "300px" }}
            >
              <div className="mb-2">
                <h2 className="text-lg font-semibold">Select Folder</h2>
              </div>
              <hr className="my-1 border-gray-200" />
              <ul>
                {allFolderList.map((folder, index) => (
                  <li
                    key={index}
                    className="flex items-center"
                    onClick={() => handleFolderClick(folder._id)}
                    style={{ marginBottom: "8px", cursor: "pointer" }}
                  >
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
        )}

        {isSharePopupOpen && (
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
                  {/* Add functionality for restricted access */}

                  <input type="radio" id="full" name="access" value="full" />
                  <label htmlFor="full" className="ml-2">
                    Anyone with the link
                  </label>
                  {/* Add functionality for full access */}
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
        )}

        <ToastContainer containerId={"friendRequest"} />
      </>
    );
  });

  // the list of files
  return list;
}

export default GetFiles;
