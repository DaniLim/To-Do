import React from 'react';
import { IconButton } from 'react-native-paper';

interface Props {
  onPress: () => void;
}

export default function AddTaskButton({ onPress }: Props) {
  return <IconButton icon="plus" size={20} onPress={onPress} accessibilityLabel="Add task" />;
}
