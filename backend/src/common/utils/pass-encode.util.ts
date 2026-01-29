import * as bcrypt from 'bcrypt';
const SALT_ROUNDS = 12;

export async function encode(stringToEncode: string): Promise<string> {
  return bcrypt.hash(stringToEncode, SALT_ROUNDS);
}

// eslint-disable-next-line prettier/prettier
  export async function compare(stringToCompare: string, encodedString: string): Promise<boolean> {
  return bcrypt.compare(stringToCompare, encodedString);
}
