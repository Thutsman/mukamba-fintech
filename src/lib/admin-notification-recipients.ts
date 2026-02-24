import 'server-only';

const DEFAULT_ADMIN_EMAILS = ['hello@mukambagateway.com'];

function uniqEmails(emails: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const e of emails) {
    const v = (e || '').trim().toLowerCase();
    if (!v) continue;
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

/**
 * Returns a deduped list of admin notification recipients.
 *
 * - Always includes `hello@mukambagateway.com` by default.
 * - Optionally merges in admin emails from `user_profiles` where `user_role='admin'`.
 */
export async function getAdminNotificationRecipients(options: {
  supabase?: any;
  includeRoleAdmins?: boolean;
  includeHello?: boolean;
} = {}): Promise<string[]> {
  const includeHello = options.includeHello !== false;
  const includeRoleAdmins = options.includeRoleAdmins !== false;

  const base = includeHello ? [...DEFAULT_ADMIN_EMAILS] : [];

  if (!includeRoleAdmins || !options.supabase) {
    return uniqEmails(base);
  }

  try {
    const { data } = await options.supabase
      .from('user_profiles')
      .select('email')
      .eq('user_role', 'admin');

    const roleAdminEmails = (data || [])
      .map((r: any) => r?.email as string | undefined)
      .filter(Boolean) as string[];

    return uniqEmails([...base, ...roleAdminEmails]);
  } catch (e) {
    console.error('Failed to load admin recipients:', e);
    return uniqEmails(base);
  }
}

