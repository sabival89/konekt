import { v } from 'convex/values'
import { Id } from './_generated/dataModel'
import { mutation, MutationCtx, query, QueryCtx } from './_generated/server'

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
 * Updates the profile of the authenticated user.
 * This mutation allows the user to update their fullname and bio.
 */
export const updateProfile = mutation({
  args: {
    fullname: v.string(),
    bio: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)

    await ctx.db.patch(currentUser._id, {
      fullname: args.fullname,
      bio: args.bio,
    })
  },
})

/**
 * Fetches a user by their Clerk ID.
 */
export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query('users')
      .withIndex('by_clerk_id', (q) => q.eq('clerkId', args.clerkId))
      .unique()

    return user
  },
})

export const getUserProfile = query({
  args: { id: v.id('users') },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.id)
    if (!user) throw new Error('User not found')

    return user
  },
})

/**
 * Checks if the authenticated user is following a specific user.
 * @param followingId The ID of the user to check if the current user is following.
 * @returns True if the current user is following the specified user, false otherwise.
 */
export const isFollowing = query({
  args: { followingId: v.id('users') },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const follow = await ctx.db
      .query('follows')
      .withIndex('by_both', (q) =>
        q.eq('followerId', currentUser._id).eq('followingId', args.followingId),
      )
      .first()

    return !!follow
  },
})

/**
 * Handle following and unfollowing users.
 * This mutation toggles the follow state between the current user and another user.
 */
export const toggleFollow = mutation({
  args: { followingId: v.id('users') },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const existing = await ctx.db
      .query('follows')
      .withIndex('by_both', (q) =>
        q.eq('followerId', currentUser._id).eq('followingId', args.followingId),
      )
      .first()

    if (existing) {
      // unfollow
      await ctx.db.delete(existing._id)
      await updateFollowCounts(ctx, currentUser._id, args.followingId, false)
    } else {
      // follow
      await ctx.db.insert('follows', {
        followerId: currentUser._id,
        followingId: args.followingId,
      })
      await updateFollowCounts(ctx, currentUser._id, args.followingId, true)

      // create a notification
      await ctx.db.insert('notifications', {
        receiverId: args.followingId,
        senderId: currentUser._id,
        type: 'follow',
      })
    }
  },
})

/**
 * Updates the follow counts for a user when they follow or unfollow another user.
 * @param ctx MutationCtx
 * @param followerId The ID of the user who is following or unfollowing.
 * @param followingId The ID of the user being followed or unfollowed.
 * @param isFollow True if the user is following, false if unfollowing.
 */
async function updateFollowCounts(
  ctx: MutationCtx,
  followerId: Id<'users'>,
  followingId: Id<'users'>,
  isFollow: boolean,
) {
  const follower = await ctx.db.get(followerId)
  const following = await ctx.db.get(followingId)

  if (follower && following) {
    await ctx.db.patch(followerId, {
      following: follower.following + (isFollow ? 1 : -1),
    })
    await ctx.db.patch(followingId, {
      followers: following.followers + (isFollow ? 1 : -1),
    })
  }
}
