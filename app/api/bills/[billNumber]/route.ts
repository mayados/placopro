import { NextRequest, NextResponse } from "next/server";
import { PUT as updateDraftBill } from "@/app/api/bills/[billNumber]/update-draft";
import { PUT as updateDepositDraftBill } from "@/app/api/bills/[billNumber]/update-draft-deposit";
import { PUT as updateClassicBill } from "@/app/api/bills/[billNumber]/update-classic";
import { GET as getBill } from "@/app/api/bills/[billNumber]/get";
import { DELETE as deleteQuote } from "@/app/api/quote/[quoteNumber]/delete";

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const billNumber = pathname.split("/").pop(); // Récupère billNumber depuis l'URL

  if (!billNumber) {
    return NextResponse.json({ error: "billNumber is required" }, { status: 400 });
  }

  return getBill(req, { params: { billNumber } });
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
  const quoteNumber = pathname.split("/").pop();

  if (!quoteNumber) {
    return NextResponse.json({ error: "billNumber is required" }, { status: 400 });
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
