import { NextRequest, NextResponse } from "next/server";
import { clerkClient} from "@clerk/express";


// Asynchrone : waits for a promise
export async function DELETE(req: NextRequest, {params}: {params: {employeeId: string}})
{
    const resolvedParams = await params;
    const employeeId = resolvedParams.employeeId;

    try{

       await clerkClient.users.deleteUser(employeeId)


        return new NextResponse(JSON.stringify({ success: true, message: 'Employee deleted with success' }), {
            status: 200,
        });

    } catch (error) {
        // servor side : SSR
        return new NextResponse("Internal error, {status: 500}")
    }


}