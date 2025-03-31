import { NextRequest, NextResponse } from "next/server";
import { PUT as updateDraftQuote } from "@/app/api/quote/[quoteNumber]/update-draft";
import { PUT as updateClassicQuote } from "@/app/api/quote/[quoteNumber]/update-classic";
import { GET as getQuote } from "@/app/api/quote/[quoteNumber]/get";
import { DELETE as deleteQuote } from "@/app/api/quote/[quoteNumber]/delete";


export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const quoteNumber = pathname.split("/").pop(); 

  if (!quoteNumber) {
    return NextResponse.json({ error: "quoteNumber is required" }, { status: 400 });
  }

  return getQuote(req, { params: { quoteNumber } });
}

export async function PUT(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const quoteNumber = pathname.split("/").pop();

  if (!quoteNumber) {
    return NextResponse.json({ error: "quoteNumber is required" }, { status: 400 });
  }

  // Decide which type of PUT to call
  if (req.headers.get("X-Update-Type") === "draft") {
    return updateDraftQuote(req);
  }
  // Classic update by default
  return updateClassicQuote(req);
}