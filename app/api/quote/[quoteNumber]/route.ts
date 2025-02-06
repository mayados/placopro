import { NextRequest, NextResponse } from "next/server";
import { PUT as updateDraftQuote } from "@/app/api/quote/[quoteNumber]/update-draft";
import { PUT as updateClassicQuote } from "@/app/api/quote/[quoteNumber]/update-classic";
import { GET as getQuote } from "@/app/api/quote/[quoteNumber]/get";
import { DELETE as deleteQuote } from "@/app/api/quote/[quoteNumber]/delete";

export async function GET(req: NextRequest, { params }: { params: { quoteNumber: string } }) {
  return getQuote(req, { params });
}

export async function PUT(req: NextRequest, { params }: { params: { quoteNumber: string } }) {
  // Decide which type of PUT to call
  if (req.headers.get('X-Update-Type') === 'draft') {
    // Update draft
    return updateDraftQuote(req);
  }
  
  // Classic update by default
  return updateClassicQuote(req);
}
