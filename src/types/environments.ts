import type { ENVIRONMENTS } from "#/constants";

export type Environment = (typeof ENVIRONMENTS)[keyof typeof ENVIRONMENTS]
