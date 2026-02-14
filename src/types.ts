import { Str } from "chanfana";
import type { Context } from "hono";
import { z } from "zod";

export type AppContext = Context<{ Bindings: Env }>;

export const OgData = z.object({
	title: Str({ required: false, description: "Open Graph title or page title" }),
	description: Str({ required: false, description: "Open Graph description or meta description" }),
	image: Str({ required: false, description: "Open Graph image URL" }),
	url: Str({ required: false, description: "Canonical URL" }),
	site_name: Str({ required: false, description: "Site name" }),
	type: Str({ required: false, description: "Object type (e.g., website, article)" }),
});