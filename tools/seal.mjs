// Encrypts each game's author name into games.json with the 6-digit code from
// private/unlock-code.txt. Real names live only in private/authors.json (not committed).
// Run before every commit: node tools/seal.mjs
import { readFileSync, writeFileSync } from "node:fs";
import { webcrypto as crypto } from "node:crypto";

const ITERATIONS = 300000;
const code = readFileSync("private/unlock-code.txt", "utf8").trim();
const authors = JSON.parse(readFileSync("private/authors.json", "utf8"));
const games = JSON.parse(readFileSync("games.json", "utf8"));
let seal;
try { seal = JSON.parse(readFileSync("shared/seal.json", "utf8")); } catch { seal = null; }

const toBase64 = (bytes) => Buffer.from(bytes).toString("base64");
const fromBase64 = (text) => new Uint8Array(Buffer.from(text, "base64"));

const salt = seal ? fromBase64(seal.salt) : crypto.getRandomValues(new Uint8Array(16));
const base = await crypto.subtle.importKey("raw", new TextEncoder().encode(code), "PBKDF2", false, ["deriveBits"]);
const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt, iterations: ITERATIONS }, base, 256);
const key = await crypto.subtle.importKey("raw", bits, "AES-GCM", false, ["encrypt"]);

async function encrypt(text) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(text));
  return { iv: toBase64(iv), data: toBase64(new Uint8Array(data)) };
}

writeFileSync("shared/seal.json", JSON.stringify({ salt: toBase64(salt), iterations: ITERATIONS, check: await encrypt("spilplatte") }) + "\n");
for (const game of games) {
  const name = authors[game.folder];
  if (!name) throw new Error("No author in private/authors.json for " + game.folder);
  game.author = await encrypt(name);
}
writeFileSync("games.json", "[\n" + games.map((g) => "  " + JSON.stringify(g)).join(",\n") + "\n]\n");
console.log("Sealed " + games.length + " authors");
