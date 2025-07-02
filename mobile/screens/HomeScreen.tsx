import React, { useEffect, useRef, useState } from 'react';
import { RefreshControl, SafeAreaView, ScrollView, StyleSheet, Platform } from 'react-native';
import { Provider, Portal, Dialog, TextInput, Button } from 'react-native-paper';
import Constants from 'expo-constants';
import * as Notifications from 'expo-notifications';
import { createClient } from '@supabase/supabase-js';
import TaskListCard, { TaskList } from '../components/TaskListCard';
import { Task } from '../components/TaskItem';

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseAnonKey;
const supabase = createClient(supabaseUrl!, supabaseKey!);

const COLORS = ['#2196f3', '#ff9800', '#9c27b0', '#4caf50', '#f44336'];

export default function HomeScreen() {
  const [lists, setLists] = useState<TaskList[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const listsRef = useRef<TaskList[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [addingListId, setAddingListId] = useState<string | null>(null);
  const [newTitle, setNewTitle] = useState('');

  useEffect(() => {
    listsRef.current = lists;
  }, [lists]);

  useEffect(() => {
    const channel = supabase.channel('public:tasks');
    channel
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'tasks' }, (payload) => {
        const record: any = payload.new;
        const listId = record.list_id || 'inbox';
        setTasks((prev) => ({
          ...prev,
          [listId]: [
            { id: record.id, title: record.title, completed: record.completed },
            ...(prev[listId] || []),
          ],
        }));
      })
      .on('postgres_changes', { event: 'UPDATE', schema: 'public', table: 'tasks' }, (payload) => {
        const record: any = payload.new;
        const listId = record.list_id || 'inbox';
        setTasks((prev) => ({
          ...prev,
          [listId]: (prev[listId] || []).map((t) =>
            t.id === record.id ? { ...t, title: record.title, completed: record.completed } : t
          ),
        }));
      })
      .on('postgres_changes', { event: 'DELETE', schema: 'public', table: 'tasks' }, (payload) => {
        const record: any = payload.old;
        const listId = record.list_id || 'inbox';
        setTasks((prev) => ({
          ...prev,
          [listId]: (prev[listId] || []).filter((t) => t.id !== record.id),
        }));
      })
      .subscribe();

    fetchTaskLists();
    fetchTasks();
    registerDeviceToken();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  async function registerDeviceToken() {
    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      console.warn('Push permissions not granted');
      return;
    }
    const token = await Notifications.getExpoPushTokenAsync();
    if (token.data) {
      await supabase.from('device_tokens').insert({
        expo_token: token.data,
        platform: Platform.OS,
      });
    }
  }

  async function fetchTaskLists() {
    const { data } = await supabase.from('task_lists').select('id, name').order('sort_order');
    if (data) {
      const newLists: TaskList[] = [
        { id: 'inbox', name: 'Inbox', color: COLORS[0] },
        ...data.map((l, idx) => ({ id: l.id, name: l.name, color: COLORS[(idx + 1) % COLORS.length] })),
      ];
      setLists(newLists);
    }
  }

  async function fetchTasks() {
    const { data } = await supabase
      .from('tasks')
      .select('id, title, completed, list_id')
      .order('created_at', { ascending: false });
    if (data) {
      const grouped: Record<string, Task[]> = {};
      data.forEach((t) => {
        const listId = t.list_id || 'inbox';
        if (!grouped[listId]) grouped[listId] = [];
        grouped[listId].push({ id: t.id, title: t.title, completed: t.completed });
      });
      setTasks(grouped);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchTaskLists();
    await fetchTasks();
    setRefreshing(false);
  }

  function showAdd(listId: string) {
    setAddingListId(listId);
  }

  function hideDialog() {
    setAddingListId(null);
    setNewTitle('');
  }

  async function addTask() {
    if (addingListId && newTitle.trim()) {
      await supabase.from('tasks').insert({ title: newTitle.trim(), list_id: addingListId === 'inbox' ? null : addingListId });
    }
    hideDialog();
  }

  async function toggleTask(id: string, completed: boolean) {
    await supabase.from('tasks').update({ completed }).eq('id', id);
  }

  return (
    <Provider>
      <SafeAreaView style={styles.container}>
        <ScrollView refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>            
          {lists.map((list) => (
            <TaskListCard
              key={list.id}
              list={list}
              tasks={tasks[list.id] || []}
              onAdd={showAdd}
              onToggle={toggleTask}
            />
          ))}
        </ScrollView>
        <Portal>
          <Dialog visible={!!addingListId} onDismiss={hideDialog}>
            <Dialog.Title>Add Task</Dialog.Title>
            <Dialog.Content>
              <TextInput value={newTitle} onChangeText={setNewTitle} autoFocus accessibilityLabel="Task title" />
            </Dialog.Content>
            <Dialog.Actions>
              <Button onPress={hideDialog}>Cancel</Button>
              <Button onPress={addTask}>Add</Button>
            </Dialog.Actions>
          </Dialog>
        </Portal>
      </SafeAreaView>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f8f8' },
});
