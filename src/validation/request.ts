import { z } from "zod";
import { AREAS, CATEGORIES } from "@/src/domain/types";

export const requestFormSchema = z.object({
  customerName: z.string().trim().min(2, "Enter at least 2 characters.").max(60),
  phone: z.string().trim().regex(/^(?:\+91|91)?[6-9]\d{9}$/, "Enter a valid Indian mobile number."),
  area: z.enum(AREAS),
  category: z.enum(CATEGORIES),
  budgetLabel: z.string().min(1, "Choose a budget range."),
  notes: z.string().max(500, "Keep notes under 500 characters.").optional(),
  privacyConsent: z.literal(true, { message: "Privacy consent is required." }),
  whatsappConsent: z.literal(true, { message: "Status-update consent is required for this demo flow." }),
  photoConsent: z.literal(true, { message: "Photo-sharing consent is required to search showrooms." }),
});

export type RequestFormValues = z.infer<typeof requestFormSchema>;

export const budgetOptions = [
  { label: "Under ₹50,000", min: 0, max: 50_000 },
  { label: "₹50,000 – ₹1 lakh", min: 50_000, max: 100_000 },
  { label: "₹1 – ₹2 lakh", min: 100_000, max: 200_000 },
  { label: "₹2 – ₹5 lakh", min: 200_000, max: 500_000 },
  { label: "₹5 lakh+", min: 500_000, max: undefined },
];
