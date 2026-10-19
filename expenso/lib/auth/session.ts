import { auth } from "@/lib/auth/server";
import { headers } from "next/headers";

/**
 * Retrieves the currently authenticated user's session on the server.
 * Returns null if unauthenticated.
 */
export async function getServerSession() {
  const reqHeaders = await headers();
  const session = await auth.api.getSession({
    headers: reqHeaders,
  });
  return session;
}

/**
 * Requires an authenticated user session.
 * Throws an error or returns session if valid.
 */
export async function requireAuth() {
  const session = await getServerSession();
  if (!session || !session.user) {
    throw new Error("Unauthorized: Please sign in to access this resource.");
  }
  return session;
}
