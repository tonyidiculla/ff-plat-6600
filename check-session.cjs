const { createClient } = require("@supabase/supabase-js");

// Load environment variables
require("dotenv").config({ path: ".env.local" });

async function checkCurrentSession() {
  console.log("Checking current session...");

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    console.error("Missing environment variables");
    return;
  }

  const supabase = createClient(supabaseUrl, anonKey);

  try {
    // Get current session
    const { data: session, error: sessionError } =
      await supabase.auth.getSession();

    if (sessionError) {
      console.error("Session error:", sessionError);
      return;
    }

    console.log("Current session:", session);

    if (session?.session?.user) {
      const user = session.session.user;
      console.log("User ID:", user.id);
      console.log("User Email:", user.email);
      console.log("User Metadata:", user.user_metadata);

      // Check if this user exists in master_data.profiles
      console.log("\n=== CHECKING PROFILE FOR USER ===");
      const { data: profile, error: profileError } = await supabase
        .schema("master_data")
        .from("profiles")
        .select("*")
        .eq("email", user.email)
        .single();

      console.log("Profile lookup result:", { profile, profileError });

      if (profile) {
        console.log("Found profile:", profile);

        // Check role assignments
        const { data: roleAssignments, error: roleError } = await supabase
          .schema("master_data")
          .from("user_to_role_assignment")
          .select("*")
          .eq("user_platform_id", profile.user_platform_id);

        console.log("Role assignments:", { roleAssignments, roleError });

        if (roleAssignments && roleAssignments.length > 0) {
          // Get role details
          const roleIds = roleAssignments.map((r) => r.platform_role_id);
          const { data: roles, error: rolesError } = await supabase
            .schema("master_data")
            .from("platform_roles")
            .select("*")
            .in("id", roleIds);

          console.log("Roles:", { roles, rolesError });
        }
      }
    } else {
      console.log("No active session");
    }
  } catch (error) {
    console.error("Exception:", error);
  }
}

checkCurrentSession();
