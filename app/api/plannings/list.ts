import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { clerkClient} from "@clerk/express";

export async function GET() {

    try{
        const plannings = await db.planning.findMany({
            select: {
                id: true,
                startTime: true,
                endTime: true,
                task: true,
                workSite: true,
                clerkUserId: true
              }
        });

        const planningsWithUserData = await Promise.all(
            plannings.map(async (planning) => {
              const user = await clerkClient.users.getUser(planning.clerkUserId);
      
              return {
                ...planning,
                employee: user.firstName + " " + user.lastName, 
              };
            })
          );


    console.log("plannings retrieved : "+plannings)
          
    return NextResponse.json({
            success: true,
            plannings: planningsWithUserData,
        })

    } catch (error) {
      console.error("Erreur détaillée :", error instanceof Error ? error.message : error);

      return new NextResponse("Internal error, {status: 500}")
    }

}