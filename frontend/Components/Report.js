import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

const Report = ({ label, points }) => {
  return (
    <View style={styles.container}>
      {label === 'Lab Test' ? (
        <>
          <Ionicons name="clipboard-outline" size={36} color="black" />
          
        </>
      ) : (
        <>
          <Ionicons name="medkit-outline" size={36} color="black" />
        </>
      )}
      <Text style={styles.labText}>{label}</Text>
      <Text style={styles.pointsText}>{`${points}/5 Points`}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    margin: 20,
  },
  labText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  pointsText: {
    fontSize: 16,
  },
});

export default Report;
