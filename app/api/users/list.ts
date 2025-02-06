// allows to get all the users
import { clerkClient} from "@clerk/express";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest) {


    try{
        // return a paginated response, not an array of plain users
        const clerkUsersResponse = await clerkClient.users.getUserList()
        const clerkUsers = clerkUsersResponse.data;
        // to access the plain user's array, we have to access "data"
        const userList = clerkUsers.map((user: GetUserType) => ({
            id: user.id,
            email: user.emailAddresses[0]?.emailAddress || "No email",
            firstName: user.firstName || "",
            lastName: user.lastName || "",
            role: user.publicMetadata?.role || "",
            slug: user.publicMetadata?.slug || "",
          }));



        return NextResponse.json({
            userList: userList
        })

    } catch (error) {
        console.log("Unable to retrieve employees datas",error)
        return new NextResponse("Internal error, {status: 500}")
    }

}