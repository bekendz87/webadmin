import { Outlet } from 'react-router-dom';
import { Sidebar } from '@/components/Layouts/Sidebar/Sidebar.component';
import { Header } from '@/components/Layouts/Header/Header.component';
interface DashboardLayoutProps {

  children: React.ReactNode;

}
export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="macos-interface macos-app flex min-h-screen">
      <Sidebar />

      <div className="w-full">
        <Header />

        <main className="isolate mx-auto w-full max-w-screen-2xl overflow-hidden p-4 md:p-6 2xl:p-10">
          <Outlet />
          {children}
        </main>
      </div>
    </div>
  );
}