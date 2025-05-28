import { GSCloudEvent, GSContext, GSStatus, PlainObject } from "@godspeedsystems/core";
import crypto from "crypto";

/**
 * Hash the password with a new salt using pbkdf2.
 * Format: salt:hash
 */
const hashPassword = (password: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) return reject(err);
      resolve(`${salt}:${derivedKey.toString("hex")}`);
    });
  });
};

export default async function registerUser(ctx: GSContext, args: PlainObject) {
  const {
    inputs: {
      data: { body },
    },
    logger,
    datasources,
  } = ctx;

  const { email, password, role } = body;

  if (!email || !password || !role) {
    return new GSStatus(false, 400, "Missing required fields", {
      missing: ["email", "password", "role"],
    });
  }

  const passwordHash = await hashPassword(password);

  // 🔒 Placeholder: This is where you’ll call user-service via Axios
  // Example:
  // const response = await datasources.axios.execute(ctx, {
  //   method: 'POST',
  //   url: 'http://user-service.localhost:4001/user',
  //   data: { organizationName, userEmail: email }
  // });

  // 🔒 Placeholder: You will also create a user in your auth DB here (commented for now)
  // const user = await datasources.postgres.client.user.create({
  //   data: {
  //     email,
  //     passwordHash,
  //     role: ["MERCHANT"],
  //     organizations: {
  //       create: {
  //         name: organizationName,
  //       },
  //     },
  //   },
  // });

  logger.info("Simulated user registration");
  return new GSStatus(true, 201, "User registered (test mode)", {
    email,
    passwordHash,
    role,
    note: "No database write. Axios call commented for testing.",
  });
}
