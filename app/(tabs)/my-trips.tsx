import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Truck, MapPin, CheckCircle, XCircle } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../services/api';
import CustomAlert, { CustomAlertButton } from '../../components/CustomAlert';

export default function MyTrips() {
  const queryClient = useQueryClient();

  const [alertConfig, setAlertConfig] = useState<{ visible: boolean; title: string; message: string; buttons?: CustomAlertButton[] }>({
    visible: false,
    title: '',
    message: '',
  });

  const showAlert = (title: string, message: string, buttons?: CustomAlertButton[]) => {
    setAlertConfig({ visible: true, title, message, buttons });
  };

  const hideAlert = () => {
    setAlertConfig(prev => ({ ...prev, visible: false }));
  };

  const { data: myOrders, isLoading, isError, refetch } = useQuery({
    queryKey: ['myOrders'],
    queryFn: async () => {
      const response = await api.get('/delivery/my-orders');
      return response.data;
    },
  });

  const completeMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await api.post(`/delivery/${orderId}/complete`);
    },
    onSuccess: () => {
      showAlert('Éxito', 'Entrega confirmada. ¡Buen trabajo!');
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['historyOrders'] });
    },
    onError: (error: any) => {
      const isNetworkError = error.message === 'Network Error' || !error.response;
      const errorMessage = isNetworkError 
        ? 'No tienes conexión a internet. Revisa tu conexión y vuelve a intentarlo.'
        : error.response?.data?.detail || 'No se pudo confirmar la entrega';
      showAlert('Error', errorMessage);
    },
  });

  const returnMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await api.post(`/delivery/${orderId}/return`);
    },
    onSuccess: () => {
      showAlert('Devuelto', 'El pedido ha sido regresado al depósito.');
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
      queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
    },
    onError: (error: any) => {
      const isNetworkError = error.message === 'Network Error' || !error.response;
      const errorMessage = isNetworkError 
        ? 'No tienes conexión a internet. Revisa tu conexión y vuelve a intentarlo.'
        : error.response?.data?.detail || 'No se pudo devolver el pedido';
      showAlert('Error', errorMessage);
    },
  });

  const handleComplete = (id: number) => {
    showAlert('Entregar Pedido', `¿Confirmas que el pedido #${id} fue entregado?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => completeMutation.mutate(id) }
    ]);
  };

  const handleReturn = (id: number) => {
    showAlert('Devolver al Depósito', `¿El pedido #${id} no pudo ser entregado?`, [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Devolver', style: 'destructive', onPress: () => returnMutation.mutate(id) }
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white mx-4 mb-4 p-5 rounded-[32px] shadow-sm border border-surface-100">
      <View className="flex-row justify-between items-start mb-4">
        <View className="bg-brand-50 p-3 rounded-2xl">
          <Truck color="#d97519" size={24} />
        </View>
        <View className="bg-brand-500 px-3 py-1 rounded-full">
          <Text className="text-white font-bold text-xs">EN CAMINO</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mb-2">
        <MapPin color="#9e4412" size={16} />
        <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={1}>
          {item.direccion_entrega}
        </Text>
      </View>

      <Text className="text-gray-500 text-sm mb-6 ml-6">
        Total: ${item.total}
      </Text>

      <View className="flex-row gap-3">
        <TouchableOpacity 
          onPress={() => handleReturn(item.id)}
          disabled={returnMutation.isPending || completeMutation.isPending}
          className={`flex-1 bg-surface-100 py-4 rounded-2xl flex-row justify-center items-center gap-2 ${(returnMutation.isPending || completeMutation.isPending) ? 'opacity-50' : ''}`}
        >
          <XCircle color="#9e4412" size={20} />
          <Text className="text-brand-800 font-bold text-sm">Devolver</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => handleComplete(item.id)}
          disabled={completeMutation.isPending || returnMutation.isPending}
          className={`flex-1 bg-brand-500 py-4 rounded-2xl flex-row justify-center items-center gap-2 ${(completeMutation.isPending || returnMutation.isPending) ? 'opacity-50' : ''}`}
        >
          <CheckCircle color="white" size={20} />
          <Text className="text-white font-bold text-base">Entregado</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

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
        <Truck color="#ef4444" size={60} />
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
      <CustomAlert
        visible={alertConfig.visible}
        title={alertConfig.title}
        message={alertConfig.message}
        buttons={alertConfig.buttons}
        onClose={hideAlert}
      />
      <FlatList
        data={myOrders}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#d97519" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20 px-10">
            <Truck color="#d6d3c8" size={60} />
            <Text className="text-gray-400 font-bold text-lg mt-4 text-center">
              Tu camioneta está vacía.
            </Text>
            <Text className="text-gray-400 text-center mt-2">
              Ve a la pestaña de "Disponibles" para cargar pedidos.
            </Text>
          </View>
        }
      />
    </View>
  );
}
