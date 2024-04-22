
import { useEffect, useState } from "react";


export const fetchAllFiles = (userEmail: string) => {
  const [fileList, setFileList] = useState<FileListPropsTest[]>([]);

  const allFiles = () => {
    if (userEmail) {
    
    }
  };

  useEffect(() => {
    allFiles();
  }, [userEmail]);

  return fileList;
};
