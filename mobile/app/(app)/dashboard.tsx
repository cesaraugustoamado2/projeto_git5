import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DashboardScreen() {
  const router = useRouter();

  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    router.replace('/(auth)/login');
  };

  const metrics = [
    { title: 'Total de Clientes', value: '0', color: '#3b82f6' },
    { title: 'Total de Vendas', value: '0', color: '#10b981' },
    { title: 'Conversas Ativas', value: '0', color: '#8b5cf6' },
    { title: 'Vendas Hoje', value: 'R$ 0,00', color: '#f59e0b' },
  ];

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bem-vindo!</Text>
          <Text style={styles.subtitle}>Dashboard de Vendas</Text>
        </View>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <Text style={styles.sectionTitle}>Métricas</Text>
        
        {metrics.map((metric, idx) => (
          <View key={idx} style={styles.metricCard}>
            <View style={styles.metricContent}>
              <Text style={styles.metricLabel}>{metric.title}</Text>
              <Text style={styles.metricValue}>{metric.value}</Text>
            </View>
            <View
              style={[styles.metricIcon, { backgroundColor: metric.color }]}
            />
          </View>
        ))}

        <Text style={[styles.sectionTitle, { marginTop: 24 }]}>Atividade Recente</Text>
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>Nenhuma atividade recente</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginTop: 4,
  },
  logoutButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#fee2e2',
    borderRadius: 6,
  },
  logoutText: {
    color: '#dc2626',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  metricContent: {
    flex: 1,
  },
  metricLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  metricIcon: {
    width: 48,
    height: 48,
    borderRadius: 8,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  emptyText: {
    color: '#94a3b8',
    fontSize: 14,
  },
});
