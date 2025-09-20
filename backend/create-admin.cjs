const mongoose = require('mongoose');
const User = require('./models/User');
const bcrypt = require('bcryptjs');

(async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/orii-india');
    console.log('Connected to MongoDB');
    
    // Check if admin user exists
    let admin = await User.findOne({ email: 'admin@oriiindia.com' });
    
    if (!admin) {
      console.log('Creating admin user...');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      admin = new User({
        firstName: 'Admin',
        lastName: 'User',
        email: 'admin@oriiindia.com',
        password: hashedPassword,
        role: 'admin',
        isVerified: true
      });
      await admin.save();
      console.log('✅ Admin user created successfully');
    } else {
      console.log('✅ Admin user already exists');
    }
    
    console.log('Admin user details:', {
      id: admin._id,
      email: admin.email,
      role: admin.role,
      isVerified: admin.isVerified
    });
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();