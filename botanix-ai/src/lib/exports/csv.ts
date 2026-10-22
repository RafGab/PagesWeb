// CSV compatible con Excel (BOM UTF-8, separador «;» habitual en configuraciones europeas)
// y protegido frente a inyección de fórmulas.
export function toCsv(rows: (string | number | null | undefined)[][], sep = ";"): string {
  const cell = (v: string | number | null | undefined) => {
    let s = v === null || v === undefined ? "" : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`;
    return /[";\n\r,]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return "\uFEFF" + rows.map((r) => r.map(cell).join(sep)).join("\r\n") + "\r\n";
}
