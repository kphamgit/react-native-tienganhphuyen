import api from '@/api/axios';
import { ButtonDemo } from '@/components/tamagui_demos/ButtonDemo';
import { CategoryProps } from '@/components/types';
import { HeaderBackButton } from '@react-navigation/elements';
import { router, Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Text, YStack } from 'tamagui';

export default function LevelScreen() {
  const { id } = useLocalSearchParams();
  const [levelName, setLevelName] = useState<string | undefined>(undefined);
  const [categories, setCategories] = useState<CategoryProps[]>([]);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    api.get(`/english/levels/${id}/`)
      .then((res) => res.data)
      .then((data) => {
        setLevelName(data.name);
        setCategories(data.categories);
      })
      .catch((err) => alert(err));
  }, [id]);

  const handleClick = (categoryId: string) => {
    router.replace(`/categories/${categoryId}`);
  };

  return (
    <>
      <Stack.Screen
        options={{
          headerTitle: levelName || '',
          headerStyle: { backgroundColor: 'orange' },
          headerTitleStyle: { color: 'white', fontWeight: 'bold', fontSize: 16 },
          headerLeft: () => (
            <HeaderBackButton onPress={() => router.replace('/(app)/dashboard')} />
          ),
          headerShown: true,
        }}
      />
      
      <YStack flex={1} pb={insets.bottom}>
        <ScrollView>
          <YStack flex={1} p="$3" gap="$2">
            {categories && categories.length > 0 ? (
              categories.map((category: CategoryProps, index: number) => (
                <Button
                  key={index}
                  onPress={() => handleClick(category.id.toString())}
                >
                  {category.name}
                </Button>
              ))
            ) : (
              <Text text="center" mt="$10" color="$gray9">
                No levels available.
              </Text>
            )}
          </YStack>
        </ScrollView>
      </YStack>
      <ButtonDemo />  
    </>
  );
}
