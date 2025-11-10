import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

type CnInput = string | number | boolean | undefined | null

export function cn(...inputs: CnInput[]) {
  return twMerge(clsx(...inputs))
}
