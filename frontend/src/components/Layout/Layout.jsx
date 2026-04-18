import { Outlet, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './Sidebar';
import RightSidebar from './RightSidebar';

export default function Layout() {
  const location = useLocation();
  const hideSidebars = 
    location.pathname.startsWith('/profile') || 
    location.pathname.startsWith('/reels') || 
    location.pathname.startsWith('/stories') || 
    location.pathname.startsWith('/photo') || 
    location.pathname.startsWith('/messages') || 
    location.pathname.startsWith('/settings');

  const isReelsPage = location.pathname.startsWith('/reels');
  const isMessagesPage = location.pathname.startsWith('/messages');
  const isSettingsPage = location.pathname.startsWith('/settings');

  return (
    <>
      <Navbar />
      <div className="flex bg-(--bg-primary) min-h-[calc(100vh-56px)]">
        {/* {hideSidebars && <Sidebar />} */}
        <Sidebar />
        <main className={`flex-1 min-h-[calc(100vh-56px)] overflow-x-hidden ${isMessagesPage || isSettingsPage ? '' : 'xl:p-4'} ${isReelsPage ? 'bg-black' : ''}`}>
          <Outlet />
        </main>
        <RightSidebar />
        {/* {!hideSidebars && <RightSidebar />} */}
      </div>
    </>
  );
}
