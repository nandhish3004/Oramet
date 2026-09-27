import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useAuthStore } from './state/useAuthStore';
import { WeatherIcon } from './components/WeatherIcon';
import { Colors, FontSize, Spacing } from './theme/colors';

// Auth screens
import { LanguageSelectScreen } from './screens/auth/LanguageSelectScreen';
import { WelcomeScreen } from './screens/auth/WelcomeScreen';
import { LoginScreen } from './screens/auth/LoginScreen';
import { SignUpScreen } from './screens/auth/SignUpScreen';

// Main screens
import { DashboardScreen } from './screens/home/DashboardScreen';
import { AlertsScreen } from './screens/alerts/AlertsScreen';
import { AlertDetailScreen } from './screens/alerts/AlertDetailScreen';
import { MapViewScreen } from './screens/map/MapViewScreen';
import { ProfileScreen } from './screens/profile/ProfileScreen';
import { SettingsScreen } from './screens/profile/SettingsScreen';
import { EditProfileScreen } from './screens/profile/EditProfileScreen';
import { RiskScoreScreen } from './screens/risk/RiskScoreScreen';
import { SOSScreen } from './screens/emergency/SOSScreen';
import { EvacuationGuidanceScreen } from './screens/map/EvacuationGuidanceScreen';
import { SafeHavenScreen } from './screens/map/SafeHavenScreen';

// Types
export type AuthStackParamList = {
  LanguageSelect: undefined;
  Welcome: undefined;
  Login: undefined;
  SignUp: undefined;
};

export type RootStackParamList = {
  MainTabs: undefined;
  RiskScore: undefined;
  AlertDetail: { alertId: string };
  Settings: undefined;
  EditProfile: undefined;
  Emergency: undefined;
  EvacuationGuidance: undefined;
  SafeHaven: undefined;
};

export type TabParamList = {
  HomeTab: undefined;
  AlertsTab: undefined;
  MapTab: undefined;
  ProfileTab: undefined;
};

const AuthStack = createNativeStackNavigator<AuthStackParamList>();
const RootStack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

// Light theme for NavigationContainer
const LightNavTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: Colors.accent.cyan,
    background: Colors.bg.primary,
    card: Colors.bg.secondary,
    text: Colors.text.primary,
    border: Colors.border.subtle,
    notification: Colors.accent.amber,
  },
};

const TabIcon: React.FC<{ name: any; focused: boolean }> = ({ name, focused }) => {
  if (focused) {
    return (
      <View
        style={{
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: '#1F1A17',
          alignItems: 'center',
          justifyContent: 'center',
          shadowColor: '#1F1A17',
          shadowOpacity: 0.2,
          shadowRadius: 6,
          elevation: 4,
        }}
      >
        <WeatherIcon name={name} size={20} color="#FFFFFF" />
      </View>
    );
  }
  return <WeatherIcon name={name} size={22} color="#827C77" />;
};

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          bottom: 22,
          left: 40,
          right: 40,
          height: 64,
          borderRadius: 32,
          backgroundColor: '#EAE6DF',
          borderTopWidth: 0,
          elevation: 12,
          shadowColor: '#1F1A17',
          shadowOpacity: 0.12,
          shadowRadius: 18,
          borderWidth: 1,
          borderColor: 'rgba(255, 255, 255, 0.6)',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-around',
          paddingHorizontal: 12,
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={DashboardScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="home" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="AlertsTab"
        component={AlertsScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="bell" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="MapTab"
        component={MapViewScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="map" focused={focused} />,
        }}
      />
      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon name="user" focused={focused} />,
        }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }} initialRouteName="LanguageSelect">
      <AuthStack.Screen name="LanguageSelect" component={LanguageSelectScreen} />
      <AuthStack.Screen name="Welcome" component={WelcomeScreen} />
      <AuthStack.Screen name="Login" component={LoginScreen} />
      <AuthStack.Screen name="SignUp" component={SignUpScreen} />
    </AuthStack.Navigator>
  );
}

function AppNavigator() {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: Colors.bg.secondary },
        headerTitleStyle: { fontWeight: '700', color: Colors.text.primary, fontSize: FontSize.lg },
        headerTintColor: Colors.accent.cyan,
        headerShadowVisible: false,
      }}
    >
      <RootStack.Screen
        name="MainTabs"
        component={MainTabNavigator}
        options={{ headerShown: false }}
      />
      <RootStack.Screen
        name="RiskScore"
        component={RiskScoreScreen}
        options={{ title: 'Safety Breakdown' }}
      />
      <RootStack.Screen
        name="AlertDetail"
        component={AlertDetailScreen}
        options={{ title: 'Alert Details' }}
      />
      <RootStack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
      <RootStack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{ title: 'Edit Profile' }}
      />
      <RootStack.Screen
        name="Emergency"
        component={SOSScreen}
        options={{ title: 'Emergency SOS', headerShown: false }}
      />
      <RootStack.Screen
        name="EvacuationGuidance"
        component={EvacuationGuidanceScreen}
        options={{ title: 'Safe Evacuation Guidance', headerShown: false }}
      />
      <RootStack.Screen
        name="SafeHaven"
        component={SafeHavenScreen}
        options={{ title: 'Safe Haven Relief Hub', headerShown: false }}
      />
    </RootStack.Navigator>
  );
}

export function Navigation() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return (
    <NavigationContainer theme={LightNavTheme}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}