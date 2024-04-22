
import React, { useState, useEffect, useRef } from "react";
import { AiOutlineSearch } from "react-icons/ai";

import {  useRouter } from "next/router";

function Search() {

  const [searchTest, setSearchTest] = useState<string>("");
  const [onFocus, setOnFocus] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [list, setList] = useState<FolderListProps[]>([]);

  const router = useRouter();

  const folderId = router.query.id as string;

  useEffect(() => {
    const GetFiles = async () => {
      try {
        const response = await fetch(
             `http://localhost:8888/files/search?name=${searchTest}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        const allFiles = await response.json();

        setList(allFiles.data);
      } catch (error) {
        console.error('Error Getting Folders:', error);
      }
    };
    if(searchTest.length > 0){
      GetFiles();
    }
   
  }, [searchTest]);





  const openFile = (fileLink: string) => {
    window.open(fileLink, "_blank");
  };

 

  const result = list?.map((item) => {
    
    return (
      <div
     
        onClick={() => openFile(item.url)}
        className="flex w-full cursor-pointer items-center space-x-3.5 border-blue-700 px-4 py-2 hover:border-l-2 hover:bg-darkC2"
      >
        <span className="h-6 w-6">
         
          
        </span>
      
        <span className="w-full truncate">
          {item.name}
        </span>
      </div>
    );
  });

  const handleDocumentClick = (e: { target: any }) => {
    if (
      inputRef.current &&
      e.target &&
      !inputRef.current.contains(e.target as Node)
    ) {
      setOnFocus(false);
    }
  };

  useEffect(() => {
    document.addEventListener("click", handleDocumentClick);
    return () => {
      document.removeEventListener("click", handleDocumentClick);
    };
  }, []);

  return (
    <div className="relative flex-1" onFocus={() => setOnFocus(!onFocus)}>
      <span className="absolute left-2 top-[5px] h-9 w-9 cursor-pointer rounded-full p-2 hover:bg-darkC">
        <AiOutlineSearch className="h-full w-full stroke-textC" stroke="2" />
      </span>

      <input
        ref={inputRef}
        onChange={(e) => setSearchTest(e.target.value)}
        type="text"
        placeholder="Search in Drive"
        className="w-full rounded-full bg-darkC2 px-2 py-[11px] indent-11 shadow-darkC
        placeholder:text-textC focus:rounded-b-none
        focus:rounded-t-2xl focus:bg-white focus:shadow-md focus:outline-none"
      />
      {onFocus && (
        <div
          className="absolute z-10 max-h-60 w-full overflow-scroll rounded-b-2xl border-t-[1.5px]
      border-textC bg-white pt-2 shadow-md shadow-darkC"
        >
          {result?.length < 1 && searchTest ? (
            <div className="pl-5 text-sm text-gray-500">
              No result match your search.
            </div>
          ) : (
            result
          )}
        </div>
      )}
    </div>
  );
}

export default Search;
