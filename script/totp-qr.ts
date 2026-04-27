import ORCode from "qrcode";

const otpAuthUrl = process.argv[2];
if (!otpAuthUrl) {
  throw new Error("Pass otpAuthurl as argument");
}

async function main() {
  await ORCode.toFile("totp.png", otpAuthUrl);
  console.log("Saved OR code");
}

main().catch((err) => {
  console.log(err);
  process.exit(1);
});
