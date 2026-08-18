import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from '@clerk/tanstack-react-start'
import { z } from 'zod'

const signInSearchSchema = z.object({
  redirect: z.string().optional(),
})

export const Route = createFileRoute('/sign-in')({
  validateSearch: signInSearchSchema,
  component: SignInPage,
})

function SignInPage() {
  const { redirect } = Route.useSearch()
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
      <SignIn forceRedirectUrl={redirect ?? '/dashboard'} />
    </div>
  )
}
