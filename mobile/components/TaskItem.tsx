import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Checkbox, Text } from 'react-native-paper';

export interface Task {
  id: string;
  title: string;
  completed: boolean;
}

interface Props {
  task: Task;
  onToggle: (id: string, completed: boolean) => void;
}

export default function TaskItem({ task, onToggle }: Props) {
  return (
    <View style={styles.row}>
      <Checkbox
        status={task.completed ? 'checked' : 'unchecked'}
        onPress={() => onToggle(task.id, !task.completed)}
      />
      <Text style={[styles.text, task.completed && styles.completed]}>{task.title}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
  },
  text: {
    fontSize: 16,
    flex: 1,
  },
  completed: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
});
