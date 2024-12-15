import { HTTP_STATUS } from '@/enum/HTTP_SATUS';
import GetCookie from '@/hooks/getCookie';
import RemoveCookie from '@/hooks/RemoveCookie';
import SetCookie from '@/hooks/setCookie';
import axiosInstance from '@/lib/axiosIntance';
import { jwtIsValid } from '@/utils/JwtHelper';
import { jwtDecode } from 'jwt-decode';
import { useRouter } from 'next/router';
import { createContext, useContext, useEffect, useState } from 'react';
interface GlobalContextType {
  user: any;
  authToken: string;
  loading: boolean;
  isChangeData: boolean; 
  handleSetToken: (token: string) => void;
  handleGetUser: () => Promise<void>;
  handleClearSession: () => void;
  handleChangeData: (state?: boolean) => void; 
}

const GlobalContext = createContext<GlobalContextType>({} as GlobalContextType);

export const GlobalProvider = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [authToken, setAuthToken] = useState<string | null>(GetCookie('jwt'));
  const [loading, setLoading] = useState<boolean>(true);
  const [isChangeData, setChangeData] = useState<boolean>(false); 


  const handleSetToken = async (token: string) => {
    SetCookie('jwt', token); 
    setAuthToken(token);
  }

  const handleGetUser = async () => {
    setLoading(true);
    let token = GetCookie('jwt');
    if (!token) {
      setLoading(false);
      router.push('/');
      return;
    }
    try {
      const claim = jwtDecode(token) as { [key: string]: any }; 
      const { data, status } = await axiosInstance.get(`/User/${claim.id}`);
      setLoading(false);
      if (status === HTTP_STATUS.OK) {
        setUser(data.data);
      } else if(status === HTTP_STATUS.UNAUTHORIZED) {
        router.push('/'); 
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/');
    }
  };

  const handleClearSession = () => {
    RemoveCookie('jwt');
    RemoveCookie('stakeId');
    RemoveCookie('refreshToken');
    setUser(null);
    setAuthToken(null);
    router.push('/'); 
  }

  const handleChangeData = (state?: boolean) => {
    setChangeData(state); 
  }

  useEffect(() => {
    if (!jwtIsValid(authToken ?? "")) {
      console.log('token invalid'); 
      router.push('/');
    } else {
      const fetchUser = async () => {
        await handleGetUser();
      }
      fetchUser();
    }

  }, []);

  return (
    <GlobalContext.Provider
      value={{
        user,
        authToken,
        handleClearSession,
        handleSetToken,
        handleGetUser,
        handleChangeData, 
        isChangeData, 
        loading,
      }}
    >
      {children}
    </GlobalContext.Provider>
  );
};

export const useStore = () => useContext(GlobalContext);
