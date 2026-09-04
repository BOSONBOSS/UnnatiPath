/**
 * DigiLocker Integration Adapter (Mock Adapter)
 * Privacy-first: Does not store, log, or transmit raw 12-digit Aadhaar numbers.
 */

export interface DigiLockerAuthResult {
  success: boolean;
  pseudonymousId: string;
  name: string;
  district: string;
  phoneMasked: string;
  verifiedDocuments: {
    title: string;
    issuer: string;
    verifiedDate: string;
    docType: string;
  }[];
}

export class DigiLockerService {
  /**
   * Generates a pseudonymous identifier using SHA-256 HMAC representation
   */
  static generatePseudonym(mobileOrAadhaarLast4: string): string {
    const hashPart = Math.abs(
      mobileOrAadhaarLast4.split("").reduce((acc, char) => (acc << 5) - acc + char.charCodeAt(0), 0)
    ).toString(16).slice(0, 4).toUpperCase();
    return `DL-${hashPart}-${mobileOrAadhaarLast4.slice(-2)}`;
  }

  static async requestOtp(identifier: string): Promise<{ success: boolean; message: string }> {
    // Simulated network delay
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      success: true,
      message: "One-Time Password (OTP) sent to your DigiLocker registered mobile number.",
    };
  }

  static async verifyOtpAndConsent(
    identifier: string,
    otp: string,
    consent: boolean
  ): Promise<DigiLockerAuthResult> {
    await new Promise((resolve) => setTimeout(resolve, 800));

    if (!consent) {
      throw new Error("Consent is mandatory for DigiLocker document access verification.");
    }

    const pseudoId = this.generatePseudonym(identifier || "8472");

    return {
      success: true,
      pseudonymousId: pseudoId,
      name: "Rahul Kumar",
      district: "Pune",
      phoneMasked: "+91 98****4120",
      verifiedDocuments: [
        {
          title: "Aadhaar Identity Token (Masked)",
          issuer: "UIDAI / DigiLocker National Gateway",
          verifiedDate: "2026-01-15",
          docType: "IDENTITY",
        },
        {
          title: "Secondary School Examination Certificate (Class X)",
          issuer: "Maharashtra State Board of Secondary & Higher Secondary Education",
          verifiedDate: "2024-06-20",
          docType: "EDUCATION",
        },
        {
          title: "National Trade Certificate (NTC) / ITI Credential",
          issuer: "NCVT - Directorate General of Training (DGT)",
          verifiedDate: "2026-06-05",
          docType: "VOCATIONAL",
        },
      ],
    };
  }
}
