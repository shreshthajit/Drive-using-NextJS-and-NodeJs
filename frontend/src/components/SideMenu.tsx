"use client";
import React, { useState, ChangeEvent, useEffect } from "react";
import { HiOutlinePlusSm } from "react-icons/hi";
import DropDown from "./addBtnComponents/DropDown";
import AddFolder from "./addBtnComponents/AddFolder";
import Navbar from "./Navbar";
import fileUpload from "@/API/FileUpload";
import ProgressIndicator from "./ProgressIndicator";
import { useRouter } from "next/router";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "@/GlobalRedux/store";
import { increment } from "@/GlobalRedux/Features/counter/counterSlice";

function SideMenu({ setNeedLoader }: { setNeedLoader: any }) {
  const [isDropDown, setIsDropDown] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // const [progress, setProgress] = useState<number>(0);
  const [fileName, setFileName] = useState<string[]>([]);
  const [folderName, setFolderName] = useState<string>("");
  const [folderToggle, setFolderToggle] = useState(false);
  const [complete, setComplete] = useState<boolean>(false);

  const count = useSelector((state:RootState)=> state.counter.value);
  const dispatch = useDispatch();

  const router = useRouter();
  const folderId = router.query.id as string;

  // Add new file
  const uploadFile =async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files || [];
    for (let i = 0; i < files.length; i++) {
      const file = files?.[i];
      if (!file) return;
      setFileName((prev) => [...prev, file.name]);
      setIsDropDown(false);

      setComplete(false);
      setIsUploading(true);
     const check =await fileUpload(file, setComplete, setIsUploading, folderId || "", setNeedLoader);
     if(check){
      dispatch(increment());
      console.log("Checking redux value",count);
     }

    }
  };

  useEffect(() => {
    if (localStorage?.getItem('loader')) {
      setIsDropDown(false);
      setNeedLoader(true);
      localStorage.removeItem('loader');
    }
  }, [localStorage?.getItem('loader')])

  fileName.reverse();

  // Add new folder
  const uploadFolder = () => {
    let payload = {
      folderName: folderName === "" ? "Untitled folder" : folderName,
      isFolder: true,
      isStarred: false,
      isTrashed: false,
      FileList: [],
      folderId: folderId || "",
    };

    //addFolder(payload);
    setFolderName("");
  };

  return (
    <section className="relative h-[90vh] w-16 space-y-4 duration-500 tablet:w-60">
      <button
        onClick={() => setIsDropDown(true)}
        className="mt-1 flex w-fit items-center justify-center space-x-2
      rounded-2xl bg-white p-3 text-textC shadow-md shadow-[#ddd]
      duration-300 hover:bg-darkC2 hover:shadow-[#bbb] tablet:px-5 tablet:py-4"
      >
        <HiOutlinePlusSm className="h-6 w-6" />
        <span className="hidden text-sm font-medium tablet:block">New</span>
      </button>
      {isDropDown && (
        <DropDown
          setFolderToggle={setFolderToggle}
          uploadFile={uploadFile}
          setIsDropDown={setIsDropDown}
        />
      )}
      {complete && <ProgressIndicator
        progress={[]}
        fileName={fileName}
        setFileName={setFileName}
      />}
      {
        isUploading && <div
          className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg"
        >
          <p>Uploading file...</p>
        </div>
      }
      {folderToggle && (
        <AddFolder
          setFolderToggle={setFolderToggle}
          setFolderName={setFolderName}
          uploadFolder={uploadFolder}
          setNeedLoader={setNeedLoader}
        />
      )}
      <Navbar />
    </section>
  );
}

export default SideMenu;
