import { fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { OgParse } from "./endpoints/ogParse";

// Start a Hono app
const app = new Hono<{ Bindings: Env }>();

// Enable CORS for all routes
app.use("*", cors());

// Setup OpenAPI registry
const openapi = fromHono(app, {
	docs_url: "/",
});

// Register OpenAPI endpoints
openapi.get("/api/parse", OgParse);

// Export the Hono app
export default app;
