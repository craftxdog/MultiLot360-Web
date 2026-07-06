const MAX_DIGITS = 200;

export function sanitizeSaleDigits(value: string) {
  return value.replace(/\D/g, "").slice(0, MAX_DIGITS);
}

export function consumeSaleDigitPairs(value: string) {
  const digits = sanitizeSaleDigits(value);
  const completeLength = digits.length - (digits.length % 2);
  const numbers: string[] = [];

  for (let index = 0; index < completeLength; index += 2) {
    numbers.push(digits.slice(index, index + 2));
  }

  return {
    numbers,
    remainder: digits.slice(completeLength),
  };
}

export function fitSaleNumbersToTicket(current: string[], incoming: string[], limit = 100) {
  const known = new Set(current);
  const accepted: string[] = [];
  const overflow: string[] = [];

  for (const number of incoming) {
    if (known.has(number)) {
      accepted.push(number);
    } else if (known.size < limit) {
      known.add(number);
      accepted.push(number);
    } else {
      overflow.push(number);
    }
  }

  return { accepted, overflow };
}
