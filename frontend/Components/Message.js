import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import socket from "../utills/socket";
import {useState,useEffect} from 'react'
import Ionicons from '@expo/vector-icons/Ionicons';

const Message = ({ text, isAI }) => {
  const iconColor = isAI ? 'green' : 'black';

  return (
    <View
      style={[
        styles.messageContainer,
        isAI ? styles.aiMessage : styles.userMessage,
      ]}
    >
      <View>
        <View style={[styles.header,isAI?styles.row:styles.rowReverse]}>
        <Ionicons name="person-circle-outline" size={32} color={iconColor} />
          {/* <Image source={iconSource} style={styles.icon} /> */}
          <Text>{isAI ? "Senior AI Doctor" : "YOU"}</Text>
        </View>
      </View>
      <Text style={styles.messageText}>{text}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  messageContainer: {
    marginVertical: 5,
    padding: 10,
    borderRadius: 10,
  },
  aiMessage: {
    backgroundColor: "#E8E8E8",
    alignSelf: "flex-start",
  },
  userMessage: {
    backgroundColor: "#DCF8C6",
    alignSelf: "flex-end",
  },
  messageText: {
    fontSize: 16,
  },
  row:{
    flexDirection: "row",
  },
  rowReverse:{
    flexDirection: "row-reverse",
  },
  header: {
    alignItems: "center",
    marginBottom: 5,
  },
  icon: {
    width: 20,
    height: 20,
    marginRight: 5,
  },
});

export default Message;
