'use client';

import { useForm } from 'react-hook-form';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../../../components/ui/form';
import * as z from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Input } from '../../../components/ui/input';
import { Button } from '../../../components/ui/button';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import ReactModal from 'react-modal';

// import GoogleSignInButton from '../GoogleSignInButton';

const FormSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email'),
  password: z
    .string()
    .min(1, 'Password is required')
    .min(6, 'Password must have than 8 characters'),
});

export default function SignIn() {
  const router = useRouter();

  const [modalMessage, setModalMessage] = useState('');
  const [userExist, setUserExist] = useState(false);

  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(true);



  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  //const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null; 

  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    //console.log("baseurl", process.env.NEXTAUTH_URL);
    //const token = localStorage.getItem('token');

    const response = await fetch(`http://localhost:8888/users/login-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: values.email,
        password: values.password
      })
    })

    console.log("This is response", response);
    if (response.ok) {
      setUserExist(true);
    }
    else {
      setUserExist(false);
      setModalMessage('Invalid username of password');
      return;
    }

    const data = await response.json();
    console.log("This is reponse from backend", data);
    const Token = data.data.token; // Assuming the token is returned in the response data
    setToken(Token);

    // Store the token in localStorage
    localStorage.setItem('token', Token);
    localStorage.setItem('email', data.data.user.email);

    //router.push('/drive/my-drive');
    window.location.href='/drive/my-drive';

  };

  useEffect(() => {
    const tokenFromStorage = localStorage.getItem('token');
    if (tokenFromStorage) {
        setToken(tokenFromStorage);
    }
    setIsLoading(false); // Mark loading as complete after setting the token
}, []);


  const handleCloseModal = () => {
    setModalMessage('');
  };

  
  if (isLoading) {
    return <div>Loading...</div>; 
}


  return (
    <>{!token && <Form {...form}>
      {!userExist && modalMessage?.length > 0 && <ReactModal
        isOpen={!userExist}
        onRequestClose={handleCloseModal}
        className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
      >
        <div className="bg-white w-full max-w-md p-6 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Warning</h2>
          <p>{modalMessage}</p>
          <button onClick={handleCloseModal} className="px-4 py-2 bg-blue-500 text-white rounded-md mt-4">OK</button>
        </div>
      </ReactModal>

      }
<form onSubmit={form.handleSubmit(onSubmit)} style={{ padding: '30px', paddingTop: '220px', alignItems: 'center' }} className="w-full max-w-md mx-auto">
  <div className="space-y-6">
    <FormField
      control={form.control}
      name="email"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-blue-600">Email</FormLabel>
          <FormControl>
            <Input placeholder="mail@example.com" {...field} className="w-full px-4 py-2 border border-blue-400 rounded-md focus:outline-none focus:border-blue-600" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <FormField
      control={form.control}
      name="password"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-green-600">Password</FormLabel>
          <FormControl>
            <Input type="password" placeholder="Enter your password" {...field} className="w-full px-4 py-2 border border-green-400 rounded-md focus:outline-none focus:border-green-600" />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  </div>
  <Button type="submit" className="w-full mt-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-md hover:bg-gradient-to-r hover:from-pink-600 hover:to-red-600 transition duration-300 ease-in-out focus:outline-none">
    Sign in
  </Button>
</form>









      {/* <div className="mx-auto my-4 flex w-full items-center justify-evenly">
        <div className="mr-4 h-px flex-grow bg-stone-400"></div>
        <span className="text-gray-600">or</span>
        <div className="ml-4 h-px flex-grow bg-stone-400"></div>
      </div>
      <p className="text-center text-sm text-gray-600 mt-2">
        If you don't have an account, please{" "}
        <Link className="text-blue-500 hover:underline" href="/auth/signup">
          Sign up
        </Link>
      </p> */}
      
      <div className="mx-auto my-4 flex items-center justify-center">
        <span className="text-gray-600 text-xs">-----</span>
        <span className="mx-4 text-gray-600 text-xs">or</span>
        <span className="text-gray-600 text-xs">-----</span>
      </div>

      <p className="text-center text-sm text-gray-600 mt-2">
        Don't have an account yet?{" "}
        <Link className="text-blue-500 hover:underline" href="/auth/signup">
          Sign up here
        </Link>
      </p>

    </Form>}</>



  );
};

