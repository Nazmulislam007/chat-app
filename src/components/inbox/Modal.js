import { useEffect, useState } from 'react';

import { useDispatch, useSelector } from 'react-redux';
import {
    conversationsApi,
    useAddCoversationMutation,
    // eslint-disable-next-line prettier/prettier
    useEditConversationMutation
} from '../../features/conversations/conversationApi';
import { useGetUserQuery } from '../../features/user/userApi';
import validateEmail from '../../utils/ValidateEmail';
import Error from '../ui/Error';

/* eslint-disable jsx-a11y/no-static-element-interactions */
export default function Modal({ open, openFn }) {
    const dispatch = useDispatch();
    const { user } = useSelector((state) => state.auth) || {};
    const { email: userEmail } = user || {};
    const [to, setTo] = useState('');
    const [message, setMessage] = useState('');
    const [checkUser, setCheckUser] = useState(false);
    const { data: participant } = useGetUserQuery(to, {
        skip: !checkUser,
    });

    const [responseError, setResponseError] = useState('');
    const [conversations, setConversations] = useState(undefined);
    const [addCoversation] = useAddCoversationMutation();
    const [editConversation] = useEditConversationMutation();

    useEffect(() => {
        if (participant?.length > 0 && participant[0].email !== userEmail) {
            dispatch(
                conversationsApi.endpoints.getConversation.initiate({
                    userEmail,
                    participantEmail: to,
                })
            )
                .unwrap()
                .then((data) => {
                    setConversations(data);
                })
                .catch((err) => {
                    setResponseError(err);
                });
        }
    }, [dispatch, participant, to, userEmail]);

    const debounce = (fn, delay) => {
        let timeout;
        return (...arg) => {
            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                fn(...arg);
            }, delay);
        };
    };

    const doSearch = (value) => {
        if (validateEmail(value)) {
            setCheckUser(true);
            setTo(value);
        }
    };

    const handleText = debounce(doSearch, 500);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (conversations?.length > 0 || conversations?.id) {
            editConversation({
                id: conversations.id || conversations[0].id,
                sender: userEmail,
                data: {
                    participants: `${userEmail}-${participant[0].email}`,
                    users: [user, participant[0]],
                    timestamp: new Date().getTime(),
                    message,
                },
            });
        }
        if (conversations?.length === 0) {
            addCoversation({
                sender: userEmail,
                data: {
                    participants: `${userEmail}-${participant[0].email}`,
                    users: [user, participant[0]],
                    message,
                    timestamp: new Date().getTime(),
                },
            })
                .unwrap()
                .then((data) => {
                    setConversations(data);
                });

            setCheckUser(false);
        }
        openFn(false);
    };

    return (
        open && (
            <>
                <div
                    onClick={() => openFn(false)}
                    className="fixed w-full h-full inset-0 z-10 bg-black/50 cursor-pointer"
                />
                <div className="rounded w-[400px] lg:w-[600px] space-y-8 bg-white p-10 absolute top-1/2 left-1/2 z-20 -translate-x-1/2 -translate-y-1/2">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Send message
                    </h2>
                    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                        <input type="hidden" name="remember" value="true" />
                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="to" className="sr-only">
                                    To
                                </label>
                                <input
                                    id="to"
                                    name="to"
                                    type="to"
                                    onChange={(e) => handleText(e.target.value)}
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Send to"
                                />
                            </div>
                            <div>
                                <label htmlFor="message" className="sr-only">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    type="message"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-violet-500 focus:border-violet-500 focus:z-10 sm:text-sm"
                                    placeholder="Message"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className={`${
                                    conversations === undefined ||
                                    participant?.length === 0 ||
                                    participant[0]?.email === userEmail
                                        ? 'cursor-not-allowed'
                                        : 'cursor-pointer'
                                } group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-violet-600 hover:bg-violet-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500`}
                                disabled={
                                    conversations === undefined ||
                                    participant[0]?.email === userEmail ||
                                    participant?.length === 0
                                }
                            >
                                Send Message
                            </button>
                        </div>

                        {participant?.length === 0 && <Error message="User does not exist" />}
                        {participant?.length > 0 && participant[0].email === userEmail && (
                            <Error message="Can't send messages to yourself" />
                        )}
                        {responseError && <Error message={responseError} />}
                    </form>
                </div>
            </>
        )
    );
}
