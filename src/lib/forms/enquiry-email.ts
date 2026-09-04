import "server-only";
import type { QuoteInput } from "@/lib/forms/quote-schema";

/**
 * The enquiry email BOVI receives.
 *
 * Plain, table-based HTML on purpose. This is an internal notification
 * that has to be readable in Outlook, Gmail and on a phone — not a
 * marketing template. Keeping it dependency-free also means no React
 * Email build step in the serverless function.
 *
 * Everything the visitor typed is escaped before it reaches the markup.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function enquirySubject(enquiry: QuoteInput): string {
  return `BOVI Website Enquiry — ${enquiry.serviceRequired}`;
}

export function renderEnquiryEmail(
  enquiry: QuoteInput,
  attachmentNames: string[],
): string {
  const rows: [string, string | undefined][] = [
    ["Name", enquiry.name],
    ["Company", enquiry.company],
    ["Email", enquiry.email],
    ["Phone", enquiry.phone],
    ["Project location", enquiry.projectLocation],
    ["Service required", enquiry.serviceRequired],
    ["Preferred contact", enquiry.preferredContact],
  ];

  const cells = rows
    // Company is optional; an empty row is noise.
    .filter(([, value]) => Boolean(value?.trim()))
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:8px 16px 8px 0;color:#4B534C;font-size:13px;white-space:nowrap;vertical-align:top;">${escapeHtml(label)}</td>
          <td style="padding:8px 0;color:#101211;font-size:15px;">${escapeHtml(value as string)}</td>
        </tr>`,
    )
    .join("");

  const attachments = attachmentNames.length
    ? `<p style="margin:24px 0 0;color:#4B534C;font-size:13px;">
         Attached: ${attachmentNames.map(escapeHtml).join(", ")}
       </p>`
    : "";

  return `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;background:#F5F4F0;font-family:Helvetica,Arial,sans-serif;">
    <div style="max-width:640px;margin:0 auto;background:#ffffff;padding:32px;">
      <p style="margin:0;color:#2A7D25;font-size:12px;letter-spacing:0.14em;text-transform:uppercase;">
        BOVI Access — website enquiry
      </p>
      <h1 style="margin:16px 0 24px;color:#101211;font-size:22px;line-height:1.25;">
        ${escapeHtml(enquiry.serviceRequired)}
      </h1>

      <table style="width:100%;border-collapse:collapse;border-top:1px solid #E2E1DC;">
        ${cells}
      </table>

      <h2 style="margin:32px 0 8px;color:#101211;font-size:15px;">Project details</h2>
      <p style="margin:0;color:#101211;font-size:15px;line-height:1.6;white-space:pre-wrap;">${escapeHtml(enquiry.projectDetails)}</p>

      ${attachments}

      <p style="margin:32px 0 0;padding-top:16px;border-top:1px solid #E2E1DC;color:#4B534C;font-size:12px;">
        Sent from the enquiry form on boviaccess.co.uk. Reply directly to this
        email to reach the sender.
      </p>
    </div>
  </body>
</html>`;
}
