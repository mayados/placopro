import { db } from "@/lib/db"; // Prisma client
import { Prisma, QuoteStatusEnum } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);

    // Pagination params
    const page = parseInt(searchParams.get("page") || "1", 10);
    const pageDraft = parseInt(searchParams.get("pageDraft") || "1", 10);
    const pageReadyToBeSent = parseInt(searchParams.get("pageReadyToBeSent") || "1", 10);
    const pageSent = parseInt(searchParams.get("pageSent") || "1", 10);
    const pageAccepted = parseInt(searchParams.get("pageAccepted") || "1", 10);
    const pageRefused = parseInt(searchParams.get("pageRefused") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    // Search term
    const search = searchParams.get("search")?.trim() || "";

    // Skip calculations
    const skip = (page - 1) * limit;
    const skipDraft = (pageDraft - 1) * limit;
    const skipReadyToBeSent = (pageReadyToBeSent - 1) * limit;
    const skipSent = (pageSent - 1) * limit;
    const skipAccepted = (pageAccepted - 1) * limit;
    const skipRefused = (pageRefused - 1) * limit;

    //  Construire le filtre Prisma (sans clientBackup, car JSON et pas insensible possible)
    const baseSearchFilter: Prisma.QuoteWhereInput = search
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

    // Si on a une recherche, on va chercher aussi les IDs de quotes qui match côté clientBackup avec MongoDB natif
    const quotesWithBackupIds: string[] = [];

    if (search) {
      // native mongodb request with insensible $regex
      const mongoFilter = {
        clientBackup: { $regex: search, $options: "i" },
      };

      // RunCommandRaw to find corresponding documents (onlys IDs)
      const mongoResult = await db.$runCommandRaw({
        find: "Quote",
        filter: mongoFilter,
        projection: { _id: 1 },
      });

      // mongoResult.cursor.firstBatch est un tableau des docs Mongo
            // Extraire les IDs Mongo (_id) du résultat
      type MongoFindResult = { _id: string };

const firstBatch = (mongoResult.cursor as { firstBatch?: MongoFindResult[] })?.firstBatch ?? [];
    firstBatch.map(doc => doc._id.toString());
  // const firstBatch = (mongoResult.cursor as { firstBatch?: any[] } | undefined)?.firstBatch ?? [];
// const quotesWithBackupIds = firstBatch.map(doc => doc._id.toString());
    }

    // Combiner avec filtre Prisma via OR sur les IDs 
    // Si on a des résultats côté clientBackup, on ajoute à l'OR le filtre id in [...ids]
const combinedSearchFilter: Prisma.QuoteWhereInput = search
  ? {
      OR: [
        ...(baseSearchFilter.OR ?? [baseSearchFilter]),
        { id: { in: quotesWithBackupIds } },
      ],
    }
  : {};

    // function for pagination and status
    const getQuotesByStatus = async (status: QuoteStatusEnum, skipValue: number) => {
      return db.quote.findMany({
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
          validityEndDate: true,
          slug: true,
        },
        skip: skipValue,
        take: limit,
        orderBy: { issueDate: "desc" },
      });
    };

    const countQuotesByStatus = async (status: QuoteStatusEnum) => {
      return db.quote.count({
        where: {
          status,
          ...combinedSearchFilter,
        },
      });
    };

    // Retrieve all the quotes
    const quotes = await db.quote.findMany({
      where: combinedSearchFilter,
      select: {
        id: true,
        number: true,
        client: true,
        status: true,
        workSite: true,
        workStartDate: true,
        validityEndDate: true,
        slug: true,
      },
      skip,
      take: limit,
      orderBy: { issueDate: "desc" },
    });

    // Counts
    const totalQuotes = await db.quote.count({ where: combinedSearchFilter });

    // Statuts
    const [draftQuotes, totalDraftQuotes] = await Promise.all([
      getQuotesByStatus(QuoteStatusEnum.DRAFT, skipDraft),
      countQuotesByStatus(QuoteStatusEnum.DRAFT),
    ]);
    const [readyToBeSentQuotes, totalReadyToBeSentQuotes] = await Promise.all([
      getQuotesByStatus(QuoteStatusEnum.READY, skipReadyToBeSent),
      countQuotesByStatus(QuoteStatusEnum.READY),
    ]);
    const [sentQuotes, totalSentQuotes] = await Promise.all([
      getQuotesByStatus(QuoteStatusEnum.SENT, skipSent),
      countQuotesByStatus(QuoteStatusEnum.SENT),
    ]);
    const [acceptedQuotes, totalAcceptedQuotes] = await Promise.all([
      getQuotesByStatus(QuoteStatusEnum.ACCEPTED, skipAccepted),
      countQuotesByStatus(QuoteStatusEnum.ACCEPTED),
    ]);
    const [refusedQuotes, totalRefusedQuotes] = await Promise.all([
      getQuotesByStatus(QuoteStatusEnum.REFUSED, skipRefused),
      countQuotesByStatus(QuoteStatusEnum.REFUSED),
    ]);

    return NextResponse.json({
      success: true,
      quotes,
      draftQuotes,
      readyToBeSentQuotes,
      sentQuotes,
      acceptedQuotes,
      refusedQuotes,
      totalQuotes,
      totalDraftQuotes,
      totalReadyToBeSentQuotes,
      totalSentQuotes,
      totalAcceptedQuotes,
      totalRefusedQuotes,
    });
  } catch (error) {
    console.error("Erreur dans l'API GET /api/quotes :", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
