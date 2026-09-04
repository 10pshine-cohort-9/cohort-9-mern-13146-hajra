import PropTypes from 'prop-types';

const ProfileSection = ({ profilePicUrl, user, onClick, isCollapsed = false, variant = 'navbar' }) => {
  const getStyles = () => {
    if (variant === 'navbar') {
      return {
        container: "flex items-center gap-2 cursor-pointer p-1.5 lg:p-3 rounded-2xl hover:bg-black/5 transition-all group shrink-0",
        avatar: "w-10 h-10 lg:w-11 lg:h-11 rounded-full object-cover border-2 border-gray-300 shadow-sm shrink-0",
        avatarFallback: "w-10 h-10 lg:w-11 lg:h-11 rounded-full bg-[#7C77C6]/20 flex items-center justify-center font-bold text-sm text-[#7C77C6] shrink-0",
        name: "text-base lg:text-xl font-bold text-[#7570b8] group-hover:underline truncate max-w-[120px]",
        nameContainer: "text-right hidden sm:block items-center justify-center gap-2"
      };
    } else {
      return {
        container: `flex items-center gap-4 mb-4 cursor-pointer p-2 rounded-xl hover:bg-white/10 transition-all group w-full ${isCollapsed ? "lg:justify-center" : ""}`,
        avatar: "w-11 h-11 rounded-full object-cover border-2 border-white/40 shadow-sm shrink-0",
        avatarFallback: "w-11 h-11 rounded-full bg-white/30 flex items-center justify-center font-bold text-base text-white shrink-0",
        name: "text-base font-bold text-white truncate group-hover:underline",
        nameContainer: `truncate ${isCollapsed ? "lg:hidden" : ""}`,
        email: "text-xs text-purple-200 truncate"
      };
    }
  };

  const styles = getStyles();

  return (
    <button
      type="button"
      onClick={onClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
      className={styles.container}
      title="Go to Profile"
    >
      {profilePicUrl ? (
        <img
          src={profilePicUrl}
          alt="Profile"
          className={styles.avatar}
        />
      ) : (
        <div className={styles.avatarFallback}>
          {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
        </div>
      )}
      
      <div className={styles.nameContainer}>
        <p className={styles.name}>
          {user?.name || "User"}
        </p>
        {variant === 'sidebar' && (
          <p className={styles.email}>
            {user?.email || ""}
          </p>
        )}
      </div>
    </button>
  );
};

ProfileSection.propTypes = {
  profilePicUrl: PropTypes.string,
  user: PropTypes.shape({
    name: PropTypes.string,
    email: PropTypes.string,
  }),
  onClick: PropTypes.func.isRequired,
  isCollapsed: PropTypes.bool,
  variant: PropTypes.oneOf(['navbar', 'sidebar']),
};

ProfileSection.defaultProps = {
  isCollapsed: false,
  variant: 'navbar',
};

export default ProfileSection;