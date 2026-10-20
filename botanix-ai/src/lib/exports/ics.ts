// Generador iCalendar (RFC 5545) mínimo: eventos de día completo con recurrencia opcional.
export interface IcsEvent {
  uid: string;
  title: string;
  description?: string;
  date: Date; // día de inicio (UTC)
  rrule?: string; // p. ej. "FREQ=DAILY;INTERVAL=7" o "FREQ=YEARLY"
}

const esc = (s: string) => s.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\;");
const ymd = (d: Date) => d.toISOString().slice(0, 10).replace(/-/g, "");

// Las líneas de más de 75 octetos se pliegan con CRLF + espacio.
function fold(line: string) {
  const bytes = Buffer.from(line, "utf8");
  if (bytes.length <= 75) return line;
  const parts: string[] = [];
  let current = "";
  for (const ch of line) {
    if (Buffer.byteLength(current + ch, "utf8") > (parts.length ? 74 : 75)) {
      parts.push(current);
      current = ch;
    } else current += ch;
  }
  parts.push(current);
  return parts.join("\r\n ");
}

export function toIcs(calendarName: string, events: IcsEvent[], now = new Date()): string {
  const stamp = now.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Botanix AI//ES", "CALSCALE:GREGORIAN", `X-WR-CALNAME:${esc(calendarName)}`];
  for (const e of events) {
    const end = new Date(e.date.getTime() + 86_400_000);
    lines.push("BEGIN:VEVENT", `UID:${e.uid}@botanix`, `DTSTAMP:${stamp}`, `DTSTART;VALUE=DATE:${ymd(e.date)}`, `DTEND;VALUE=DATE:${ymd(end)}`, `SUMMARY:${esc(e.title)}`);
    if (e.description) lines.push(`DESCRIPTION:${esc(e.description)}`);
    if (e.rrule) lines.push(`RRULE:${e.rrule}`);
    lines.push("END:VEVENT");
  }
  lines.push("END:VCALENDAR");
  return lines.map(fold).join("\r\n") + "\r\n";
}
