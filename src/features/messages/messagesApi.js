import { io } from 'socket.io-client';
import apiSlice from '../api/apiSlice';

export const messagesApi = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getMessages: builder.query({
            query: (id) =>
                `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=1&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,

            transformResponse(apiResponse, meta) {
                const totalMsg = meta.response.headers.get('X-Total-Count');
                return {
                    data: apiResponse,
                    totalMsg,
                };
            },

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

                    socket.on('message', (data) => {
                        updateCachedData((draft) => {
                            draft.data.push(data.data);
                        });
                    });
                } catch (error) {
                    console.log(error);
                }
                await cacheEntryRemoved;
                socket.close();
            },
        }),
        getMoreMessages: builder.query({
            query: ({ id, page }) =>
                `/messages?conversationId=${id}&_sort=timestamp&_order=desc&_page=${page}&_limit=${process.env.REACT_APP_MESSAGES_PER_PAGE}`,

            async onQueryStarted({ id }, { queryFulfilled, dispatch }) {
                const messages = await queryFulfilled;
                const { data } = messages || {};

                if (data?.length > 0) {
                    dispatch(
                        // eslint-disable-next-line arrow-body-style
                        apiSlice.util.updateQueryData('getMessages', id, (draft) => {
                            return {
                                data: [...draft.data, ...data],
                                totalMsg: draft.totalMsg,
                            };
                        })
                    );
                }
            },
        }),
        addMessage: builder.mutation({
            query: (data) => ({
                url: `/messages`,
                method: 'POST',
                body: data,
            }),
        }),
    }),
});

export const { useGetMessagesQuery, useAddMessageMutation } = messagesApi;
