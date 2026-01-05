import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Check if admin user exists with auth_user_id already set
    const { data: existingAdmin } = await supabase
      .from('User')
      .select('id, auth_user_id, email, role')
      .eq('role', 'Admin')
      .limit(1);

    if (existingAdmin && existingAdmin.length > 0 && existingAdmin[0].auth_user_id) {
      console.log('Admin user already has auth linked, skipping bootstrap');
      return new Response(
        JSON.stringify({ message: 'Admin already exists and linked', bootstrapped: false }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Try to find existing auth user with admin@nucleosys.local
    const { data: existingAuthUsers } = await supabase.auth.admin.listUsers();
    const existingAuthAdmin = existingAuthUsers?.users?.find(u => u.email === 'admin@nucleosys.local');

    let authUserId: string;

    if (existingAuthAdmin) {
      console.log('Found existing auth admin user:', existingAuthAdmin.id);
      authUserId = existingAuthAdmin.id;
    } else {
      // Create admin auth user
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: 'admin@nucleosys.local',
        password: 'Admin@123',
        email_confirm: true,
      });

      if (authError) {
        console.error('Error creating auth user:', authError);
        throw authError;
      }

      console.log('Created new auth user:', authData.user.id);
      authUserId = authData.user.id;
    }

    // If an admin user exists without auth_user_id, update it
    if (existingAdmin && existingAdmin.length > 0 && !existingAdmin[0].auth_user_id) {
      const { error: updateError } = await supabase
        .from('User')
        .update({ 
          auth_user_id: authUserId,
          email: 'admin@nucleosys.local'
        })
        .eq('id', existingAdmin[0].id);

      if (updateError) {
        console.error('Error updating user profile:', updateError);
        throw updateError;
      }

      // Add/update role in user_roles table
      await supabase
        .from('user_roles')
        .upsert({
          user_id: authUserId,
          role: 'Admin'
        }, { onConflict: 'user_id' });

      console.log('Linked existing admin with auth');
    } else {
      // Create new admin profile
      const { error: profileError } = await supabase.from('User').insert({
        auth_user_id: authUserId,
        name: 'System Admin',
        email: 'admin@nucleosys.local',
        role: 'Admin',
        department: 'Admin',
        status: 'active',
      });

      if (profileError) {
        console.error('Error creating user profile:', profileError);
        throw profileError;
      }

      // Add role to user_roles table
      await supabase
        .from('user_roles')
        .upsert({
          user_id: authUserId,
          role: 'Admin'
        }, { onConflict: 'user_id' });
    }

    console.log('Bootstrap admin created successfully');

    return new Response(
      JSON.stringify({ 
        message: 'Admin user bootstrapped successfully', 
        bootstrapped: true,
        email: 'admin@nucleosys.local',
        password: 'Admin@123'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Bootstrap error:', error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
