/**
 * Document Number Configuration
 * Admin-configurable validation rules for document types
 */

import { storage } from "./storage";

export interface DocumentNumberRule {
  documentType: string;
  pattern: string;
  description: string;
  example: string;
  required: boolean;
}

const DEFAULT_RULES: DocumentNumberRule[] = [
  {
    documentType: "Aadhaar Card",
    pattern: "^\\d{12}$",
    description: "12-digit number",
    example: "123456789012",
    required: true,
  },
  {
    documentType: "Light Bill",
    pattern: "^[A-Z0-9\\-\\/]{6,20}$",
    description: "Alphanumeric with dashes/slashes",
    example: "MSEDCL-123456",
    required: true,
  },
  {
    documentType: "PAN Card",
    pattern: "^[A-Z]{5}[0-9]{4}[A-Z]{1}$",
    description: "10 characters: 5 letters, 4 digits, 1 letter",
    example: "ABCDE1234F",
    required: true,
  },
  {
    documentType: "Sanction Letter",
    pattern: "^[A-Z0-9\\-\\/]{6,30}$",
    description: "Alphanumeric reference number",
    example: "SAN-2024-001234",
    required: false,
  },
  {
    documentType: "Sale Deed",
    pattern: "^[A-Z0-9\\-\\/]{6,30}$",
    description: "Property document number",
    example: "SD-2024-MH-001",
    required: false,
  },
];

class DocumentNumberConfigManager {
  private storageKey = "solar_doc_number_rules";

  /**
   * Get all document number rules
   */
  getRules(): DocumentNumberRule[] {
    const stored = localStorage.getItem(this.storageKey);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing document rules:", e);
      }
    }
    return DEFAULT_RULES;
  }

  /**
   * Get rule for specific document type
   */
  getRuleForDocument(documentType: string): DocumentNumberRule | undefined {
    const rules = this.getRules();
    return rules.find(
      (r) => r.documentType.toLowerCase() === documentType.toLowerCase()
    );
  }

  /**
   * Validate document number against rule
   */
  validateDocumentNumber(
    documentType: string,
    documentNumber: string
  ): { valid: boolean; error?: string } {
    const rule = this.getRuleForDocument(documentType);

    if (!rule) {
      return { valid: true }; // No rule = allow any
    }

    if (!documentNumber && rule.required) {
      return { valid: false, error: "Document number is required" };
    }

    if (!documentNumber) {
      return { valid: true }; // Optional and empty
    }

    try {
      const regex = new RegExp(rule.pattern);
      const isValid = regex.test(documentNumber.trim());

      if (!isValid) {
        return {
          valid: false,
          error: `Invalid format. ${rule.description}. Example: ${rule.example}`,
        };
      }

      return { valid: true };
    } catch (e) {
      console.error("Invalid regex pattern:", rule.pattern);
      return { valid: true }; // Allow if pattern is broken
    }
  }

  /**
   * Update rules (admin only)
   */
  updateRules(rules: DocumentNumberRule[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(rules));
    window.dispatchEvent(
      new CustomEvent("solar_storage_change", {
        detail: { section: "document_rules" },
      })
    );
  }

  /**
   * Add new rule
   */
  addRule(rule: DocumentNumberRule): void {
    const rules = this.getRules();
    rules.push(rule);
    this.updateRules(rules);
  }

  /**
   * Update existing rule
   */
  updateRule(documentType: string, updates: Partial<DocumentNumberRule>): void {
    const rules = this.getRules();
    const index = rules.findIndex(
      (r) => r.documentType.toLowerCase() === documentType.toLowerCase()
    );

    if (index !== -1) {
      rules[index] = { ...rules[index], ...updates };
      this.updateRules(rules);
    }
  }

  /**
   * Delete rule
   */
  deleteRule(documentType: string): void {
    const rules = this.getRules().filter(
      (r) => r.documentType.toLowerCase() !== documentType.toLowerCase()
    );
    this.updateRules(rules);
  }

  /**
   * Reset to defaults
   */
  resetToDefaults(): void {
    this.updateRules(DEFAULT_RULES);
  }
}

export const documentNumberConfig = new DocumentNumberConfigManager();
