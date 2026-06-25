import React from 'react';
import { View, Text, FlatList, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { CheckCircle2, RotateCcw, MapPin } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import api from '../../services/api';
import { useAuthStore } from '../../store/authStore';

export default function HistoryScreen() {
  const { user } = useAuthStore();
  const { data: history, isLoading, isError, refetch } = useQuery({
    queryKey: ['historyOrders'],
    queryFn: async () => {
      const response = await api.get('/delivery/history');
      return response.data;
    },
  });

  const stats = React.useMemo(() => {
    if (!history) return { delivered: 0 };
    const myId = user?.id;
    return {
      delivered: history.filter((o: any) => o.estado === 'entregado' && o.rider_id === myId).length,
    };
  }, [history, user]);

  const renderItem = ({ item }: { item: any }) => {
    const isDeliveredByMe = item.estado === 'entregado' && item.rider_id === user?.id;
    return (
      <View className="bg-white mx-4 mb-4 p-5 rounded-[32px] shadow-sm border border-surface-100">
        <View className="flex-row justify-between items-center mb-4">
          <View className="flex-row items-center gap-2">
            <View className={isDeliveredByMe ? 'bg-green-100 p-2 rounded-xl' : 'bg-gray-100 p-2 rounded-xl'}>
              {isDeliveredByMe ? (
                <CheckCircle2 color="#16a34a" size={20} />
              ) : (
                <RotateCcw color="#4b5563" size={20} />
              )}
            </View>
            <Text className="text-gray-900 font-bold text-sm">Pedido #{item.id}</Text>
          </View>
          <Text className="text-gray-400 text-xs font-medium">
            {new Date(item.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>

        <View className="flex-row items-center gap-2 mb-2">
          <MapPin color="#9e4412" size={14} />
          <Text className="text-gray-600 text-sm flex-1" numberOfLines={1}>
            {item.direccion_entrega}
          </Text>
        </View>

        <View className="flex-row justify-between items-end mt-2">
          <Text className="text-gray-400 text-xs italic">
            {isDeliveredByMe ? 'Entregado con éxito' : 'Devuelto al depósito'}
          </Text>
          <Text className="text-gray-900 font-bold text-lg">
            ${item.total}
          </Text>
        </View>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface-50">
        <ActivityIndicator size="large" color="#d97519" />
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-surface-50 p-8">
        <CheckCircle2 color="#ef4444" size={60} />
        <Text className="text-red-500 font-bold text-lg mt-4 text-center">Error de Conexión</Text>
        <Text className="text-gray-500 text-center mt-2 mb-6">
          No se pudo conectar con el servidor. Verifica que el backend esté encendido y que el dispositivo esté en la misma red local.
        </Text>
        <TouchableOpacity 
          onPress={() => refetch()}
          className="bg-brand-500 px-6 py-3 rounded-2xl"
        >
          <Text className="text-white font-bold text-base">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-surface-50">
      <View className="p-4">
        <View className="bg-white p-5 rounded-[32px] border border-surface-100 items-center shadow-sm">
          <Text className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Pedidos Entregados</Text>
          <Text className="text-green-600 text-3xl font-extrabold">{stats.delivered}</Text>
        </View>
      </View>

      <FlatList
        data={history}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#d97519" />
        }
        ListHeaderComponent={
          <View className="px-5 py-2">
            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Actividad de Hoy</Text>
          </View>
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-10">
            <Text className="text-gray-400 font-medium">Aún no tienes actividad registrada.</Text>
          </View>
        }
      />
    </View>
  );
}
