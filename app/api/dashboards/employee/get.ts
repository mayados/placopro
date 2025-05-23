import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { WorkSiteStatusEnum } from "@prisma/client";



export async function GET() {


  // currentUser() is a founction from Clerk which allows to retrieve the current User
  const user = await currentUser()

  try {

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "Utilisateur non authentifié."
      }, { status: 401 });
    }





    const plannings = await db.planning.findMany({

      where: {
        clerkUserId: user.id,
      },
      include: {
        workSite: true,
      },
    });


    const workSites = await db.workSite.findMany({
      where: {
        plannings: {
          some: {
            clerkUserId: user.id,
          },
        },
        status: WorkSiteStatusEnum.PROGRESS
      },
    });

    console.log("les workSites " + JSON.stringify(workSites))
    console.log("les plannings " + JSON.stringify(plannings))


    return NextResponse.json({
      plannings: plannings,
      workSites: workSites
    })

  } catch (error) {
    console.error("Erreur lors de la récupération des to do :", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }

}