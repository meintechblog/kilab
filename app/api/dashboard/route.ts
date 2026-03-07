export const dynamic = "force-dynamic";

import { getDashboardData } from "@/src/lib/prices/query";

export async function GET() {
  return Response.json(await getDashboardData());
}
