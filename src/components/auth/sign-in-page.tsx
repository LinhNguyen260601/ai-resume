import { SignIn } from '@clerk/tanstack-react-start'

export function SignInPage({ redirect }: { redirect?: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0B0F19]">
      <SignIn
        path="/sign-in"
        routing="path"
        forceRedirectUrl={redirect ?? '/dashboard'}
      />
    </div>
  )
}
