import { db } from "@/lib/db";
import { BillStatusEnum, Prisma } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageDraft = parseInt(searchParams.get("pageDraft") || "1", 10);
    const pageReadyToBeSent = parseInt(searchParams.get("pageReadyToBeSent") || "1", 10);
    const pageSent = parseInt(searchParams.get("pageSent") || "1", 10);
    const pageCanceled = parseInt(searchParams.get("pageCanceled") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search")?.trim() || "";

    const skip = (page - 1) * limit;
    const skipDraft = (pageDraft - 1) * limit;
    const skipReadyToBeSent = (pageReadyToBeSent - 1) * limit;
    const skipSent = (pageSent - 1) * limit;
    const skipCanceled = (pageCanceled - 1) * limit;

    // Prisma base search
    const baseSearchFilter: Prisma.BillWhereInput = search
      ? {
          OR: [
            { number: { startsWith: search, mode: "insensitive" } },
            {
              client: {
                OR: [
                  { firstName: { startsWith: search, mode: "insensitive" } },
                  { name: { startsWith: search, mode: "insensitive" } },
                ],
              },
            },
          ],
        }
      : {};

    // Recherche clientBackup via Mongo natif (champ JSON)
    const backupMatchIds: string[] = [];
    if (search) {
      const mongoResult = await db.$runCommandRaw({
        find: "Bill",
        filter: {
          clientBackup: { $regex: search, $options: "i" },
        },
        projection: { _id: 1 },
      });

      // Extraire les IDs Mongo (_id) du résultat
      type MongoFindResult = { _id: string };

const firstBatch = (mongoResult.cursor as { firstBatch?: MongoFindResult[] })?.firstBatch ?? [];
    firstBatch.map(doc => doc._id.toString());
    }

    // Combine Prisma + JSON (clientBackup) search
    const combinedSearchFilter: Prisma.BillWhereInput = search
      ? {
          OR: [
            ...(baseSearchFilter.OR ?? [baseSearchFilter]),
            ...(backupMatchIds.length > 0 ? [{ id: { in: backupMatchIds } }] : []),
          ],
        }
      : {};

    // Helper: récupération des factures par statut
    const getBillsByStatus = async (status: BillStatusEnum, skipValue: number) => {
      return db.bill.findMany({
        where: {
          status,
          ...combinedSearchFilter,
        },
        select: {
          id: true,
          number: true,
          client: true,
          status: true,
          workSite: true,
          workStartDate: true,
          dueDate: true,
          issueDate: true,
          slug: true,
        },
        skip: skipValue,
        take: limit,
        orderBy: { issueDate: "desc" },
      });
    };

    const countBillsByStatus = async (status: BillStatusEnum) => {
      return db.bill.count({
        where: {
          status,
          ...combinedSearchFilter,
        },
      });
    };

    // Get all bills
    const bills = await db.bill.findMany({
      where: combinedSearchFilter,
      select: {
        id: true,
        number: true,
        client: true,
        status: true,
        workSite: true,
        workStartDate: true,
        dueDate: true,
        issueDate: true,
        slug: true,
      },
      skip,
      take: limit,
      orderBy: { issueDate: "desc" },
    });

    const totalBills = await db.bill.count({ where: combinedSearchFilter });

    // Par statut
    const [draftBills, totalDraftBills] = await Promise.all([
      getBillsByStatus(BillStatusEnum.DRAFT, skipDraft),
      countBillsByStatus(BillStatusEnum.DRAFT),
    ]);
    const [readyToBeSentBills, totalReadyToBeSentBills] = await Promise.all([
      getBillsByStatus(BillStatusEnum.READY, skipReadyToBeSent),
      countBillsByStatus(BillStatusEnum.READY),
    ]);
    const [sentBills, totalSentBills] = await Promise.all([
      getBillsByStatus(BillStatusEnum.SENT, skipSent),
      countBillsByStatus(BillStatusEnum.SENT),
    ]);
    const [canceledBills, totalCanceledBills] = await Promise.all([
      getBillsByStatus(BillStatusEnum.CANCELED, skipCanceled),
      countBillsByStatus(BillStatusEnum.CANCELED),
    ]);

    return NextResponse.json({
      success: true,
      bills,
      draftBills,
      readyToBeSentBills,
      sentBills,
      canceledBills,
      totalBills,
      totalDraftBills,
      totalReadyToBeSentBills,
      totalSentBills,
      totalCanceledBills,
    });
  } catch (error) {
    console.error("Erreur dans l'API GET /api/bills :", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
