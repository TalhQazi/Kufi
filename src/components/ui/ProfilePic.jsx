import React from 'react';
import { FiUser } from 'react-icons/fi';

const ProfilePic = ({
    user,
    size = "md",
    className = "",
    showBorder = true
}) => {
    const imageUrl = user?.profileImage || user?.avatar || user?.imageUrl;
    const name = user?.fullName || user?.name || '';

    const sizeClasses = {
        xs: "w-6 h-6 text-[8px]",
        sm: "w-8 h-8 text-[10px]",
        md: "w-10 h-10 text-xs",
        lg: "w-16 h-16 text-base",
        xl: "w-20 h-20 text-xl",
        "2xl": "w-24 h-24 text-2xl"
    };

    const iconSizes = {
        xs: 12,
        sm: 16,
        md: 20,
        lg: 32,
        xl: 40,
        "2xl": 48
    };

    const initials = name
        ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '';

    const baseClasses = `rounded-full flex items-center justify-center overflow-hidden shrink-0 ${showBorder ? 'border-2 border-white shadow-sm' : ''} ${sizeClasses[size] || size} ${className}`;

    if (imageUrl) {
        return (
            <div className={baseClasses}>
                <img
                    src={imageUrl}
                    alt={name || "Profile"}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = "/assets/profile-avatar.jpeg";
                    }}
                />
            </div>
        );
    }

    return (
        <div className={`${baseClasses} bg-[#A67C52] text-white font-bold`}>
            {initials || <FiUser size={iconSizes[size] || 20} />}
        </div>
    );
};

export default ProfilePic;
