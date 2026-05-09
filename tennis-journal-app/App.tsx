import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, Text, View } from 'react-native';

import CreateEntryScreen from './screens/CreateEntryScreen';
import EntriesScreen from './screens/EntriesScreen';
import WeeklyReviewScreen from './screens/WeeklyReviewScreen';
import AIInsightCard from './components/AIInsightCard';

const Tab = createBottomTabNavigator();

function HomeScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1020', padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 32, fontWeight: '700' }}>
        AI Tennis Journal
      </Text>

      <Text style={{ color: '#9CA3AF', marginTop: 12, fontSize: 16 }}>
        Track your training, matches, mindset and progress.
      </Text>

      <AIInsightCard
        title="AI Coach Insight"
        insight="Your consistency is improving. Focus on movement and recovery this week. Your mental stability during long rallies has improved compared to previous sessions."
      />

      <View
        style={{
          marginTop: 20,
          backgroundColor: '#151B2E',
          padding: 20,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18, fontWeight: '600' }}>
          Weekly Goals
        </Text>

        <Text style={{ color: '#D1D5DB', marginTop: 10 }}>
          • Improve first serve percentage
        </Text>

        <Text style={{ color: '#D1D5DB', marginTop: 8 }}>
          • Work on recovery after matches
        </Text>

        <Text style={{ color: '#D1D5DB', marginTop: 8 }}>
          • Stay aggressive on short balls
        </Text>
      </View>
    </SafeAreaView>
  );
}

function StatsScreen() {
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#0B1020', padding: 20 }}>
      <Text style={{ color: 'white', fontSize: 28, fontWeight: '700' }}>
        Statistics
      </Text>

      <View
        style={{
          marginTop: 24,
          backgroundColor: '#151B2E',
          padding: 20,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: 'white', fontSize: 18 }}>
          Weekly Progress
        </Text>

        <Text style={{ color: '#9CA3AF', marginTop: 10 }}>
          Matches won: 4
        </Text>

        <Text style={{ color: '#9CA3AF', marginTop: 6 }}>
          Training sessions: 6
        </Text>

        <Text style={{ color: '#9CA3AF', marginTop: 6 }}>
          Average mood: 8/10
        </Text>
      </View>
    </SafeAreaView>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          headerShown: false,
          tabBarStyle: {
            backgroundColor: '#111827',
            borderTopWidth: 0,
          },
          tabBarActiveTintColor: '#3B82F6',
          tabBarInactiveTintColor: '#6B7280',
        }}
      >
        <Tab.Screen name="Home" component={HomeScreen} />
        <Tab.Screen name="New Entry" component={CreateEntryScreen} />
        <Tab.Screen name="Journal" component={EntriesScreen} />
        <Tab.Screen name="Weekly" component={WeeklyReviewScreen} />
        <Tab.Screen name="Stats" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
