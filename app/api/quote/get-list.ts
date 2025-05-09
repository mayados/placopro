import { db } from "@/lib/db";
import { QuoteStatusEnum } from "@prisma/client";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const { searchParams } = new URL(req.url);

        // Retrieve parameters
        const page = parseInt(searchParams.get("page") || "1", 10);
        const pageDraft = parseInt(searchParams.get("pageDraft") || "1", 10);
        const pageReadyToBeSent = parseInt(searchParams.get("pageReadyToBeSent") || "1", 10);
        const pageSent = parseInt(searchParams.get("pageSent") || "1", 10);
        const pageAccepted = parseInt(searchParams.get("pageAccepted") || "1", 10);
        const pageRefused = parseInt(searchParams.get("pageRefused") || "1", 10);
        const limit = parseInt(searchParams.get("limit") || "10", 10);

        const skip = (page - 1) * limit;
        const skipDraft = (pageDraft - 1) * limit;
        const skipReadyToBeSent = (pageReadyToBeSent - 1) * limit;
        const skipSent = (pageSent - 1) * limit;
        const skipAccepted = (pageAccepted - 1) * limit;
        const skipRefused = (pageRefused - 1) * limit;

        const quotes = await db.quote.findMany({
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
            orderBy: {
              issueDate: "desc",
            },
        });


          const draftQuotes = await db.quote.findMany({
            where: {
                status: QuoteStatusEnum.DRAFT
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
            skip: skipDraft,
            take: limit,
            orderBy: {
              issueDate: "desc",
            },
        })

          const readyToBeSentQuotes = await db.quote.findMany({
            where: {
                status: QuoteStatusEnum.READY
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
            skip: skipReadyToBeSent,
            take: limit,
            orderBy: {
              issueDate: "desc",
            },
        })

          const sentQuotes = await db.quote.findMany({
            where: {
                status: QuoteStatusEnum.SENT,
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
            skip: skipSent,
            take: limit,
            orderBy: {
              issueDate: "desc",
            },
        })

          const acceptedQuotes = await db.quote.findMany({
            where: {
                status: QuoteStatusEnum.ACCEPTED
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
            skip: skipAccepted,
            take: limit,
            orderBy: {
              issueDate: "desc",
            },
        })

          const refusedQuotes = await db.quote.findMany({
            where: {
                status: QuoteStatusEnum.REFUSED
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
            skip: skipRefused,
            take: limit,
            orderBy: {
              issueDate: "desc",
            },
        })


        //Counting number of recipes
        const totalQuotes: number = await db.quote.count();
        
        const totalDraftQuotes: number = await db.quote.count({ 
                where: { status: QuoteStatusEnum.DRAFT }
        });

        const totalReadyToBeSentQuotes: number = await db.quote.count({ 
            where: { status: QuoteStatusEnum.READY }
        });

        const totalSentQuotes: number = await db.quote.count({ 
            where: { status: QuoteStatusEnum.SENT }
        });

        const totalAcceptedQuotes: number = await db.quote.count({ 
            where: { status: QuoteStatusEnum.ACCEPTED }
        });

        const totalRefusedQuotes: number = await db.quote.count({ 
            where: { status: QuoteStatusEnum.REFUSED }
        });

        console.log("les quotes retrieved : "+quotes)
          
        return NextResponse.json({
            success: true,
            quotes: quotes,
            draftQuotes: draftQuotes,
            readyToBeSentQuotes: readyToBeSentQuotes,
            sentQuotes: sentQuotes,
            acceptedQuotes: acceptedQuotes,
            refusedQuotes: refusedQuotes,
            totalQuotes : totalQuotes,
            totalDraftQuotes : totalDraftQuotes,
            totalReadyToBeSentQuotes : totalReadyToBeSentQuotes,
            totalSentQuotes : totalSentQuotes,
            totalAcceptedQuotes : totalAcceptedQuotes,
            totalRefusedQuotes : totalRefusedQuotes,

        })

    } catch (error) {
        console.error("Erreur dans l'API GET /api/quotes :", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

}