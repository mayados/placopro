import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'


// Asynchrone : waits for a promise
export async function POST(req: NextRequest) {
    const data = await req.json();
    const { 
            task,
            workSiteId,
            userId,
            startDate,
            startTime,
            endDate,
            endTime
        } = data;
        // currentUser() is a founction from Clerk which allows to retrieve the current User
        const user = await currentUser()


    try {
        
        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        // We create the planning thanks to te datas retrieved
        const planning = await db.planning.create({
            data: {
                task: task,
                startDate: startDate,
                startTime: startTime,
                endDate: endDate,
                endTime: endTime,
                workSiteId: workSiteId,
                clerkUserId: userId
            },
        });


        console.log("Planning créé avec succès.");
        // Toujours retourner la réponse après la création
        return NextResponse.json({ success: true, data: planning });


    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error
        }, { status: 500 });
    }
}
