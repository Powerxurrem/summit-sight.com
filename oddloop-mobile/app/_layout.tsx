import { ErrorBoundaryProps, Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: "#101714" }}>
        <StatusBar style="light" />
        <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#101714" }, animation: "fade" }} />
      </View>
    </SafeAreaProvider>
  );
}

export function ErrorBoundary({ error, retry }: ErrorBoundaryProps) {
  return (
    <SafeAreaProvider>
      <View style={errorStyles.screen}>
        <Text style={errorStyles.kicker}>ODDLOOP COULD NOT START</Text>
        <Text style={errorStyles.title}>Something broke the loop.</Text>
        <Text selectable style={errorStyles.message}>{error.message}</Text>
        <Pressable style={errorStyles.button} onPress={retry}>
          <Text style={errorStyles.buttonText}>TRY AGAIN</Text>
        </Pressable>
      </View>
    </SafeAreaProvider>
  );
}

const errorStyles = StyleSheet.create({
  screen: { flex: 1, justifyContent: "center", padding: 28, backgroundColor: "#101714" },
  kicker: { color: "#d4774c", fontSize: 10, fontWeight: "900", letterSpacing: 1.2 },
  title: { marginTop: 12, color: "#f0eadb", fontFamily: "serif", fontSize: 38, lineHeight: 40 },
  message: { marginTop: 20, color: "#98a199", fontSize: 13, lineHeight: 19 },
  button: { alignSelf: "flex-start", marginTop: 28, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 24, backgroundColor: "#f0eadb" },
  buttonText: { color: "#101714", fontSize: 10, fontWeight: "900", letterSpacing: 1 },
});
