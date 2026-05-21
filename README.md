# Big Growth Digital Blog CMS

A modern serverless blog CMS built with Node.js, MongoDB Atlas, AWS Lambda, API Gateway, S3, CloudFront, and Next.js App Router.

## Architecture

- `backend/` - AWS Lambda REST API handlers, MongoDB Atlas models, JWT auth, S3 media upload, and search.
- `frontend/` - Next.js App Router frontend with SSR, dynamic metadata, blog listing, category/tag views, search, and admin dashboard.
- `serverless.yml` - AWS Serverless Framework deployment for backend.

## Getting started

1. Copy `.env.example` to `backend/.env` and set values.
2. Install dependencies:
   - `npm install`
3. Start local development:
   - `npm run dev`
4. Deploy backend:
   - `npm run deploy -- --stage prod`

## Features

- Blog CRUD with draft/publish workflow
- Structured block-based blog content
- SEO metadata management
- Categories and tags
- Search, related posts, sitemap, RSS
- JWT authentication and refresh tokens
- S3 media uploads with CloudFront-ready structure
- Next.js App Router with SEO-friendly pages
