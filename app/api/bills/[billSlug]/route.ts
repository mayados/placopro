import { NextRequest, NextResponse } from "next/server";
import { PUT as updateDraftBill } from "@/app/api/bills/[billSlug]/update-draft";
import { PUT as updateDepositDraftBill } from "@/app/api/bills/[billSlug]/update-draft-deposit";
import { PUT as updateClassicBill } from "@/app/api/bills/[billSlug]/update-classic";
import { GET as getBill } from "@/app/api/bills/[billSlug]/get";
// import { DELETE as deleteQuote } from "@/app/api/quote/[quoteNumber]/delete";

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const billSlug = pathname.split("/").pop(); // Récupère billSlug depuis l'URL

  if (!billSlug) {
    return NextResponse.json({ error: "billSlug is required" }, { status: 400 });
  }

  return getBill(req, { params: { billSlug } });
}

// export async function PUT(req: NextRequest, { params }: { params: { quoteNumber: string } }) {
//   // Decide which type of PUT to call
//   if (req.headers.get('X-Update-Type') === 'draft') {
//     // Update draft (=all the fields)
//     return updateDraftBill(req);
//   }

//   if (req.headers.get('X-Update-Type') === 'draft-deposit') {
//     // Update draft (=all the fields)
//     return updateDepositDraftBill(req);
//   }
  
//   // Classic update by default
//   return updateClassicBill(req);
// }

export async function PUT(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const billSlug = pathname.split("/").pop();

  if (!billSlug) {
    return NextResponse.json({ error: "billSlug is required" }, { status: 400 });
  }

  // Vérifie le header et route vers la bonne fonction
  if (req.headers.get("X-Update-Type") === "draft") {
    return updateDraftBill(req);
  }

  if (req.headers.get("X-Update-Type") === "draft-deposit") {
    return updateDepositDraftBill(req);
  }

  return updateClassicBill(req);
}
