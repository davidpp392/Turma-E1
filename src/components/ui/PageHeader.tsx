interface PageHeaderProps {
  label?: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}

export default function PageHeader({ label, title, description, children }: PageHeaderProps) {
  return (
    <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {label && <p className="label-caps mb-2">{label}</p>}
        <h1 className="text-3xl font-light tracking-tight text-text-primary sm:text-4xl">{title}</h1>
        {description && (
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-text-secondary">{description}</p>
        )}
      </div>
      {children && <div className="shrink-0">{children}</div>}
    </div>
  );
}
