import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { BillStatusEnum, ClientOrProspectEnum, QuoteStatusEnum} from "@prisma/client";



export async function GET() {


    // currentUser() is a founction from Clerk which allows to retrieve the current User
    const user = await currentUser()

    try{

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }


        const toDos: number = await db.toDo.count({ 
            where: {
                authorClerkId: user.id,
                isArchived: false,
                isChecked: false,
                assignedToClerkId: null,
            },
        });

        const bills: number = await db.bill.count({ 
            where: {
                status: BillStatusEnum.DRAFT,
            },
        });

        const quotes: number = await db.quote.count({ 
            where: {
                status: QuoteStatusEnum.DRAFT,
            },
        });

        const quotesRealized: number = await db.quote.count({ 
            where: {
                author: user.id
            },
        });

        const clients: number = await db.client.count({ 
            where: {
                status: ClientOrProspectEnum.CLIENT,
            },
        });

        const billsRealized: number = await db.bill.count({ 
            where: {
                                author: user.id

            },
        });


          

        return NextResponse.json({
            toDos: toDos,
            bills: bills,
            quotes: quotes,
            quotesRealized: quotesRealized,
            clients: clients,
            billsRealized: billsRealized
        })

    } catch (error) {
        console.error("Erreur lors de la récupération des to do :", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

}