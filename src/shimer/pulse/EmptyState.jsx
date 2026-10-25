
export const EmptyState = ({ message = "No hay productos disponibles en el catalogo", onAction, actionLabel = "Recargar Catálogo" }) => {
    return (
        <div className="flex flex-col items-center justify-center py-12 px-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl text-center">
            <svg
                className="w-16 h-16 text-gray-400 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
            </svg>
            <h3 className="!text-lg font-semibold text-hiper-navy">Sin resultados</h3>
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{message}</p>

            {/* El botón solo aparece si hay una acción */}
            {onAction && (
            <button
                type="button"
                onClick={onAction}
                className="mt-4 px-4 py-2 bg-hiper-orange text-white text-sm font-semibold rounded-full hover:bg-hiper-orange-dark transition-colors focus:outline-none focus:ring-2 focus:ring-hiper-orange focus:ring-offset-2"
            >
                {actionLabel}
            </button>
            )}
        </div>
    );
};

export default EmptyState;