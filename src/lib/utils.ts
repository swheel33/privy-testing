import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Address, formatUnits, parseUnits } from "viem"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const fromBigNumber = (number: bigint | undefined, decimals = 18) => {
  if (!number) return 0
  return parseFloat(formatUnits(number, decimals))
}

export const toBigNumber = (number: number | string, decimals = 18) => {
  if (!number) return BigInt(0)
  return parseUnits(`${number}`, decimals)
}

export const truncateAddress = (address: Address | undefined) => {
  return `${address?.slice(0, 4)}...${address?.slice(-4)}`
}