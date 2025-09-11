import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  (await cookies()).set("session", "", { maxAge: -1 });

  return new NextResponse(JSON.stringify({ status: "success" }), {
    status: 200,
  });
}
