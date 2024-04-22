import { increment } from "@/GlobalRedux/Features/counter/counterSlice";
import { RootState } from "@/GlobalRedux/store";
import { useDispatch, useSelector } from "react-redux";
import { DotLoader } from "react-spinners";

const fileUpload = async (
  file: any,
  setComplete: Function,
  setIsUploading: Function,
  parentId: string,
  setNeedLoader: any,
): Promise<boolean> => { // Specify return type as Promise<boolean>
  try {
    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', parentId);

    const response = await fetch(`http://localhost:8888/files/upload`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData,
    });

    if (response.ok) {
      setIsUploading(false);
      setComplete(true);
      setNeedLoader(true);
      return true; // Return true if upload is successful
    } else {
      console.error("File upload failed");
      return false; // Return false if upload fails
    }
  } catch (error) {
    console.error("File upload failed:", error);
    return false; // Return false if upload fails due to an error
  }
};

export default fileUpload;
