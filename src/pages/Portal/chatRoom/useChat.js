import { useEffect, useRef, useState } from "react";
import socketIOClient from "socket.io-client";
import { UrlService } from "services/imports/index";

const SOCKET_SERVER_URL = UrlService.chatAPIURL();


const useChat = (roomId) => {
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const socketRef = useRef();

  useEffect(() => {
    socketRef.current = socketIOClient(SOCKET_SERVER_URL, {
      query: { roomId },
    });

    /* Load users */
    socketRef.current.on('users', function(user) {
      setUsers((users) => [...users, user]);
    })    

    /* Load previous messages */
    socketRef.current.on('prev_message', function(message) {
      setMessages((messages) => [...messages, message]);
    })    

    /* New messages */
    socketRef.current.on('new_chat_message', (message) => {
      setMessages((messages) => [...messages, message]);
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, [roomId]);

  /* Send new message */
  const sendMessage = (messageBody) => {
    socketRef.current.emit('new_chat_message', {
      message: messageBody,
      senderId: 1,
    });
  };

  return { messages, users, sendMessage };
};

export default useChat;
