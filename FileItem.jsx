import React from "react";
import API from "../api";

const FileItem = ({ file, onDelete }) => {
  const handleDownload = () => {
    window.open(`http://localhost:5000/files/${file._id}`, "_blank");
  };

  const handleDelete = async () => {
    try {
      await API.delete(`/files/${file._id}`);
      onDelete();
    } catch (error) {
      alert("Delete failed");
    }
  };

  return (
    <tr className="border-b">
      <td className="p-2">{file.filename}</td>
      <td className="p-2">{(file.size / 1024).toFixed(2)} KB</td>
      <td className="p-2">
        {new Date(file.uploadDate).toLocaleString()}
      </td>
      <td className="p-2 flex gap-2">
        <button
          onClick={handleDownload}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          Download
        </button>
        <button
          onClick={handleDelete}
          className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
        >
          Delete
        </button>
      </td>
    </tr>
  );
};

export default FileItem;
