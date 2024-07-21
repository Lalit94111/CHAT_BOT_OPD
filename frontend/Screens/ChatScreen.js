import React from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Text,
  KeyboardAvoidingView,
  Platform,
  Image,
  TouchableOpacity
} from "react-native";
import { useState, useRef, useEffect } from "react";
import Input from "../Components/Input";
import Message from "../Components/Message";
import Header from "../Components/header";
import socket from "../utills/socket";
import { v4 as uuidv4 } from 'uuid';
import Ionicons from '@expo/vector-icons/Ionicons';

const ChatScreen = ({ route,navigation }) => {
  const { question } = route.params;
  const FlatListRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const [currentMaximumScore, setCurrentMaximumScore] = useState(null);
  const [answered, setAnswered] = useState(false);
  const [currentQuestionAnswered, setCurrentQuestionAnswered] = useState(false);

  useEffect(() => {
    if (FlatListRef.current && messages.length > 0) {
      FlatListRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  useEffect(() => {
    socket.on("previous-chats", (response) => {
      setMessages((prevMessages) => {
        return [...prevMessages, ...response];
      });
    });

    return () => socket.off("previous-chats");
  }, []);

  useEffect(() => {
    socket.on("current-maximum-score", (response) => {
      setCurrentMaximumScore(response);
    });

    return () => socket.off("current-maximum-score");
  }, []);

  useEffect(() => {
    socket.on("question-answered", (response) => {
      setCurrentQuestionAnswered(response);
    });

    return () => socket.off("question-answered");
  }, []);

  useEffect(() => {
    const roomId = `1_${question.id}`;

    socket.emit("join-room", roomId);

    socket.on("patient-info", (data) => {
      console.log(data)
      setMessages((prevMessages) => {
        return [...prevMessages, data];
      });
    });

    return () => {
      socket.off("patient-info");
    };
  }, []);

  useEffect(() => {
    socket.on("response-fromAI", (response) => {
      setMessages((prevMessages) => {
        return [...prevMessages, response];
      });
    });

    return () => socket.off("response-fromAI");
  }, []);

  const sendMessage = (text) => {
    const roomId = `1_${question.id}`;
    const answer = {
      id: Date.now().toString(),
      text: text,
      isAI: false,
    };
    setMessages((prevMessages) => {
      return [...prevMessages, answer];
    });
    const data = {
      patientId: question.id,
      message: text,
      roomId: roomId,
    };
    socket.emit("send-chat", data);
    setAnswered(true);
  };

  const onPress = () =>{
        navigation.navigate('Finish',{question})
    }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={Platform.OS === "ios" ? 100 : 0}
    >
      <Header />

      <View style={styles.content}>
        <Text style={styles.caseText}>
          Hi Dr. Shreya Good to See You ,{"\n"}
          {"\n"}
          {question.patientSummary}
        </Text>

        <FlatList
          ref={FlatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <Message text={item.text} isAI={item.isAI} />
          )}
          
          onContentSizeChange={() =>
            FlatListRef.current.scrollToEnd({ animated: true })
          }
        />

        {answered && (
          <View style={styles.pointsContainer}>
            <Text style={styles.pointsText}>
              {currentMaximumScore ? `${currentMaximumScore.score} Points` : "..."}
              <Ionicons name="information-circle-outline" size={15} color="white" />
            </Text>
          </View>
        )}

        {currentQuestionAnswered ? (
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>SEE RESULTS</Text>
          </TouchableOpacity>
        ) : (
          <Input onSend={sendMessage} />
        )}
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  caseText: {
    fontSize: 16,
  },
  content: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ffffff",
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
    margin: 10,
    marginTop: 0,
  },
  pointsContainer: {
    backgroundColor: "#0056b3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    alignSelf: "flex-end",
  },
  pointsText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  button: {
    margin:20,
    padding: 15, 
    borderRadius: 10,
    backgroundColor: '#007bff', 
    alignItems: 'center', 
  },
  buttonText: {
    color: 'white', 
    fontSize: 16, 
    fontWeight: 'bold', 
  },
});

export default ChatScreen;
