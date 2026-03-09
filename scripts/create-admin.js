/* Script to create an admin user in Supabase.
 *
 * Usage:
 *   SUPABASE_SERVICE_ROLE_KEY=... NEXT_PUBLIC_SUPABASE_URL=... \
 *   npm run create-admin -- admin@camboea.com admin@168
 */

/* eslint-disable no-console */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

async function main() {
  const [, , emailArg, passwordArg] = process.argv;

  if (!emailArg || !passwordArg) {
    console.error('Usage: npm run create-admin -- <email> <password>');
    process.exit(1);
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  // 1) Create (or reuse) user
  const { data: userResult, error: createError } = await supabase.auth.admin.createUser({
    email: emailArg,
    password: passwordArg,
    email_confirm: true,
  });

  if (createError && createError.message !== 'User already registered') {
    console.error('Error creating user:', createError.message);
    process.exit(1);
  }

  let userId = userResult?.user?.id;

  if (!userId) {
    // If user already exists, fetch it
    const { data: listResult, error: listError } = await supabase.auth.admin.listUsers({
      page: 1,
      perPage: 100,
    });
    if (listError) {
      console.error('Error listing users:', listError.message);
      process.exit(1);
    }
    const existing = listResult.users.find((u) => u.email === emailArg);
    if (!existing) {
      console.error('User not found and could not be created.');
      process.exit(1);
    }
    userId = existing.id;
  }

  // 2) Upsert profile with admin role
  const { error: profileError } = await supabase
    .from('profiles')
    .upsert({ id: userId, role: 'admin' }, { onConflict: 'id' });

  if (profileError) {
    console.error('Error setting admin role:', profileError.message);
    process.exit(1);
  }

  console.log(`Admin user ready: ${emailArg}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

