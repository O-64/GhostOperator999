import { useState } from 'react';

interface DragAndDropUploadProps {
  label: string;
  onFileSelect: (file: File | null) => void;
}

export default function DragAndDropUpload({ label, onFileSelect }: DragAndDropUploadProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    else if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const files = e.dataTransfer.files;
    if (files && files[0]) onFileSelect(files[0]);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) onFileSelect(files[0]);
  };

  return (
    <div
      className={`border-2 border-dashed rounded p-4 text-center ${dragActive ? 'border-indigo-600 bg-indigo-50' : 'border-gray-300'}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <p className="mb-2 text-gray-600">{label}</p>
      <input type="file" accept=".pdf,.docx,.pptx" onChange={handleChange} className="hidden" id={`file-input-${label}`} />
      <label htmlFor={`file-input-${label}`} className="cursor-pointer inline-block bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">
        Choose File
      </label>
    </div>
  );
}
