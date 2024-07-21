import React, { useState, useEffect, useCallback } from "react";
import { Text, StyleSheet, View, Image, ActivityIndicator } from "react-native";
import api from "../API/Instance";
import { useFocusEffect } from '@react-navigation/native';
import Ionicons from '@expo/vector-icons/Ionicons';

const Header = () => {
  const [user, setUser] = useState(null);
  const [points, setPoints] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async () => {
    try {
      const userResponse = await api.get('/users/fetch_user?id=1'); 
      const pointsResponse = await api.get('/users/1/scores'); 
      setUser(userResponse.data);
      setPoints(pointsResponse.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true); 
      fetchUserData();
    }, [fetchUserData])
  );

  if (loading) {
    return <ActivityIndicator size="large" color="#007bff" />;
  }

  return (
    <View style={styles.blueLabelContainer}>
      <View style={styles.name}>
        <Ionicons name="person-outline" size={32} color="black" style={styles.icon} />
        <Text style={styles.blueLabelText}>Mr. {user ? `${user.name} (${user.age} Y/O)` : 'Loading...'}</Text>
      </View>

      <View style={styles.pointsContainer}>
      <Text style={styles.pointsText}>
        {points ? `${points.totalScore} Points` : 'Loading...'}
        <Ionicons name="information-circle-outline" size={15} color="white" />
      </Text>
    </View>
    </View>
  );
};

const styles = StyleSheet.create({
  blueLabelContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 150,
    backgroundColor: "#007bff",
    padding: 10,
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  name: {
    flexDirection: "row",
    alignItems: "center",
  },
  blueLabelText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  pointsContainer: {
    backgroundColor: "#0056b3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center', 
  },
  pointsText: {
    color: "#ffffff",
    fontWeight: "bold",
  },
  icon: {
    margin: 10,
  },
});

export default Header;
