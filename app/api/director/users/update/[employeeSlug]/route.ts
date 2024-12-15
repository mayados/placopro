import { NextRequest, NextResponse } from "next/server";
import { clerkClient, EmailAddress, User} from "@clerk/express";

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
    const parametersSimpleUpdate = { firstName: firstName, lastName: lastName, role: role, primaryEmailAddress: email }



    const updatedEmployeeSimple = await clerkClient.users.updateUser(id, parametersSimpleUpdate)

    const updatedEmployeeMetadata = await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: { role: role, slug: slug},
      });
      const updatedEmployeeEmail = await clerkClient.emailAddresses.createEmailAddress({
        userId: updatedEmployeeSimple.id,
        emailAddress: email,
        primary: true,
        verified: true,
      })

      console.log("Le nouveau rôle après l'udpate est : "+updatedEmployeeMetadata.publicMetadata?.role)
      console.log("le type de données de role : "+typeof(updatedEmployeeMetadata.publicMetadata?.role))
      const employee: UserType= {
        id: updatedEmployeeSimple.id,
        email: updatedEmployeeEmail.emailAddress,
        // first name and lasName are not to put in metadata beacause these properties already exist
        firstName: updatedEmployeeSimple.firstName || "",
        lastName: updatedEmployeeSimple.lastName || "",
        // We use an assertion type here "as" to guide TypeScript because other way publicMetadata is probably large and TypeScript can't type well. Its types {} 
        role: updatedEmployeeMetadata.publicMetadata?.role as string || "",
        slug: updatedEmployeeMetadata.publicMetadata?.slug as string || "",            
    }


    return NextResponse.json({updatedEmployee: employee }, { status: 200 });

  } catch (error) {
    console.error("Error with employee's update:", error);
    return new NextResponse("Internal error, {status: 500}")

  }
}
