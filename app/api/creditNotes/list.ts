import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { Prisma } from "@prisma/client";

// Pour typage propre de MongoDB native result
type MongoFindResult = { _id: string };

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageSettled = parseInt(searchParams.get("pageSettled") || "1", 10);
    const pageNotSettled = parseInt(searchParams.get("pageNotSettled") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search")?.trim() || "";

    // Skip
    const skip = (page - 1) * limit;
    const skipSettled = (pageSettled - 1) * limit;
    const skipNotSettled = (pageNotSettled - 1) * limit;

    // Prisma base filter
    const baseSearchFilter: Prisma.CreditNoteWhereInput = search
      ? {
          OR: [
            { number: { startsWith: search, mode: "insensitive" } },
            {
              bill: {
                number: { startsWith: search, mode: "insensitive" },
              },
            },
          ],
        }
      : {};

    // Recherche JSON via Mongo natif
    let creditNoteIdsFromBackup: string[] = [];

    if (search) {
      const mongoResult = await db.$runCommandRaw({
        find: "CreditNote",
        filter: {
          clientBackup: { $regex: search, $options: "i" },
        },
        projection: { _id: 1 },
      });

      const firstBatch = (mongoResult.cursor as { firstBatch?: MongoFindResult[] })?.firstBatch ?? [];
      creditNoteIdsFromBackup = firstBatch.map(doc => doc._id.toString());
    }

    // Filtre combiné Prisma + Mongo (_id in [...])
    const combinedSearchFilter: Prisma.CreditNoteWhereInput = search
      ? {
          OR: [
            ...(baseSearchFilter.OR ?? [baseSearchFilter]),
            { id: { in: creditNoteIdsFromBackup } },
          ],
        }
      : {};

    // Helper
    const getCreditNotesBySettlement = async (isSettled: boolean, skipValue: number) => {
      return db.creditNote.findMany({
        where: {
          isSettled,
          ...combinedSearchFilter,
        },
        select: {
          id: true,
          number: true,
          bill: true,
          issueDate: true,
          isSettled: true,
        },
        skip: skipValue,
        take: limit,
        orderBy: { issueDate: "desc" },
      });
    };

    const countBySettlement = async (isSettled: boolean) => {
      return db.creditNote.count({
        where: {
          isSettled,
          ...combinedSearchFilter,
        },
      });
    };

    // Tous
    const creditNotes = await db.creditNote.findMany({
      where: combinedSearchFilter,
      select: {
        id: true,
        number: true,
        bill: true,
        issueDate: true,
        isSettled: true,
      },
      skip,
      take: limit,
      orderBy: { issueDate: "desc" },
    });

    // Segments
    const [settledCreditNotes, totalSettledCreditNotes] = await Promise.all([
      getCreditNotesBySettlement(true, skipSettled),
      countBySettlement(true),
    ]);

    const [notSettledCreditNotes, totalNotSettledCreditNotes] = await Promise.all([
      getCreditNotesBySettlement(false, skipNotSettled),
      countBySettlement(false),
    ]);

    const totalCreditNotes = await db.creditNote.count({ where: combinedSearchFilter });

    return NextResponse.json({
      success: true,
      creditNotes,
      settledCreditNotes,
      notSettledCreditNotes,
      totalCreditNotes,
      totalSettledCreditNotes,
      totalNotSettledCreditNotes,
    });
  } catch (error) {
    console.error("Erreur dans l'API GET /api/creditNotes :", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
