import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}


export function canNotbeNull(...args: any[]){

  return args.every((arg) => arg !== null && arg !== undefined)

}