import { createEmailClient } from "./src/lib/email";
import { validateEnv } from "./src/env";
import * as dotenv from "dotenv";

dotenv.config();

const env = validateEnv(process.env);

async function test() {
    console.log("Testing Resend...");
    console.log("Key:", env.RESEND_API_KEY ? "Loaded" : "Missing");
    console.log("From:", env.RESEND_FROM_EMAIL);

    const client = createEmailClient(env);
    const result = await client.emails.send({
        from: env.RESEND_FROM_EMAIL,
        to: "test@example.com", // testing only
        subject: "Test",
        html: "<h1>Test</h1>"
    });

    console.log("Result:", result);
}

test();
