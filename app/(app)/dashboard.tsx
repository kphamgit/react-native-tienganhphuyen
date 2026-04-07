// app/(app)/dashboard.tsx
import api from '@/api/axios';
import { useAuth } from '@/components/context/auth';
import { LevelProps } from '@/components/types';
import { router } from 'expo-router';
import React, { useEffect } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, ScrollView, Text, YStack } from 'tamagui';

export default function Dashboard() {
    const auth = useAuth();
    const signOut = auth?.signOut;
    const insets = useSafeAreaInsets();

    const [levels, setLevels] = React.useState<LevelProps[]>([]);

    useEffect(() => {
        console.log(' Dashboard insets top : ', insets.top)
        console.log(' Dashboard insets bottom : ', insets.bottom)
    }, [insets]);

    const getLevels = () => {
        api
            .get("/api/levels/")
            .then((res) => res.data)
            .then((data) => {
                console.log("***** levels: ", data as LevelProps[]);
                setLevels(data as LevelProps[]);
                (data as LevelProps[]).forEach(level => {
                    console.log(`Level: ${level.name}, ID: ${level.id}`);
                    level.categories.forEach(category => {
                        console.log(` Category: ${category.name}, ID: ${category.id}`);
                    });
                });
            })
            .catch((err) => alert(err));
    };

    useEffect(() => {
        getLevels();
    }, []);

    const handleClick = (id: string) => {
        console.log("Level clicked! id =", id);
        router.replace(`/levels/${id}`);
    };

    return (
        <YStack flex={1} pt={insets.top} pb={insets.bottom}>
            <YStack items="flex-start">
                <Button onPress={signOut} theme="red">
                    Logout
                </Button>
            </YStack>

            <ScrollView style={{ width: '100%' }}>
                <YStack p="$2" bg="$green4" gap="$2">
                    {levels && levels.length > 0 ? (
                        levels.map((level: LevelProps, index: number) => (
                            <Button
                                key={index}
                                theme="blue"
                                bg="$color7"
                                rounded="$2"
                                onPress={() => handleClick(level.id.toString())}
                            >
                                {level.name}
                            </Button>
                        ))
                    ) : (
                        <Text mt={50} color="$color9">
                            No levels available.
                        </Text>
                    )}
                </YStack>
            </ScrollView>
        </YStack>
    );
}
