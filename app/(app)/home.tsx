import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../src/redux/store';
import { fetchMagazines, selectMagazines, selectListingLoading } from '../../src/redux/slices/listingSlice';
import { useTheme } from '../../src/hooks/useTheme';

export default function HomeScreen() {
  const theme = useTheme();
  const dispatch = useDispatch<AppDispatch>();
  const magazines = useSelector(selectMagazines);
  const isLoading = useSelector(selectListingLoading);

  useEffect(() => {
    dispatch(fetchMagazines());
  }, [dispatch]);

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <Text style={[styles.loadingText, { color: theme.colors.text }]}>
          Loading magazines...
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView style={styles.scrollView}>
        <Text style={[styles.title, { color: theme.colors.text }]}>
          Welcome to EchoReads
        </Text>
        <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
          Discover amazing magazines and books
        </Text>
        
        <View style={styles.magazineGrid}>
          {magazines.slice(0, 6).map((magazine) => (
            <TouchableOpacity
              key={magazine._id}
              style={[styles.magazineCard, { backgroundColor: theme.colors.surface }]}
            >
              <Text style={[styles.magazineTitle, { color: theme.colors.text }]}>
                {magazine.name}
              </Text>
              <Text style={[styles.magazineCategory, { color: theme.colors.textSecondary }]}>
                {magazine.category}
              </Text>
              <Text style={[styles.magazineRating, { color: theme.colors.primary }]}>
                ⭐ {magazine.rating}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
  },
  loadingText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 100,
  },
  magazineGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  magazineCard: {
    width: '48%',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  magazineTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  magazineCategory: {
    fontSize: 14,
    marginBottom: 8,
  },
  magazineRating: {
    fontSize: 14,
    fontWeight: '600',
  },
}); 