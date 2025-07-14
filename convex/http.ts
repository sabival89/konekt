import { httpRouter } from 'convex/server'
import { Webhook } from 'svix'
import { api } from './_generated/api'
import { httpAction } from './_generated/server'

const http = httpRouter()

/**
 * This route handles Clerk webhooks.
 * It listens for user creation events and creates a corresponding user in Convex.
 * Make sure to set the CLERK_WEBHOOK_SECRET environment variable in your Convex deployment
 * to secure the webhook endpoint.
 */
http.route({
  path: '/clerk-webhook',
  method: 'POST',
  handler: httpAction(async (ctx, req) => {
    // Handle the webhook event
    const webhookSecret = process.env.CLERK_WEBHOOK_SECRET // Ensure the webhook secret is set On server (convex) side
    if (!webhookSecret) {
      throw new Error('CLERK_WEBHOOK_SECRET is not set')
    }

    // Check headers
    const svix_id = req.headers.get('svix-id')
    const svix_timestamp = req.headers.get('svix-timestamp')
    const svix_signature = req.headers.get('svix-signature')

    if (!svix_id || !svix_timestamp || !svix_signature) {
      return new Response('Error Occurred -- Missing svix headers', {
        status: 400,
      })
    }

    const payload = await req.json()
    const body = JSON.stringify(payload)

    const wh = new Webhook(webhookSecret)
    let evt: any

    // verify the webhook signature
    try {
      evt = wh.verify(body, {
        'svix-id': svix_id,
        'svix-timestamp': svix_timestamp,
        'svix-signature': svix_signature,
      })
    } catch (error) {
      console.error('Webhook verification failed:', error)
      return new Response('Error Occurred -- Webhook verification failed', {
        status: 400,
      })
    }

    const eventType = evt.type

    if (eventType === 'user.created') {
      // Handle user.created event
      const { id, email_addresses, first_name, last_name, image_url } = evt.data

      const email = email_addresses[0]?.email_address || ''
      const name = `${first_name} ${last_name}`.trim()

      try {
        await ctx.runMutation(api.users.createUser, {
          email,
          fullname: name,
          image: image_url || '',
          clerkId: id,
          username: email.split('@')[0],
        })
      } catch (error) {
        console.error('Error creating user:', error)
        return new Response('Error Occurred -- Failed to create user', {
          status: 500,
        })
      }
    }

    return new Response('Webhook processed successfully', { status: 200 })
  }),
}) // /clerk-webhook is postfix of the webhook endpoint name

export default http
