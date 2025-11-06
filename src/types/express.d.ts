// Modify express.js Request type to include user id (for use with auth middleware)

declare namespace Express {
  export interface Request {
    user?: { id: string };
  }
}