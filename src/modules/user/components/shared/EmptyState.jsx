import { Link } from 'react-router-dom';
import '../../../../styles/pages/userProfile.css';

/**
 * EmptyState Component
 *
 * Displays a friendly message when there's no data to show
 *
 * @param {Object} props - Component props
 * @param {string} props.icon - Bootstrap icon class (without bi- prefix)
 * @param {string} props.title - Title message
 * @param {string} props.message - Explanatory message
 * @param {string} props.actionLink - Where the button should link to (optional)
 * @param {string} props.actionText - Text for the action button (optional)
 */
export const EmptyState = ({
                             icon,
                             title,
                             message,
                             actionLink,
                             actionText
                           }) => {
  return (
    <div className="text-center py-5">
      <i className={`bi bi-${icon} fs-1 text-muted`}></i>
      <h5 className="mt-3">{title}</h5>
      <p className="text-muted">{message}</p>

      {actionLink && actionText && (
        <Link to={actionLink} className="btn btn-green-3 text-white mt-2">
          {actionText}
        </Link>
      )}
    </div>
  );
};