import React, { useEffect, useState } from "react";
import { FlatList, Text, View, Platform } from "react-native";
import Constants from "expo-constants";
import * as Notifications from "expo-notifications";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = Constants.expoConfig?.extra?.supabaseUrl;
const supabaseKey = Constants.expoConfig?.extra?.supabaseAnonKey;
const supabase = createClient(supabaseUrl!, supabaseKey!);

export default function App() {
  const [tasks, setTasks] = useState<any[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel("public:tasks")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tasks" },
        (payload) => {
          fetchTasks();
        },
      )
      .subscribe();

    fetchTasks();
    registerDeviceToken();

    return () => {
      subscription.unsubscribe();
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

  async function fetchTasks() {
    const { data } = await supabase.from("tasks").select("*");
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
