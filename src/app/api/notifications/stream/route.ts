import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// Map userId -> set de controllere active (suportă mai multe tab-uri simultan)
const clients = new Map<string, Set<ReadableStreamDefaultController>>();

// Funcție exportată pentru a notifica un user din alte route-uri (ex: PATCH status)
export function notifyUser(userId: string) {
    const controllers = clients.get(userId);
    if (!controllers || controllers.size === 0) return;

    const message = `data: ${JSON.stringify({ type: "notification" })}\n\n`;

    for (const controller of controllers) {
        try {
            controller.enqueue(new TextEncoder().encode(message));
        } catch {
            // Controllerul e închis — îl eliminăm
            controllers.delete(controller);
        }
    }
}

export async function GET() {
    const { userId } = await auth();

    if (!userId) {
        return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    let controller: ReadableStreamDefaultController;

    const stream = new ReadableStream({
        start(c) {
            controller = c;

            // Înregistrăm clientul
            if (!clients.has(userId)) {
                clients.set(userId, new Set());
            }
            clients.get(userId)!.add(controller);

            // Trimitem un ping imediat ca să confirmăm conexiunea
            const ping = `data: ${JSON.stringify({ type: "ping" })}\n\n`;
            controller.enqueue(new TextEncoder().encode(ping));

            // Ping la fiecare 30s ca să menținem conexiunea vie (proxy-urile închid idle connections)
            const keepAlive = setInterval(() => {
                try {
                    controller.enqueue(
                        new TextEncoder().encode(`data: ${JSON.stringify({ type: "ping" })}\n\n`)
                    );
                } catch {
                    clearInterval(keepAlive);
                }
            }, 30000);

            // Cleanup la deconectare
            return () => {
                clearInterval(keepAlive);
                clients.get(userId)?.delete(controller);
                if (clients.get(userId)?.size === 0) {
                    clients.delete(userId);
                }
            };
        },
    });

    return new Response(stream, {
        headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache",
            Connection: "keep-alive",
        },
    });
}
