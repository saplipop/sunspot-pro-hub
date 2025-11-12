export interface UploadedFile {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadDate: string;
  base64Data: string;
}

const STORAGE_KEY = 'solar_uploaded_files';

export const saveFile = async (file: File, documentId: string): Promise<UploadedFile> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const uploadedFile: UploadedFile = {
        id: `${documentId}_${Date.now()}`,
        name: file.name,
        type: file.type,
        size: file.size,
        uploadDate: new Date().toISOString(),
        base64Data: reader.result as string,
      };

      // Get existing files
      const existingFiles = getStoredFiles();
      existingFiles[uploadedFile.id] = uploadedFile;

      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(existingFiles));
        resolve(uploadedFile);
      } catch (error) {
        // If localStorage is full, try to clean old files
        if (error instanceof Error && error.name === 'QuotaExceededError') {
          cleanOldFiles(10);
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existingFiles));
            resolve(uploadedFile);
          } catch {
            reject(new Error('Storage quota exceeded. Please delete some old files.'));
          }
        } else {
          reject(error);
        }
      }
    };

    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
};

export const getFile = (fileId: string): UploadedFile | null => {
  const files = getStoredFiles();
  return files[fileId] || null;
};

export const deleteFile = (fileId: string): void => {
  const files = getStoredFiles();
  delete files[fileId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
};

export const getStoredFiles = (): Record<string, UploadedFile> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

export const cleanOldFiles = (keepCount: number = 20): void => {
  const files = getStoredFiles();
  const fileArray = Object.values(files);
  
  // Sort by upload date (newest first)
  fileArray.sort((a, b) => 
    new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()
  );

  // Keep only the newest files
  const filesToKeep = fileArray.slice(0, keepCount);
  const newFiles: Record<string, UploadedFile> = {};
  
  filesToKeep.forEach(file => {
    newFiles[file.id] = file;
  });

  localStorage.setItem(STORAGE_KEY, JSON.stringify(newFiles));
};

export const downloadFile = (file: UploadedFile): void => {
  const link = document.createElement('a');
  link.href = file.base64Data;
  link.download = file.name;
  link.click();
};