import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { FileUpload } from "@/components/FileUpload";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Document, Status } from "@/data/mockData";
import { CheckCircle2, XCircle, Clock, Upload, FileCheck, AlertTriangle, Eye } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface DocumentManagementPanelProps {
  documents: Document[];
  onDocumentUpdate: (doc: Document) => void;
}

export function DocumentManagementPanel({ documents, onDocumentUpdate }: DocumentManagementPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [verifyDialog, setVerifyDialog] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  const getStatusIcon = (status: Status) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-success" />;
      case "in_progress":
        return <Clock className="h-4 w-4 text-warning" />;
      default:
        return <XCircle className="h-4 w-4 text-destructive" />;
    }
  };

  const getStatusBadge = (doc: Document) => {
    if (doc.verified) {
      return (
        <Badge className="bg-success text-success-foreground hover:bg-success/90">
          <CheckCircle2 className="h-3 w-3 mr-1" />
          Verified
        </Badge>
      );
    }
    if (doc.uploaded || doc.fileId) {
      return (
        <Badge className="bg-warning text-warning-foreground hover:bg-warning/90">
          <Clock className="h-3 w-3 mr-1" />
          Pending Review
        </Badge>
      );
    }
    return (
      <Badge variant="destructive">
        <XCircle className="h-3 w-3 mr-1" />
        Not Uploaded
      </Badge>
    );
  };

  const handleFileUpload = (docId: string, fileId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      onDocumentUpdate({
        ...doc,
        fileId,
        uploaded: true,
        uploadDate: new Date().toISOString().split("T")[0],
        doneBy: user?.username || "Unknown",
        status: "in_progress",
      });
      toast({
        title: "Document Uploaded",
        description: `${doc.name} has been uploaded successfully`,
      });
    }
  };

  const handleFileDelete = (docId: string) => {
    const doc = documents.find(d => d.id === docId);
    if (doc) {
      onDocumentUpdate({
        ...doc,
        fileId: undefined,
        uploaded: false,
        uploadDate: undefined,
        status: "pending",
      });
    }
  };

  const handleVerify = () => {
    if (selectedDoc) {
      onDocumentUpdate({
        ...selectedDoc,
        verified: true,
        verifiedBy: user?.username || "Admin",
        status: "completed",
        remark: verificationNotes,
      });
      toast({
        title: "Document Verified",
        description: `${selectedDoc.name} has been verified`,
      });
      setVerifyDialog(false);
      setSelectedDoc(null);
      setVerificationNotes("");
    }
  };

  const uploadedCount = documents.filter(d => d.uploaded || d.fileId).length;
  const verifiedCount = documents.filter(d => d.verified).length;
  const completionPercentage = documents.length > 0 ? Math.round((verifiedCount / documents.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Total Documents</CardDescription>
            <CardTitle className="text-3xl font-bold">{documents.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-warning">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Uploaded</CardDescription>
            <CardTitle className="text-3xl font-bold">{uploadedCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-l-4 border-l-success">
          <CardHeader className="pb-3">
            <CardDescription className="text-xs">Verified</CardDescription>
            <CardTitle className="text-3xl font-bold">{verifiedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Progress Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Verification Progress</CardTitle>
          <CardDescription>Overall document completion status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Completion</span>
              <span className="font-semibold">{completionPercentage}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      <Card>
        <CardHeader>
          <CardTitle>Document Management</CardTitle>
          <CardDescription>Upload and verify customer documents</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.length === 0 ? (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>No documents found for this customer</AlertDescription>
            </Alert>
          ) : (
            documents.map((doc) => (
              <Card key={doc.id} className="border-l-4 border-l-muted hover:border-l-primary transition-colors">
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    {/* Document Header */}
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="mt-1">
                          {getStatusIcon(doc.status)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm mb-1">{doc.name}</h4>
                          {doc.documentNumber && (
                            <p className="text-xs text-muted-foreground">
                              Doc #: {doc.documentNumber}
                            </p>
                          )}
                          {doc.uploadDate && (
                            <p className="text-xs text-muted-foreground">
                              Uploaded: {doc.uploadDate} by {doc.doneBy || "N/A"}
                            </p>
                          )}
                          {doc.verifiedBy && (
                            <p className="text-xs text-success flex items-center gap-1 mt-1">
                              <CheckCircle2 className="h-3 w-3" />
                              Verified by {doc.verifiedBy}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(doc)}
                      </div>
                    </div>

                    {/* File Upload Section */}
                    <div className="space-y-3">
                      <Label className="text-xs font-medium">Document File</Label>
                      <FileUpload
                        documentId={doc.id}
                        documentName={doc.name}
                        existingFileId={doc.fileId}
                        onUploadComplete={(fileId) => handleFileUpload(doc.id, fileId)}
                        onDelete={() => handleFileDelete(doc.id)}
                      />
                    </div>

                    {/* Verification Section - Only for Admin/Uploaded Docs */}
                    {user?.role === "admin" && (doc.uploaded || doc.fileId) && !doc.verified && (
                      <div className="pt-3 border-t">
                        <Button
                          onClick={() => {
                            setSelectedDoc(doc);
                            setVerifyDialog(true);
                          }}
                          className="w-full sm:w-auto"
                          size="sm"
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Verify Document
                        </Button>
                      </div>
                    )}

                    {/* Remarks */}
                    {doc.remark && (
                      <Alert>
                        <AlertDescription className="text-xs">
                          <strong>Note:</strong> {doc.remark}
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </CardContent>
      </Card>

      {/* Verification Dialog */}
      <Dialog open={verifyDialog} onOpenChange={setVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verify Document</DialogTitle>
            <DialogDescription>
              Confirm that {selectedDoc?.name} has been reviewed and verified
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Verification Notes (Optional)</Label>
              <Textarea
                placeholder="Add any notes or comments..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={4}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVerifyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleVerify}>
              <FileCheck className="h-4 w-4 mr-2" />
              Verify Document
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
