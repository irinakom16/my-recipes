import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

const MOCK_ENTRIES = [
  {
    id: '1',
    title: 'Morning Serve Practice',
    date: '2026-05-09',
    insight: 'Good consistency on first serve. Movement needs attention.',
  },
  {
    id: '2',
    title: 'Match vs Alex',
    date: '2026-05-08',
    insight: 'Mental stability improved during pressure points.',
  },
];

export default function EntriesScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1020' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text
          style={{
            color: 'white',
            fontSize: 28,
            fontWeight: '700',
          }}
        >
          Journal History
        </Text>

        {MOCK_ENTRIES.map((entry) => (
          <View
            key={entry.id}
            style={{
              marginTop: 20,
              backgroundColor: '#151B2E',
              borderRadius: 20,
              padding: 20,
            }}
          >
            <Text
              style={{
                color: 'white',
                fontSize: 18,
                fontWeight: '600',
              }}
            >
              {entry.title}
            </Text>

            <Text style={{ color: '#6B7280', marginTop: 8 }}>
              {entry.date}
            </Text>

            <Text
              style={{
                color: '#D1D5DB',
                marginTop: 14,
                lineHeight: 22,
              }}
            >
              {entry.insight}
            </Text>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}
