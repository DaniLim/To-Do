import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from 'react-native-paper';
import AddTaskButton from './AddTaskButton';
import TaskItem, { Task } from './TaskItem';

export interface TaskList {
  id: string;
  name: string;
  color: string;
}

interface Props {
  list: TaskList;
  tasks: Task[];
  onAdd: (listId: string) => void;
  onToggle: (taskId: string, completed: boolean) => void;
}

export default function TaskListCard({ list, tasks, onAdd, onToggle }: Props) {
  return (
    <Card style={styles.card}>
      <View style={[styles.header, { backgroundColor: list.color }]}>
        <Text style={styles.headerText}>{list.name}</Text>
        <AddTaskButton onPress={() => onAdd(list.id)} />
      </View>
      <Card.Content style={styles.content}>
        {tasks.map((t) => (
          <TaskItem key={t.id} task={t} onToggle={onToggle} />
        ))}
      </Card.Content>
    </Card>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 16,
    marginVertical: 8,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  headerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  content: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingBottom: 8,
  },
});
