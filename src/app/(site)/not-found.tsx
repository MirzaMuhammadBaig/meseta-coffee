import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section">
      <div className="container-base text-center">
        <p className="eyebrow">404</p>
        <h1 className="mt-4 font-display text-5xl text-coffee-800 sm:text-6xl">
          That page brewed away.
        </h1>
        <p className="mx-auto mt-4 max-w-md text-coffee-600">
          The page you are looking for doesn't exist, but we have coffee
          waiting for you.
        </p>
        <Link href="/" className="btn-primary mt-8 inline-flex">
          Back home
        </Link>
      </div>
    </section>
  );
}
