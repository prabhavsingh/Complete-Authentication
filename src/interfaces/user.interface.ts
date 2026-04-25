import { Document } from "mongoose";

export interface IUser {
  name: string;
  email: string;
  role: "admin" | "user";
  isEmailVerfied: boolean;
  password: string;
  twoFactorEnabled: boolean;
  twoFactorSecret?: boolean;
  tokenVersion: number;
  passwordChangedAt?: Date | undefined;
  resetPasswordToken?: string | undefined;
  resetPasswordExpires?: Date | undefined;
}

export interface IUserDocument extends IUser, Document {
  correctPassword(password: string): Promise<boolean>;
  createPasswordResetToken(): string;
}
