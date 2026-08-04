import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import SideNavbar from './side-navbar';
import MobileBottomNav from './mobile-bottom-nav';
import { Toaster } from '../ui/toaster';
import { CommandPalette } from './command-palette';
import { useAuth } from '../../hooks/useAuth';

/** Public routes render full-bleed, without the authenticated app chrome. */
const PUBLIC_ROUTES = ['/', '/login'];

type UserData = {
  avatar_url: string;
  email: string;
  email_verified: boolean;
  full_name: string;
  iss: string;
  name: string;
  picture: string;
  provider_id: string;
  sub: string;
};

type Props = {
  children: React.ReactNode;
};

const Layout = ({ children }: Props) => {
  const auth = useAuth();
  const location = useLocation();
  const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname);

  // Memoize the initial user data structure
  const initialUserData: UserData = useMemo(
    () => ({
      avatar_url: '',
      email: '',
      email_verified: false,
      full_name: '',
      iss: '',
      name: '',
      picture: '',
      provider_id: '',
      sub: ''
    }),
    []
  );

  const [loggedInUserData, setLoggedInUserData] = React.useState<UserData>(initialUserData);

  // Memoize the user data to prevent unnecessary re-renders
  const userData = useMemo(() => {
    if (auth.user && 'user_metadata' in auth.user && auth.user.user_metadata) {
      return {
        ...initialUserData,
        ...auth.user.user_metadata
      } as UserData;
    }
    return initialUserData;
  }, [auth.user, initialUserData]);

  // Update user data only when auth.user changes
  React.useEffect(() => {
    setLoggedInUserData(userData);
  }, [userData]);

  // Public marketing / auth pages render edge-to-edge without app navigation.
  if (isPublicRoute) {
    return (
      <>
        {children}
        <Toaster />
      </>
    );
  }

  return (
    <>
      <header>
        <SideNavbar userData={loggedInUserData} />
      </header>
      <div className="flex justify-center lg:ml-[5rem] pt-1 pb-2 px-4 sm:px-6">
        <div className="flex w-full lg:mt-[0rem] justify-center max-w-screen-3xl pb-20 lg:pb-2">
          {children}
        </div>
        <Toaster />
        <CommandPalette />
      </div>
      <MobileBottomNav />
    </>
  );
};

export default Layout;
