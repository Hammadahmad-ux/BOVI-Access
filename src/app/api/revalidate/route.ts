import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { isValidSignature, SIGNATURE_HEADER_NAME } from "@sanity/webhook";

/**
 * Sanity publish webhook.
 *
 * This is what makes the CMS promise real: when Renan hits Publish, the
 * live site updates within seconds instead of waiting for the hourly
 * revalidate or a developer redeploy.
 *
 * The request is signature-verified. Without SANITY_REVALIDATE_SECRET the
 * endpoint refuses everything — an unauthenticated cache-purge endpoint
 * is a free denial-of-service lever, so failing closed is correct.
 *
 * Setup is documented in DEPLOYMENT.md § Revalidation.
 */
export const runtime = "nodejs";

export async function POST(request: Request) {
  const secret = process.env.SANITY_REVALIDATE_SECRET;
  if (!secret) {
    return NextResponse.json(
      { ok: false, message: "Revalidation is not configured." },
      { status: 501 },
    );
  }

  const signature = request.headers.get(SIGNATURE_HEADER_NAME);
  const body = await request.text();

  if (!signature || !(await isValidSignature(body, signature, secret))) {
    return NextResponse.json(
      { ok: false, message: "Invalid signature." },
      { status: 401 },
    );
  }

  let payload: { _type?: string };
  try {
    payload = JSON.parse(body) as { _type?: string };
  } catch {
    return NextResponse.json(
      { ok: false, message: "Malformed payload." },
      { status: 400 },
    );
  }

  const type = payload._type;
  const known = ["service", "project", "homepage", "siteSettings"];

  if (!type || !known.includes(type)) {
    return NextResponse.json({ ok: true, revalidated: [] });
  }

  // A project or service edit can change the Homepage too (featured
  // project, service index), so those are refreshed alongside.
  const tags =
    type === "project" || type === "service" ? [type, "homepage"] : [type];

  // Next 16 requires an explicit cache profile. "max" purges every
  // cached entry carrying the tag, which is what a publish means.
  tags.forEach((tag) => revalidateTag(tag, "max"));

  return NextResponse.json({ ok: true, revalidated: tags });
}
