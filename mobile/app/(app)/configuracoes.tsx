import { View, Text, ScrollView, StyleSheet, TextInput, TouchableOpacity, Switch } from 'react-native';
import { useState } from 'react';

export default function ConfiguracoesScreen() {
  const [systemPrompt, setSystemPrompt] = useState(
    'Você é a assistente virtual da autoescola. Seu tom é amigável, prestativo e focado em fechar matrículas.'
  );
  const [precoTeoria, setPrecoTeoria] = useState('50');
  const [precoManobra, setPrecoManobra] = useState('75');
  const [precoRua, setPrecoRua] = useState('100');
  const [precoMatricula, setPrecoMatricula] = useState('200');
  const [notificacoes, setNotificacoes] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    // Simular salvamento
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    alert('Configurações salvas com sucesso!');
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Configurações</Text>
      </View>

      <View style={styles.content}>
        {/* System Prompt */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>System Prompt da IA</Text>
          <Text style={styles.sectionDescription}>
            Configure o comportamento da assistente de vendas
          </Text>
          <TextInput
            style={styles.textArea}
            multiline
            numberOfLines={4}
            value={systemPrompt}
            onChangeText={setSystemPrompt}
            placeholder="Digite o system prompt..."
            placeholderTextColor="#cbd5e1"
          />
        </View>

        {/* Preços */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Preços dos Serviços</Text>
          
          <View style={styles.priceGroup}>
            <Text style={styles.label}>Aula de Teoria (R$)</Text>
            <TextInput
              style={styles.input}
              value={precoTeoria}
              onChangeText={setPrecoTeoria}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>

          <View style={styles.priceGroup}>
            <Text style={styles.label}>Aula de Manobra (R$)</Text>
            <TextInput
              style={styles.input}
              value={precoManobra}
              onChangeText={setPrecoManobra}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>

          <View style={styles.priceGroup}>
            <Text style={styles.label}>Aula de Rua (R$)</Text>
            <TextInput
              style={styles.input}
              value={precoRua}
              onChangeText={setPrecoRua}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>

          <View style={styles.priceGroup}>
            <Text style={styles.label}>Matrícula (R$)</Text>
            <TextInput
              style={styles.input}
              value={precoMatricula}
              onChangeText={setPrecoMatricula}
              keyboardType="decimal-pad"
              placeholder="0.00"
            />
          </View>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <View style={styles.notificationRow}>
            <View>
              <Text style={styles.label}>Notificações Push</Text>
              <Text style={styles.description}>
                Receba alertas de novas mensagens
              </Text>
            </View>
            <Switch
              value={notificacoes}
              onValueChange={setNotificacoes}
              trackColor={{ false: '#cbd5e1', true: '#86efac' }}
              thumbColor={notificacoes ? '#22c55e' : '#e2e8f0'}
            />
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? 'Salvando...' : 'Salvar Configurações'}
          </Text>
        </TouchableOpacity>
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
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  content: {
    padding: 16,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 4,
  },
  sectionDescription: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 12,
  },
  textArea: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    textAlignVertical: 'top',
  },
  priceGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 6,
  },
  description: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#1e293b',
    backgroundColor: '#f8fafc',
  },
  notificationRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 32,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
