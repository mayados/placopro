// allows to get all the users
import { clerkClient, User} from "@clerk/express";
import { NextResponse, NextRequest } from "next/server";

export async function GET(req: NextRequest, {params}: {params: {employeeSlug: string}}){

    const resolvedParams = await params;
    const employeeSlug = resolvedParams.employeeSlug;
    console.log("Slug de l'employé : "+employeeSlug)

    try{
        // return a paginated response, not an array of plain users
        const clerkUsersResponse = await clerkClient.users.getUserList()
        const clerkUsers = clerkUsersResponse.data;
        // to access the plain user's array, we have to access "data"
        let employeeRetrieved: GetUserType | undefined = clerkUsers.find(
            (user) => user.publicMetadata?.slug === employeeSlug
          );
        
        if(!employeeRetrieved){
            throw new Error(`Pas d'utilisateur trouvé avec le slug: ${employeeSlug}`);
        }

        const employee: UserType= {
            id: employeeRetrieved.id,
            email: employeeRetrieved.emailAddresses[0]?.emailAddress || "No email",
            // first name and lasName are not to put in metadata beacause these properties already exist
            firstName: employeeRetrieved.firstName || "",
            lastName: employeeRetrieved.lastName || "",
            role: employeeRetrieved.publicMetadata?.role || "",
            slug: employeeRetrieved.publicMetadata?.slug || "",            
        }


        return NextResponse.json({
            employee
        })

    } catch (error) {
        console.log("Impossible de trouver les données de l'employé",error)
        return new NextResponse("Internal error, {status: 500}")
    }

}