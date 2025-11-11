import { NavLink as RouterNavLink, NavLinkProps } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CustomNavLinkProps extends NavLinkProps {
  activeClassName?: string;
}

const NavLink = ({ className, activeClassName, ...props }: CustomNavLinkProps) => {
  return (
    <RouterNavLink
      {...props}
      className={(navProps) =>
        cn(
          typeof className === 'function' ? className(navProps) : className,
          navProps.isActive && activeClassName
        )
      }
    />
  );
};

export default NavLink;
