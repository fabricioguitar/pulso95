import React from 'react';

interface UserAvatarProps {
  name: string;
  avatarUrl?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = ''
}) => {
  const getInitials = (fullName: string) => {
    if (!fullName) return 'U';
    const trimmed = fullName.trim();
    if (trimmed.toLowerCase().includes('fabrício') || trimmed.toLowerCase().includes('fabricio')) {
      return 'FS';
    }
    const parts = trimmed.split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return trimmed.substring(0, 1).toUpperCase();
  };

  const sizeClasses = {
    xs: 'w-5 h-5 text-[10px]',
    sm: 'w-7 h-7 text-xs',
    md: 'w-9 h-9 text-xs',
    lg: 'w-12 h-12 text-sm',
    xl: 'w-16 h-16 text-base'
  }[size];

  // Specific gradient colors per known test users
  const getBgGradient = (userName: string) => {
    const lower = userName.toLowerCase();
    if (lower.includes('fabrício') || lower.includes('fabricio')) {
      return 'bg-gradient-to-tr from-amber-600 via-orange-600 to-amber-700';
    }
    if (lower.includes('antony')) {
      return 'bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-700';
    }
    if (lower.includes('renata')) {
      return 'bg-gradient-to-tr from-purple-600 via-pink-600 to-indigo-700';
    }
    return 'bg-gradient-to-tr from-slate-700 via-slate-600 to-slate-800';
  };

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses} rounded-xl object-cover ring-1 ring-white/10 shrink-0 ${className}`}
      />
    );
  }

  return (
    <div
      className={`${sizeClasses} ${getBgGradient(name)} rounded-xl text-white font-bold flex items-center justify-center tracking-tight shadow-sm shrink-0 select-none ${className}`}
    >
      {getInitials(name)}
    </div>
  );
};
