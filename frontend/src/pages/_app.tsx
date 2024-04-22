import "@/styles/globals.css";
import Header from "@/components/headerComponents/Header";
import SideMenu from "@/components/SideMenu";
import { useEffect, useState } from "react";
import { Providers } from "@/GlobalRedux/provider";
// import './global.css';
interface PageProps {
  // Define your page props interface here if needed
}

const MyApp = ({ Component, pageProps }: { Component: any, pageProps: PageProps }) => {
  const [token, setToken] = useState<string | null>(null);
  const [needLoader, setNeedLoader] = useState(false);
  const [componentKey, setComponentKey] = useState(0); // Initialize key with 0

  useEffect(() => {
    if (localStorage.getItem('token')) {
      setToken(localStorage.getItem('token'));
    }
  }, []);

  // useEffect(() => {
  //   console.log({ needLoader })
  //   if (needLoader) {
  //      setComponentKey(prevKey => prevKey + 1);
  //   }
  //   setNeedLoader(false);
  // }, [needLoader]);

  return (
    <Providers>
       <main className="flex h-screen flex-col items-center justify-between overflow-hidden bg-bgc">
      {token && <Header />}

      <section className="mb-5 flex h-full w-screen flex-1 px-5 pr-16">
        {token &&
          <div>
            <SideMenu setNeedLoader={setNeedLoader} />
          </div>
        }
        <div className="flex flex-1">
          <div className="h-[90vh] w-full  rounded-2xl ">
            <Component {...pageProps} needLoader={needLoader} key={componentKey} />
          </div>
        </div>
      </section>
      <section>
        <div className="flex items-center">
          
        </div>
      </section>
      <></>
    </main>
    </Providers>
  );
};

export default MyApp;
