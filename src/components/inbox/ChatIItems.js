import gravatarUrl from 'gravatar-url';
import moment from 'moment';
import { useEffect, useState } from 'react';

import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import {
    conversationsApi,
    // eslint-disable-next-line prettier/prettier
    useGetConversationsQuery
} from '../../features/conversations/conversationApi';
import Error from '../ui/Error';
import ChatItem from './ChatItem';

export default function ChatItems() {
    const { user } = useSelector((state) => state.auth) || {};
    const { email } = user || {};
    const dispatch = useDispatch();
    const { data, isLoading, isError, error } = useGetConversationsQuery(email) || {};
    const { data: conversations, totalCount } = data || {};
    const [checkMore, setCheckMore] = useState(true);
    const [page, setPage] = useState(1);

    const fetchData = () => {
        setPage((prev) => prev + 1);
    };

    useEffect(() => {
        if (page > 1) {
            dispatch(conversationsApi.endpoints.getMoreConversaions.initiate({ email, page }));
        }
    }, [dispatch, email, page]);

    useEffect(() => {
        if (totalCount > 0) {
            const more =
                Math.ceil(totalCount / Number(process.env.REACT_APP_CONVERSATIONS_PER_PAGE)) > page;
            setCheckMore(more);
        }
    }, [page, setCheckMore, totalCount]);

    let content = null;

    if (isLoading) content = <li className="m-2 text-center">Loading...</li>;
    if (!isLoading && isError)
        content = (
            <li className="m-2 text-center">
                <Error message={error?.data} />
            </li>
        );
    if (!isLoading && !isError && conversations?.length === 0)
        content = <li className="m-2 text-center">No conversations found!</li>;
    if (!isLoading && !isError && conversations?.length > 0)
        content = (
            <InfiniteScroll
                dataLength={conversations?.length}
                next={fetchData}
                hasMore={checkMore}
                loader={<h4>Loading...</h4>}
                height={window.innerHeight - 127}
            >
                {conversations
                    ?.slice()
                    ?.sort((a, b) => b.timestamp - a.timestamp)
                    ?.map((conversation) => {
                        const { timestamp, message, id } = conversation || {};
                        const partnerInfo = conversation?.users?.find(
                            (userInfo) => userInfo.email !== email
                        );

                        return (
                            <li key={id}>
                                <Link to={`/inbox/${id}`}>
                                    <ChatItem
                                        avatar={gravatarUrl(partnerInfo?.email, {
                                            size: 80,
                                        })}
                                        name={partnerInfo?.name}
                                        lastMessage={message}
                                        lastTime={moment(timestamp).fromNow()}
                                    />
                                </Link>
                            </li>
                        );
                    })}
            </InfiniteScroll>
        );

    return <ul>{content}</ul>;
}
