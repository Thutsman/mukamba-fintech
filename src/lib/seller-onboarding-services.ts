export type UploadedFileRef = {
  id?: string;
  name?: string;
  url: string;
  type?: string;
  size?: number;
  uploaded_at?: string;
  path?: string;
  signedUrl?: string;
};

export interface SellerOnboardingEntry {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  email?: string;
  completedAt: string | null;
  createdAt?: string;
  updatedAt?: string;
  propertyAddress: string;
  propertyType: string;
  estimatedValue: string | number;
  reasonForSelling: string;
  acceptsInstallments?: boolean | null;
  preferredDepositAmount?: string | number | null;
  installmentDurationMonths?: string | number | null;
  minimumDepositPercentage?: string | number | null;
  photos: UploadedFileRef[];
  documents: UploadedFileRef[];
}

export async function getSellerOnboardingEntries(onlyCompleted: boolean = false): Promise<SellerOnboardingEntry[]> {
  try {
    const res = await fetch(`/api/admin/seller-onboarding?onlyCompleted=${onlyCompleted ? 'true' : 'false'}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      cache: 'no-store'
    });
    if (!res.ok) {
      console.error('Failed to load seller onboarding entries', await res.text());
      return [];
    }
    const body = await res.json();
    return body.data || [];
  } catch (e) {
    console.error('Error fetching seller onboarding entries:', e);
    return [];
  }
}


