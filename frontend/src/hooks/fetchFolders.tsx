
import { useEffect, useState } from "react";


export const fetchFolders = (folderId: string) => {
    const [folderList, setFolderList] = useState<FolderListProps[]>([]);
  
    useEffect(() => {
      const GetFolders = async () => {
        try {
          const response = await fetch(`http://localhost:8888/folders`, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            },
          });
          const allFoldrs = await response.json();
          setFolderList(allFoldrs.data);
  
        } catch (error) {
          console.error('Error Getting Folders:', error);
        }
      };
      GetFolders();
    }, []);
  
  
  
  //console.log("This is response",fileList);
  const getFolders = () => {
    // if (userEmail) {
    //   const getUserFiles = query(files, where("userEmail", "==", userEmail));
    //   if (!folderId) {
    //     onSnapshot(getUserFiles, (res) => {
    //       return setFileList(
    //         res.docs
    //           .map((doc) => {
    //             const fileExtension = doc
    //               .data()
    //               .fileName?.split(".")
    //               .pop()
    //               ?.toLowerCase();
    //             return {
    //               ...doc.data(),
    //               id: doc.id,
    //               fileName: doc.data().fileName,
    //               fileExtension: fileExtension,
    //               fileLink: doc.data().fileLink,
    //               folderId: doc.data().folderId,
    //               folderName: doc.data().folderName,
    //               isFolder: doc.data().isFolder,
    //               isStarred: doc.data().isStarred,
    //               isTrashed: doc.data().isTrashed,
    //             };
    //           })
    //           .filter((file) => file.folderId === "") as FileListProps[],
    //       );
    //     });
    //   } else {
    //     onSnapshot(getUserFiles, (res) => {
    //       return setFileList(
    //         res.docs
    //           .map((doc) => {
    //             const fileExtension = doc
    //               .data()
    //               .fileName?.split(".")
    //               .pop()
    //               ?.toLowerCase();
    //             return {
    //               ...doc.data(),
    //               id: doc.id,
    //               fileName: doc.data().fileName,
    //               fileExtension: fileExtension,
    //               fileLink: doc.data().fileLink,
    //               folderId: doc.data().folderId,
    //               folderName: doc.data().folderName,
    //               isFolder: doc.data().isFolder,
    //               isStarred: doc.data().isStarred,
    //               isTrashed: doc.data().isTrashed,
    //             };
    //           })
    //           .filter((file) => file.folderId === folderId) as FileListProps[],
    //       );
    //     });
    //   }
    // }
  };

//   useEffect(() => {
//     getFolders();
//   }, [folderId, userEmail]);

  return folderList;
};
