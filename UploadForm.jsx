import React, { useState } from "react";
import API from "../api";

const UploadForm = ({ onUploadSuccess }) => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) return alert("Please select a file!");

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      await API.post("/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setFile(null);
      onUploadSuccess();
    } catch (error) {
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleUpload}
      className="p-4 flex items-center gap-3 border rounded-lg bg-gray-100"
    >
      <input
        type="file"
        onChange={handleFileChange}
        className="border p-2 rounded"
      />
      <button
        type="submit"
        disabled={uploading}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
};

export default UploadForm;
