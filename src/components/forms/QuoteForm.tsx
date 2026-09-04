"use client";

import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle, CheckCircle2, Paperclip, X } from "lucide-react";
import {
  quoteSchema,
  contactMethods,
  ACCEPTED_UPLOAD_TYPES,
  MAX_UPLOAD_BYTES,
  MAX_UPLOAD_FILES,
  type QuoteInput,
} from "@/lib/forms/quote-schema";
import { services } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/**
 * The quote enquiry form.
 *
 * Submits to /api/quote, which validates against the SAME Zod schema
 * used here and delivers through Resend.
 *
 * The success state is shown ONLY when the server confirms the provider
 * accepted the message. If email is not configured, or the provider
 * fails, the route returns an error and this form says so and points at
 * the phone number — it never reports a delivery that did not happen.
 *
 * Attachments are posted as multipart form data and forwarded straight to
 * the email as attachments. Nothing is stored: the enquiry files live in
 * BOVI's inbox and nowhere else.
 */

type Status = "idle" | "submitting" | "success" | "error";

const OTHER_SERVICE = "Other / not sure";

export function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [serverMessage, setServerMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const formId = useId();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitted },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: "onBlur",
    defaultValues: { preferredContact: "Either", website: "" },
  });

  // Move focus to the outcome so submitting always lands the user
  // somewhere meaningful and the message is announced. Done in an effect
  // rather than in the submit handler, which would read a ref during the
  // render pass that handleSubmit triggers.
  useEffect(() => {
    if (status === "success" || status === "error") {
      statusRef.current?.focus();
    }
  }, [status]);

  const addFiles = (incoming: FileList | null) => {
    if (!incoming) return;
    setFileError("");

    const next = [...files];
    for (const file of Array.from(incoming)) {
      if (next.length >= MAX_UPLOAD_FILES) {
        setFileError(`You can attach up to ${MAX_UPLOAD_FILES} files.`);
        break;
      }
      if (
        !ACCEPTED_UPLOAD_TYPES.includes(
          file.type as (typeof ACCEPTED_UPLOAD_TYPES)[number],
        )
      ) {
        setFileError(`“${file.name}” is not a supported file type.`);
        continue;
      }
      if (file.size > MAX_UPLOAD_BYTES) {
        setFileError(`“${file.name}” is larger than 8MB.`);
        continue;
      }
      if (next.some((f) => f.name === file.name && f.size === file.size)) {
        continue;
      }
      next.push(file);
    }

    setFiles(next);
    // Clearing lets the same file be re-picked after removal.
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (index: number) =>
    setFiles((current) => current.filter((_, i) => i !== index));

  const onSubmit = async (values: QuoteInput) => {
    setStatus("submitting");
    setServerMessage("");

    const payload = new FormData();
    for (const [key, value] of Object.entries(values)) {
      if (typeof value === "string") payload.append(key, value);
    }
    files.forEach((file) => payload.append("files", file));

    try {
      const response = await fetch("/api/quote", {
        method: "POST",
        body: payload,
      });
      const result = (await response.json()) as {
        ok?: boolean;
        message?: string;
      };

      if (response.ok && result.ok) {
        setStatus("success");
        setServerMessage(
          result.message ??
            "Thanks — your project details have been sent to BOVI Access.",
        );
        reset();
        setFiles([]);
      } else {
        setStatus("error");
        setServerMessage(
          result.message ??
            "We could not send that just now. Please call 07990 377780.",
        );
      }
    } catch {
      setStatus("error");
      setServerMessage(
        "We could not reach the server. Please check your connection, or call 07990 377780.",
      );
    }
  };

  const field = (name: keyof QuoteInput) => `${formId}-${name}`;
  const errorId = (name: keyof QuoteInput) => `${formId}-${name}-error`;

  const inputClass = (invalid: boolean) =>
    cn(
      "w-full rounded-sm border bg-pure px-4 py-3 text-body text-ink",
      "placeholder:text-moss/60 focus-visible:outline-none",
      invalid ? "border-[#B3261E]" : "border-hairline-light",
    );

  return (
    <form
      noValidate
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6"
    >
      {/* Honeypot. Never shown, never announced, never focusable. */}
      <div aria-hidden="true" className="hidden">
        <label htmlFor={field("website")}>Website</label>
        <input
          id={field("website")}
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("website")}
        />
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Name"
          required
          id={field("name")}
          errorId={errorId("name")}
          error={errors.name?.message}
        >
          <input
            id={field("name")}
            type="text"
            autoComplete="name"
            aria-required="true"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? errorId("name") : undefined}
            className={inputClass(Boolean(errors.name))}
            {...register("name")}
          />
        </Field>

        <Field
          label="Company"
          id={field("company")}
          errorId={errorId("company")}
          error={errors.company?.message}
        >
          <input
            id={field("company")}
            type="text"
            autoComplete="organization"
            aria-invalid={Boolean(errors.company)}
            aria-describedby={errors.company ? errorId("company") : undefined}
            className={inputClass(Boolean(errors.company))}
            {...register("company")}
          />
        </Field>

        <Field
          label="Email"
          required
          id={field("email")}
          errorId={errorId("email")}
          error={errors.email?.message}
        >
          <input
            id={field("email")}
            type="email"
            inputMode="email"
            autoComplete="email"
            aria-required="true"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? errorId("email") : undefined}
            className={inputClass(Boolean(errors.email))}
            {...register("email")}
          />
        </Field>

        <Field
          label="Phone"
          required
          id={field("phone")}
          errorId={errorId("phone")}
          error={errors.phone?.message}
        >
          <input
            id={field("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            aria-required="true"
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? errorId("phone") : undefined}
            className={inputClass(Boolean(errors.phone))}
            {...register("phone")}
          />
        </Field>
      </div>

      <Field
        label="Project location"
        required
        hint="Building address or postcode."
        id={field("projectLocation")}
        errorId={errorId("projectLocation")}
        error={errors.projectLocation?.message}
      >
        <input
          id={field("projectLocation")}
          type="text"
          autoComplete="address-level2"
          aria-required="true"
          aria-invalid={Boolean(errors.projectLocation)}
          aria-describedby={
            errors.projectLocation ? errorId("projectLocation") : undefined
          }
          className={inputClass(Boolean(errors.projectLocation))}
          {...register("projectLocation")}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Service required"
          required
          id={field("serviceRequired")}
          errorId={errorId("serviceRequired")}
          error={errors.serviceRequired?.message}
        >
          <select
            id={field("serviceRequired")}
            defaultValue=""
            aria-required="true"
            aria-invalid={Boolean(errors.serviceRequired)}
            aria-describedby={
              errors.serviceRequired ? errorId("serviceRequired") : undefined
            }
            className={inputClass(Boolean(errors.serviceRequired))}
            {...register("serviceRequired")}
          >
            <option value="" disabled>
              Select a service
            </option>
            {services.map((service) => (
              <option key={service.slug} value={service.name}>
                {service.name}
              </option>
            ))}
            <option value={OTHER_SERVICE}>{OTHER_SERVICE}</option>
          </select>
        </Field>

        <fieldset>
          <legend className="eyebrow text-moss">Preferred contact</legend>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {contactMethods.map((method) => (
              <label
                key={method}
                className="inline-flex min-h-11 items-center gap-2.5 text-body"
              >
                <input
                  type="radio"
                  value={method}
                  className="size-4 accent-[#2A7D25]"
                  {...register("preferredContact")}
                />
                {method}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <Field
        label="Project details"
        required
        hint="What needs doing, which elevation, and how high."
        id={field("projectDetails")}
        errorId={errorId("projectDetails")}
        error={errors.projectDetails?.message}
      >
        <textarea
          id={field("projectDetails")}
          rows={6}
          aria-required="true"
          aria-invalid={Boolean(errors.projectDetails)}
          aria-describedby={
            errors.projectDetails ? errorId("projectDetails") : undefined
          }
          className={cn(inputClass(Boolean(errors.projectDetails)), "resize-y")}
          {...register("projectDetails")}
        />
      </Field>

      {/* ---------------- Attachments ---------------- */}
      <div className="flex flex-col gap-3">
        <label htmlFor={field("name") + "-files"} className="eyebrow text-moss">
          Photographs
          <span className="ml-1 normal-case tracking-normal opacity-70">
            (optional)
          </span>
        </label>
        <p className="text-small text-moss">
          A photograph from the ground usually tells us more than a paragraph.
          JPG, PNG, HEIC, WebP or PDF — up to {MAX_UPLOAD_FILES} files, 8MB
          each.
        </p>

        {/* A real file input, visually restyled but never hidden from the
            keyboard: the label is bound by id, so it is focusable and
            operable exactly as a native control. */}
        <input
          ref={fileInputRef}
          id={field("name") + "-files"}
          type="file"
          multiple
          accept={ACCEPTED_UPLOAD_TYPES.join(",")}
          onChange={(event) => addFiles(event.target.files)}
          aria-describedby={fileError ? field("name") + "-files-error" : undefined}
          className={cn(
            "w-full rounded-sm border border-hairline-light bg-pure px-4 py-3 text-body text-ink",
            "file:mr-4 file:min-h-9 file:cursor-pointer file:rounded-sm file:border-0",
            "file:bg-ink file:px-4 file:py-2 file:font-display file:text-[13px]",
            "file:font-semibold file:tracking-[0.08em] file:text-bone file:uppercase",
          )}
        />

        {fileError ? (
          <p
            id={field("name") + "-files-error"}
            role="alert"
            className="text-small text-[#B3261E]"
          >
            {fileError}
          </p>
        ) : null}

        {files.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {files.map((file, index) => (
              <li
                key={`${file.name}-${file.size}`}
                className="flex items-center justify-between gap-4 rounded-sm border border-hairline-light bg-pure px-4 py-2"
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Paperclip
                    aria-hidden="true"
                    className="size-4 shrink-0 text-moss"
                  />
                  <span className="truncate text-small text-ink">
                    {file.name}
                  </span>
                  <span className="shrink-0 text-small text-moss">
                    {(file.size / 1024 / 1024).toFixed(1)}MB
                  </span>
                </span>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="inline-flex size-11 shrink-0 items-center justify-center rounded-sm text-moss transition-colors hover:text-ink"
                >
                  <X aria-hidden="true" className="size-4" />
                  <span className="sr-only-focusable">Remove {file.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-2 flex flex-col gap-5">
        <Button type="submit" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </Button>

        {/* Outcome. role="status" for success, role="alert" for failure,
            and focusable so submitting always lands the user somewhere
            meaningful. */}
        <div
          ref={statusRef}
          tabIndex={-1}
          role={status === "error" ? "alert" : "status"}
          aria-live="polite"
          className="outline-none"
        >
          {status === "success" ? (
            <div className="flex gap-3 rounded-sm border border-green/30 bg-pure p-5">
              <CheckCircle2
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-green"
              />
              <div className="text-body text-ink">
                <p className="font-semibold">{serverMessage}</p>
                <p className="mt-2 text-moss">
                  If it is urgent, call{" "}
                  <a
                    href="tel:+447990377780"
                    className="text-ink underline underline-offset-4 hover:text-green"
                  >
                    07990 377780
                  </a>
                  .
                </p>
              </div>
            </div>
          ) : null}

          {status === "error" ? (
            <div className="flex gap-3 rounded-sm border border-[#B3261E]/40 bg-pure p-5">
              <AlertCircle
                aria-hidden="true"
                className="mt-0.5 size-5 shrink-0 text-[#B3261E]"
              />
              <div className="text-body text-ink">
                <p className="font-semibold">Your enquiry was not sent.</p>
                <p className="mt-2 text-moss">{serverMessage}</p>
              </div>
            </div>
          ) : null}
        </div>

        {isSubmitted && Object.keys(errors).length > 0 ? (
          <p role="alert" className="text-small text-[#B3261E]">
            Please check the highlighted fields above.
          </p>
        ) : null}
      </div>
    </form>
  );
}

/* ------------------------------------------------------------------ */

type FieldProps = {
  label: string;
  id: string;
  errorId: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
};

/**
 * Every control gets a real <label>, a visible required marker, and an
 * error message wired by aria-describedby — not a placeholder pretending
 * to be a label.
 */
function Field({
  label,
  id,
  errorId,
  error,
  hint,
  required,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="eyebrow text-moss">
        {label}
        {required ? (
          <span aria-hidden="true" className="ml-1 text-green">
            *
          </span>
        ) : (
          <span className="ml-1 normal-case tracking-normal opacity-70">
            (optional)
          </span>
        )}
      </label>

      {hint ? <p className="text-small text-moss">{hint}</p> : null}

      {children}

      {error ? (
        <p id={errorId} className="text-small text-[#B3261E]">
          {error}
        </p>
      ) : null}
    </div>
  );
}
