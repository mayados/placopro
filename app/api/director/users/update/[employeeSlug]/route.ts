import { NextRequest, NextResponse } from "next/server";
import { clerkClient, User} from "@clerk/express";

export async function PUT(req: NextRequest) {
  // Retrieve datas from request's body
  const data = await req.json();
  const { 
    id,
    firstName,
    lastName,
    email,
    role
  } = data;

  try {

    const slug = lastName.toLowerCase()+"-"+firstName.toLowerCase();
    // Clerk doesn't allow us to update all the elements of the user with only one function. We have to use another function for the metadata

    console.log("Les datas reçues sont :"+JSON.stringify(data))
    console.log("Infos concernant l'employé :  +"+firstName+" nom : "+lastName+" email : "+email+" role : "+role+" id: "+id)
    const parametersSimpleUpdate = { firstName: firstName, lastName: lastName, emailAddresses: [{ emailAddress: email }], role: role }

    const updatedEmployeeSimple = await clerkClient.users.updateUser(id, parametersSimpleUpdate)

    const updatedEmployeeMetadata = await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: { role: role, slug: slug},
      });


      console.log("Le nouveau rôle après l'udpate est : "+updatedEmployeeMetadata.publicMetadata?.role)
      console.log("le type de données de role : "+typeof(updatedEmployeeMetadata.publicMetadata?.role))
      const employee: UserType= {
        id: updatedEmployeeSimple.id,
        email: updatedEmployeeSimple.emailAddresses[0]?.emailAddress,
        // first name and lasName are not to put in metadata beacause these properties already exist
        firstName: updatedEmployeeSimple.firstName || "",
        lastName: updatedEmployeeSimple.lastName || "",
        role: updatedEmployeeMetadata.publicMetadata?.role || "",
        slug: updatedEmployeeMetadata.publicMetadata?.slug || "",            
    }


    return NextResponse.json({updatedEmployee: employee }, { status: 200 });

  } catch (error) {
    console.error("Error with employee's update:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}
