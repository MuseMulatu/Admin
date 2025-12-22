import type { VercelRequest, VercelResponse } from "@vercel/node";
import { proxyRequest } from "./_proxy";

export default function handler(req: VercelRequest, res: VercelResponse) {
  proxyRequest(req, res, "/admin/drivers");
}
