type PageHeaderProps = {
  title: string;
  description: string;
};

export default function PageHeader({ title, description }: PageHeaderProps) {
  return (
    <div>
      <h1 style={{ fontSize: "22px", fontWeight: 500, color: "var(--foreground)", margin: 0, lineHeight: 1.2 }}>
        {title}
      </h1>
      <p style={{ fontSize: "13px", color: "var(--muted)", marginTop: "4px" }}>
        {description}
      </p>
    </div>
  );
}
