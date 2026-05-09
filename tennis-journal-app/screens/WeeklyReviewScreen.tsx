import React from 'react';
import { SafeAreaView, ScrollView, Text, View } from 'react-native';

export default function WeeklyReviewScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1020' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
          Weekly AI Review
        </Text>

        <View style={{ marginTop: 24, backgroundColor: '#151B2E', padding: 20, borderRadius: 20 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
            Main Summary
          </Text>
          <Text style={{ color: '#D1D5DB', marginTop: 12, lineHeight: 22 }}>
            This week shows strong consistency. Your biggest opportunity is to connect technical work with tactical decisions during matches.
          </Text>
        </View>

        <View style={{ marginTop: 20, backgroundColor: '#151B2E', padding: 20, borderRadius: 20 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
            Focus for Next Week
          </Text>
          <Text style={{ color: '#D1D5DB', marginTop: 12 }}>• First serve percentage</Text>
          <Text style={{ color: '#D1D5DB', marginTop: 8 }}>• Recovery after long rallies</Text>
          <Text style={{ color: '#D1D5DB', marginTop: 8 }}>• Confidence on important points</Text>
        </View>

        <View style={{ marginTop: 20, backgroundColor: '#151B2E', padding: 20, borderRadius: 20 }}>
          <Text style={{ color: 'white', fontSize: 20, fontWeight: '700' }}>
            Coach Message
          </Text>
          <Text style={{ color: '#D1D5DB', marginTop: 12, lineHeight: 22 }}>
            Keep training with intention. Do not only count sessions — measure what changed after each session.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
