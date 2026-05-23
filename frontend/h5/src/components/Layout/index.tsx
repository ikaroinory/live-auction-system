import { ReactNode } from 'react';
import { BottomNav } from '../BottomNav';
import './Layout.scss';

interface LayoutProps {
  children: ReactNode;
  showBottomNav?: boolean;
}

export const Layout = ({ children, showBottomNav = true }: LayoutProps) => {
  return (
    <div className="layout-container">
      <main className="layout-content">{children}</main>
      {showBottomNav && (
        <footer className="layout-footer">
          <BottomNav />
        </footer>
      )}
    </div>
  );
};
