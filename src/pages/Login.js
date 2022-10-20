import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import logoImage from '../assets/images/logo.svg';
import Error from '../components/ui/Error';
import { useLoginMutation } from '../features/auth/authApi';

export default function Login() {
    const [input, setInput] = useState({
        email: 'test1@test.com',
        password: '1234',
    });
    const [errorMsg, setErrorMsg] = useState('');

    const [login, { data, isLoading, error }] = useLoginMutation();

    const navigate = useNavigate();

    useEffect(() => {
        if (error?.data) {
            setErrorMsg(error?.data);
        }
        if (data?.accessToken && data?.user) {
            navigate('/inbox');
        }
    }, [data, error, navigate]);

    const { email, password } = input;

    const handleChange = (e) => {
        const { name: nam, value } = e.target;
        setInput({ ...input, [nam]: value });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        setErrorMsg('');
        return login({
            email,
            password,
        });
    };
    return (
        <div className="grid place-items-center h-screen bg-[#F9FAFB">
            <div className="min-h-full flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-md w-full space-y-8">
                    <div>
                        <Link to="/">
                            <img className="mx-auto h-12 w-auto" src={logoImage} alt="d" />
                        </Link>
                        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                            Sign in to your account
                        </h2>
                    </div>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <input type="hidden" name="remember" value="true" />
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="email-address" className="sr-only">
                                    Email address
                                </label>
                                <input
                                    id="email-address"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    value={email}
                                    onChange={handleChange}
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Email address"
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">
                                    Password
                                </label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    value={password}
                                    onChange={handleChange}
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-end">
                            <div className="text-sm">
                                <Link
                                    to="/register"
                                    className="font-medium text-violet-600 hover:text-violet-500"
                                >
                                    Register
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                disabled={isLoading}
                                type="submit"
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500"
                            >
                                Sign in
                            </button>
                        </div>

                        {errorMsg && <Error message={errorMsg} />}
                    </form>
                    <div className="shadow-md shadow-blue-200 p-3">
                        <p>Available User:</p>
                        <ul className="ml-2">
                            <li>1. test@test.com</li>
                            <li>2. test1@test.com</li>
                            <li>3. test2@test.com</li>
                            <li>4. test3@test.com</li>
                            <li>test4@test.com - test13@test.com</li>
                        </ul>
                        <p>Password: 1234</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
