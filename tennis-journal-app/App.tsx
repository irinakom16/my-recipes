import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaView, Text, View, TouchableOpacity } from 'react-native';

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

      <View
        style={{
          marginTop: 24,
          backgroundColor: '#151B2E',
          padding: 20,
          borderRadius: 20,
        }}
      >
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '600' }}>
          AI Coach Insight
        </Text>

        <Text style={{ color: '#D1D5DB', marginTop: 12, lineHeight: 22 }}>
          Your consistency is improving. Focus on movement and recovery this week.
        </Text>
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
          Add Training Entry
        </Text>
      </TouchableOpacity>
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
        <Tab.Screen name="Stats" component={StatsScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
