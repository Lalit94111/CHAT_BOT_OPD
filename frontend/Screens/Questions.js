import {View,Text,StyleSheet,FlatList} from 'react-native'
import Header from '../Components/header'
import api from '../API/Instance'
import QuestionItem from '../Components/QuestionItem'

import {useState,useEffect} from 'react'

const Questions = ({navigation}) =>{
    const [questions,setQuestions] = useState([])
    const [error, setError] = useState(null);


    useEffect(()=>{
        const fetchData = async () => {
            
      try {
        const response = await api.get('/patient/get_patients'); 
        setQuestions(response.data);
      } catch (err) {
        setError(err);
      }
    };

    fetchData();
    },[])

    return (
    <View style={styles.container}>
      <Header />
      <Text style={styles.heading}>Questions</Text>
      <FlatList
        data={questions}
        renderItem={({ item }) => <QuestionItem question={item} navigation={navigation} />}
        keyExtractor={item => item.id.toString()} 
        contentContainerStyle={styles.list}
      />
      {error && <Text style={styles.errorText}>{error.message}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 20,
  },
  list: {
    paddingHorizontal: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
  },
});

export default Questions;