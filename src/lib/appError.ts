export class AppError extends Error {
  private status: string;
  constructor(
    message: string,
    private statusCode: number,
    private errorMessage?: any,
  ) {
    super(message);

    this.status = `${statusCode}`.startsWith("4") ? "fail" : "error";

    Error.captureStackTrace(this, this.constructor);
  }
}
