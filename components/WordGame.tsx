import { AnimatePresence, MotiView } from 'moti';
import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const ALL_WORDS = [
  { id: '1', text: 'Moti' },
  { id: '2', text: 'is' },
  { id: '3', text: 'really' },
  { id: '4', text: 'smooth' },
];

export default function WordGame() {
  // We track the IDs in the order they were clicked
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handlePick = (id: string) => {
    if (!selectedIds.includes(id)) {
      setSelectedIds((prev) => [...prev, id]);
    }
  };

  const handleRemove = (id: string) => {
    setSelectedIds((prev) => prev.filter((item) => item !== id));
  };

  // Helper to get the full word object from an ID
  const getWordById = (id: string) => ALL_WORDS.find(w => w.id === id);

  return (
    <View style={styles.container}>
      
      {/* --- SENTENCE AREA --- */}
      <View style={styles.sentenceArea}>
        <View style={styles.row}>
          <AnimatePresence>
            {selectedIds.map((id) => {
              const word = getWordById(id);
              return (
                word && (
                  <MotiView
                    key={`selected-${id}`}
                    from={{ opacity: 0, scale: 0.5, translateY: 15 }}
                    animate={{ opacity: 1, scale: 1, translateY: 0 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    style={styles.wordBadgeSelected}
                  >
                    <TouchableOpacity onPress={() => handleRemove(id)}>
                      <Text style={styles.selectedText}>{word.text}</Text>
                    </TouchableOpacity>
                  </MotiView>
                )
              );
            })}
          </AnimatePresence>
        </View>
      </View>

      {/* --- PERSISTENT WORD BANK --- */}
      <View style={styles.bankArea}>
        <View style={styles.row}>
          {ALL_WORDS.map((word) => {
            const isUsed = selectedIds.includes(word.id);
            
            return (
              <View key={`bank-${word.id}`} style={styles.slotWrapper}>
                {/* The "Ghost" or Disabled State */}
                <MotiView
                  animate={{ 
                    opacity: isUsed ? 0.2 : 1,
                    scale: isUsed ? 0.95 : 1 
                  }}
                  transition={{ type: 'timing', duration: 200 }}
                >
                  <TouchableOpacity 
                    style={styles.wordBadge} 
                    onPress={() => handlePick(word.id)}
                    disabled={isUsed}
                  >
                    <Text style={styles.wordText}>{word.text}</Text>
                  </TouchableOpacity>
                </MotiView>
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#F5F7FA' },
  sentenceArea: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  bankArea: { paddingVertical: 30, borderTopWidth: 1, borderColor: '#DDD' },
  row: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
  wordBadge: {
    backgroundColor: '#FFF',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 15,
    margin: 6,
    borderWidth: 1,
    borderColor: '#CCC',
  },
  wordBadgeSelected: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: 18,
    paddingVertical: 12,
    borderRadius: 15,
    margin: 4,
  },
  wordText: { fontSize: 16, color: '#333' },
  selectedText: { fontSize: 16, color: '#FFF', fontWeight: '600' },
  slotWrapper: {
    // This ensures the word bank layout never shifts
    minWidth: 80, 
  }
});