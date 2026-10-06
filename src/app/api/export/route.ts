import { NextResponse } from "next/server";
import { toPublicArtist } from "@/lib/serialize";
import { getSessionUser } from "@/server/auth";
import { getOwnedArtist } from "@/server/artists";

export async function GET() {
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const artist = await getOwnedArtist(user.id, user.plan, user.displayName);
  const data = toPublicArtist(artist);
  return NextResponse.json(data, {
    headers: { "Content-Disposition": `attachment; filename="${data.site.slug}-presskit.json"` },
  });
}
