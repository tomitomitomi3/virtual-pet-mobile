import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, SafeAreaView, KeyboardAvoidingView, Platform, ScrollView, Alert } from 'react-native';
import { Dog } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../store/authStore';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, checkAuth, user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (user) {
      router.replace('/(tabs)/available');
    }
  }, [user]);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    const success = await login(email, password);
    if (!success) {
      Alert.alert('Error', 'Credenciales inválidas o no tienes permiso de repartidor');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-50">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          <View className="bg-white rounded-[40px] p-8 shadow-xl border border-surface-100">
            <View className="flex-row items-center gap-3 mb-8">
              <View className="bg-brand-500 p-2.5 rounded-2xl">
                <Dog color="white" size={28} />
              </View>
              <Text className="text-2xl font-bold text-gray-900 tracking-tight">
                Virtual Pet <Text className="text-brand-500 text-sm align-top">Rider</Text>
              </Text>
            </View>

            <Text className="text-3xl font-bold text-gray-900 mb-2">
              ¡Hola, Rider!
            </Text>
            <Text className="text-gray-500 text-base mb-8">
              Ingresá para ver tus repartos del día.
            </Text>

            <View className="space-y-6">
              <View>
                <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Email</Text>
                <TextInput
                  placeholder="tu@email.com"
                  className="w-full px-5 py-4 bg-surface-50 border border-surface-200 rounded-2xl text-gray-900 text-base"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  value={email}
                  onChangeText={setEmail}
                />
              </View>

              <View className="mt-4">
                <Text className="text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Contraseña</Text>
                <TextInput
                  placeholder="••••••••"
                  className="w-full px-5 py-4 bg-surface-50 border border-surface-200 rounded-2xl text-gray-900 text-base"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                />
              </View>

              <TouchableOpacity 
                onPress={handleLogin}
                disabled={isLoading}
                className={`w-full bg-brand-500 py-5 rounded-3xl mt-8 shadow-lg shadow-brand-500/30 ${isLoading ? 'opacity-70' : ''}`}
              >
                <Text className="text-white text-center font-bold text-lg">
                  {isLoading ? 'Iniciando...' : 'Comenzar Turno'}
                </Text>
              </TouchableOpacity>
            </View>

            <View className="mt-10 pt-8 border-t border-surface-100 items-center">
              <Text className="text-xs text-gray-400 text-center px-4 leading-5">
                Uso exclusivo para personal de VirtualPet.{"\n"}Reporta problemas a soporte.
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
