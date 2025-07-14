import { v } from 'convex/values'
import { mutation } from './_generated/server'

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
