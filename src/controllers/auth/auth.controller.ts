import type { NextFunction, Request, Response } from "express";
import { AppError } from "../../lib/appError.js";
import { User } from "../../models/user.model.js";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import z from "zod";
import jwt from "jsonwebtoken";
import { sendEmail } from "../../lib/email.js";
import { catchAyncError } from "../../lib/catchAsyncError.js";
import { createTokens, verifyRefreshToken } from "../../lib/token.js";
import crypto from "crypto";

function getAppUrl() {
  return process.env.APP_URL || `http://localhost:${process.env.PORT}`;
}

export const registerHandler = catchAyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = registerSchema.safeParse(req.body);

  if (!result.success) {
    return next(
      new AppError("Invalid Data!", 400, z.prettifyError(result.error)),
    );
  }
  // provide email and password
  const { name, email, password } = result.data;

  const normalizedEmail = email.toLowerCase().trim();

  const existingUser = await User.findOne({
    email: normalizedEmail,
  });

  if (existingUser) {
    return next(
      new AppError(
        "Account with that Email already exists. please provide a different email",
        409,
      ),
    );
  }

  const newUser = await User.create({
    name,
    email: normalizedEmail,
    password,
  });

  const tokens = createTokens(
    newUser._id.toString(),
    "user",
    newUser.tokenVersion,
  );

  // jwt.sign({ sub: newUser._id }, process.env.JWT_ACCESS_SECRET!, {
  //   expiresIn: process.env.JWT_EXPIRES_IN as any,
  // });

  const verifyUrl = `${getAppUrl()}/auth/verify-email?token=${tokens.accessToken}`;

  await sendEmail(
    newUser.email,
    "Verify your email",
    `<p>Please verify your email by clicking this link:<p>
    <p><a href="${verifyUrl}"> ${verifyUrl}</a><p>`,
  );

  return res.status(201).json({
    status: "success",
    message: "User is registered",
    data: {
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        isEmailVerfied: newUser.isEmailVerfied,
      },
      accessToken: tokens.accessToken,
    },
  });
});

export const verifyEmailHandler = catchAyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.query.token as string;

  if (!token) {
    return next(new AppError("Verification token is missing", 400));
  }

  const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET as string);

  const user = await User.findById(payload.sub);

  if (!user) {
    return next(new AppError("Verification token is missing", 400));
  }

  if (user?.isEmailVerfied) {
    return res.status(200).json({ message: "Email is already verified" });
  }

  user.isEmailVerfied = true;
  await user.save();

  return res
    .status(200)
    .json({ message: "Email is now verified! You can login." });
});

export const loginHandler = catchAyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = loginSchema.safeParse(req.body);

  if (!result.success) {
    return next(
      new AppError("invalid data", 400, z.prettifyError(result.error)),
    );
  }

  const { email, password } = result.data;

  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({
    email: normalizedEmail,
  }).select("+password");

  if (!user || !(await user.correctPassword(password))) {
    return next(new AppError("invalid credentials", 400));
  }

  // if (!user.isEmailVerfied) {
  //   return res.status(403).json({
  //     status: "fail",
  //     message: "Please verify your email before login",
  //   });
  // }

  const tokens = createTokens(
    user._id.toString(),
    user.role,
    user.tokenVersion,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  } as const;

  res.cookie("refreshToken", tokens.refreshToken, cookieOptions);

  return res.status(200).json({
    status: "success",
    message: "Login Successfully",
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerfied: user.isEmailVerfied,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      accessToken: tokens.accessToken,
    },
  });
});

// export const protectHandler = catchAyncError(async function (
//   req: Request,
//   res: Response,
//   next: NextFunction,
// ) {
//   let token: string | undefined;
//   console.log("cokie", req.cookies);
//   if (
//     req?.headers?.authorization &&
//     req?.headers?.authorization.startsWith("Bearer")
//   ) {
//     token = req?.headers?.authorization?.split(" ")[1];
//   }

//   if (!token) {
//     return next(
//       new AppError("You are not logged in! Please log in to get access", 401),
//     );
//   }
//   let payload: any;
//   payload = await promisify(jwt.verify)(
//     token,
//     process.env.JWT_ACCESS_SECRET as string,
//   );
//   // try {
//   // } catch (error) {
//   //   console.log("error", error.message);
//   //   await refreshTokenHandler;
//   // }

//   console.log("decoed", payload);

//   const { sub, tokenVersion, iat, exp } = payload;

//   const currentUser = await User.findById(sub);
//   console.log("user", currentUser);
//   if (!currentUser) {
//     return next(
//       new AppError("User belonging to this token no longer exists", 401),
//     );
//   }

//   req.user = currentUser;
//   next();
// });

export const refreshTokenHandler = catchAyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const token = req.cookies?.refreshToken as string | undefined;

  if (!token) {
    return next(new AppError("Refresh Token missing", 401));
  }

  const { sub, tokenVersion } = verifyRefreshToken(token);
  const user = await User.findById(sub);

  if (!user) {
    return next(new AppError("User not found for this token", 401));
  }

  if (tokenVersion !== user.tokenVersion) {
    return next(new AppError("Refresh token invalidated", 401));
  }

  const newTokens = createTokens(
    user._id.toString(),
    user.role,
    user.tokenVersion,
  );

  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  } as const;

  res.cookie("refreshToken", newTokens.refreshToken, cookieOptions);

  return res.status(200).json({
    status: "success",
    message: "Token refreshed",
    data: {
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        isEmailVerfied: user.isEmailVerfied,
        twoFactorEnabled: user.twoFactorEnabled,
      },
      accessToken: newTokens.accessToken,
    },
  });
});

export const logoutHandler = function (req: Request, res: Response) {
  res.clearCookie("refreshToken", { path: "/" });
  return res.status(200).json({
    status: "success",
    message: "Logged out",
  });
};

export const forgotPasswordHandler = catchAyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const result = forgotPasswordSchema.safeParse(req.body);

  if (!result.success) {
    return next(
      new AppError("Invalid data!", 400, z.prettifyError(result.error)),
    );
  }

  const { email } = result.data;
  const normalizedEmail = email.toLowerCase().trim();

  const user = await User.findOne({ email: normalizedEmail });

  if (!user) {
    return next(new AppError("there is no user with email address", 404));
  }

  const resetToken = user.createPasswordResetToken();

  await user.save({ validateBeforeSave: false });

  try {
    const resetUrl = `${getAppUrl()}/auth/reset-password?token=${resetToken}`;

    await sendEmail(
      user.email,
      "Reset your passowrd",
      `<p>You requested password reset. Click on the below link to reset the password</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>`,
    );
    res.status(200).json({
      status: "success",
      message: "Reset link sent to email",
    });
  } catch (error) {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later!",
        500,
      ),
    );
  }
});

export const resetPasswordHandler = catchAyncError(async function (
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const resetToken = req.query.token as string;
  if (!resetToken) {
    return next(new AppError("Reset token is missing", 400));
  }
  const result = resetPasswordSchema.safeParse(req.body);
  if (!result.success) {
    return next(
      new AppError("Invalid data!", 400, z.prettifyError(result.error)),
    );
  }

  const { password } = result.data;
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken: hashedToken,
    resetPasswordExpires: { $gt: Date.now() },
  }).select("+password");

  if (!user) {
    return next(new AppError("Token is invalid or has expired", 400));
  }

  if (await user.correctPassword(password)) {
    return next(
      new AppError("New password can not be same as old password", 400),
    );
  }

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  user.tokenVersion = user.tokenVersion + 1;
  await user.save();

  return res.status(200).json({
    status: "success",
    message: "Password reset successfully",
  });
});
