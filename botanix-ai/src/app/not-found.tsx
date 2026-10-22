import Link from "next/link";
export default function NotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-4xl font-semibold">404</h1>
      <p className="muted mt-2">Esta página no existe o no tienes acceso. · This page does not exist or you have no access.</p>
      <Link href="/" className="btn btn-primary mt-6">Botanix</Link>
    </div>
  );
}
