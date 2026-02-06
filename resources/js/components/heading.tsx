export default function Heading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-4 space-y-0.5">
      <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
      {description && <p className="text-md text-muted-foreground">{description}</p>}
    </div>
  )
}
