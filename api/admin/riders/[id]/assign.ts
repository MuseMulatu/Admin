import type { VercelRequest, VercelResponse } from "@vercel/node";
import { proxyRequest } from "../../../_proxy";

export default function handler(req: VercelRequest, res: VercelResponse) {
  const { id } = req.query;
  proxyRequest(req, res, `/admin/rides/${id}/assign`);
}
