import { Outlet } from 'react-router-dom';

interface PublicLayoutProps {

  children: React.ReactNode;

}

export const PublicLayout: React.FC<PublicLayoutProps> = ({ children }) => {
  return (
    <div className="macos-interface macos-app">
      {children}
      <Outlet />
    </div>
  );
}