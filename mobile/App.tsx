import React, { useEffect, useState } from 'react';
import { FlatList, Text, View } from 'react-native';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseAnonKey;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default function App() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel('public:tasks')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, (payload) => {
        fetchTasks();
      })
      .subscribe();

    fetchTasks();

    Notifications.getExpoPushTokenAsync();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function fetchTasks() {
    const { data } = await supabase.from('tasks').select('*');
    setTasks(data || []);
  }

  return (
    <View style={{ marginTop: 50 }}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <Text>{item.title}</Text>}
      />
    </View>
  );
}
