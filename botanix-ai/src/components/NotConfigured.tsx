import { Notice } from "./ui";

export function NotConfigured({ message, help }: { message: string; help?: string[] }) {
  return (
    <Notice tone="warn">
      <p className="font-semibold">{message}</p>
      {help && (
        <ol className="mt-2 list-inside space-y-1">
          {help.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ol>
      )}
    </Notice>
  );
}
