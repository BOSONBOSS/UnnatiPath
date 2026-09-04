/**
 * EPFO / NCS Employment Signal Adapter (Mock Adapter)
 * Provides external triangulation signal of active payroll contributions.
 */

export interface EpfoSignalResult {
  hasActiveContribution: boolean;
  pfMemberIdMasked: string;
  establishmentName: string;
  establishmentPfCode: string;
  contributionMonth: string;
  wageBandEstimate: string;
  confidenceScore: number;
}

export class EpfoService {
  static async queryEmploymentSignal(
    traineePseudonym: string,
    employerPfCode?: string
  ): Promise<EpfoSignalResult> {
    await new Promise((resolve) => setTimeout(resolve, 400));

    return {
      hasActiveContribution: true,
      pfMemberIdMasked: `MH/PUN/${traineePseudonym.slice(-4)}/001`,
      establishmentName: "XYZ Precision Manufacturing Ltd",
      establishmentPfCode: employerPfCode || "MH/PUN/0048192/000",
      contributionMonth: "August 2026",
      wageBandEstimate: "₹18,000 - ₹22,000",
      confidenceScore: 0.98,
    };
  }
}
