import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

type UploadedFileRef = {
  id?: string;
  name?: string;
  url: string;
  type?: string;
  size?: number;
  uploaded_at?: string;
  path?: string;
  signedUrl?: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const onlyCompleted = searchParams.get('onlyCompleted') === 'true';

    const supabase = createServiceClient();

    // 1) Load onboarding rows
    let query = supabase
      .from('seller_onboarding_progress')
      .select('id, user_id, form_data, completed_at, created_at, updated_at')
      .order('completed_at', { ascending: false, nullsFirst: false });

    if (onlyCompleted) {
      query = query.not('completed_at', 'is', null);
    }

    const { data: progressRows, error: progressError } = await query;
    if (progressError) {
      return NextResponse.json({ error: progressError.message }, { status: 500 });
    }

    const userIds = Array.from(new Set((progressRows || []).map(r => r.user_id).filter(Boolean)));

    // 2) Load user names
    let profilesById: Record<string, { first_name: string; last_name: string; email?: string }> = {};
    if (userIds.length > 0) {
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('id, first_name, last_name, email')
        .in('id', userIds);

      if (profilesError) {
        return NextResponse.json({ error: profilesError.message }, { status: 500 });
      }

      for (const p of profiles || []) {
        profilesById[p.id] = { first_name: p.first_name, last_name: p.last_name, email: (p as any).email };
      }
    }

    // Helper to extract storage path from a public URL
    const extractPath = (u?: string) => {
      if (!u) return '';
      const marker = '/storage/v1/object/public/property-documents/';
      const idx = u.indexOf(marker);
      if (idx === -1) return '';
      return u.substring(idx + marker.length);
    };

    // Create signed URLs for files
    const signFiles = async (files: UploadedFileRef[] = []): Promise<UploadedFileRef[]> => {
      const out: UploadedFileRef[] = [];
      for (const f of files) {
        const path = f.path || extractPath(f.url);
        let signedUrl: string | undefined = undefined;
        if (path) {
          const { data: signed, error: signErr } = await supabase
            .storage
            .from('property-documents')
            .createSignedUrl(path, 60 * 60); // 1 hour
          if (!signErr && signed?.signedUrl) {
            signedUrl = signed.signedUrl;
          }
        }
        out.push({ ...f, path, signedUrl });
      }
      return out;
    };

    // 3) Shape response
    const results = await Promise.all((progressRows || []).map(async row => {
      const formData: any = row.form_data || {};
      const profile = profilesById[row.user_id] || { first_name: '', last_name: '' };

      const photosRaw: UploadedFileRef[] = Array.isArray(formData.uploadedPropertyPhotos)
        ? formData.uploadedPropertyPhotos
        : [];
      const documentsRaw: UploadedFileRef[] = Array.isArray(formData.uploadedPropertyDocuments)
        ? formData.uploadedPropertyDocuments
        : [];

      const photos = await signFiles(photosRaw);
      const documents = await signFiles(documentsRaw);

      return {
        id: row.id,
        userId: row.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
        completedAt: row.completed_at,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
        propertyAddress: formData.propertyAddress || formData.property_address || '',
        propertyType: formData.propertyType || formData.property_type || '',
        estimatedValue: formData.estimatedValue || formData.estimated_property_value || '',
        reasonForSelling: formData.reasonForSelling || formData.reason_for_selling || '',
        acceptsInstallments: formData.acceptsInstallments ?? null,
        preferredDepositAmount: formData.preferredDepositAmount ?? null,
        installmentDurationMonths: formData.installmentDurationMonths ?? null,
        minimumDepositPercentage: formData.minimumDepositPercentage ?? null,
        photos,
        documents,
      };
    }));

    return NextResponse.json({ data: results });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || 'Unexpected error' }, { status: 500 });
  }
}


