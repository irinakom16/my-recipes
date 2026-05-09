import React, { useState } from 'react';
import {
  SafeAreaView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

export default function CreateEntryScreen() {
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');

  return (
    <SafeAreaView
      style={{
        flex: 1,
        backgroundColor: '#0B1020',
        padding: 20,
      }}
    >
      <Text
        style={{
          color: 'white',
          fontSize: 28,
          fontWeight: '700',
        }}
      >
        New Training Entry
      </Text>

      <View style={{ marginTop: 24 }}>
        <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>
          Title
        </Text>

        <TextInput
          value={title}
          onChangeText={setTitle}
          placeholder="Morning practice"
          placeholderTextColor="#6B7280"
          style={{
            backgroundColor: '#151B2E',
            color: 'white',
            padding: 16,
            borderRadius: 16,
          }}
        />
      </View>

      <View style={{ marginTop: 20 }}>
        <Text style={{ color: '#9CA3AF', marginBottom: 8 }}>
          Notes
        </Text>

        <TextInput
          value={notes}
          onChangeText={setNotes}
          multiline
          numberOfLines={8}
          placeholder="How did the session go?"
          placeholderTextColor="#6B7280"
          style={{
            backgroundColor: '#151B2E',
            color: 'white',
            padding: 16,
            borderRadius: 16,
            minHeight: 180,
            textAlignVertical: 'top',
          }}
        />
      </View>

      <TouchableOpacity
        style={{
          marginTop: 24,
          backgroundColor: '#3B82F6',
          padding: 18,
          borderRadius: 18,
          alignItems: 'center',
        }}
      >
        <Text style={{ color: 'white', fontWeight: '700' }}>
          Save Entry
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
