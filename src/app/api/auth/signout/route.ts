import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Wait for the cookies() to resolve before calling set()
    const cookieStore = await cookies();

    // Clear the session cookie by setting maxAge to 0
    cookieStore.set("session", "", {
      expires: new Date(0),
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });

    return NextResponse.json({ status: "success" });
  } catch (error) {
    console.error("Error during signout:", error);
    return NextResponse.json({ error: "Failed to sign out" }, { status: 500 });
  }
}
