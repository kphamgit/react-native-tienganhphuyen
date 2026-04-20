import api from '@/api/axios';
import { AudioModule, RecordingPresets, useAudioRecorder } from 'expo-audio';
import React, { useState } from 'react';
import { ActivityIndicator, Button, Text, View } from 'react-native';

interface VoiceRecorderProps {
  onResult?: (transcript: string) => void;
}

export default function VoiceRecorderSave({ onResult }: VoiceRecorderProps) {
  const audioRecorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const [isRecording, setIsRecording] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startRecording = async () => {
    setError(null);
    const status = await AudioModule.requestRecordingPermissionsAsync();
    if (!status.granted) {
      setError('Microphone permission denied.');
      return;
    }
    await AudioModule.setAudioModeAsync({
      allowsRecording: true,
      playsInSilentMode: true,
    });
    await audioRecorder.prepareToRecordAsync();
    audioRecorder.record();
    setIsRecording(true);
  };

  const stopAndUpload = async () => {
    setIsRecording(false);
    await audioRecorder.stop();

    const uri = audioRecorder.uri;
    if (!uri) {
      setError('No recording found.');
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('audio', {
        uri,
        name: 'recording.m4a',
        type: 'audio/m4a',
      } as any);

      const response = await api.post('/api/speech-to-text/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onResult?.(response.data.transcript);
    } catch (err: any) {
      setError(err.message || 'Upload failed.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <View style={{ alignItems: 'center', gap: 12 }}>
      {isUploading ? (
        <ActivityIndicator size="large" />
      ) : isRecording ? (
        <Button title="Stop & Send" color="red" onPress={stopAndUpload} />
      ) : (
        <Button title="Record" onPress={startRecording} />
      )}
      {error && <Text style={{ color: 'red' }}>{error}</Text>}
    </View>
  );
}
