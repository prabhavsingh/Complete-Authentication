import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import crypto from "crypto";
import type { IUser, IUserDocument } from "../interfaces/user.interface.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Please tell us your name"],
    },
    email: {
      type: String,
      required: [true, "please provide your email"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    isEmailVerfied: {
      type: Boolean,
      default: false,
    },
    password: {
      type: String,
      required: [true, "please provide your password"],
      minLength: 8,
      select: false,
    },
    twoFactorEnabled: {
      type: Boolean,
      default: false,
    },
    twoFactorSecret: {
      type: Boolean,
      default: undefined,
    },
    tokenVersion: {
      type: Number,
      default: 0,
    },
    passwordChangedAt: {
      type: Date,
      default: undefined,
    },
    resetPasswordToken: {
      type: String,
      default: undefined,
    },
    resetPasswordExpires: {
      type: Date,
      default: undefined,
    },
  },
  { timestamps: true },
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 11);
  next();
});

userSchema.methods.correctPassword = function (password: string) {
  return bcrypt.compare(password, this.password);
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.resetPasswordToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  this.resetPasswordExpires = new Date(Date.now() + 15 * 60 * 1000);

  return resetToken;
};

export const User = mongoose.model<IUserDocument>("User", userSchema);
