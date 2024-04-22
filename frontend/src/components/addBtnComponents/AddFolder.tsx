import { useRouter } from "next/router";
import React, { useState } from "react";
import { DotLoader } from "react-spinners";

function AddFolder({ setFolderToggle, setNeedLoader }: folderToggleProps) {
  const [folderName, setFolderName] = useState("");
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const id = router.query.id as string;

  const addFolder = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:8888/folders/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          name: folderName,
          parent: id ? id : null,
        }),
      });

      const result = await response.json();
      setFolderToggle(false);
      if (result?.data) {
        localStorage.setItem('loader', "true");
        setNeedLoader(true);
      }
    } catch (error) {
      console.error("Error creating folder:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      onClick={() => setFolderToggle(false)}
      className="absolute -left-5 -top-20 z-20 flex h-screen w-screen items-center justify-center bg-darkC2/40"
    >
      <div
        onClick={(e) => {
          e.stopPropagation();
        }}
        className="w-96 space-y-6 rounded-xl bg-white p-5 shadow-lg shadow-[#bbb]"
      >
        <h2 className="text-2xl">New folder</h2>
        <input
          className="w-full rounded-md border border-textC py-2 indent-5 outline-textC2"
          type="text"
          placeholder="Untitled folder"
          onChange={(e) => setFolderName(e.target.value)}
        />
        {
          isLoading ? <div className="flex h-full items-center justify-center">
            <DotLoader color="#b8c2d7" size={60} />
          </div> : <div className=" flex w-full justify-end space-x-5 pr-3 font-medium text-textC2">
            <button
              type="button"
              onClick={() => setFolderToggle(false)}
              className="rounded-full px-3 py-2 hover:bg-darkC2"
            >
              Cancel
            </button>
            <button
              onClick={() => addFolder()}
              className="rounded-full px-3 py-2 hover:bg-darkC2"
            >
              Create
            </button>
          </div>
        }

      </div>
    </div>
  );
}

export default AddFolder;
