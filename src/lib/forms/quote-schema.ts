import { z } from "zod";
import { services } from "@/lib/config/site";

/**
 * Quote enquiry schema.
 *
 * This is the SINGLE source of validation truth. The client form (React
 * Hook Form + zodResolver) and the server route handler both parse against
 * it, so a payload can never pass the browser and fail silently on the
 * server, or bypass the browser and reach the server unvalidated.
 *
 * PHASE 4 wires this to the form UI and Resend delivery. It is defined now
 * because it fixes the data contract the form and the email template share.
 */

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024; // 8MB per file
export const MAX_UPLOAD_FILES = 5;

/** Deliberately narrow. Site photos are images or the occasional PDF. */
export const ACCEPTED_UPLOAD_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "application/pdf",
] as const;

// Widened deliberately: this is a runtime membership check against
// arbitrary submitted input, not a compile-time union.
const serviceNames: readonly string[] = services.map((service) => service.name);

export const contactMethods = ["Email", "Phone", "Either"] as const;

export const quoteSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Please enter your name.")
    .max(100, "That name is too long."),

  company: z.string().trim().max(120, "That company name is too long.").optional(),

  email: z
    .string()
    .trim()
    .min(1, "Please enter your email address.")
    .email("Please enter a valid email address."),

  phone: z
    .string()
    .trim()
    .min(7, "Please enter a contact number.")
    .max(24, "Please enter a valid contact number.")
    .regex(/^[\d\s+()-]+$/, "Please enter a valid contact number."),

  projectLocation: z
    .string()
    .trim()
    .min(2, "Please tell us where the building is.")
    .max(160, "Please shorten the location."),

  serviceRequired: z
    .string()
    .refine(
      (value) => serviceNames.includes(value) || value === "Other / not sure",
      "Please choose a service.",
    ),

  projectDetails: z
    .string()
    .trim()
    .min(20, "Please give us a little more detail about the works required.")
    .max(4000, "Please shorten your message."),

  preferredContact: z.enum(contactMethods),

  /**
   * Honeypot. Never rendered to real users, never labelled, and hidden from
   * assistive technology. Any value here means a bot filled the form.
   */
  website: z.string().max(0, "Submission rejected.").optional(),
});

export type QuoteInput = z.infer<typeof quoteSchema>;

/** File validation runs separately — files do not travel as JSON. */
export function validateUpload(file: { size: number; type: string }) {
  if (file.size > MAX_UPLOAD_BYTES) {
    return { ok: false as const, error: "Each file must be 8MB or smaller." };
  }
  if (!ACCEPTED_UPLOAD_TYPES.includes(file.type as (typeof ACCEPTED_UPLOAD_TYPES)[number])) {
    return { ok: false as const, error: "Please attach images or a PDF." };
  }
  return { ok: true as const };
}
