export function convertStringToNumber(input: string | null): number | null {
  if (input === null || input === undefined) {
    return null;
  }

  const trimmedInput = input.trim();

  const numberRegex = /^-?\d+(\.\d+)?$/;

  if (!numberRegex.test(trimmedInput)) {
    return null;
  }

  const parsedNumber = parseFloat(trimmedInput);

  if (isNaN(parsedNumber)) {
    return null;
  }

  return parsedNumber;
}
