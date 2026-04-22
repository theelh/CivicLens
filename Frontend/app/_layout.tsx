import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { ActivityIndicator, View } from 'react-native';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useEffect } from 'react';

export const unstable_settings = {
  // Removed anchor property to prevent '(tabs)' from appearing in the header
};

SplashScreen.preventAutoHideAsync();
function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth(); 
  const colorScheme = useColorScheme();
  const [loaded] = useFonts({
    'InterBlack': require('../assets/fonts/inter/Inter-Black.ttf'),
    'InterBlackItalic': require('../assets/fonts/inter/Inter-BlackItalic.ttf'),
    'InterBold': require('../assets/fonts/inter/Inter-Bold.ttf'),
    'InterBoldItalic': require('../assets/fonts/inter/Inter-BoldItalic.ttf'),
    'InterExtraBoldItalic': require('../assets/fonts/inter/Inter-ExtraBoldItalic.ttf'),
    'InterExtraBold': require('../assets/fonts/inter/Inter-ExtraBold.ttf'),
    'InterMedium': require('../assets/fonts/inter/Inter-Medium.ttf'),
    'InterMediumItalic': require('../assets/fonts/inter/Inter-MediumItalic.ttf'),
    'InterRegular': require('../assets/fonts/inter/Inter-Regular.ttf'),
    'InterSemiBoldItalic': require('../assets/fonts/inter/Inter-SemiBoldItalic.ttf'),

    //Satoshi
    'SatoshiBlack': require('../assets/fonts/satoshi/Satoshi-Black.ttf'),
    'SatoshiBlackItalic': require('../assets/fonts/satoshi/Satoshi-BlackItalic.ttf'),
    'SatoshiBold': require('../assets/fonts/satoshi/Satoshi-Bold.ttf'),
    'SatoshiBoldItalic': require('../assets/fonts/satoshi/Satoshi-BoldItalic.ttf'),
    'SatoshiItalic': require('../assets/fonts/satoshi/Satoshi-Italic.ttf'),
    'SatoshiLight': require('../assets/fonts/satoshi/Satoshi-Light.ttf'),
    'SatoshiLightItalic': require('../assets/fonts/satoshi/Satoshi-LightItalic.ttf'),
    'SatoshiMedium': require('../assets/fonts/satoshi/Satoshi-Medium.ttf'),
    'SatoshiMediumItalic': require('../assets/fonts/satoshi/Satoshi-MediumItalic.ttf'),
    'SatoshiRegular': require('../assets/fonts/satoshi/Satoshi-Regular.ttf'),    
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) return null;

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#fff' : '#0a7ea4'} />
      </View>
    );
  }

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack screenOptions={{ headerShown: false, headerTitle: 'Home' }}>
        {isAuthenticated ? (
          <>
            <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
            <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
          </>
        ) : ( 
            <Stack.Screen name="index" options={{ headerShown: false, title: 'Home' }} />
        )}
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootNavigator />
    </AuthProvider>
  );
}
