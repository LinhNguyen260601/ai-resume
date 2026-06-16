import { createFileRoute } from '@tanstack/react-router'

import { LandingPage } from '#/components/landing/landing-page.tsx'

export const Route = createFileRoute('/')({
  component: Home,
  head: () => ({
    meta: [
      {
        title: 'ResumeAI — AI-Powered CV Builder',
      },
      {
        name: 'description',
        content:
          'Upload your resume once. Paste any job description. Let AI tailor your CV in under 2 minutes.',
      },
    ],
  }),
})

function Home() {
  return <LandingPage />
}
