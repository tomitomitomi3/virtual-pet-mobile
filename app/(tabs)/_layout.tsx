import { Tabs } from 'expo-router';
import { Package, Truck, History } from 'lucide-react-native';

export default function TabsLayout() {
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
