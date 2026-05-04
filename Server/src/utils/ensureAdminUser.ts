import { User } from '../models/User';

export const ensureAdminUser = async () => {
  const adminCount = await User.countDocuments({ role: 'admin' });
  if (adminCount > 0) {
    return false;
  }

  const adminEmail = process.env.ADMIN_EMAIL || 'admin@example.com';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  const existingUser = await User.findOne({ email: adminEmail });
  if (existingUser) {
    existingUser.role = 'admin';
    await existingUser.save();
    console.log(`Existing user ${adminEmail} promoted to admin`);
    return true;
  }

  await User.create({
    email: adminEmail,
    password: adminPassword,
    role: 'admin'
  });

  console.log(`Admin user ${adminEmail} created successfully`);
  return true;
};
