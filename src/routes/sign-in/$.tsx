import { createFileRoute } from '@tanstack/react-router'
import { z } from 'zod'

import { SignInPage } from '#/components/auth/sign-in-page'

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/sign-in/$')({
  validateSearch: signInSearchSchema,
  component: SignInSplatRoute,
})

function SignInSplatRoute() {
  const { redirect } = Route.useSearch()
  return <SignInPage redirect={redirect} />
}
