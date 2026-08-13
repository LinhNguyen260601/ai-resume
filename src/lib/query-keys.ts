export const baseCvsQueryKey = ['baseCvs'] as const

export const tailoredCvQueryKey = (id: string) => ['tailoredCv', id] as const
