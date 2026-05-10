import { customAlphabet } from "nanoid";

const ALPHABET =
  "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789"; // no 0 / O / 1 / I / l
const make = customAlphabet(ALPHABET, 16);

export function newToken(): string {
  return make();
}
