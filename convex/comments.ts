import { ConvexError, v } from 'convex/values'
import { mutation } from './_generated/server'
import { getAuthenticatedUser } from './users'

export const addComment = mutation({
  args: { content: v.string(), postId: v.id('posts') },
  handler: async (ctx, args) => {
    const currentUser = await getAuthenticatedUser(ctx)

    const post = await ctx.db.get(args.postId)
    if (!post) throw new ConvexError('Post not found')

    const { content, postId } = args
    const userId = currentUser._id

    const commentId = await ctx.db.insert('comments', {
      content,
      postId,
      userId,
    })

    await ctx.db.patch(postId, { comments: post.comments + 1 })
  },
})
