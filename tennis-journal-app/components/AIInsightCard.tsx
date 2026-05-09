import React from 'react';
import { Text, View } from 'react-native';

type Props = {
  title: string;
  insight: string;
};

export default function AIInsightCard({ title, insight }: Props) {
  return (
    <View
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
          fontWeight: '700',
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: '#D1D5DB',
          marginTop: 12,
          lineHeight: 22,
        }}
      >
        {insight}
      </Text>
    </View>
  );
}
