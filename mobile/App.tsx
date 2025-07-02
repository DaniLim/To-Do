import React, { useEffect, useState, useRef } from "react";
import {
  FlatList,
  Text,
  View,
  Platform,
  SafeAreaView,
  StyleSheet,
  RefreshControl,
} from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseAnonKey;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default function App() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [lists, setLists] = useState<Record<string, string>>({});
  const listsRef = useRef<Record<string, string>>({});
  const [refreshing, setRefreshing] = useState(false);

  // keep ref updated with the latest lists mapping
  useEffect(() => {
    listsRef.current = lists;
  }, [lists]);

  useEffect(() => {
    const channel = supabase.channel("public:tasks");
    channel
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "tasks" },
        (payload) => {
          const record: any = payload.new;
          setTasks((prev) => [
            {
              ...record,
              listName: listsRef.current[record.list_id] || "Inbox",
            },
            ...prev,
          ]);
        },
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "tasks" },
        (payload) => {
          const record: any = payload.new;
          setTasks((prev) =>
            prev.map((t) =>
              t.id === record.id
                ? { ...t, ...record, listName: listsRef.current[record.list_id] || "Inbox" }
                : t,
            ),
          );
        },
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table: "tasks" },
        (payload) => {
          const record: any = payload.old;
          setTasks((prev) => prev.filter((t) => t.id !== record.id));
        },
      )
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
    if (status !== "granted") {
      console.warn("Push permissions not granted");
      return;
    }
    const token = await Notifications.getExpoPushTokenAsync();
    if (token.data) {
      await supabase.from("device_tokens").insert({
        expo_token: token.data,
        platform: Platform.OS,
      });
    }
  }

  async function fetchTaskLists() {
    const { data } = await supabase.from("task_lists").select("id, name");
    if (data) {
      const map: Record<string, string> = {};
      data.forEach((l) => {
        map[l.id] = l.name;
      });
      setLists(map);
    }
  }

  async function fetchTasks() {
    const { data } = await supabase
      .from("tasks")
      .select("id, title, due_at, important, list_id")
      .order("created_at", { ascending: false });
    if (data) {
      setTasks(
        data.map((t) => ({
          ...t,
          listName: lists[t.list_id] || "Inbox",
        })),
      );
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchTaskLists();
    await fetchTasks();
    setRefreshing(false);
  }

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>My Tasks</Text>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.meta}>
              {item.listName}
              {item.due_at
                ? ` • Due ${new Date(item.due_at).toLocaleDateString()}`
                : ""}
            </Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f8f8" },
  header: { fontSize: 24, fontWeight: "bold", padding: 20 },
  card: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 8,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: { fontSize: 16, fontWeight: "500" },
  meta: { fontSize: 12, color: "#666", marginTop: 4 },
});
