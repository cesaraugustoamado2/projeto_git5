import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text } from 'react-native';
import DashboardScreen from './dashboard';
import ClientesScreen from './clientes';
import ConfiguracoesScreen from './configuracoes';

const Tab = createBottomTabNavigator();

export default function AppLayout() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#e2e8f0',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tab.Screen
        name="dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarLabel: 'Dashboard',
        }}
      />
      <Tab.Screen
        name="clientes"
        component={ClientesScreen}
        options={{
          title: 'Clientes',
          tabBarLabel: 'Clientes',
        }}
      />
      <Tab.Screen
        name="configuracoes"
        component={ConfiguracoesScreen}
        options={{
          title: 'Configurações',
          tabBarLabel: 'Configurações',
        }}
      />
    </Tab.Navigator>
  );
}
