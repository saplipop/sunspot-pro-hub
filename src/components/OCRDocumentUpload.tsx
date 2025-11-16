import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Scan, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { ocrService } from "@/lib/ocrService";
import { documentNumberConfig } from "@/lib/documentNumberConfig";
import { useToast } from "@/hooks/use-toast";
import { FileUpload } from "@/components/FileUpload";

interface OCRDocumentUploadProps {
  documentName: string;
  documentId: string;
  customerId: string;
  onUploadComplete: (fileId: string, documentNumber: string) => void;
}

export function OCRDocumentUpload({
  documentName,
  documentId,
  customerId,
  onUploadComplete,
}: OCRDocumentUploadProps) {
  const [documentNumber, setDocumentNumber] = useState("");
  const [ocrScanning, setOcrScanning] = useState(false);
  const [ocrSuggestion, setOcrSuggestion] = useState("");
  const [validationError, setValidationError] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const { toast } = useToast();

  const validateNumber = (value: string): boolean => {
    const validation = documentNumberConfig.validateDocumentNumber(documentName, value);
    
    if (!validation.valid) {
      setValidationError(validation.error || "Invalid format");
      return false;
    }
    
    setValidationError("");
    return true;
  };

  const handleOCRScan = async () => {
    if (!file) {
      toast({
        title: "No File Selected",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    setOcrScanning(true);
    setOcrSuggestion("");

    try {
      const result = await ocrService.extractText(file);

      if (result.success && result.documentNumber) {
        setOcrSuggestion(result.documentNumber);
        toast({
          title: "OCR Successful",
          description: `Detected: ${result.documentNumber} (${Math.round(result.confidence)}% confidence)`,
        });
      } else {
        toast({
          title: "OCR Complete",
          description: "No document number detected. Please enter manually.",
        });
      }
    } catch (error) {
      toast({
        title: "OCR Failed",
        description: "Could not scan document. Please enter number manually.",
        variant: "destructive",
      });
    } finally {
      setOcrScanning(false);
    }
  };

  const handleAcceptSuggestion = () => {
    setDocumentNumber(ocrSuggestion);
    setOcrSuggestion("");
    validateNumber(ocrSuggestion);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
  };

  const handleUpload = (fileId: string) => {
    if (!documentNumber.trim()) {
      toast({
        title: "Document Number Required",
        description: "Please enter a document number before uploading",
        variant: "destructive",
      });
      return;
    }

    if (!validateNumber(documentNumber)) {
      return;
    }

    onUploadComplete(fileId, documentNumber);
  };

  const rule = documentNumberConfig.getRuleForDocument(documentName);

  return (
    <div className="space-y-4">
      <Alert className="bg-primary/5 border-primary/20">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <div className="text-sm">
            <p className="font-semibold mb-1">Document Number Required</p>
            {rule && (
              <>
                <p className="text-xs text-muted-foreground">{rule.description}</p>
                <p className="text-xs text-muted-foreground mt-1">Example: {rule.example}</p>
              </>
            )}
          </div>
        </AlertDescription>
      </Alert>

      <div className="space-y-2">
        <Label htmlFor="docNumber">
          Document Number {rule?.required && <span className="text-destructive">*</span>}
        </Label>
        <div className="flex gap-2">
          <Input
            id="docNumber"
            value={documentNumber}
            onChange={(e) => {
              setDocumentNumber(e.target.value);
              validateNumber(e.target.value);
            }}
            placeholder={rule?.example || "Enter document number"}
            className={validationError ? "border-destructive" : ""}
          />
          <Button
            type="button"
            variant="outline"
            onClick={handleOCRScan}
            disabled={!file || ocrScanning}
            className="gap-2 whitespace-nowrap"
          >
            {ocrScanning ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Scanning...
              </>
            ) : (
              <>
                <Scan className="h-4 w-4" />
                OCR Scan
              </>
            )}
          </Button>
        </div>
        {validationError && (
          <p className="text-sm text-destructive">{validationError}</p>
        )}
      </div>

      {ocrSuggestion && (
        <Alert className="bg-green-500/10 border-green-500/20">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription>
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">OCR Detected: {ocrSuggestion}</p>
                <p className="text-xs text-muted-foreground">Click to use this number</p>
              </div>
              <Button size="sm" variant="outline" onClick={handleAcceptSuggestion}>
                Use This
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label>Upload Document File</Label>
        <input
          type="file"
          accept="image/*,.pdf"
          onChange={handleFileSelect}
          className="block w-full text-sm text-muted-foreground
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-primary file:text-primary-foreground
            hover:file:bg-primary/90"
        />
      </div>

      {file && documentNumber && !validationError && (
        <FileUpload
          documentId={documentId}
          documentName={documentName}
          onUploadComplete={handleUpload}
        />
      )}
    </div>
  );
}
