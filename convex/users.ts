import { v } from 'convex/values'
import { mutation, MutationCtx, QueryCtx } from './_generated/server'

// Create a new task with the given text
export const createUser = mutation({
  args: {
    username: v.string(),
    fullname: v.string(),
    bio: v.optional(v.string()),
    image: v.string(),
    clerkId: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existingUser = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .first()

    if (existingUser) return

    const newUserId = await ctx.db.insert('users', {
      username: args.username,
      fullname: args.fullname,
      bio: args.bio,
      image: args.image,
      clerkId: args.clerkId,
      email: args.email,
      followers: 0,
      following: 0,
      posts: 0,
    })
    return newUserId
  },
})

/**
 *  Retrieves the authenticated user based on the current context.
 *  This function checks the authentication status and fetches the user from the database.
 * @param ctx QueryCtx | MutationCtx
 * @returns The authenticated user or throws an error if not authenticated
 */
export async function getAuthenticatedUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity()
  if (!identity) throw new Error('Unauthenticated')

  const currentUser = await ctx.db
    .query('users')
    .withIndex('by_clerk_id', (q) => q.eq('clerkId', identity.subject))
    .first()

  if (!currentUser) throw new Error('User not found')

  return currentUser
}
