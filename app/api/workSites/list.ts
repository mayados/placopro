import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {

    try{
        const workSites = await db.workSite.findMany({
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                city: true,
                beginsThe: true
              },
        });


          const commingWorkSites = await db.workSite.findMany({
            where: {
                status: {
                    contains: "A venir",
                    mode: 'insensitive',
                }
            },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                city: true,
                beginsThe: true
            },
        })

          const completedWorkSites = await db.workSite.findMany({
            where: {
                status: {
                    contains: "Terminé",
                    mode: 'insensitive',
                }
            },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                city: true,
                beginsThe: true
            },
        })

          const inProgressWorkSites = await db.workSite.findMany({
            where: {
                status: {
                    contains: "En cours",
                    mode: 'insensitive',
                }
            },
            select: {
                id: true,
                title: true,
                slug: true,
                status: true,
                city: true,
                beginsThe: true
            },
        })


        //Counting number of workSites
        const totalWorkSites: number = await db.workSite.count();
        
        const totalCommingWorkSites: number = await db.workSite.count({ 
                where: { status: { contains: "A venir", mode: 'insensitive' } }
        });

        const totalCompletedWorkSites: number = await db.workSite.count({ 
            where: { status: { contains: "Terminé", mode: 'insensitive' } }
        });

        const totalInProgressWorkSites: number = await db.workSite.count({ 
            where: { status: { contains: "En cours", mode: 'insensitive' } }
        });
          
        return NextResponse.json({
            success: true,
            workSites: workSites,
            commingWorkSites: commingWorkSites,
            completedWorkSites: completedWorkSites,
            inProgressWorkSites: inProgressWorkSites,
            totalWorkSites : totalWorkSites,
            totalCommingWorkSites : totalCommingWorkSites,
            totalCompletedWorkSites : totalCompletedWorkSites,
            totalInProgressWorkSites : totalInProgressWorkSites,

        })

    } catch (error) {
        return new NextResponse("Internal error, {status: 500}")
    }

}