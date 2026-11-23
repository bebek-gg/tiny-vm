// tiny-vm: a tiny stack virtual machine for make.fun's tiny stack ISA v1.
// Runs every /input/<id>/program.bin with its input.bin, writing
// /output/<id>/stdout.bin and /output/<id>/exit.txt. Node 22, no deps.
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const I = process.env.MAKEFUN_INPUT_DIR ?? '/input';
const O = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
function run(p: Uint8Array, inp: Uint8Array): [number, Uint8Array] {
  const n = p.length, M = new Int32Array(256), S = new Int32Array(257), C = new Int32Array(64), B = new Uint8Array(65536);
  let sp = 0, cp = 0, pc = 0, ip = 0, ol = 0, st = 0;
  const fin = (e: number): [number, Uint8Array] => [e, B.subarray(0, ol)];
  for (;;) {
    if (st >= 1e6) return fin(10);
    if (pc < 0 || pc >= n) return fin(9);
    const op = p[pc];
    st++;
    switch (op) {
      case 0x00: return fin(0);
      case 0x01:
        if (pc + 2 > n) return fin(9);
        if (sp > 255) return fin(3);
        S[sp++] = (p[pc + 1] << 24) >> 24; pc += 2; break;
      case 0x02:
        if (pc + 5 > n) return fin(9);
        if (sp > 255) return fin(3);
        S[sp++] = p[pc + 1] | p[pc + 2] << 8 | p[pc + 3] << 16 | p[pc + 4] << 24; pc += 5; break;
      case 0x03:
        if (sp < 1) return fin(2);
        sp--; pc++; break;
      case 0x04:
        if (sp < 1) return fin(2);
        if (sp > 255) return fin(3);
        S[sp] = S[sp - 1]; sp++; pc++; break;
      case 0x05:
        if (sp < 2) return fin(2);
        { const t = S[sp - 1]; S[sp - 1] = S[sp - 2]; S[sp - 2] = t; }
        pc++; break;
      case 0x06:
        if (sp < 2) return fin(2);
        if (sp > 255) return fin(3);
        S[sp] = S[sp - 2]; sp++; pc++; break;
      case 0x07:
        if (sp < 3) return fin(2);
        { const t = S[sp - 3]; S[sp - 3] = S[sp - 2]; S[sp - 2] = S[sp - 1]; S[sp - 1] = t; }
        pc++; break;
      case 0x10: case 0x11: case 0x12: case 0x13: case 0x14: case 0x15: case 0x16: case 0x18: case 0x19: case 0x1a: case 0x1c: case 0x1d: case 0x1e: case 0x20: case 0x21: case 0x22: {
        if (sp < 2) return fin(2);
        const b = S[--sp], a = S[sp - 1];
        let r: number;
        if (op === 0x10) r = (a + b) | 0;
        else if (op === 0x11) r = (a - b) | 0;
        else if (op === 0x12) r = Math.imul(a, b);
        else if (op === 0x13) { if (!b) return fin(4); r = (a / b) | 0; }
        else if (op === 0x14) { if (!b) return fin(4); r = a % b; }
        else if (op === 0x15) { if (!b) return fin(4); r = Math.floor((a >>> 0) / (b >>> 0)) | 0; }
        else if (op === 0x16) { if (!b) return fin(4); r = ((a >>> 0) % (b >>> 0)) | 0; }
        else if (op === 0x18) r = a & b;
        else if (op === 0x19) r = a | b;
        else if (op === 0x1a) r = a ^ b;
        else if (op === 0x1c) r = a << b;
        else if (op === 0x1d) r = a >> b;
        else if (op === 0x1e) r = (a >>> b) | 0;
        else if (op === 0x20) r = a === b ? 1 : 0;
        else if (op === 0x21) r = a < b ? 1 : 0;
        else r = (a >>> 0) < (b >>> 0) ? 1 : 0;
        S[sp - 1] = r; pc++; break;
      }
      case 0x17:
        if (sp < 1) return fin(2);
        S[sp - 1] = (-S[sp - 1]) | 0; pc++; break;
      case 0x1b:
        if (sp < 1) return fin(2);
        S[sp - 1] = ~S[sp - 1]; pc++; break;
      case 0x30:
        if (pc + 3 > n) return fin(9);
        pc = pc + 3 + (((p[pc + 1] | p[pc + 2] << 8) << 16) >> 16); break;
      case 0x31: case 0x32: {
        if (pc + 3 > n) return fin(9);
        if (sp < 1) return fin(2);
        const off = ((p[pc + 1] | p[pc + 2] << 8) << 16) >> 16, v = S[--sp];
        pc = (op === 0x31 ? v === 0 : v !== 0) ? pc + 3 + off : pc + 3; break;
      }
      case 0x33:
        if (pc + 3 > n) return fin(9);
        if (cp >= 64) return fin(7);
        C[cp++] = pc + 3; pc = p[pc + 1] | p[pc + 2] << 8; break;
      case 0x34:
        if (cp === 0) return fin(8);
        pc = C[--cp]; break;
      case 0x40:
        if (sp < 1) return fin(2);
        { const a = S[sp - 1]; if (a < 0 || a > 255) return fin(6); S[sp - 1] = M[a]; }
        pc++; break;
      case 0x41:
        if (sp < 2) return fin(2);
        { const a = S[--sp], v = S[--sp]; if (a < 0 || a > 255) return fin(6); M[a] = v; }
        pc++; break;
      case 0x50:
        if (sp < 1) return fin(2);
        { const s = String(S[--sp]); if (ol + s.length > 65536) return fin(11); for (let i = 0; i < s.length; i++) B[ol++] = s.charCodeAt(i); }
        pc++; break;
      case 0x51:
        if (sp < 1) return fin(2);
        if (ol >= 65536) return fin(11);
        B[ol++] = S[--sp] & 255; pc++; break;
      case 0x52:
        if (sp > 255) return fin(3);
        S[sp++] = ip < inp.length ? inp[ip++] : -1; pc++; break;
      case 0x53:
        if (sp < 1) return fin(2);
        return fin(S[--sp] & 255);
      default: return fin(5);
    }
  }
}
for (const id of readdirSync(I).sort()) {
  const p = readFileSync(join(I, id, 'program.bin'));
  let inp: Uint8Array;
  try { inp = readFileSync(join(I, id, 'input.bin')); } catch { inp = new Uint8Array(0); }
  const [e, out] = run(p, inp);
  mkdirSync(join(O, id), { recursive: true });
  writeFileSync(join(O, id, 'stdout.bin'), out);
  writeFileSync(join(O, id, 'exit.txt'), String(e) + '\n');
}
