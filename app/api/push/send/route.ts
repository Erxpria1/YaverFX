import { NextResponse } from "next/server";
import webpush from "web-push";

// Ensure VAPID keys are available
if (process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || "mailto:hello@yaverfx.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(req: Request) {
  try {
    const { subscription, title, body, requireInteraction } = await req.json();

    if (!subscription) {
      return NextResponse.json({ error: "Missing push subscription object" }, { status: 400 });
    }

    // Send the push notification
    const result = await webpush.sendNotification(
      subscription,
      JSON.stringify({ 
        title: title || "YaverFX", 
        body: body || "Zamanlayıcı tamamlandı!",
        requireInteraction: requireInteraction !== undefined ? requireInteraction : false
      })
    );

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    console.error("Error sending push notification:", error);
    return NextResponse.json(
      { error: "Failed to send push notification", details: error.message },
      { status: 500 }
    );
  }
}
