import type { Util } from "./types/Util";

export function getUtil(): Util {
  return objParse(String(java.get("util")));
}

export function objStringify(obj: any): string {
  return JSON.stringify(obj, (n, v) => {
    if (typeof v === "function") return v.toString();
    return v;
  });
}

export function objParse(obj: string): any {
  return JSON.parse(obj, (n, v) => {
    if (typeof v === "string" && v.match("()")) {
      return eval(`(${v})`);
    }
    return v;
  });
}