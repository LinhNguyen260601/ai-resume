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
import { useBaseCvs } from '#/hooks/use-base-cvs'
import { Route } from './upload'

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
      h1: createMotionComponent('h1'),
      section: createMotionComponent('section'),
    },
    useReducedMotion: vi.fn(),
  }
})

vi.mock('#/hooks/use-base-cvs', function mockBaseCvsHook() {
  return { useBaseCvs: vi.fn() }
})

vi.mock('#/hooks/use-cv-upload', function mockCvUploadHook() {
  return {
    useCvUpload: vi.fn(function useIdleCvUpload() {
      return {
        stage: 'idle',
        isBusy: false,
        error: null,
        result: null,
        handleFile: vi.fn(),
        handleLooksGood: vi.fn(),
        handleReParse: vi.fn(),
      }
    }),
  }
})

const mockedUseReducedMotion = vi.mocked(useReducedMotion)
const mockedUseBaseCvs = vi.mocked(useBaseCvs)
const UploadPage = Route.options.component as ComponentType & {
  preload?: () => Promise<void>
}

describe('upload route', function uploadRouteSuite() {
  beforeAll(async function preloadUploadPage() {
    await UploadPage.preload?.()
  })

  beforeEach(function resetMocks() {
    mockedUseReducedMotion.mockReturnValue(false)
    mockedUseBaseCvs.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: false,
      error: null,
      invalidate: vi.fn(),
    })
  })

  afterEach(function cleanupDom() {
    cleanup()
  })

  it('renders entry content statically when reduced motion is preferred', async function reducedMotion() {
    mockedUseReducedMotion.mockReturnValue(true)

    render(<UploadPage />)

    const heading = await screen.findByRole('heading', {
      name: 'Upload CV',
    })
    const animatedElements =
      heading.parentElement?.querySelectorAll('[data-initial]')

    expect(animatedElements).toHaveLength(3)
    animatedElements?.forEach(function assertStatic(element) {
      expect(element.getAttribute('data-initial')).toBe('false')
    })
  })

  it('shows a styled error instead of the empty upload state', async function baseCvError() {
    mockedUseBaseCvs.mockReturnValue({
      data: undefined,
      isLoading: false,
      isError: true,
      error: new Error('Request failed'),
      invalidate: vi.fn(),
    })

    render(<UploadPage />)

    expect((await screen.findByRole('alert')).textContent).toContain(
      'Unable to load previous uploads',
    )
    expect(screen.queryByText(/No CVs yet/)).toBeNull()
  })
})
