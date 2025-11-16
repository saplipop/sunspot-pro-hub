/**
 * OCR Service for Document Number Extraction
 * Uses Tesseract.js for client-side OCR
 */

import Tesseract from "tesseract.js";

export interface OCRResult {
  success: boolean;
  text: string;
  documentNumber?: string;
  confidence: number;
  error?: string;
}

class OCRService {
  /**
   * Extract text from image file
   */
  async extractText(file: File): Promise<OCRResult> {
    try {
      const result = await Tesseract.recognize(file, "eng", {
        logger: (m) => {
          if (m.status === "recognizing text") {
            console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
          }
        },
      });

      const text = result.data.text;
      const confidence = result.data.confidence;

      // Attempt to extract document numbers
      const documentNumber = this.extractDocumentNumber(text);

      return {
        success: true,
        text,
        documentNumber,
        confidence,
      };
    } catch (error) {
      return {
        success: false,
        text: "",
        confidence: 0,
        error: error instanceof Error ? error.message : "OCR failed",
      };
    }
  }

  /**
   * Extract document number from text using pattern matching
   */
  private extractDocumentNumber(text: string): string | undefined {
    // Remove extra whitespace and newlines
    const cleanText = text.replace(/\s+/g, " ").trim();

    // Pattern 1: Aadhaar number (12 digits, may have spaces)
    const aadhaarPattern = /\b\d{4}\s?\d{4}\s?\d{4}\b/g;
    const aadhaarMatch = cleanText.match(aadhaarPattern);
    if (aadhaarMatch) {
      return aadhaarMatch[0].replace(/\s/g, "");
    }

    // Pattern 2: Bill numbers (alphanumeric with dashes/slashes)
    const billPattern = /\b[A-Z]{2,4}[-\/]?\d{6,12}\b/gi;
    const billMatch = cleanText.match(billPattern);
    if (billMatch) {
      return billMatch[0];
    }

    // Pattern 3: Consumer number patterns
    const consumerPattern = /\b(?:CON|CONS|CN)[-\s]?\d{8,12}\b/gi;
    const consumerMatch = cleanText.match(consumerPattern);
    if (consumerMatch) {
      return consumerMatch[0];
    }

    // Pattern 4: Generic long number sequences (10-15 digits)
    const genericPattern = /\b\d{10,15}\b/g;
    const genericMatch = cleanText.match(genericPattern);
    if (genericMatch) {
      return genericMatch[0];
    }

    return undefined;
  }

  /**
   * Extract document number with specific pattern
   */
  async extractWithPattern(file: File, pattern: RegExp): Promise<OCRResult> {
    const result = await this.extractText(file);

    if (!result.success) {
      return result;
    }

    const match = result.text.match(pattern);
    
    return {
      ...result,
      documentNumber: match ? match[0] : undefined,
    };
  }
}

export const ocrService = new OCRService();
