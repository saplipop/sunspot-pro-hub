import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { FileText, Upload, Download, Trash2, Eye } from "lucide-react";
import { Document } from "@/data/mockData";
import { FileUpload } from "@/components/FileUpload";
import { getFile, downloadFile, deleteFile } from "@/utils/fileStorage";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface DocumentTabsProps {
  documents: Document[];
  onDocumentUpdate: (doc: Document) => void;
  onBulkUpload?: (uploadedDocs: Document[]) => void;
}

export function DocumentTabs({ documents, onDocumentUpdate, onBulkUpload }: DocumentTabsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [previewDoc, setPreviewDoc] = useState<{ doc: Document; fileData: string } | null>(null);
  const isAdmin = user?.role === "admin";

  const addedDocuments = documents.filter((doc) => !doc.fileId && !doc.uploaded);
  const uploadedDocuments = documents.filter((doc) => doc.fileId || doc.uploaded);

  const handleFileUpload = (doc: Document, fileId: string) => {
    const updatedDoc: Document = {
      ...doc,
      fileId,
      uploaded: true,
      uploadDate: new Date().toISOString().split("T")[0],
      doneBy: user?.username || "Admin",
      status: "in_progress",
    };
    
    onDocumentUpdate(updatedDoc);

    toast({
      title: "Document Uploaded",
      description: `${doc.name} uploaded successfully by ${user?.username}`,
    });
  };

  const handleFileDelete = (doc: Document) => {
    if (doc.fileId) {
      deleteFile(doc.fileId);
    }

    const updatedDoc: Document = {
      ...doc,
      fileId: undefined,
      uploaded: false,
      uploadDate: undefined,
      status: "pending",
    };

    onDocumentUpdate(updatedDoc);

    toast({
      title: "Document Deleted",
      description: `${doc.name} has been removed`,
      variant: "destructive",
    });
  };

  const handlePreview = (doc: Document) => {
    if (doc.fileId) {
      const file = getFile(doc.fileId);
      if (file && file.type.startsWith("image/")) {
        setPreviewDoc({ doc, fileData: file.base64Data });
      }
    }
  };

  const handleDownload = (doc: Document) => {
    if (doc.fileId) {
      const file = getFile(doc.fileId);
      if (file) {
        downloadFile(file);
        toast({
          title: "Download Started",
          description: `Downloading ${doc.name}`,
        });
      }
    }
  };

  const getSectionProgress = () => {
    if (documents.length === 0) return 0;
    const uploadedCount = documents.filter((d) => d.uploaded || d.fileId).length;
    return Math.round((uploadedCount / documents.length) * 100);
  };

  const progress = getSectionProgress();

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Documents Management
            </CardTitle>
            <div className="flex items-center gap-3">
              <Badge
                className={
                  progress >= 80
                    ? "bg-success text-success-foreground"
                    : progress >= 40
                    ? "bg-warning text-warning-foreground"
                    : "bg-destructive text-destructive-foreground"
                }
              >
                {progress}% Complete
              </Badge>
              <div className="flex gap-2 text-sm">
                <Badge variant="outline" className="bg-success/10 text-success">
                  ✓ {uploadedDocuments.length} Uploaded
                </Badge>
                <Badge variant="outline" className="bg-destructive/10 text-destructive">
                  ⏳ {addedDocuments.length} Pending
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="added" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="added" className="relative">
                Added Documents
                {addedDocuments.length > 0 && (
                  <Badge variant="destructive" className="ml-2 h-5 w-5 rounded-full p-0 text-xs">
                    {addedDocuments.length}
                  </Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="uploaded" className="relative">
                Uploaded Documents
                {uploadedDocuments.length > 0 && (
                  <Badge variant="default" className="ml-2 h-5 w-5 rounded-full p-0 text-xs bg-success">
                    {uploadedDocuments.length}
                  </Badge>
                )}
              </TabsTrigger>
            </TabsList>

            {/* Added Documents Tab */}
            <TabsContent value="added" className="animate-fade-in">
              {addedDocuments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>All documents uploaded! 🎉</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Document Number</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Remark</TableHead>
                      <TableHead className="text-right">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {addedDocuments.map((doc) => (
                      <TableRow key={doc.id} className="animate-fade-in">
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4 text-muted-foreground" />
                            {doc.name}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm">
                          {doc.documentNumber ? (
                            <code className="px-2 py-1 bg-muted rounded text-xs">{doc.documentNumber}</code>
                          ) : (
                            <span className="text-muted-foreground text-xs italic">Not set</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-destructive/10 text-destructive">
                            🟥 Pending
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {doc.remark || "-"}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end">
                            <FileUpload
                              documentId={doc.id}
                              documentName={doc.name}
                              existingFileId={doc.fileId}
                              onUploadComplete={(fileId) => handleFileUpload(doc, fileId)}
                              acceptedFormats=".pdf,.jpg,.jpeg,.png,.docx"
                            />
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </TabsContent>

            {/* Uploaded Documents Tab */}
            <TabsContent value="uploaded" className="animate-fade-in">
              {uploadedDocuments.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  <Upload className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No documents uploaded yet</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Document Name</TableHead>
                      <TableHead>Document Number</TableHead>
                      <TableHead>Upload Date</TableHead>
                      <TableHead>Uploaded By</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {uploadedDocuments.map((doc) => {
                      const file = doc.fileId ? getFile(doc.fileId) : null;
                      const isImage = file?.type.startsWith("image/");

                      return (
                        <TableRow key={doc.id} className="animate-fade-in">
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-primary" />
                              {doc.name}
                              {doc.verified && (
                                <Badge className="bg-blue-500 text-white text-xs">✓</Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {doc.documentNumber ? (
                              <code className="px-2 py-1 bg-primary/10 text-primary rounded text-xs font-semibold">
                                {doc.documentNumber}
                              </code>
                            ) : (
                              <span className="text-muted-foreground text-xs italic">Not provided</span>
                            )}
                          </TableCell>
                          <TableCell className="text-sm">
                            {doc.uploadDate || "-"}
                          </TableCell>
                          <TableCell className="text-sm font-medium">
                            {doc.doneBy || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge className="bg-success text-success-foreground">
                              🟢 Uploaded
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                            {doc.remark || doc.notes || "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1">
                              {isImage && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handlePreview(doc)}
                                  title="Preview"
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDownload(doc)}
                                title="Download"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              {isAdmin && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleFileDelete(doc)}
                                  title="Delete"
                                  className="text-destructive hover:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Preview Dialog */}
      {previewDoc && (
        <Dialog open={!!previewDoc} onOpenChange={() => setPreviewDoc(null)}>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>{previewDoc.doc.name}</DialogTitle>
            </DialogHeader>
            <img
              src={previewDoc.fileData}
              alt={previewDoc.doc.name}
              className="w-full h-auto max-h-[70vh] object-contain"
            />
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}