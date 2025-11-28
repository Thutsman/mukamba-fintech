/**
 * Script to update admin user password
 * 
 * Usage:
 *   node scripts/update-admin-password.js
 * 
 * Make sure you have SUPABASE_SERVICE_ROLE_KEY in your .env or .env.local file
 * Or set environment variables:
 *   NEXT_PUBLIC_SUPABASE_URL=your-url
 *   SUPABASE_SERVICE_ROLE_KEY=your-key
 */

const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

// Load .env or .env.local if it exists
const envPaths = [
  path.join(__dirname, '..', '.env'),
  path.join(__dirname, '..', '.env.local')
];

for (const envPath of envPaths) {
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split(/\r?\n/).forEach(line => {
      // Skip comments and empty lines
      line = line.trim();
      if (!line || line.startsWith('#')) return;
      
      // Match key=value format (handles values with = in them)
      const match = line.match(/^([^=:#\s]+)\s*=\s*(.*)$/);
      if (match) {
        const key = match[1].trim();
        let value = match[2].trim();
        // Remove surrounding quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        if (!process.env[key] && value) {
          process.env[key] = value;
        }
      }
    });
    console.log(`✅ Loaded environment variables from ${path.basename(envPath)}`);
    break; // Use the first file found
  }
}

const ADMIN_EMAIL = 'admin@mukamba.com';
const NEW_PASSWORD = 'Adm1n!'; // Must be at least 6 characters per Supabase requirements

async function updateAdminPassword() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('❌ Error: Missing Supabase configuration');
    console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env or .env.local');
    process.exit(1);
  }

  console.log('🔐 Updating admin password...');
  console.log(`📧 Email: ${ADMIN_EMAIL}`);
  console.log(`🔑 New Password: ${NEW_PASSWORD}`);

  const supabase = createClient(supabaseUrl, serviceRoleKey);

  try {
    // First, find the user by email
    console.log('\n🔍 Searching for admin user...');
    const { data: users, error: listError } = await supabase.auth.admin.listUsers();

    if (listError) {
      console.error('❌ Error listing users:', listError);
      process.exit(1);
    }

    const adminUser = users.users.find(user => user.email === ADMIN_EMAIL);

    if (!adminUser) {
      console.error(`❌ Error: User with email ${ADMIN_EMAIL} not found`);
      console.log('\n💡 Tip: You may need to create the admin user first in Supabase Dashboard');
      process.exit(1);
    }

    console.log(`✅ Found admin user: ${adminUser.id}`);

    // Update the password
    console.log('\n🔄 Updating password...');
    const { data: updateData, error: updateError } = await supabase.auth.admin.updateUserById(
      adminUser.id,
      { password: NEW_PASSWORD }
    );

    if (updateError) {
      console.error('❌ Error updating password:', updateError);
      process.exit(1);
    }

    console.log('✅ Password updated successfully!');
    console.log('\n📝 Summary:');
    console.log(`   Email: ${ADMIN_EMAIL}`);
    console.log(`   Password: ${NEW_PASSWORD}`);
    console.log('\n✨ You can now sign in with these credentials.');

  } catch (error) {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  }
}

// Run the script
updateAdminPassword();

