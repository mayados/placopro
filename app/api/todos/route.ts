// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
// import { POST as createToDoForSecretary } from "@/app/api/todos/create-for-secretary"; 
// import { POST as createToDo } from "@/app/api/todos/create"; 
import { GET as getToDos } from "@/app/api/todos/list"; 

export async function GET(req: NextRequest) {

    return getToDos(req); 
}

// export async function POST(req: NextRequest) {
//     // Decide which type of POST to call
//     if (req.headers.get('X-create-Type') === 'create-for-secretary') {
//       return createToDoForSecretary(req);
//     }
//   return createToDo(req);  
// }

