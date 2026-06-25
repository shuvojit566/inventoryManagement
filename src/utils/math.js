// Minimal fixed-point cents-based helpers to avoid floating point errors
export function toCents(value){
  const n = (typeof value === 'number') ? value : parseFloat(String(value) || '0')
  return Math.round(n * 100)
}

export function fromCents(cents){
  return (cents/100).toFixed(2)
}

export function addCents(a,b){ return a + b }
export function subCents(a,b){ return a - b }
export function mulCents(a,b){ // a in cents, b float multiplier
  return Math.round(a * b)
}
