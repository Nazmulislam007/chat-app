/* eslint-disable eqeqeq */
import { io } from 'socket.io-client';
import apiSlice from '../api/apiSlice';
import { messagesApi } from '../messages/messagesApi';

export const conversationsApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getConversations: builder.query({
            query: (email) =>
                `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
            transformResponse(apiResponse, meta) {
                const totalCount = meta.response.headers.get('X-Total-Count');
                return {
                    data: apiResponse,
                    totalCount,
                };
            },
            // eslint-disable-next-line no-unused-vars
            async onCacheEntryAdded(arg, { updateCachedData, cacheDataLoaded, cacheEntryRemoved }) {
                const socket = io(process.env.REACT_APP_API_URL, {
                    reconnectionDelay: 1000,
                    reconnection: true,
                    reconnectionAttemps: 10,
                    transports: ['websocket'],
                    agent: false,
                    upgrade: false,
                    rejectUnauthorized: false,
                });

                try {
                    await cacheDataLoaded;

                    socket.on('conversation', (data) => {
                        updateCachedData((draft) => {
                            const conversation = draft?.data?.find((d) => d.id == data?.data?.id);

                            if (conversation?.id) {
                                conversation.message = data?.data?.message;
                                conversation.timestamp = data?.data?.timestamp;
                            } else {
                                draft?.data?.push(data?.data);
                            }
                        });
                    });
                } catch (error) {
                    console.log(error);
                }
                await cacheEntryRemoved;
                socket.close();
            },
        }),
        getMoreConversaions: builder.query({
            query: ({ email, page }) =>
                `/conversations?participants_like=${email}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_CONVERSATIONS_PER_PAGE}`,
            async onQueryStarted({ email }, { queryFulfilled, dispatch }) {
                const conversations = await queryFulfilled;
                const { data } = conversations || {};

                if (data?.length > 0) {
                    dispatch(
                        apiSlice.util.updateQueryData('getConversations', email, (draft) => ({
                            data: [...draft.data, ...conversations.data],
                            totalCount: draft.totalCount,
                        }))
                    );
                }
            },
        }),
        getConversation: builder.query({
            query: ({ userEmail, participantEmail }) =>
                `/conversations?participants_like=${userEmail}-${participantEmail}&&participants_like=${participantEmail}-${userEmail}`,
        }),
        addCoversation: builder.mutation({
            query: ({ data }) => ({
                url: '/conversations',
                method: 'POST',
                body: data,
            }),
            async onQueryStarted(arg, { queryFulfilled, dispatch }) {
                const { sender, data } = arg || {};

                const conversation = await (await queryFulfilled).data;

                if (conversation?.id) {
                    const { users } = data;
                    const senderEmail = users.find((user) => user.email === sender);
                    const receiverEmail = users.find((user) => user.email !== sender);

                    dispatch(
                        messagesApi.endpoints.addMessage.initiate({
                            conversationId: conversation.id,
                            message: data.message,
                            timestamp: data.timestamp,
                            sender: senderEmail,
                            receiver: receiverEmail,
                        })
                    );

                    // dispatch(
                    //     apiSlice.util.updateQueryData('getConversations', sender, (draft) => {
                    //         draft.push({ id: res.conversationId, ...data });
                    //     })
                    // );
                }
            },
        }),
        editConversation: builder.mutation({
            query: ({ id, data }) => ({
                url: `/conversations/${id}`,
                method: 'PATCH',
                body: data,
            }),
            async onQueryStarted({ id, sender, data }, { queryFulfilled, dispatch }) {
                const updateCache = dispatch(
                    apiSlice.util.updateQueryData('getConversations', sender, (draft) => {
                        const draftConversation = draft.data.find((c) => c.id == id);
                        draftConversation.message = data.message;
                        draftConversation.timestamp = data.timestamp;
                    })
                );

                try {
                    const conversation = await (await queryFulfilled).data;

                    if (conversation?.id) {
                        const { users } = data;
                        const senderEmail = users.find((user) => user.email === sender);
                        const receiverEmail = users.find((user) => user.email !== sender);
                        dispatch(
                            messagesApi.endpoints.addMessage.initiate({
                                conversationId: conversation.id,
                                message: data.message,
                                timestamp: data.timestamp,
                                sender: senderEmail,
                                receiver: receiverEmail,
                            })
                        );

                        // dispatch(
                        //     apiSlice.util.updateQueryData(
                        //         'getMessages',
                        //         res.conversationId.toString(),
                        //         (draft) => {
                        //             draft.push(res);
                        //         }
                        //     )
                        // );
                    }
                } catch (err) {
                    updateCache.undo();
                }
            },
        }),
    }),
});

export const {
    useGetConversationsQuery,
    useAddCoversationMutation,
    useEditConversationMutation,
    useGetConversationQuery,
    useGetMoreConversaionsQuery,
} = conversationsApi;
