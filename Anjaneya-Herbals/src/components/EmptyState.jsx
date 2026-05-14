const EmptyState = ({ 
  icon: Icon = Package,
  title = "No items found",
  description = "There's nothing here yet.",
  actionLabel = "Browse Products",
  actionHref = "/"
}) => {
  return (
    <div className="text-center py-12">
      <div className="w-20 h-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
        <Icon size={40} className="text-gray-400" />
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md mx-auto">{description}</p>
      <Link
        to={actionHref}
        className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        {actionLabel}
      </Link>
    </div>
  );
};

export default EmptyState;