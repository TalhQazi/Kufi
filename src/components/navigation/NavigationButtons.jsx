import React from 'react'
import { FiArrowLeft, FiArrowRight } from 'react-icons/fi'

export default function NavigationButtons({ onBack, onForward, canGoBack, canGoForward }) {
    return (
        <div className="flex items-center gap-2">
            <button
                onClick={onBack}
                disabled={!canGoBack}
                className={`p-2 rounded-lg border transition-all ${canGoBack
                        ? 'border-gray-300 hover:border-[#A67C52] hover:bg-[#A67C52]/10 text-gray-700 hover:text-[#A67C52] cursor-pointer'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                title="Go back"
            >
                <FiArrowLeft size={20} />
            </button>
            <button
                onClick={onForward}
                disabled={!canGoForward}
                className={`p-2 rounded-lg border transition-all ${canGoForward
                        ? 'border-gray-300 hover:border-[#A67C52] hover:bg-[#A67C52]/10 text-gray-700 hover:text-[#A67C52] cursor-pointer'
                        : 'border-gray-200 text-gray-300 cursor-not-allowed'
                    }`}
                title="Go forward"
            >
                <FiArrowRight size={20} />
            </button>
        </div>
    )
}
