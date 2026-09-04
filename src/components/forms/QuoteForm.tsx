"use client";

import { useId, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import {
  quoteSchema,
  contactMethods,
  type QuoteInput,
} from "@/lib/forms/quote-schema";
import { services } from "@/lib/config/site";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils/cn";

/**
 * The quote enquiry form.
 *
 * ---------------------------------------------------------------------
 * PHASE 3 SCOPE: the complete, accessible, validating front end.
 * PHASE 4 wires the server: /api/quote, Resend delivery, rate limiting
 * and file upload.
 *
 * SUBMISSION IS DELIBERATELY NOT WIRED, AND THE FORM SAYS SO.
 *
 * Showing a success message for a submission that goes nowhere would be
 * worse than having no form: a property manager would believe BOVI had
 * their enquiry. So the submit handler sets an explicit "not yet
 * connected" notice that points at the phone number and email address,
 * both of which work today. There is no fake success state anywhere in
 * this component.
 * ---------------------------------------------------------------------
 *
 * Validation runs against src/lib/forms/quote-schema.ts — the same schema
 * the Phase 4 route handler will parse against, so the client can never
 * accept something the server would reject.
 */

type Status = "idle" | "submitting" | "unavailable";

const OTHER_SERVICE = "Other / not sure";

export function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");
  const formId = useId();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitted },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    mode: "onBlur",
    defaultValues: { preferredContact: "Either", website: "" },
  });

  const onSubmit = async () => {
    setStatus("submitting");
    // Phase 4 replaces this with a POST to the quote route handler.
    setStatus("unavailable");
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

      {/*
        No file input is rendered. The upload field only becomes honest
        once Phase 4 can actually receive and store the file — an input
        that appears to accept photographs and silently discards them is
        worse than not offering it. The schema and MIME/size validation
        are already written in src/lib/forms/quote-schema.ts.
      */}

      <div className="mt-2 flex flex-col gap-5">
        <Button type="submit" size="lg" disabled={status === "submitting"}>
          {status === "submitting" ? "Sending…" : "Send enquiry"}
        </Button>

        {status === "unavailable" ? (
          <div
            role="alert"
            className="flex gap-3 rounded-sm border border-hairline-light bg-pure p-5"
          >
            <AlertCircle
              aria-hidden="true"
              className="mt-0.5 size-5 shrink-0 text-green"
            />
            <div className="text-body text-ink">
              <p className="font-semibold">
                Online sending is not switched on yet.
              </p>
              <p className="mt-2 text-moss">
                Your details have not been sent. Please call{" "}
                <a
                  href="tel:+447990377780"
                  className="text-ink underline underline-offset-4 hover:text-green"
                >
                  07990 377780
                </a>{" "}
                or email{" "}
                <a
                  href="mailto:info@boviaccess.co.uk"
                  className="text-ink underline underline-offset-4 hover:text-green"
                >
                  info@boviaccess.co.uk
                </a>{" "}
                and we will pick it up straight away.
              </p>
            </div>
          </div>
        ) : null}

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
