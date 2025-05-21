// This file allows to handle different actions based on the http method retrieved
import { NextRequest } from "next/server";
import { POST as sendMessage } from "@/app/api/contact/send-message"

export async function POST(req: NextRequest) {
  return sendMessage(req);  
}

