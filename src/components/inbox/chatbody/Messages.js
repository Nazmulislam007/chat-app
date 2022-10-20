/* eslint-disable eqeqeq */
import { useEffect, useState } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { messagesApi } from '../../../features/messages/messagesApi';
import Message from './Message';

export default function Messages({ messages, totalMsg }) {
    const { id: uid } = useParams();
    const { user } = useSelector((state) => state.auth) || {};
    const dispatch = useDispatch();
    const { email } = user || {};

    const totalPage = Math.ceil(totalMsg / Number(process.env.REACT_APP_MESSAGES_PER_PAGE));

    const [page, setPage] = useState(1);
    const [checkMore, setCheckMore] = useState(true);

    const fetchData = () => {
        setPage((prev) => prev + 1);
    };

    useEffect(() => {
        if (page > 1) {
            dispatch(messagesApi.endpoints.getMoreMessages.initiate({ id: uid, page }));
        }
    }, [dispatch, uid, page, totalPage]);

    useEffect(() => {
        if (totalMsg > 0) {
            const check = totalPage > page;
            setCheckMore(check);
        }
    }, [page, totalMsg, totalPage]);

    return (
        <div className="relative w-full h-[calc(100vh_-_197px)] pl-6 pt-6 overflow-y-hidden flex flex-col-reverse">
            <ul
                id="scrollableDiv"
                style={{
                    height: 'calc(100vh - 197px)',
                    overflow: 'auto',
                    display: 'flex',
                    flexDirection: 'column-reverse',
                }}
            >
                <InfiniteScroll
                    dataLength={messages?.length}
                    next={fetchData}
                    hasMore={checkMore}
                    loader={<h4>Loading...</h4>}
                    // height={window.innerHeight - 197}
                    inverse
                    style={{ display: 'flex', flexDirection: 'column-reverse' }}
                    scrollableTarget="scrollableDiv"
                    // endMessage={
                    //     <p style={{ textAlign: 'center' }}>
                    //         <b>Yay! You have seen it all</b>
                    //     </p>
                    // }
                >
                    {[...messages]
                        .sort((a, b) => b.timestamp - a.timestamp)
                        .map((msg) => {
                            const { sender, id, message: lastMessage } = msg || {};
                            const justify = email === sender.email ? 'end' : 'start';
                            return <Message key={id} justify={justify} message={lastMessage} />;
                        })}
                </InfiniteScroll>
            </ul>
        </div>
    );
}
