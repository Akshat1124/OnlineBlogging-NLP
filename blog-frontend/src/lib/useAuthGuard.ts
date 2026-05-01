import { useState, useCallback } from 'react';
import useAuthStore from '../store/authStore';

/**
 * Hook for guest-mode RBAC. Returns a guard function and modal state.
 *
 * Usage:
 *   const { requireAuth, guardModalProps } = useAuthGuard();
 *
 *   const handleLike = () => {
 *     if (!requireAuth('like this post')) return;
 *     // ... proceed with like
 *   };
 *
 *   return (
 *     <>
 *       <AuthGuardModal {...guardModalProps} />
 *       <button onClick={handleLike}>Like</button>
 *     </>
 *   );
 */
export function useAuthGuard() {
  const { isAuthenticated } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const [action, setAction] = useState<string | undefined>();

  const requireAuth = useCallback(
    (actionDescription?: string): boolean => {
      if (isAuthenticated) return true;
      setAction(actionDescription);
      setIsOpen(true);
      return false;
    },
    [isAuthenticated]
  );

  const guardModalProps = {
    isOpen,
    onClose: () => setIsOpen(false),
    action,
  };

  return { requireAuth, guardModalProps };
}
