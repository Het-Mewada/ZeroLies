import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  streak: { type: Number, default: 0 },
  lastCompletedDate: { type: String, default: null }, // YYYY-MM-DD
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

// Ensure a single user doc always exists
export async function getUser() {
  let user = await User.findOne();
  if (!user) {
    user = await User.create({ streak: 0 });
  }
  return user;
}

export default User;
