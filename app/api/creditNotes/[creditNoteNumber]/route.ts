import { NextRequest, NextResponse } from "next/server";
import { PUT as updateCreditNote } from "@/app/api/creditNotes/[creditNoteNumber]/update";
import { GET as getCreditNote } from "@/app/api/creditNotes/[creditNoteNumber]/get";
import { DELETE as deleteCreditNote } from "@/app/api/creditNotes/[creditNoteNumber]/delete";

export async function GET(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const creditNoteNumber = pathname.split("/").pop(); 

  if (!creditNoteNumber) {
    return NextResponse.json({ error: "creditNoteNumber is required" }, { status: 400 });
  }

  return getCreditNote(req, { params: { creditNoteNumber } });
}

export async function PUT(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const creditNoteNumber = pathname.split("/").pop();

  if (!creditNoteNumber) {
    return NextResponse.json({ error: "creditNoteNumber is required" }, { status: 400 });
  }

  return updateCreditNote(req);
}

export async function DELETE(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const creditNoteNumber = pathname.split("/").pop(); 
  
  if (!creditNoteNumber) {
    return NextResponse.json({ error: "creditNoteNumber is required" }, { status: 400 });
  }
  
  return deleteCreditNote(req, { params: { creditNoteNumber } });
}