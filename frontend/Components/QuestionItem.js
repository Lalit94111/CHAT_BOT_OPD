import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';

const QuestionItem = ({ question, navigation }) => {
  const handlePress = () => {
    navigation.navigate('ChatScreen', { question });
  };

  return (
    <TouchableOpacity style={styles.item} onPress={handlePress}>
      <Text style={styles.text}>{question.id}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  item: {
    backgroundColor: '#007bff',
    padding: 16,
    borderRadius: 8,
    marginVertical: 8,
  },
  text: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
  },
});

export default QuestionItem;
