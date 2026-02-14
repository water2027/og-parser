# Open Graph Parser Worker

This is a Cloudflare Worker that fetches a URL and parses Open Graph (OG) metadata, returning it as JSON. It uses [chanfana](https://github.com/cloudflare/chanfana) for OpenAPI documentation and validation, and [cheerio](https://cheerio.js.org/) for HTML parsing.

## Features

-   **OpenAPI 3.1 Compliant**: Automatically generates `openapi.json` and Swagger UI.
-   **Validation**: Uses Zod to validate input URLs.
-   **Parsing**: Extracts `og:title`, `og:description`, `og:image`, `og:url`, `og:site_name`, and `og:type`, falling back to standard HTML tags where appropriate.
-   **Intelligent Caching**: Responses are cached for 1 hour (`Cache-Control: public, max-age=3600`) to improve performance and reduce upstream load.
-   **Robust Error Handling**: Handles timeouts (10s), invalid URLs, and upstream server errors with appropriate HTTP status codes (400, 502, 504).
-   **CORS Enabled**: Configured to allow cross-origin requests from any domain (`Access-Control-Allow-Origin: *`) by default.

## API Usage

### Parse a URL

**Endpoint:** `GET /api/parse`

**Parameters:**
-   `url` (query parameter, required): The URL to fetch and parse.

**Example Request:**

```bash
curl "http://localhost:8787/api/parse?url=https://github.com"
```

**Example Success Response (200 OK):**

```json
{
  "success": true,
  "data": {
    "title": "GitHub: Let's build from here",
    "description": "GitHub is where over 100 million developers shape the future of software...",
    "image": "https://github.githubassets.com/images/modules/site/social-cards/github-social.png",
    "url": "https://github.com",
    "site_name": "GitHub",
    "type": "object"
  }
}
```

**Example Error Response (502 Bad Gateway):**

```json
{
  "success": false,
  "error": "Upstream error: 404 Not Found"
}
```

## Get Started

1.  **Install dependencies**:
    ```bash
    npm install
    # or
    pnpm install
    ```

2.  **Run locally**:
    ```bash
    npm run dev
    # or
    pnpm dev
    ```
    Open [http://localhost:8787/](http://localhost:8787/) to view the Swagger UI.

3.  **Deploy**:
    ```bash
    npm run deploy
    # or
    pnpm deploy
    ```