import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServiceClient } from '@/lib/supabase';
import { sendTransactionalTemplateEmail, getAppUrl } from '@/lib/transactional-email-service';
import { KycStatusEmailTemplate } from '@/lib/email-templates/kyc-status';
import * as React from 'react';

const patchSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  rejection_reason: z.string().optional(),
  admin_notes: z.string().optional(),
  admin_id: z.string().optional(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ verificationId: string }> }
) {
  try {
    const { verificationId } = await params;
    const body = await request.json().catch(() => ({}));
    const data = patchSchema.parse(body);

    if (!verificationId) {
      return NextResponse.json({ error: 'Verification ID is required' }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Fetch existing verification for user_id + type
    const { data: existing, error: fetchError } = await supabase
      .from('kyc_verifications')
      .select('id, user_id, verification_type')
      .eq('id', verificationId)
      .single();

    if (fetchError || !existing) {
      return NextResponse.json({ error: 'Verification not found' }, { status: 404 });
    }

    const updatePayload: any = {
      status: data.status,
      reviewed_by: data.admin_id || null,
      reviewed_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    if (data.status === 'rejected') {
      updatePayload.rejection_reason = data.rejection_reason || 'Verification was rejected';
    }
    if (data.admin_notes) updatePayload.admin_notes = data.admin_notes;

    const { error: updateError } = await supabase
      .from('kyc_verifications')
      .update(updatePayload)
      .eq('id', verificationId);

    if (updateError) {
      console.error('KYC update error:', updateError);
      return NextResponse.json({ error: 'Failed to update verification' }, { status: 500 });
    }

    // If approved identity, reflect on profile (align with existing client logic)
    if (data.status === 'approved' && (existing as any).verification_type === 'identity') {
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({ is_identity_verified: true })
        .eq('id', (existing as any).user_id);
      if (profileError) {
        console.error('Profile update error after KYC approval:', profileError);
      }
    }

    // Email user (best-effort)
    const userId = (existing as any).user_id as string;
    const verificationType = ((existing as any).verification_type as string) || 'identity';
    const { data: userProfile } = await supabase
      .from('user_profiles')
      .select('first_name, email')
      .eq('id', userId)
      .single();

    const email = (userProfile as any)?.email as string | undefined;
    const firstName = ((userProfile as any)?.first_name as string | undefined) || 'there';

    if (email) {
      let appUrl: string | null = null;
      try {
        appUrl = getAppUrl();
      } catch (e) {
        console.error('NEXT_PUBLIC_APP_URL missing; skipping CTA links:', e);
      }

      const cta = appUrl ? { label: 'Open your dashboard', url: `${appUrl}/?section=overview` } : undefined;

      sendTransactionalTemplateEmail({
        to: [email],
        subject:
          data.status === 'approved'
            ? 'KYC approved'
            : 'KYC rejected',
        react: React.createElement(KycStatusEmailTemplate, {
          firstName,
          verificationType,
          status: data.status,
          rejectionReason: data.status === 'rejected' ? (data.rejection_reason || null) : null,
          cta,
        }),
        tags: [data.status === 'approved' ? 'kyc_approved' : 'kyc_rejected'],
        metadata: { verification_id: String(verificationId), verification_type: String(verificationType) },
      }).catch((e) => console.error('Failed to send KYC decision email:', e));
    }

    return NextResponse.json({ success: true });
  } catch (e) {
    if (e instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation error', details: e.issues }, { status: 400 });
    }
    console.error('PATCH /api/admin/kyc/[verificationId] error:', e);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

