import api from "./interceptor";
import { Document } from "@/data/mockData";

export interface DocumentResponse {
  success: boolean;
  data: {
    documents?: Document[];
    document?: Document;
    fileId?: string;
    fileName?: string;
    fileUrl?: string;
    uploadDate?: string;
  };
  message?: string;
}

const documentService = {
  getCustomerDocuments: async (customerId: string): Promise<Document[]> => {
    const response = await api.get<DocumentResponse>(`/customers/${customerId}/documents`);
    return response.data.data.documents || [];
  },

  update: async (customerId: string, documentId: string, data: Partial<Document>): Promise<Document> => {
    const response = await api.put<DocumentResponse>(
      `/customers/${customerId}/documents/${documentId}`,
      data
    );
    return response.data.data.document!;
  },

  uploadFile: async (
    customerId: string,
    documentId: string,
    file: File,
    documentNumber: string
  ): Promise<{ fileId: string; fileUrl: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("documentNumber", documentNumber);

    const response = await api.post<DocumentResponse>(
      `/customers/${customerId}/documents/${documentId}/upload`,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return {
      fileId: response.data.data.fileId!,
      fileUrl: response.data.data.fileUrl!,
    };
  },

  deleteFile: async (customerId: string, documentId: string): Promise<void> => {
    await api.delete(`/customers/${customerId}/documents/${documentId}/file`);
  },
};

export default documentService;
