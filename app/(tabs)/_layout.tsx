import { Tabs, useRouter } from 'expo-router';
import { Package, Truck, History, LogOut } from 'lucide-react-native';
import { useAuthStore } from '../../store/authStore';
import { TouchableOpacity, Alert } from 'react-native';

export default function TabsLayout() {
  const { logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    Alert.alert('Cerrar Sesión', '¿Seguro que quieres cerrar sesión?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Confirmar',
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/');
        },
      },
    ]);
  };

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#d97519',
        tabBarInactiveTintColor: '#9e4412',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#f4f3ef',
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        headerStyle: {
          backgroundColor: '#fafaf8',
        },
        headerTitleStyle: {
          fontWeight: 'bold',
          fontSize: 20,
        },
        headerShadowVisible: false,
        headerRight: () => (
          <TouchableOpacity onPress={handleLogout} style={{ marginRight: 20 }}>
            <LogOut color="#9e4412" size={22} />
          </TouchableOpacity>
        ),
      }}
    >
      <Tabs.Screen
        name="available"
        options={{
          title: 'Disponibles',
          tabBarIcon: ({ color }) => <Package color={color} size={24} />,
          headerTitle: 'Pedidos en Depósito',
        }}
      />
      <Tabs.Screen
        name="my-trips"
        options={{
          title: 'Mis Viajes',
          tabBarIcon: ({ color }) => <Truck color={color} size={24} />,
          headerTitle: 'Pedidos en Camino',
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color }) => <History color={color} size={24} />,
          headerTitle: 'Mi Historial',
        }}
      />
    </Tabs>
  );
}
