// This file allows to handle different actions based on the http method retrieved
import { NextRequest, NextResponse } from "next/server";
import { POST as createUser } from "@/app/api/users/create"; 
import { GET as getUsers} from "@/app/api/users/list"; 

export async function GET(req: NextRequest) {

    return getUsers(req); 
}

export async function POST(req: NextRequest) {
  return createUser(req);  
}

