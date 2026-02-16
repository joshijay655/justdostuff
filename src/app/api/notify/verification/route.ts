import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendEmail, verificationSubmittedEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { userName } = await request.json();

  // Get user's email
  const { data: profile } = await supabase
    .from("profiles")
    .select("email")
    .eq("id", user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: "Profile not found" }, { status: 404 });
  }

  try {
    const email = verificationSubmittedEmail({
      userName: userName || "Provider",
    });
    await sendEmail({ to: profile.email, ...email });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[Verification Email Error]", error);
    return NextResponse.json({ error: "Failed to send" }, { status: 500 });
  }
}
