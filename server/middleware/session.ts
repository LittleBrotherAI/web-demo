export default defineEventHandler(async (event) => {
  const session = await getUserSession(event)

  // If no session ID exists, create one
  if (!session.id) {
    await setUserSession(event, {
      ...session,
      id: crypto.randomUUID()
    })
  }
})
