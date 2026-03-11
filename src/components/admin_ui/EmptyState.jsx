import { InformationCircleIcon, PlusIcon } from "@heroicons/react/24/outline";

export default function EmptyState({ title, description, buttonText, onButtonClick }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-8 sm:p-12 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-full mb-4 sm:mb-6">
        <InformationCircleIcon className="w-8 h-8 sm:w-10 sm:h-10 text-gray-400" />
      </div>
      <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-500 mb-6 max-w-md mx-auto">{description}</p>
      <button
        onClick={onButtonClick}
        className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-primary-gradient text-white font-medium text-sm rounded-lg hover:bg-primary-gradient-hover focus:outline-none focus:ring-2 focus:ring-orange-400 focus:ring-offset-2 transition-all duration-200 shadow-sm hover:shadow-md"
      >
        <PlusIcon className="w-5 h-5" />
        {buttonText}
      </button>
    </div>
  );
}
