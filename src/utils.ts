import { ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function formatUnitCost(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  }).format(value);
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (error) => reject(error);
  });
}

export function parseNumber(value: string | number | undefined | null): number {
  if (!value) return 0;
  const stringValue = String(value);
  // If value has a comma, assume it's the decimal separator (PT-BR)
  // Remove dots (thousand separators) and replace comma with dot
  if (stringValue.includes(',')) {
    return parseFloat(stringValue.replace(/\./g, '').replace(',', '.'));
  }
  // Otherwise, assume dot is the decimal separator (or just a number)
  return parseFloat(stringValue);
}
