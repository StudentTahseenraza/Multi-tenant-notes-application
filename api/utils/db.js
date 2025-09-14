// utils/db.js
import bcrypt from "bcryptjs";
import Tenant from "../models/Tenant.js";
import User from "../models/User.js";

export async function initializeDatabase() {
  console.log("Initializing database...");

  // Create tenants
  const acmeTenant = await Tenant.findOneAndUpdate(
    { slug: "acme" },
    { name: "Acme Corporation", slug: "acme", plan: "free", noteLimit: 3 },
    { upsert: true, new: true }
  );

  const globexTenant = await Tenant.findOneAndUpdate(
    { slug: "globex" },
    { name: "Globex Corporation", slug: "globex", plan: "free", noteLimit: 3 },
    { upsert: true, new: true }
  );

  console.log("Acme tenant:", acmeTenant);
  console.log("Globex tenant:", globexTenant);

  // Helper to create or update user safely
  async function createOrUpdateUser(email, plainPassword, tenantId, role = "member") {
    let user = await User.findOne({ email, tenantId });

    if (!user) {
      // Fresh user → pre-save hook will hash
      user = new User({ email, password: plainPassword, tenantId, role });
      await user.save();
      console.log(`✅ Created user: ${email}`);
    } else {
      // Fix password only if it's not hashed yet
      if (!user.password.startsWith("$2")) {
        user.password = plainPassword; // pre-save will hash
        await user.save();
        console.log(`🔄 Fixed password for: ${email}`);
      } else {
        console.log(`ℹ️ User already has hashed password: ${email}`);
      }
    }
  }

  // Create/update users
  await createOrUpdateUser("admin@acme.test", "password", acmeTenant._id, "admin");
  await createOrUpdateUser("user@acme.test", "password", acmeTenant._id, "member");
  await createOrUpdateUser("admin@globex.test", "password", globexTenant._id, "admin");
  await createOrUpdateUser("user@globex.test", "password", globexTenant._id, "member");

  // Log all users
  const users = await User.find().populate("tenantId");
  console.log(`👥 Total users in database: ${users.length}`);
  users.forEach(u =>
    console.log(`- ${u.email} | Tenant: ${u.tenantId?.name} | Role: ${u.role}`)
  );

  console.log("✅ Database initialized with test data");
}
