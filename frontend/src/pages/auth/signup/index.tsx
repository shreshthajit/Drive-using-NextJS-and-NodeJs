'use client';

import { useForm } from 'react-hook-form';
import { useState } from 'react';
import ReactModal from 'react-modal';
import Modal from '@mui/material/Modal';
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

// import GoogleSignInButton from '../GoogleSignInButton';

const FormSchema = z
  .object({
    username: z.string().min(1, 'Username is required').max(100),
    email: z.string().min(1, 'Email is required').email('Invalid email'),
    password: z
      .string()
      .min(1, 'Password is required')
      .min(6, 'Password must have than 8 characters'),
    confirmPassword: z.string().min(1, 'Password confirmation is required'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Password do not match',
  });

export default function SignUp() {

  const router = useRouter();
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpValue, setOtpValue] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const [modalMessage, setModalMessage] = useState('');

  const [userExist,setUserExist]=useState(false);


  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      username: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  const openOtpModal = () => setShowOtpModal(true);
  const closeOtpModal = () => setShowOtpModal(false);



  const onSubmit = async (values: z.infer<typeof FormSchema>) => {
    // if(values.password!==values.confirmPassword){

    // }


    console.log("baseurl", process.env.NEXTAUTH_URL);
    const otpResponse = await fetch(`http://localhost:8888/users/signup-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: values.email,
      })
    })

    //console.log("This is optResponse",otpResponse);

    if (otpResponse.ok) {
      setUserExist(false);
      openOtpModal();
    }
    else {
      setUserExist(true);
      setModalMessage('A user with this email already exists. Please sign in instead.');
      setShowOtpModal(false);
    }

    setEmail(values.email);
    setName(values.username);
    setPassword(values.password);

    console.log("This is response", otpResponse);

    // if(response.ok){
    //   router.push('/sign-in');
    // }
    // else{
    //   console.log("Registration failed");
    // }

    console.log(values);
  };

  const handleOtpChange = (event: any) => {
    setOtpValue(event.target.value);

  };

  const handleFormSubmit = async (event: any) => {
    event.preventDefault();
    const response = await fetch(`http://localhost:8888/users/verify-account/${otpValue}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fullname: name,
        email: email,
        password: password,
        user_type: "user"
      })
    })

    closeOtpModal();
    if (response.ok) {
      router.push('/auth/signin');
    }
    console.log("THis is signupResponse", response);
  };

  const handleCloseModal = () => {
    setShowOtpModal(false);
    setModalMessage('');
  };

  return (
    <Form  {...form} >
    {!userExist && showOtpModal && 
    <ReactModal
     isOpen={showOtpModal}
     onRequestClose={closeOtpModal}
     className="fixed inset-0 flex items-center justify-center bg-gray-800 bg-opacity-50"
   >
     <div className="bg-white w-full max-w-md p-6 rounded-lg">
       <h2 className="text-lg font-semibold mb-4">Enter OTP</h2>
       <form onSubmit={handleFormSubmit}>
         <input
           type="text"
           value={otpValue}
           onChange={handleOtpChange}
           placeholder="Enter OTP"
           className="w-full px-4 py-2 border border-gray-300 rounded-md mb-4"
         />
         <div className="flex justify-between">
           <button onClick={closeOtpModal} className="px-4 py-2 bg-gray-400 text-white rounded-md mr-2">Cancel</button>
           <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md">Submit</button>
         </div>
       </form>
     </div>
   </ReactModal>
    }


   {userExist && modalMessage.length && 
   <ReactModal
     isOpen={!showOtpModal}
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

<form onSubmit={form.handleSubmit(onSubmit)} style={{ padding: '50px' }} className='w-full max-w-lg mx-auto'>
      <div className='space-y-6'>
        <FormField
          control={form.control}
          name='username'
          render={({ field }) => (
            <div>
              <FormLabel className='block mb-1 text-sm text-green-600'>Full Name</FormLabel>
              <FormControl>
                <Input placeholder='Enter your full name' {...field} className='w-full px-4 py-2 border border-green-400 rounded-md focus:outline-none focus:border-green-600' />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        <FormField
          control={form.control}
          name='email'
          render={({ field }) => (
            <div>
              <FormLabel className='block mb-1 text-sm text-blue-600'>Email</FormLabel>
              <FormControl>
                <Input placeholder='Enter your email' {...field} className='w-full px-4 py-2 border border-blue-400 rounded-md focus:outline-none focus:border-blue-600' />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        <FormField
          control={form.control}
          name='password'
          render={({ field }) => (
            <div>
              <FormLabel className='block mb-1 text-sm text-purple-600'>Password</FormLabel>
              <FormControl>
                <Input type='password' placeholder='Enter your password' {...field} className='w-full px-4 py-2 border border-purple-400 rounded-md focus:outline-none focus:border-purple-600' />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
        <FormField
          control={form.control}
          name='confirmPassword'
          render={({ field }) => (
            <div>
              <FormLabel className='block mb-1 text-sm text-red-600'>Confirm Password</FormLabel>
              <FormControl>
                <Input type='password' placeholder='Confirm your password' {...field} className='w-full px-4 py-2 border border-red-400 rounded-md focus:outline-none focus:border-red-600' />
              </FormControl>
              <FormMessage />
            </div>
          )}
        />
      </div>
      <Button type='submit' className='w-full mt-6 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-md hover:bg-gradient-to-r hover:from-pink-600 hover:to-red-600 transition duration-300 ease-in-out focus:outline-none'>
        Sign up
      </Button>
    </form>

















   {/* <div className='mx-auto my-8 flex w-full items-center justify-evenly before:mr-4 before:block before:h-px before:flex-grow before:bg-gray-300 after:ml-4 after:block after:h-px after:flex-grow after:bg-gray-300'></div>
   <p className='text-center text-sm text-gray-600 mt-2'>
     If you don't have an account, please&nbsp;
     <Link href='/auth/signin' className='text-blue-500 hover:underline'>Sign in</Link>
   </p> */}
   


   <div className="mx-auto my-4 flex items-center justify-center">
        <span className="text-gray-600 text-xs">-----</span>
        <span className="mx-4 text-gray-600 text-xs">or</span>
        <span className="text-gray-600 text-xs">-----</span>
      </div>

      <p className="text-center text-sm text-gray-600 mt-2">
        If you don't have an account, please&nbsp;
        <Link href='/auth/signin' className='text-blue-500 hover:underline'>Sign in</Link>
      </p>
 </Form>
  );
};
