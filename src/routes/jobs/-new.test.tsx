/** @vitest-environment jsdom */
import { cleanup, render, screen } from '@testing-library/react'
import {
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  it,
  vi,
} from 'vitest'
import { createElement } from 'react'
import type { ComponentProps, ComponentType, ElementType } from 'react'
import { useReducedMotion } from 'motion/react'
import { useJobForm } from '#/hooks/use-job-form'
import { emptyJobFormValues } from '#/models/job-form'
import { Route } from './new'

vi.mock('motion/react', function mockMotion() {
  function createMotionComponent<T extends ElementType>(element: T) {
    return function MotionComponent({
      initial,
      animate: _animate,
      transition: _transition,
      ...props
    }: ComponentProps<T> & {
      initial?: false | Record<string, unknown>
      animate?: Record<string, unknown>
      transition?: Record<string, unknown>
    }) {
      return createElement(element, {
        ...props,
        'data-initial': initial === false ? 'false' : JSON.stringify(initial),
      })
    }
  }

  return {
    motion: {
      div: createMotionComponent('div'),
    },
    useReducedMotion: vi.fn(),
  }
})

vi.mock('@tanstack/react-router', async function mockRouter() {
  const actual = await vi.importActual<typeof import('@tanstack/react-router')>(
    '@tanstack/react-router',
  )
  return {
    ...actual,
    useNavigate: vi.fn(function useNavigateMock() {
      return vi.fn()
    }),
  }
})

vi.mock('#/hooks/use-job-form', function mockJobFormHook() {
  return { useJobForm: vi.fn() }
})

const mockedUseReducedMotion = vi.mocked(useReducedMotion)
const mockedUseJobForm = vi.mocked(useJobForm)
const NewJobPage = Route.options.component as ComponentType & {
  preload?: () => Promise<void>
}

describe('new job route', function newJobRouteSuite() {
  beforeAll(async function preloadNewJobPage() {
    await NewJobPage.preload?.()
  })

  beforeEach(function resetMocks() {
    mockedUseReducedMotion.mockReturnValue(false)
    mockedUseJobForm.mockReturnValue({
      values: emptyJobFormValues,
      error: null,
      isScraping: false,
      isSubmitting: false,
      onSourceTypeChange: vi.fn(),
      onChange: vi.fn(),
      onScrape: vi.fn(),
      onSubmit: vi.fn(),
    })
  })

  afterEach(function cleanupDom() {
    cleanup()
  })

  it('renders the new job heading and form', function renderPage() {
    render(<NewJobPage />)

    expect(screen.getByRole('heading', { name: 'New job' })).toBeTruthy()
    expect(screen.getByRole('tab', { name: 'Paste text' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Continue' })).toBeTruthy()
  })
})
