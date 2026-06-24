import React from 'react';
import { View, Text, TouchableOpacity, Modal } from 'react-native';

export interface CustomAlertButton {
  text: string;
  onPress?: () => void;
  style?: 'default' | 'cancel' | 'destructive';
}

interface CustomAlertProps {
  visible: boolean;
  title: string;
  message: string;
  buttons?: CustomAlertButton[];
  onClose: () => void;
}

export default function CustomAlert({ visible, title, message, buttons, onClose }: CustomAlertProps) {
  const defaultButtons: CustomAlertButton[] = [
    { text: 'OK', onPress: onClose, style: 'default' }
  ];

  const renderButtons = buttons || defaultButtons;

  return (
    <Modal
      transparent={true}
      animationType="fade"
      visible={visible}
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-center items-center bg-black/50">
        <View className="bg-white mx-4 rounded-3xl p-6 w-11/12 max-w-sm shadow-lg">
          <Text className="text-xl font-bold text-gray-900 mb-2 text-center">{title}</Text>
          <Text className="text-base text-gray-500 mb-6 text-center leading-5">{message}</Text>
          
          <View className={`flex-row ${renderButtons.length > 1 ? 'justify-between' : 'justify-center'} gap-3`}>
            {renderButtons.map((btn, index) => {
              let buttonClass = "flex-1 py-3 rounded-2xl items-center justify-center";
              let textClass = "font-bold text-base";
              
              if (btn.style === 'cancel') {
                buttonClass += " bg-surface-100";
                textClass += " text-gray-500";
              } else if (btn.style === 'destructive') {
                buttonClass += " bg-red-500";
                textClass += " text-white";
              } else {
                buttonClass += " bg-brand-500";
                textClass += " text-white";
              }

              return (
                <TouchableOpacity
                  key={index}
                  className={buttonClass}
                  onPress={() => {
                    if (btn.onPress) btn.onPress();
                    if (!btn.onPress || (btn.onPress && btn.style === 'cancel') || renderButtons.length === 1 || btn.onPress === onClose) {
                        onClose();
                    } else if (btn.onPress) {
                        onClose(); // Automatically close after action
                    }
                  }}
                >
                  <Text className={textClass}>{btn.text}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>
    </Modal>
  );
}
