import { NextResponse } from "next/server";
import { Resend } from "resend";
import { emailConfig } from "@/lib/config/env";
import {
  quoteSchema,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
  ACCEPTED_UPLOAD_TYPES,
} from "@/lib/forms/quote-schema";
import { renderEnquiryEmail, enquirySubject } from "@/lib/forms/enquiry-email";
import { checkRateLimit } from "@/lib/forms/rate-limit";

/**
 * Quote enquiry endpoint.
 *
 * Runs on the Node runtime because it handles file buffers.
 *
 * ORDER OF CHECKS matters and is deliberate:
 *   1. rate limit      — cheapest, rejects floods before parsing
 *   2. parse form data
 *   3. honeypot        — reject bots before doing real work
 *   4. schema          — the SAME Zod schema the browser used
 *   5. files           — type and size, per file and in total
 *   6. configuration   — refuse honestly if we cannot actually send
 *   7. send
 *
 * The response NEVER reports success unless Resend confirmed delivery.
 */
export const runtime = "nodejs";

/** Resend caps a whole request at 40MB; stay well inside it. */
const MAX_TOTAL_UPLOAD_BYTES = 15 * 1024 * 1024;

type Failure = { field?: string; message: string };

function fail(status: number, message: string, errors?: Failure[]) {
  return NextResponse.json({ ok: false, message, errors }, { status });
}

export async function POST(request: Request) {
  /* 1 — rate limit ------------------------------------------------- */
  const limit = checkRateLimit(request);
  if (!limit.allowed) {
    return fail(
      429,
      "Too many enquiries from this connection. Please wait a few minutes, or call us on 07990 377780.",
    );
  }

  /* 2 — parse ------------------------------------------------------ */
  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return fail(400, "That submission could not be read. Please try again.");
  }

  const value = (key: string) => {
    const raw = form.get(key);
    return typeof raw === "string" ? raw : undefined;
  };

  /* 3 — honeypot ---------------------------------------------------- */
  // A real person never sees this field, so anything in it is a bot.
  // Respond 200 so the bot believes it succeeded and does not retry, but
  // send nothing. This is the one place a truthful-looking response is
  // correct: the caller is not a person being misled.
  if ((value("website") ?? "").length > 0) {
    return NextResponse.json({ ok: true, message: "Thank you." });
  }

  /* 4 — schema ------------------------------------------------------ */
  const parsed = quoteSchema.safeParse({
    name: value("name"),
    company: value("company"),
    email: value("email"),
    phone: value("phone"),
    projectLocation: value("projectLocation"),
    serviceRequired: value("serviceRequired"),
    projectDetails: value("projectDetails"),
    preferredContact: value("preferredContact"),
    website: value("website") ?? "",
  });

  if (!parsed.success) {
    return fail(
      422,
      "Some details need checking.",
      parsed.error.issues.map((issue) => ({
        field: String(issue.path[0] ?? ""),
        message: issue.message,
      })),
    );
  }

  /* 5 — files ------------------------------------------------------- */
  const files = form
    .getAll("files")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (files.length > MAX_UPLOAD_FILES) {
    return fail(422, `Please attach no more than ${MAX_UPLOAD_FILES} files.`);
  }

  let totalBytes = 0;
  for (const file of files) {
    if (
      !ACCEPTED_UPLOAD_TYPES.includes(
        file.type as (typeof ACCEPTED_UPLOAD_TYPES)[number],
      )
    ) {
      return fail(
        422,
        `“${file.name}” is not a supported file type. Please attach photographs (JPG, PNG, HEIC, WebP) or a PDF.`,
      );
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      return fail(
        422,
        `“${file.name}” is larger than 8MB. Please attach a smaller version.`,
      );
    }
    totalBytes += file.size;
  }

  if (totalBytes > MAX_TOTAL_UPLOAD_BYTES) {
    return fail(
      422,
      "Those attachments are too large in total. Please send fewer or smaller photographs.",
    );
  }

  /* 6 — configuration ----------------------------------------------- */
  // Without credentials we cannot deliver. Say so plainly rather than
  // returning a success the enquiry never had.
  if (!emailConfig.isConfigured) {
    console.error("[quote] email is not configured; enquiry not delivered");
    return fail(
      503,
      "Online sending is not available right now. Please call 07990 377780 or email info@boviaccess.co.uk and we will pick it up straight away.",
    );
  }

  /* 7 — send --------------------------------------------------------- */
  const enquiry = parsed.data;

  try {
    const attachments = await Promise.all(
      files.map(async (file) => ({
        filename: file.name,
        content: Buffer.from(await file.arrayBuffer()),
      })),
    );

    const resend = new Resend(emailConfig.apiKey);

    const { error } = await resend.emails.send({
      from: emailConfig.from as string,
      to: [emailConfig.to as string],
      replyTo: enquiry.email,
      subject: enquirySubject(enquiry),
      html: renderEnquiryEmail(enquiry, files.map((f) => f.name)),
      attachments,
    });

    if (error) {
      // Log the provider's reason, never the enquiry itself.
      console.error("[quote] resend rejected the message:", error.message);
      return fail(
        502,
        "We could not send that just now. Please call 07990 377780 or email info@boviaccess.co.uk.",
      );
    }
  } catch (error) {
    console.error(
      "[quote] delivery failed:",
      error instanceof Error ? error.message : "unknown error",
    );
    return fail(
      502,
      "We could not send that just now. Please call 07990 377780 or email info@boviaccess.co.uk.",
    );
  }

  return NextResponse.json({
    ok: true,
    message: "Thanks — your project details have been sent to BOVI Access.",
  });
}
