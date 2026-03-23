type PageHeaderProps = {
  title: string;
  description: string;
};

export default function PageHeader({
  title,
  description,
}: PageHeaderProps) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-sm dark:bg-gray-900">
      <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
        {title}
      </h1>
      <p className="mt-2 text-gray-500 dark:text-gray-400">{description}</p>
    </div>
  );
}