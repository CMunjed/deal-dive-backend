# Deal Dive Backend

Deal Dive is a collaborative full-stack web platform for discovering, posting, and evaluating local deals. This repository contains the backend codebase built with Express.js, TypeScript, and Supabase.

> **Frontend Repository**: For information about the frontend application, visit the [Deal Dive Frontend repository](https://github.com/emerinecole/deal-dive-frontend).

## Major Features and Functionality

Deal Dive is a crowdsourced, location-based platform designed to help college students find accurate, reliable, and close deals near their university. Its core features include:

- **Deal Management**: Create, read, update, and delete deal postings with information including location, deal category, original price, and associated deal
- **Geographic Integration**: Support for location-based queries to find nearby deals based on user location
- **Community Engagement**:
  - Upvote and downvote deals to highlight popular and user-validated deals
  - Comment on deals to share experiences and information
  - Report innacurate or misleading deals
- **User Authentication**: Secure user registration, login, and persistance
- **Deal Categorization**: Filter by catagory or tag to find specific deals

## Technology Stack

### Core Technologies
- **Language**: TypeScript
- **Runtime**: Node.js
- **Framework**: Express.js (v5.1.0)
- **Database**: Supabase (PostgreSQL with PostGIS)
- **Authentication**: Supabase Auth

### Development Tools
- **Testing**: Jest with ts-jest
- **Code Quality**: ESLint, Prettier
- **Type Checking**: TypeScript Compiler
- **Package Manager**: npm
- **Version Control**: Git/GitHub
- **CI/CD**: GitHub Actions

### Key Dependencies
- `@supabase/supabase-js`: Database client and authentication
- `express`: Web application framework
- `cors`: Cross-origin resource sharing middleware
- `dotenv`: Environment variable management
- `tsx`: TypeScript execution and hot reload

## Installation Instructions

### How to Set Up Locally

#### Prerequisites
- Node.js (v22 or higher recommended)
- npm (comes with Node.js)
- Git

#### Setup Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/CMunjed/deal-dive-backend.git
   cd deal-dive-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the root directory with the following variables:
   ```
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   PORT=5000
   CORS_ORIGINS=http://localhost:3000
   ```

   > **Note**: The `.env` file containing actual credentials will be sent separately

4. **Run the development server**
   ```bash
   npm run dev
   ```

   The server will start on `http://localhost:5000` with hot reload enabled.

5. **Verify the installation**

   Navigate to `http://localhost:5000/` in your browser. You should see:
   ```json
   {
     "message": "API is running",
     "version": "1.0.0",
     "status": "OK"
   }
   ```

#### Additional Commands

- **Run tests**: `npm test`
- **Type checking**: `npm run type-check`
- **Linting**: `npm run lint`
- **Format code**: `npm run format`
- **Check formatting**: `npm run check-format`
- **Production start**: `npm start`

### How to Run Deployed Version

The deployed version of **DealDive** is accessible at the following URL:
https://deal-dive-frontend.vercel.app/auth/signup

#### Known Authentication Redirect Issue on Vercel Deployment

While local signup functions correctly, the deployed Vercel environment currently experiences a redirect failure following email confirmation, requiring a manual workaround.

**Local Signup:** Fully functional and requires no extra steps.

**Deployed Signup Workaround:**

1.  **Navigate** to the signup page: `https://deal-dive-frontend.vercel.app/auth/signup`
2.  **Complete Signup:** Enter a name, email, and password to register a new user.
3.  **Confirm Email:** Click the confirmation link sent to your email address.
4.  **Observe Redirect:** After clicking the confirmation link, the application currently redirects the user back to the same URL: `https://deal-dive-frontend.vercel.app/auth/signup`
5.  **Manual Fix (Required):** To complete the authentication and access the dashboard, you must **manually remove the trailing `/auth/signup`** path from the browser's address bar, leaving only the base URL:
    ```
    [https://deal-dive-frontend.vercel.app/](https://deal-dive-frontend.vercel.app/)
    ```
6.  **Access:** After deleting the path and hitting Enter, the application will successfully redirect the confirmed user to the **Dashboard**.

This temporary measure is required until the authentication callback configuration is finalized on the Vercel hosting environment.

## Project Structure

### Key Folders

```
deal-dive-backend/
├── src/
│   ├── config/          # Configuration files (Supabase client)
│   ├── controllers/     # Request handlers (extract params, call services, return responses)
│   ├── routes/          # API route definitions and endpoint mounting
│   ├── services/        # Business logic and database operations
│   ├── types/           # TypeScript type definitions and database schemas
│   ├── app.ts           # Express app configuration (middleware, CORS, routes)
│   └── server.ts        # Application entry point (server startup)
├── tests/               # Test files organized by feature
│   ├── deals/           # Deal-related tests
│   ├── comments/        # Comment-related tests
│   ├── votes/           # Vote-related tests
│   ├── reports/         # Report-related tests
│   └── setup.ts         # Test environment configuration
├── .github/
│   └── workflows/       # GitHub Actions CI/CD configuration
└── [config files]       # TypeScript, ESLint, Jest, Prettier configs
```

#### Architecture Pattern

The codebase follows a **three-layer architecture** for separation of concerns:

1. **Routes Layer** (`src/routes/`): Defines HTTP endpoints and mounts them to the Express router
2. **Controllers Layer** (`src/controllers/`): Handles HTTP requests/responses, extracts parameters, and orchestrates service calls
3. **Services Layer** (`src/services/`): Contains business logic and executes database operations via Supabase

### API Models

The API uses auto-generated TypeScript types from the Supabase database schema. The key data structures are:

* **Deal:** The primary entity representing a local deal or promotion, containing price data, location (`geom`), community metrics, and ownership information.

* **Comment:** User comments on deals. Key fields include `deal_id`, `user_id`, and `content`.
* **Vote:** Tracks upvote/downvote actions for deals. Key fields include `deal_id`, `user_id`, and `vote_type`.
* **Report:** Tracks content moderation reports. Key fields include `deal_id`, `reporter_id`, and `reason`.
* **Tag / Deal\_Tags:** These tables manage the many-to-many relationship for categorizing deals (e.g., "BOGO", "Wings").

## API Endpoints

All API endpoints are prefixed with `/api/v1/`.

### Deals
- `POST /api/v1/deals` - Create a new deal
- `GET /api/v1/deals` - Get all deals (supports filtering by userId)
- `GET /api/v1/deals/:id` - Get a specific deal by ID
- `PUT /api/v1/deals/:id` - Update a deal
- `DELETE /api/v1/deals/:id` - Delete a deal

---

## Contributing

This project follows a **feature branch workflow**:

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commits
3. Submit a pull request for review
4. Require approval from at least one team member before merging

### Code Quality Standards

Before submitting a PR, ensure:
- All tests pass: `npm test`
- Code is properly formatted: `npm run format`
- No linting errors: `npm run lint`
- Type checking passes: `npm run type-check`

The CI pipeline automatically runs these checks on all pull requests.

---

## License

ISC
