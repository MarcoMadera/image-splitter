const digitCharacters =
  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+-.,:;=?@[]^_{|}~";

export function decode83(str: string): number {
  let value = 0;
  for (const element of str) {
    const digit = digitCharacters.indexOf(element);
    value = value * 83 + digit;
  }
  return value;
}
