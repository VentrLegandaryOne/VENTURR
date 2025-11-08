/**
 * Predictive Maintenance & IoT
 * Equipment monitoring, predictive failure alerts, maintenance scheduling, IoT sensor integration
 */

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'warning' | 'critical' | 'maintenance';
  healthScore: number;
  lastMaintenance: string;
  nextMaintenance: string;
  sensors: number;
  location: string;
  predictedFailure?: string;
}

interface SensorReading {
  id: string;
  equipment: string;
  sensorType: string;
  value: number;
  unit: string;
  threshold: number;
  status: 'normal' | 'warning' | 'critical';
  timestamp: string;
}

interface MaintenanceTask {
  id: string;
  equipment: string;
  type: string;
  status: 'scheduled' | 'in-progress' | 'completed' | 'overdue';
  dueDate: string;
  completedDate?: string;
  technician: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  estimatedDuration: string;
}

interface PredictiveAlert {
  id: string;
  equipment: string;
  type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  predictedFailureDate: string;
  confidence: number;
  description: string;
  recommendedAction: string;
  createdAt: string;
  status: 'new' | 'acknowledged' | 'resolved';
}

interface IoTDevice {
  id: string;
  deviceId: string;
  equipment: string;
  type: string;
  status: 'online' | 'offline' | 'error';
  lastSync: string;
  battery: number;
  signalStrength: number;
  dataPoints: number;
}

interface MaintenanceHistory {
  id: string;
  equipment: string;
  date: string;
  type: string;
  technician: string;
  duration: string;
  cost: number;
  notes: string;
}

export default function PredictiveMaintenanceIoT() {
  const [activeTab, setActiveTab] = useState('equipment');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);

  const [equipment] = useState<Equipment[]>([
    {
      id: '1',
      name: 'Excavator - Unit 001',
      type: 'Heavy Equipment',
      status: 'operational',
      healthScore: 92,
      lastMaintenance: '2025-01-15',
      nextMaintenance: '2025-02-15',
      sensors: 8,
      location: 'Site A',
      predictedFailure: '2025-03-20',
    },
    {
      id: '2',
      name: 'Concrete Mixer - Unit 002',
      type: 'Mixing Equipment',
      status: 'warning',
      healthScore: 68,
      lastMaintenance: '2024-12-20',
      nextMaintenance: '2025-01-31',
      sensors: 5,
      location: 'Site B',
      predictedFailure: '2025-02-10',
    },
    {
      id: '3',
      name: 'Crane - Unit 003',
      type: 'Heavy Equipment',
      status: 'critical',
      healthScore: 35,
      lastMaintenance: '2024-11-10',
      nextMaintenance: '2025-01-25',
      sensors: 12,
      location: 'Site A',
      predictedFailure: '2025-02-01',
    },
    {
      id: '4',
      name: 'Compressor - Unit 004',
      type: 'Pneumatic Equipment',
      status: 'operational',
      healthScore: 88,
      lastMaintenance: '2025-01-20',
      nextMaintenance: '2025-02-20',
      sensors: 6,
      location: 'Site C',
    },
  ]);

  const [sensorReadings] = useState<SensorReading[]>([
    {
      id: '1',
      equipment: 'Excavator - Unit 001',
      sensorType: 'Temperature',
      value: 78,
      unit: '°C',
      threshold: 85,
      status: 'normal',
      timestamp: '2025-01-31 14:32',
    },
    {
      id: '2',
      equipment: 'Concrete Mixer - Unit 002',
      sensorType: 'Vibration',
      value: 4.2,
      unit: 'mm/s',
      threshold: 3.5,
      status: 'warning',
      timestamp: '2025-01-31 14:30',
    },
    {
      id: '3',
      equipment: 'Crane - Unit 003',
      sensorType: 'Pressure',
      value: 95,
      unit: 'PSI',
      threshold: 80,
      status: 'critical',
      timestamp: '2025-01-31 14:28',
    },
    {
      id: '4',
      equipment: 'Compressor - Unit 004',
      sensorType: 'Oil Level',
      value: 87,
      unit: '%',
      threshold: 75,
      status: 'normal',
      timestamp: '2025-01-31 14:31',
    },
  ]);

  const [maintenanceTasks] = useState<MaintenanceTask[]>([
    {
      id: '1',
      equipment: 'Crane - Unit 003',
      type: 'Hydraulic System Inspection',
      status: 'overdue',
      dueDate: '2025-01-25',
      technician: 'John Smith',
      priority: 'critical',
      estimatedDuration: '4 hours',
    },
    {
      id: '2',
      equipment: 'Concrete Mixer - Unit 002',
      type: 'Belt Replacement',
      status: 'scheduled',
      dueDate: '2025-01-31',
      technician: 'Sarah Johnson',
      priority: 'high',
      estimatedDuration: '2 hours',
    },
    {
      id: '3',
      equipment: 'Excavator - Unit 001',
      type: 'Oil Change',
      status: 'in-progress',
      dueDate: '2025-01-30',
      completedDate: '2025-01-31',
      technician: 'Mike Davis',
      priority: 'medium',
      estimatedDuration: '1.5 hours',
    },
  ]);

  const [predictiveAlerts] = useState<PredictiveAlert[]>([
    {
      id: '1',
      equipment: 'Crane - Unit 003',
      type: 'Hydraulic Failure',
      severity: 'critical',
      predictedFailureDate: '2025-02-01',
      confidence: 0.94,
      description: 'Hydraulic pressure trending toward critical levels',
      recommendedAction: 'Schedule immediate hydraulic system inspection',
      createdAt: '2025-01-31 14:15',
      status: 'new',
    },
    {
      id: '2',
      equipment: 'Concrete Mixer - Unit 002',
      type: 'Motor Bearing Wear',
      severity: 'high',
      predictedFailureDate: '2025-02-10',
      confidence: 0.87,
      description: 'Vibration levels indicate bearing degradation',
      recommendedAction: 'Replace motor bearings within 10 days',
      createdAt: '2025-01-31 14:00',
      status: 'acknowledged',
    },
    {
      id: '3',
      equipment: 'Excavator - Unit 001',
      type: 'Engine Oil Degradation',
      severity: 'medium',
      predictedFailureDate: '2025-03-20',
      confidence: 0.76,
      description: 'Oil analysis shows early signs of degradation',
      recommendedAction: 'Schedule oil change in 2-3 weeks',
      createdAt: '2025-01-30 10:30',
      status: 'resolved',
    },
  ]);

  const [iotDevices] = useState<IoTDevice[]>([
    {
      id: '1',
      deviceId: 'IOT-001-TEMP',
      equipment: 'Excavator - Unit 001',
      type: 'Temperature Sensor',
      status: 'online',
      lastSync: '2025-01-31 14:32',
      battery: 87,
      signalStrength: 95,
      dataPoints: 12847,
    },
    {
      id: '2',
      deviceId: 'IOT-002-VIB',
      equipment: 'Concrete Mixer - Unit 002',
      type: 'Vibration Sensor',
      status: 'online',
      lastSync: '2025-01-31 14:30',
      battery: 72,
      signalStrength: 88,
      dataPoints: 8934,
    },
    {
      id: '3',
      deviceId: 'IOT-003-PRESS',
      equipment: 'Crane - Unit 003',
      type: 'Pressure Sensor',
      status: 'online',
      lastSync: '2025-01-31 14:28',
      battery: 45,
      signalStrength: 92,
      dataPoints: 15234,
    },
    {
      id: '4',
      deviceId: 'IOT-004-OIL',
      equipment: 'Compressor - Unit 004',
      type: 'Oil Level Sensor',
      status: 'offline',
      lastSync: '2025-01-31 12:15',
      battery: 12,
      signalStrength: 0,
      dataPoints: 6543,
    },
  ]);

  const [maintenanceHistory] = useState<MaintenanceHistory[]>([
    {
      id: '1',
      equipment: 'Excavator - Unit 001',
      date: '2025-01-31',
      type: 'Oil Change',
      technician: 'Mike Davis',
      duration: '1.5 hours',
      cost: 250,
      notes: 'Replaced oil filter, topped up hydraulic fluid',
    },
    {
      id: '2',
      equipment: 'Concrete Mixer - Unit 002',
      date: '2025-01-20',
      type: 'Motor Inspection',
      technician: 'Sarah Johnson',
      duration: '2 hours',
      cost: 180,
      notes: 'Inspected motor bearings, applied grease',
    },
    {
      id: '3',
      equipment: 'Crane - Unit 003',
      date: '2024-11-10',
      type: 'Hydraulic System Overhaul',
      technician: 'John Smith',
      duration: '8 hours',
      cost: 1200,
      notes: 'Replaced hydraulic hoses, flushed system',
    },
  ]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
      case 'online':
      case 'completed':
      case 'normal':
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'warning':
      case 'offline':
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
      case 'error':
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'maintenance':
      case 'in-progress':
      case 'acknowledged':
        return 'bg-blue-100 text-blue-800';
      case 'new':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'bg-blue-100 text-blue-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const operationalEquipment = equipment.filter((e) => e.status === 'operational').length;
  const criticalAlerts = predictiveAlerts.filter((a) => a.severity === 'critical').length;
  const overdueTasks = maintenanceTasks.filter((t) => t.status === 'overdue').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-4xl font-bold text-slate-900">Predictive Maintenance & IoT</h1>
              <p className="text-slate-600 mt-2">Equipment monitoring, predictive alerts, maintenance scheduling</p>
            </div>
            <Button className="bg-blue-600 hover:bg-blue-700">+ Add Equipment</Button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Operational Equipment</p>
              <p className="text-3xl font-bold text-green-600">{operationalEquipment}/{equipment.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Critical Alerts</p>
              <p className="text-3xl font-bold text-red-600">{criticalAlerts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">Overdue Maintenance</p>
              <p className="text-3xl font-bold text-orange-600">{overdueTasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <p className="text-sm text-slate-600">IoT Devices Online</p>
              <p className="text-3xl font-bold text-slate-900">{iotDevices.filter((d) => d.status === 'online').length}/{iotDevices.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="equipment">Equipment</TabsTrigger>
            <TabsTrigger value="sensors">Sensors</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
            <TabsTrigger value="iot">IoT Devices</TabsTrigger>
            <TabsTrigger value="history">History</TabsTrigger>
          </TabsList>

          {/* Equipment Tab */}
          <TabsContent value="equipment" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {equipment.map((equip) => (
                <Card
                  key={equip.id}
                  className="cursor-pointer hover:shadow-lg transition-shadow"
                  onClick={() => setSelectedEquipment(equip)}
                >
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-slate-900">{equip.name}</h3>
                          <p className="text-sm text-slate-600">{equip.type}</p>
                        </div>
                        <Badge className={getStatusColor(equip.status)}>{equip.status}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Health Score</span>
                          <span className="font-semibold">{equip.healthScore}%</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              equip.healthScore >= 80
                                ? 'bg-green-600'
                                : equip.healthScore >= 50
                                ? 'bg-yellow-600'
                                : 'bg-red-600'
                            }`}
                            style={{ width: `${equip.healthScore}%` }}
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="text-slate-600">Location</p>
                          <p className="font-semibold text-slate-900">{equip.location}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Sensors</p>
                          <p className="font-semibold text-slate-900">{equip.sensors}</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Next Service</p>
                          <p className="font-semibold text-slate-900">{equip.nextMaintenance}</p>
                        </div>
                      </div>

                      {equip.predictedFailure && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded text-xs">
                          <p className="text-red-900">⚠️ Predicted failure: {equip.predictedFailure}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {selectedEquipment && (
              <Card>
                <CardHeader className="flex justify-between items-start">
                  <CardTitle>{selectedEquipment.name}</CardTitle>
                  <Button variant="ghost" onClick={() => setSelectedEquipment(null)}>
                    ✕
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-slate-600">Status</p>
                      <Badge className={getStatusColor(selectedEquipment.status)}>
                        {selectedEquipment.status}
                      </Badge>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Health Score</p>
                      <p className="text-2xl font-bold text-slate-900">{selectedEquipment.healthScore}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Last Maintenance</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedEquipment.lastMaintenance}</p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-600">Next Maintenance</p>
                      <p className="text-sm font-semibold text-slate-900">{selectedEquipment.nextMaintenance}</p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    <Button className="flex-1 bg-blue-600 hover:bg-blue-700">
                      Schedule Maintenance
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Sensors Tab */}
          <TabsContent value="sensors" className="space-y-4">
            {sensorReadings.map((reading) => (
              <Card key={reading.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{reading.sensorType}</h3>
                      <p className="text-sm text-slate-600">{reading.equipment}</p>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600">Current Value</p>
                          <p className="font-semibold text-slate-900">
                            {reading.value} {reading.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Threshold</p>
                          <p className="font-semibold text-slate-900">
                            {reading.threshold} {reading.unit}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Variance</p>
                          <p className={`font-semibold ${reading.value > reading.threshold ? 'text-red-600' : 'text-green-600'}`}>
                            {((reading.value / reading.threshold - 1) * 100).toFixed(1)}%
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Last Reading</p>
                          <p className="font-semibold text-slate-900">{reading.timestamp}</p>
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(reading.status)}>{reading.status}</Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Maintenance Tab */}
          <TabsContent value="maintenance" className="space-y-4">
            {maintenanceTasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{task.type}</h3>
                        <p className="text-sm text-slate-600">{task.equipment}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getStatusColor(task.status)}>{task.status}</Badge>
                        <Badge
                          className={
                            task.priority === 'critical'
                              ? 'bg-red-100 text-red-800'
                              : task.priority === 'high'
                              ? 'bg-orange-100 text-orange-800'
                              : task.priority === 'medium'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }
                        >
                          {task.priority}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Due Date</p>
                        <p className="font-semibold text-slate-900">{task.dueDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Technician</p>
                        <p className="font-semibold text-slate-900">{task.technician}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Duration</p>
                        <p className="font-semibold text-slate-900">{task.estimatedDuration}</p>
                      </div>
                      <div>
                        <Button size="sm" variant="outline">
                          Details
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Alerts Tab */}
          <TabsContent value="alerts" className="space-y-4">
            {predictiveAlerts.map((alert) => (
              <Card key={alert.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{alert.type}</h3>
                        <p className="text-sm text-slate-600">{alert.equipment}</p>
                      </div>
                      <div className="flex gap-2">
                        <Badge className={getSeverityColor(alert.severity)}>{alert.severity}</Badge>
                        <Badge className={getStatusColor(alert.status)}>{alert.status}</Badge>
                      </div>
                    </div>

                    <p className="text-sm text-slate-700">{alert.description}</p>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Predicted Failure</p>
                        <p className="font-semibold text-slate-900">{alert.predictedFailureDate}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Confidence</p>
                        <p className="font-semibold text-slate-900">{Math.round(alert.confidence * 100)}%</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Created</p>
                        <p className="font-semibold text-slate-900">{alert.createdAt}</p>
                      </div>
                    </div>

                    <div className="p-3 bg-blue-50 border border-blue-200 rounded">
                      <p className="text-sm font-semibold text-blue-900">💡 Recommended Action</p>
                      <p className="text-sm text-blue-800 mt-1">{alert.recommendedAction}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* IoT Devices Tab */}
          <TabsContent value="iot" className="space-y-4">
            {iotDevices.map((device) => (
              <Card key={device.id}>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h3 className="font-semibold text-slate-900">{device.deviceId}</h3>
                      <p className="text-sm text-slate-600">{device.type} - {device.equipment}</p>
                      <div className="grid grid-cols-4 gap-4 mt-3 text-sm">
                        <div>
                          <p className="text-slate-600">Status</p>
                          <Badge className={getStatusColor(device.status)}>{device.status}</Badge>
                        </div>
                        <div>
                          <p className="text-slate-600">Battery</p>
                          <p className="font-semibold text-slate-900">{device.battery}%</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Signal</p>
                          <p className="font-semibold text-slate-900">{device.signalStrength}%</p>
                        </div>
                        <div>
                          <p className="text-slate-600">Data Points</p>
                          <p className="font-semibold text-slate-900">{(device.dataPoints / 1000).toFixed(1)}K</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="space-y-4">
            {maintenanceHistory.map((history) => (
              <Card key={history.id}>
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-semibold text-slate-900">{history.type}</h3>
                        <p className="text-sm text-slate-600">{history.equipment}</p>
                      </div>
                      <p className="font-semibold text-green-600">${history.cost}</p>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Date</p>
                        <p className="font-semibold text-slate-900">{history.date}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Technician</p>
                        <p className="font-semibold text-slate-900">{history.technician}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Duration</p>
                        <p className="font-semibold text-slate-900">{history.duration}</p>
                      </div>
                      <div>
                        <Button size="sm" variant="outline">
                          View Notes
                        </Button>
                      </div>
                    </div>

                    <p className="text-sm text-slate-600 italic">{history.notes}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

