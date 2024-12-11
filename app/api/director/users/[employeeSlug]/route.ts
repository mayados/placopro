// allows to get all the users
import { clerkClient, User} from "@clerk/express";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {employeeSlug: string}}){

    const employeeSlug = params.employeeSlug;
    console.log("Slug de l'employé : "+employeeSlug)

    try{
        // return a paginated response, not an array of plain users
        const clerkUsersResponse = await clerkClient.users.getUserList()
        const clerkUsers = clerkUsersResponse.data;
        // to access the plain user's array, we have to access "data"
        let employee : GetUserType | UserType |undefined= clerkUsers.find((user) => user.publicMetadata?.slug === employeeSlug )
        
        if(!employee){
            throw new Error(`Pas d'utilisateur trouvé avec le slug: ${employeeSlug}`);
        }

        employee = {
            id: employee.id,
            email: employee.emailAddresses[0]?.emailAddress || "No email",
            firstName: employee.publicMetadata?.firstName || "",
            lastName: employee.publicMetadata?.lastName || "",
            role: employee.publicMetadata?.role || "",
            slug: employee.publicMetadata?.slug || "",            
        }


        return NextResponse.json({
            employee: employee
        })

    } catch (error) {
        console.log("Impossible de trouver les données de l'employé",error)
        return new NextResponse("Internal error, {status: 500}")
    }

}