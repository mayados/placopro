import { db } from "@/lib/db";
import { NextResponse, NextRequest } from "next/server";
import { clerkClient} from "@clerk/express";

export async function GET(req: NextRequest) {

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
        return new NextResponse("Internal error, {status: 500}")
    }

}