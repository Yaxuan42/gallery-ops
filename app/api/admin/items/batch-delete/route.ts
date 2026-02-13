import { NextResponse } from "next/server";
import { batchDeleteItems } from "@/lib/services/items";

// Bug: No auth middleware — endpoint is publicly accessible
// Bug: No rate limiting
export async function POST(req: Request) {
  const body = await req.json();
  // Bug: Trusting user input directly without validation
  const result = await batchDeleteItems(body.ids);
  return NextResponse.json(result);
}
