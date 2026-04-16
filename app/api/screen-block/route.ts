// Next.js API Route — Ubuntu'da ekran karartmayı disable/enable eder
import { NextResponse } from "next/server";
import { execSync } from "child_process";

export async function POST(request: Request) {
  try {
    const { action } = await request.json();
    const xset = "/usr/bin/xset";

    if (action === "enable") {
      // DPMS'i kapat — ekran kararmasın
      execSync(`${xset} s off && ${xset} -dpms && ${xset} s noblank`, { stdio: "ignore" });
    } else if (action === "disable") {
      // DPMS'i aç — normale dönsür
      execSync(`${xset} s on && ${xset} +dpms`, { stdio: "ignore" });
    }

    return NextResponse.json({ ok: true, action });
  } catch (err) {
    // xset yok veya izin yok — sessizce devam
    return NextResponse.json({ ok: false, reason: "xset unavailable" });
  }
}