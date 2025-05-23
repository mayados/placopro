import { db } from "@/lib/db";
import { NextResponse } from "next/server";
import { currentUser } from '@clerk/nextjs/server'
import { clerkClient} from "@clerk/express";



export async function GET() {


    // currentUser() is a founction from Clerk which allows to retrieve the current User
    const user = await currentUser()

    try{

        if (!user) {
            return NextResponse.json({ 
                success: false, 
                message: "Utilisateur non authentifié." 
            }, { status: 401 });
        }

        const allUsersResponse = await clerkClient.users.getUserList();
        const allUsers = allUsersResponse.data;
        
        const secretaries = allUsers
        .filter(user => user.publicMetadata?.role === "secrétaire")
        .map(user => ({
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
        }));
              

        const toDos = await db.toDo.findMany({
            select: {
                id: true,
                description: true,
                task: true,
                createdAt: true,
                isChecked: true
            },
            where: {
                authorClerkId: user.id,
                isArchived: false,
                isChecked: false,
                assignedToClerkId: {
                    equals: null
                }
            },
            orderBy: {
                createdAt: "desc",
            },
        });
  

        const checkedToDos = await db.toDo.findMany({
            select: {
                id: true,
                description: true,
                task: true,
                createdAt: true,
                isChecked: true
            },
            where: {
                authorClerkId: user.id,
                isArchived: false,
                isChecked: true,
                assignedToClerkId: null,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        const archivedToDos = await db.toDo.findMany({
            where: {
                authorClerkId: user.id,
                isArchived: true,
                assignedToClerkId: null,
            },
            select: {
                id: true,
                description: true,
                task: true,
                createdAt: true,
                isChecked: true

            },
            orderBy: {
                createdAt: "desc",
            },
        })

  

    // Étape 1 : Récupérer les todos assignés
    const rawAssignedToDos = await db.toDo.findMany({
        where: {
        authorClerkId: user.id,
        assignedToClerkId: {
            not: null,
        },
        },
        select: {
        id: true,
        description: true,
        task: true,
        createdAt: true,
        assignedToClerkId: true,
        },
        orderBy: {
        createdAt: "desc",
        },
    });
    
    // Extract all clerk ids
    const clerkIds = [...new Set(rawAssignedToDos.map(todo => todo.assignedToClerkId))];
    
    // Get users
    const assignedUsers = await Promise.all(
        clerkIds.map(async id => {
        try {
            const user = await clerkClient.users.getUser(id!); // le ! évite TypeScript de râler sur le null potentiel
            return {
            id,
            fullName: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
            };
        } catch (err) {
            console.warn(`Impossible de récupérer l'utilisateur Clerk ${id}`+err);
            return { id, fullName: "Utilisateur inconnu" };
        }
        })
    );
    
    // Create a dictionnary {id => nom complet}
    const userMap = Object.fromEntries(assignedUsers.map(user => [user.id, user.fullName]));
    
    // Add complete name for each to do
    const assignedToDos = rawAssignedToDos.map(todo => ({
        ...todo,
        assignedToName: userMap[todo.assignedToClerkId ?? ""] ?? "Utilisateur inconnu",
    }));


        //Counting number of toDos
        
        const totalToDos: number = await db.toDo.count({ 
            where: {
                authorClerkId: user.id,
                isArchived: false,
                assignedToClerkId: null,
                isChecked: false
            },
        });
        
        const totalCheckedToDos: number = await db.toDo.count({ 
            where: {
                authorClerkId: user.id,
                isArchived: false,
                isChecked: true,
                assignedToClerkId: null,
            },
        });

        const totalArchivedToDos: number = await db.toDo.count({ 
            where: {
                authorClerkId: user.id,
                isArchived: true,
                assignedToClerkId: null,
            },
        });

        const totalAssignedToDos: number = await db.toDo.count({ 
            where: {
                authorClerkId: user.id,
                assignedToClerkId: {
                    not: null,
                },
            },
        });

        console.log("secrétaires : "+JSON.stringify(secretaries))
          

        return NextResponse.json({
            success: true,
            toDos: toDos,
            archivedToDos: archivedToDos,
            assignedToDos: assignedToDos,
            checkedToDos: checkedToDos,
            totalToDos : totalToDos,
            totalArchivedToDos : totalArchivedToDos,
            totalAssignedToDos : totalAssignedToDos,
            totalCheckedToDos : totalCheckedToDos,
            secretaries: secretaries
        })

    } catch (error) {
        console.error("Erreur lors de la récupération des to do :", error);
        return new NextResponse("Internal Server Error", { status: 500 });
    }

}