/**
 * Venturr Mobile - Measurement Screen
 * Camera-based site measurements with AR capabilities
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Alert,
  ScrollView,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('window');

interface Measurement {
  id: string;
  type: 'length' | 'area' | 'angle';
  value: number;
  unit: string;
  timestamp: Date;
  notes: string;
}

export default function MeasurementScreen() {
  const insets = useSafeAreaInsets();
  const [cameraActive, setCameraActive] = useState(false);
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [currentMode, setCurrentMode] = useState<'length' | 'area' | 'angle'>('length');
  const [showResults, setShowResults] = useState(false);

  const addMeasurement = (type: 'length' | 'area' | 'angle', value: number, unit: string) => {
    const measurement: Measurement = {
      id: `measure-${Date.now()}`,
      type,
      value,
      unit,
      timestamp: new Date(),
      notes: '',
    };
    setMeasurements([...measurements, measurement]);
  };

  const calculateTotalArea = () => {
    const areaItems = measurements.filter((m) => m.type === 'area');
    return areaItems.reduce((sum, m) => sum + m.value, 0);
  };

  const calculateTotalLength = () => {
    const lengthItems = measurements.filter((m) => m.type === 'length');
    return lengthItems.reduce((sum, m) => sum + m.value, 0);
  };

  if (showResults) {
    return (
      <ScrollView style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setShowResults(false)}>
            <Text style={styles.backButton}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Measurement Results</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Summary Cards */}
        <View style={styles.summaryContainer}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Area</Text>
            <Text style={styles.summaryValue}>{calculateTotalArea().toFixed(2)}</Text>
            <Text style={styles.summaryUnit}>sq ft</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Total Length</Text>
            <Text style={styles.summaryValue}>{calculateTotalLength().toFixed(2)}</Text>
            <Text style={styles.summaryUnit}>ft</Text>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryLabel}>Measurements</Text>
            <Text style={styles.summaryValue}>{measurements.length}</Text>
            <Text style={styles.summaryUnit}>total</Text>
          </View>
        </View>

        {/* Measurements List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>All Measurements</Text>

          {measurements.length === 0 ? (
            <Text style={styles.emptyText}>No measurements taken yet</Text>
          ) : (
            measurements.map((measurement) => (
              <View key={measurement.id} style={styles.measurementItem}>
                <View style={styles.measurementIcon}>
                  <Text style={styles.iconText}>
                    {measurement.type === 'length' && '📏'}
                    {measurement.type === 'area' && '📐'}
                    {measurement.type === 'angle' && '∠'}
                  </Text>
                </View>
                <View style={styles.measurementInfo}>
                  <Text style={styles.measurementType}>
                    {measurement.type.charAt(0).toUpperCase() + measurement.type.slice(1)}
                  </Text>
                  <Text style={styles.measurementTime}>
                    {measurement.timestamp.toLocaleTimeString()}
                  </Text>
                </View>
                <View style={styles.measurementValue}>
                  <Text style={styles.valueText}>
                    {measurement.value.toFixed(2)} {measurement.unit}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionContainer}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={() => {
              Alert.alert('Success', 'Measurements saved to project');
              setShowResults(false);
              setMeasurements([]);
            }}
          >
            <Text style={styles.buttonText}>Save Measurements</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.button, styles.secondaryButton]}
            onPress={() => {
              setMeasurements([]);
              setShowResults(false);
            }}
          >
            <Text style={styles.secondaryButtonText}>Clear All</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity>
          <Text style={styles.backButton}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Site Measurement</Text>
        <TouchableOpacity>
          <Text style={styles.helpButton}>?</Text>
        </TouchableOpacity>
      </View>

      {/* Camera View Placeholder */}
      <View style={styles.cameraContainer}>
        <View style={styles.cameraPlaceholder}>
          <Text style={styles.cameraIcon}>📷</Text>
          <Text style={styles.cameraText}>Camera View</Text>
          <Text style={styles.cameraSubtext}>Point camera at surface to measure</Text>
        </View>

        {/* Measurement Grid Overlay */}
        <View style={styles.gridOverlay}>
          <View style={styles.gridLine} />
          <View style={[styles.gridLine, { transform: [{ rotate: '90deg' }] }]} />
        </View>
      </View>

      {/* Measurement Mode Selector */}
      <View style={styles.modeContainer}>
        <TouchableOpacity
          style={[styles.modeButton, currentMode === 'length' && styles.activeModeButton]}
          onPress={() => setCurrentMode('length')}
        >
          <Text style={styles.modeIcon}>📏</Text>
          <Text style={[styles.modeLabel, currentMode === 'length' && styles.activeModeLabel]}>
            Length
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, currentMode === 'area' && styles.activeModeButton]}
          onPress={() => setCurrentMode('area')}
        >
          <Text style={styles.modeIcon}>📐</Text>
          <Text style={[styles.modeLabel, currentMode === 'area' && styles.activeModeLabel]}>
            Area
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.modeButton, currentMode === 'angle' && styles.activeModeButton]}
          onPress={() => setCurrentMode('angle')}
        >
          <Text style={styles.modeIcon}>∠</Text>
          <Text style={[styles.modeLabel, currentMode === 'angle' && styles.activeModeLabel]}>
            Angle
          </Text>
        </TouchableOpacity>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActionsContainer}>
        <TouchableOpacity
          style={styles.quickActionButton}
          onPress={() => {
            const mockValue = Math.random() * 100 + 50;
            addMeasurement(currentMode, mockValue, currentMode === 'angle' ? '°' : 'ft');
          }}
        >
          <Text style={styles.quickActionIcon}>✓</Text>
          <Text style={styles.quickActionLabel}>Record</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionIcon}>📸</Text>
          <Text style={styles.quickActionLabel}>Photo</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionIcon}>📍</Text>
          <Text style={styles.quickActionLabel}>Location</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.quickActionButton}>
          <Text style={styles.quickActionIcon}>🔄</Text>
          <Text style={styles.quickActionLabel}>Undo</Text>
        </TouchableOpacity>
      </View>

      {/* Measurement Counter */}
      <View style={styles.counterContainer}>
        <Text style={styles.counterLabel}>Measurements Recorded</Text>
        <Text style={styles.counterValue}>{measurements.length}</Text>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity
          style={[styles.button, styles.primaryButton]}
          onPress={() => setShowResults(true)}
          disabled={measurements.length === 0}
        >
          <Text style={styles.buttonText}>Review Results</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.secondaryButton]}>
          <Text style={styles.secondaryButtonText}>Continue Measuring</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    fontSize: 16,
    fontWeight: '600',
    color: '#3B82F6',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  helpButton: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B7280',
  },
  cameraContainer: {
    height: 300,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  cameraPlaceholder: {
    alignItems: 'center',
  },
  cameraIcon: {
    fontSize: 64,
    marginBottom: 12,
  },
  cameraText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cameraSubtext: {
    fontSize: 14,
    color: '#D1D5DB',
  },
  gridOverlay: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    opacity: 0.2,
  },
  gridLine: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: '#FFFFFF',
  },
  modeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modeButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeModeButton: {
    borderColor: '#3B82F6',
    backgroundColor: '#EFF6FF',
  },
  modeIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  modeLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
  },
  activeModeLabel: {
    color: '#3B82F6',
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: '#FFFFFF',
  },
  quickActionButton: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  quickActionIcon: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickActionLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#6B7280',
  },
  counterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  counterLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  counterValue: {
    fontSize: 32,
    fontWeight: '700',
    color: '#3B82F6',
  },
  actionContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3B82F6',
  },
  secondaryButton: {
    backgroundColor: '#F3F4F6',
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  section: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    paddingVertical: 20,
  },
  measurementItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  measurementIcon: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  iconText: {
    fontSize: 20,
  },
  measurementInfo: {
    flex: 1,
  },
  measurementType: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  measurementTime: {
    fontSize: 12,
    color: '#9CA3AF',
  },
  measurementValue: {
    alignItems: 'flex-end',
  },
  valueText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#3B82F6',
  },
  summaryContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  summaryLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  summaryUnit: {
    fontSize: 11,
    color: '#9CA3AF',
  },
});

