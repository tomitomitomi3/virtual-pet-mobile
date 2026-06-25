import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { Package, MapPin, ChevronRight } from 'lucide-react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, { BASE_URL } from '../../services/api';
import CustomAlert, { CustomAlertButton } from '../../components/CustomAlert';

export default function AvailableOrders() {
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

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: any = null;
    let pingInterval: any = null;

    const connectWS = () => {
      const wsProtocol = BASE_URL.startsWith('https') ? 'wss' : 'ws';
      const wsUrl = `${wsProtocol}://${BASE_URL.replace(/^https?:\/\//, '')}/delivery/ws`;
      
      console.log('Mobile WS: Attempting connection to:', wsUrl);
      ws = new WebSocket(wsUrl);
      
      ws.onopen = () => {
        console.log('Mobile WS: Connected successfully to delivery/ws');
        // Enviar un ping cada 30 segundos para mantener la conexión activa en Nginx/proxies
        pingInterval = setInterval(() => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'ping' }));
          }
        }, 30000);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'order_updated') {
            console.log('Mobile WS: Invalidating queries...', data);
            queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
            queryClient.invalidateQueries({ queryKey: ['myOrders'] });
          }
        } catch (err) {
          // Ignorar respuestas de ping/pong u otros formatos no JSON
        }
      };
      
      ws.onclose = (event) => {
        console.log('Mobile WS: Connection closed', event.code, event.reason);
        clearInterval(pingInterval);
        console.log('Mobile WS: Attempting reconnection in 3 seconds...');
        reconnectTimeout = setTimeout(connectWS, 3000);
      };
      
      ws.onerror = (error) => {
        console.error('Mobile WS: Error:', error);
      };
    };

    connectWS();
    
    return () => {
      console.log('Mobile WS: Cleaning up connection...');
      clearInterval(pingInterval);
      clearTimeout(reconnectTimeout);
      if (ws) {
        // Desactivar el callback onclose antes de cerrar para evitar la reconexión en el desmontaje
        ws.onclose = null;
        ws.close();
      }
    };
  }, [queryClient]);


  const { data: orders, isLoading, isError, refetch } = useQuery({
    queryKey: ['availableOrders'],
    queryFn: async () => {
      const response = await api.get('/delivery/available');
      return response.data;
    },
  });

  const claimMutation = useMutation({
    mutationFn: async (orderId: number) => {
      await api.post(`/delivery/${orderId}/claim`);
    },
    onSuccess: () => {
      showAlert('Éxito', 'Pedido tomado correctamente. Ya puedes verlo en "Mis Viajes".');
      queryClient.invalidateQueries({ queryKey: ['availableOrders'] });
      queryClient.invalidateQueries({ queryKey: ['myOrders'] });
    },
    onError: (error: any) => {
      const isNetworkError = error.message === 'Network Error' || !error.response;
      const errorMessage = isNetworkError 
        ? 'No tienes conexión a internet. Revisa tu conexión y vuelve a intentarlo.'
        : error.response?.data?.detail || 'No se pudo tomar el pedido';
      
      showAlert('Error', errorMessage);
    },
  });

  const handleClaim = (orderId: number) => {
    showAlert('Tomar Pedido', '¿Quieres asignar este pedido a tu nombre?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Confirmar', onPress: () => claimMutation.mutate(orderId) },
    ]);
  };

  const renderItem = ({ item }: { item: any }) => (
    <View className="bg-white mx-4 mb-4 p-5 rounded-[32px] shadow-sm border border-surface-100">
      <View className="flex-row justify-between items-start mb-4">
        <View className="bg-brand-50 p-3 rounded-2xl">
          <Package color="#d97519" size={24} />
        </View>
        <View className="bg-surface-100 px-3 py-1 rounded-full">
          <Text className="text-gray-500 font-bold text-xs">#{item.id}</Text>
        </View>
      </View>

      <View className="flex-row items-center gap-2 mb-2">
        <MapPin color="#9e4412" size={16} />
        <Text className="text-gray-900 font-bold text-base flex-1" numberOfLines={1}>
          {item.direccion_entrega}
        </Text>
      </View>

      <Text className="text-gray-500 text-sm mb-6 ml-6">
        {item.items.length} {item.items.length === 1 ? 'producto' : 'productos'} • Total: ${item.total}
      </Text>

      <TouchableOpacity 
        onPress={() => handleClaim(item.id)}
        disabled={claimMutation.isPending}
        className={`bg-brand-500 py-4 rounded-2xl flex-row justify-center items-center gap-2 ${claimMutation.isPending ? 'opacity-50' : ''}`}
      >
        <Text className="text-white font-bold text-base">
          {claimMutation.isPending ? 'Procesando...' : 'Tomar Pedido'}
        </Text>
        {!claimMutation.isPending && <ChevronRight color="white" size={20} />}
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View className="flex-1 justify-center items-center bg-surface-50">
        <ActivityIndicator size="large" color="#d97519" />
        <Text className="mt-4 text-gray-500">Cargando pedidos disponibles...</Text>
      </View>
    );
  }

  if (isError) {
    return (
      <View className="flex-1 justify-center items-center bg-surface-50 p-8">
        <Package color="#ef4444" size={60} />
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
        data={orders}
        renderItem={renderItem}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 40 }}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor="#d97519" />
        }
        ListEmptyComponent={
          <View className="flex-1 items-center justify-center pt-20 px-10">
            <Package color="#d6d3c8" size={60} />
            <Text className="text-gray-400 font-bold text-lg mt-4 text-center">No hay pedidos disponibles</Text>
            <Text className="text-gray-400 text-center mt-2">Vuelve a intentar en unos minutos.</Text>
          </View>
        }
      />
    </View>
  );
}
