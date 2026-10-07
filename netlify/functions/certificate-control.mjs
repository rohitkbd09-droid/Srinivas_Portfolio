import { getStore } from "@netlify/blobs";

const store = getStore("portfolio-settings");
const KEY = "certificate-visibility";

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store"
    }
  });
}

export default async (request) => {
  try {
    if (request.method === "GET") {
      const saved = await store.get(KEY, { type: "json" });

      return json({
        visible: saved?.visible !== false
      });
    }

    if (request.method !== "POST") {
      return json(
        { error: "Method not allowed." },
        405
      );
    }

    const body = await request.json();

    const suppliedPassword =
      String(body.password || "");

    const ownerPassword =
      String(process.env.OWNER_PASSWORD || "");

    if (!ownerPassword) {
      return json(
        {
          error:
            "OWNER_PASSWORD is not configured in Netlify."
        },
        500
      );
    }

    if (
      !suppliedPassword ||
      suppliedPassword !== ownerPassword
    ) {
      return json(
        {
          error: "Incorrect owner password."
        },
        401
      );
    }

    const visible = body.visible === true;

    await store.setJSON(KEY, {
      visible,
      updatedAt: new Date().toISOString()
    });

    return json({ visible });

  } catch (error) {

    console.error(
      "Certificate control error:",
      error
    );

    return json(
      {
        error:
          "Server error. Please try again."
      },
      500
    );
  }
};
