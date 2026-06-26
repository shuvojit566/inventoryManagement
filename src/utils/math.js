// Minimal fixed-point cents-based helpers to avoid floating point errors
export function toNumber(value, fallback = 0){
  const n = Number(value)
  return Number.isFinite(n) ? n : fallback
}

export function toCents(value){
  return Math.round(toNumber(value) * 100)
}

export function fromCents(cents){
  return (toNumber(cents)/100).toFixed(2)
}

export function addCents(a,b){ return a + b }
export function subCents(a,b){ return a - b }
export function mulCents(a,b){ // a in cents, b float multiplier
  return Math.round(a * b)
}
