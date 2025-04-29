import { NextRequest, NextResponse } from "next/server";
import { PUT as updateDraftQuote } from "@/app/api/quote/[quoteSlug]/update-draft";
import { PUT as updateClassicQuote } from "@/app/api/quote/[quoteSlug]/update-classic";
import { GET as getQuote } from "@/app/api/quote/[quoteSlug]/get";
// import { DELETE as deleteQuote } from "@/app/api/quote/[quoteSlug]/delete";


export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const quoteSlug = pathname.split("/").pop(); 

  if (!quoteSlug) {
    return NextResponse.json({ error: "quoteSlug is required" }, { status: 400 });
  }

  return getQuote(req, { params: { quoteSlug } });
}

export async function PUT(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const quoteSlug = pathname.split("/").pop();

  if (!quoteSlug) {
    return NextResponse.json({ error: "quoteSlug is required" }, { status: 400 });
  }

  // Decide which type of PUT to call
  if (req.headers.get("X-Update-Type") === "draft") {
    return updateDraftQuote(req);
  }
  // Classic update by default
  return updateClassicQuote(req);
}