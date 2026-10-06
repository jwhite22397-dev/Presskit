import type { Release, ReleaseStatus } from "@/types";
import { formatDate } from "@/lib/utils";

export function releaseStatus(release: Pick<Release, "release_status">): ReleaseStatus {
  return release.release_status ?? "released";
}

export function isUnreleased(release: Pick<Release, "release_status">) {
  const status = releaseStatus(release);
  return status === "announced" || status === "prerelease";
}

export function releaseEyebrow(release: Pick<Release, "release_status" | "release_date" | "type">) {
  if (!isUnreleased(release)) return release.type;
  if (release.release_date) return `Coming ${formatDate(release.release_date)}`;
  return "Coming soon";
}
