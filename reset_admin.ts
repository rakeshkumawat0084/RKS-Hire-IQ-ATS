import mongoose, { type Model } from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import dns from "node:dns";

dns.setDefaultResultOrder("ipv4first");
try {
  dns.setServers(["8.8.8.8", "8.8.4.4"]);
} catch (e) {
  console.warn("Could not set DNS servers, proceeding with defaults.");
}

dotenv.config();

const uri = process.env.MONGODB_URI;

async function resetPassword() {
  if (!uri) {
    console.error("No MONGODB_URI found");
    return;
  }
  
  try {
    await mongoose.connect(uri);
    console.log("Connected to DB");
    
    // Import the User model schema directly for this script
    const userSchema = new mongoose.Schema({
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      fullName: { type: String },
      isAdmin: { type: Boolean, default: false },
    });
    
    // Avoid "Cannot overwrite model once compiled" error
    const User = (mongoose.models.User || mongoose.model('User', userSchema)) as Model<any>;
    
    const email = process.env.INITIAL_ADMIN_EMAIL;
    const password = process.env.INITIAL_ADMIN_PASSWORD;

    if (!email || !password) {
      console.error("INITIAL_ADMIN_EMAIL and INITIAL_ADMIN_PASSWORD must be set in .env");
      process.exit(1);
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    
    const user = await User.findOne({ email });
    if (user) {
      user.password = hashedPassword;
      user.isAdmin = true;
      await user.save();
      console.log(`Password reset for ${email}`);
    } else {
      const newUser = new User({
        email,
        password: hashedPassword,
        fullName: "Platform Admin",
        isAdmin: true
      });
      await newUser.save();
      console.log(`User created for ${email}`);
    }
    
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

resetPassword();
