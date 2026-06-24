import React, { useEffect, useState } from 'react';
import { View, Text, Animated } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { WifiOff } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function NetworkBanner() {
  const [isConnected, setIsConnected] = useState<boolean | null>(true);
  const [animation] = useState(new Animated.Value(0));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (isConnected === false) {
      Animated.timing(animation, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(animation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [isConnected]);

  if (isConnected === true) return null;

  const translateY = animation.interpolate({
    inputRange: [0, 1],
    outputRange: [-100, 0],
  });

  return (
    <Animated.View
      style={{
        transform: [{ translateY }],
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 50,
        paddingTop: insets.top,
      }}
      className="bg-red-500"
    >
      <View className="flex-row items-center justify-center py-2 gap-2">
        <WifiOff color="white" size={16} />
        <Text className="text-white font-bold text-sm">Sin conexión a Internet</Text>
      </View>
    </Animated.View>
  );
}
