import { NextRequest, NextResponse } from "next/server";
import { PUT as updateCreditNote } from "@/app/api/creditNotes/[creditNoteNumber]/update";
import { GET as getCreditNote } from "@/app/api/creditNotes/[creditNoteNumber]/get";
import { DELETE as deleteCreditNote } from "@/app/api/creditNotes/[creditNoteNumber]/delete";

export async function GET(req: NextRequest, { params }: { params: { creditNoteNumber: string } }) {
  return getCreditNote(req, { params });
}

export async function PUT(req: NextRequest, { params }: { params: { creditNoteNumber: string } }) {

  return updateCreditNote(req);
}

export async function DELETE(req: NextRequest, { params }: { params: { creditNoteNumber: string } }) {
    return deleteCreditNote(req, { params });
  }