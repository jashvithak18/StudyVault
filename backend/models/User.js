import { Schema, model } from 'mongoose'
import bcrypt from 'bcryptjs'
const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, "First name is required"]
  },
  lastName: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  role: {
    type: String,
    enum: ['STUDENT', 'ADMIN', 'USER'],
    default: 'STUDENT'
  },
  profileImageUrl: {
    type: String,
    default: ''
  }
}, {
  versionKey: false,
  timestamps: true
})
// pre save password hashing
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err) {
    next(err);
  }
});
// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const UserModel = model("user", userSchema)
