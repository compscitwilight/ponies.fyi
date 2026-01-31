# Project file structure
This document aims to outline the file structure for source files in this repository.

## `lib/`
### Purpose
Contains server-side source files handling heavily reused code that interacts with installed packages.

### Examples
`lib/prisma.ts` - Handles pooled database connections and exposes the client for use in API endpoint handlers.

`lib/supabase.ts` - Provides useful functions for interacting with the Supabase server-side client for user auth and authx.

## `public/`
### Purpose
See the [Next.js documentation](https://nextjs.org/docs/pages/api-reference/file-conventions/public-folder)
### Examples
Static images, metadata, and HTML that needs to be included with the build.

## `src/app/`
### Purpose
Container for CSS source code and all pages and API endpoints included in the build. Each directory represents a subpath in the URL, where `src/app/` is the root.

### Examples
* Individual pages: `[page_name]/page.tsx`
* API endpoints: `api/[name]/route.ts`

## `src/components/`
### Purpose
Houses all client-side components used throughout the frontend.