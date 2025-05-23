import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { BillStatusEnum, ClientOrProspectEnum, QuoteStatusEnum, WorkSiteStatusEnum } from "@prisma/client";
import { clerkClient} from "@clerk/express";



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

        const workSites: number = await db.workSite.count({ 
            where: {
                status: WorkSiteStatusEnum.PROGRESS,
            },
        });

        const clients: number = await db.client.count({ 
            where: {
                status: ClientOrProspectEnum.CLIENT,
            },
        });

    const allUserResponse = await clerkClient.users.getUserList();
    const allUsers = allUserResponse.data;
    const employees = allUsers.map(
        (u: GetUserType) => u.publicMetadata?.role === "EMPLOYEE"
    );
    const countEmployees = employees.length;


          

        return NextResponse.json({
            toDos: toDos,
            bills: bills,
            quotes: quotes,
            workSites: workSites,
            clients: clients,
            employees: countEmployees
        })

    } catch (error) {
        console.error("Erreur lors de la récupération des to do :", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

}