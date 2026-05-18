export default function PageHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <section className="border-b border-coffee-100 bg-cream-100/60">
      <div className="container-base py-14 sm:py-20 lg:py-28">
        <p className="eyebrow">{eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl text-coffee-800 sm:mt-4 sm:text-5xl lg:text-6xl">
          {title}
        </h1>
        {description && (
          <p className="mt-4 max-w-2xl text-base text-coffee-600 sm:mt-5 sm:text-lg">
            {description}
          </p>
        )}
      </div>
    </section>
  );
}
