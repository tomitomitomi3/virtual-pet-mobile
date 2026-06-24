import { Stack } from 'expo-router';
import { QueryClient, QueryClientProvider, onlineManager } from '@tanstack/react-query';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import NetworkBanner from '../components/NetworkBanner';
import "../global.css";

onlineManager.setEventListener((setOnline) => {
  return NetInfo.addEventListener((state) => {
    setOnline(!!state.isConnected);
  });
});

const queryClient = new QueryClient();

export default function RootLayout() {
  return (
    <QueryClientProvider client={queryClient}>
      <View style={{ flex: 1 }}>
        <StatusBar style="dark" />
        <NetworkBanner />
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: '#fafaf8' },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </View>
    </QueryClientProvider>
  );
}
