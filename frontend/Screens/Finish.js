import React, { useState, useEffect } from 'react';
import { Text, View, Image, StyleSheet, TouchableOpacity } from 'react-native';
import Header from '../Components/header';
import Report from '../Components/Report';
import api from '../API/Instance';
import Ionicons from '@expo/vector-icons/Ionicons';

const Finish = ({ navigation, route }) => {
  const { question } = route.params; 
  const [score, setScore] = useState(null); 
  const [loading, setLoading] = useState(true); 

  useEffect(() => {
    const fetchScores = async () => {
      try {
        const response = await api.get(`/users/user/1/patient/${question.id}/scores`);
        setScore(response.data); 
      } catch (error) {
        console.error('Error fetching scores:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchScores();
  }, [question]);

  const onPress = () => {
    navigation.navigate('Questions');
  };

  if (loading) {
    return <Text>Loading...</Text>; 
  }

  return (
    <View style={styles.outerContainer}>
      <Header />
      <View style={styles.container}>
      <Ionicons name="checkmark-circle" size={50} color="green" />
        {/* <Image source={require('../assets/favicon.png')} /> */}
        <Text style={styles.scoreText}>Your Score</Text>
        {/* Display dynamic scores */}
        <Text style={styles.pointsText}>{score ? `${score.testScore + score.diagnosisScore}/10 Points` : 'N/A'}</Text>

        <View style={styles.reportContainer}>
          <Report label="Lab Test" points={score ? score.testScore : 0} />
          <Report label="Diagnosis" points={score ? score.diagnosisScore : 0} />
        </View>
      </View>
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Text style={styles.buttonText}>NEXT PATIENT</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  outerContainer: {
    flex: 1,
  },
  button: {
    margin: 20,
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
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  scoreText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  pointsText: {
    fontSize: 16,
    marginBottom: 20,
  },
  reportContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
});

export default Finish;
