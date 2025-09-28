import React, { useEffect, useState } from "react";
import API from "../api";
import FileItem from "./FileItem";

const FileList = () => {
  const [files, setFiles] = useState([]);

  const fetchFiles = async () => {
    try {
      const { data } = await API.get("/files");
      setFiles(data);
    } catch (error) {
      console.error("Error fetching files", error);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  return (
    <div className="mt-6">
      <h2 className="text-xl font-semibold mb-3">Uploaded Files</h2>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 text-left">Filename</th>
            <th className="p-2 text-left">Size</th>
            <th className="p-2 text-left">Uploaded At</th>
            <th className="p-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.length > 0 ? (
            files.map((file) => (
              <FileItem key={file._id} file={file} onDelete={fetchFiles} />
            ))
          ) : (
            <tr>
              <td colSpan="4" className="text-center p-4 text-gray-500">
                No files uploaded yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default FileList;
