import { OpenAPIRoute, Str } from "chanfana";
import { z } from "zod";
import * as cheerio from "cheerio";
import { OgData, type AppContext } from "../types";

export class OgParse extends OpenAPIRoute {
	schema = {
		tags: ["OpenGraph"],
		summary: "Parse Open Graph data from a URL",
		request: {
			query: z.object({
				url: Str({ description: "URL to parse" }).url(),
			}),
		},
		responses: {
			"200": {
				description: "Successfully parsed Open Graph data",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							data: OgData,
						}),
					},
				},
			},
			"400": {
				description: "Invalid input or fetch error",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
						}),
					},
				},
			},
			"502": {
				description: "Bad Gateway - Upstream server error",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
						}),
					},
				},
			},
			"504": {
				description: "Gateway Timeout - Upstream request timed out",
				content: {
					"application/json": {
						schema: z.object({
							success: z.boolean(),
							error: z.string(),
						}),
					},
				},
			},
		},
	};

	async handle(c: AppContext) {
		const data = await this.getValidatedData<typeof this.schema>();
		const { url } = data.query;

		// 10 seconds timeout for fetch
		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 10000);

		try {
			const response = await fetch(url, {
				headers: {
					"User-Agent": "Mozilla/5.0 (compatible; OGParser/1.0; +http://example.com)",
				},
				signal: controller.signal,
			});

			clearTimeout(timeoutId);

			if (!response.ok) {
				return Response.json(
					{ success: false, error: `Upstream error: ${response.status} ${response.statusText}` },
					{ status: 502 }
				);
			}

			// Check content type
			const contentType = response.headers.get("content-type");
			if (!contentType || !contentType.includes("text/html")) {
				return Response.json(
					{ success: false, error: "URL did not return HTML content" },
					{ status: 400 } // Bad Request is appropriate here as the input URL is not suitable
				);
			}

			const html = await response.text();
			const $ = cheerio.load(html);

			const result = {
				title: $('meta[property="og:title"]').attr('content') || $('title').text() || undefined,
				description: $('meta[property="og:description"]').attr('content') || $('meta[name="description"]').attr('content') || undefined,
				image: $('meta[property="og:image"]').attr('content') || undefined,
				url: $('meta[property="og:url"]').attr('content') || url,
				site_name: $('meta[property="og:site_name"]').attr('content') || undefined,
				type: $('meta[property="og:type"]').attr('content') || undefined,
			};

			// Cache for 1 hour (3600 seconds)
			// 'public' allows shared caches (CDNs) to store the response
			return Response.json(
				{
					success: true,
					data: result,
				},
				{
					headers: {
						"Cache-Control": "public, max-age=3600",
					},
				}
			);
		} catch (error) {
			clearTimeout(timeoutId);
			
			if (error instanceof Error) {
				if (error.name === 'AbortError') {
					return Response.json(
						{ success: false, error: "Request to upstream URL timed out" },
						{ status: 504 }
					);
				}
				return Response.json(
					{ success: false, error: error.message },
					{ status: 500 } // Use 500 for unexpected internal errors
				);
			}
			
			return Response.json(
				{ success: false, error: "Unknown error occurred" },
				{ status: 500 }
			);
		}
	}
}