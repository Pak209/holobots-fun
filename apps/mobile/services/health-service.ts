import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Application from 'expo-application';
import * as Location from 'expo-location';
import AppleHealthKit, { 
  HealthInputOptions, 
  HealthKitPermissions,
  HealthValue
} from 'react-native-health';

// IMPORTANT: In a production app, you would import the health tracking library here
// For example:
// import AppleHealthKit from 'react-native-health';
// import GoogleFit from 'react-native-google-fit';

interface LocationData {
  speed: number; // in km/h
  distance: number; // in km
  latitude: number;
  longitude: number;
}

// Create a platform-specific health service
class HealthService {
  private isAvailable: boolean;
  private isConnected: boolean = false;
  private readonly HEALTH_CONNECTED_KEY = 'health_kit_connected';
  private readonly MOCK_STEP_KEY = 'mock_step_count';
  private readonly LAST_SYNC_DATE_KEY = 'last_sync_date';
  private locationWatcher: Location.LocationSubscription | null = null;
  private lastLocation: LocationData | null = null;
  private totalDistance: number = 0;
  
  constructor() {
    // Check if we're in an environment where health tracking might be available
    this.isAvailable = Platform.OS === 'ios';
    
    // Initialize connection state
    this.initConnectionState();
  }
  
  private async initConnectionState() {
    try {
      const connected = await AsyncStorage.getItem(this.HEALTH_CONNECTED_KEY);
      this.isConnected = connected === 'true';
    } catch (error) {
      console.error('Error initializing health connection state:', error);
      this.isConnected = false;
    }
  }
  
  async requestPermissions(): Promise<boolean> {
    if (!this.isAvailable) {
      console.log('HealthKit not available on this platform');
      return false;
    }
    
    try {
      const permissions: HealthKitPermissions = {
        permissions: {
          read: [
            AppleHealthKit.Constants.Permissions.StepCount,
            AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
            AppleHealthKit.Constants.Permissions.ActiveEnergyBurned
          ],
          write: []
        }
      };
      
      return new Promise((resolve) => {
        AppleHealthKit.initHealthKit(permissions, async (error) => {
          if (error) {
            console.error('Error initializing HealthKit:', error);
            resolve(false);
            return;
          }
          
          // After initialization, check if permissions were actually granted
          AppleHealthKit.isAvailable((error, available) => {
            if (error) {
              console.error('Error checking HealthKit availability:', error);
              resolve(false);
              return;
            }
            
            if (!available) {
              console.log('HealthKit is not available on this device');
              resolve(false);
              return;
            }
            
            // Check if we have the permissions we need
            AppleHealthKit.getAuthStatus(permissions, (error, status) => {
              if (error) {
                console.error('Error checking HealthKit auth status:', error);
                resolve(false);
                return;
              }
              
              const hasPermissions = status.permissions.read.every(
                (permission) => permission.status === 'authorized'
              );
              
              if (hasPermissions) {
                this.setConnected(true);
                resolve(true);
              } else {
                console.log('HealthKit permissions not granted');
                resolve(false);
              }
            });
          });
        });
      });
    } catch (error) {
      console.error('Error requesting health permissions:', error);
      return false;
    }
  }
  
  async disconnectHealthKit(): Promise<boolean> {
    if (!this.isAvailable || Platform.OS !== 'ios') {
      return false;
    }
    
    try {
      await this.setConnected(false);
      return true;
    } catch (error) {
      console.error('Error disconnecting from HealthKit:', error);
      return false;
    }
  }
  
  async isHealthKitConnected(): Promise<boolean> {
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    try {
      const connected = await AsyncStorage.getItem(this.HEALTH_CONNECTED_KEY);
      return connected === 'true';
    } catch (error) {
      console.error('Error checking health connection state:', error);
      return false;
    }
  }
  
  private async setConnected(connected: boolean): Promise<void> {
    try {
      await AsyncStorage.setItem(this.HEALTH_CONNECTED_KEY, connected ? 'true' : 'false');
      this.isConnected = connected;
    } catch (error) {
      console.error('Error saving health connection state:', error);
    }
  }
  
  async getTodayStepCount(): Promise<number> {
    if (!this.isAvailable || Platform.OS !== 'ios' || !this.isConnected) {
      return 0;
    }
    
    try {
      const options: HealthInputOptions = {
        startDate: new Date(new Date().setHours(0, 0, 0, 0)).toISOString(),
        endDate: new Date().toISOString(),
      };
      
      return new Promise((resolve) => {
        AppleHealthKit.getStepCount(options, (error: string, results: HealthValue) => {
          if (error) {
            console.error('Error getting step count from HealthKit:', error);
            resolve(0);
            return;
          }
          resolve(results.value);
        });
      });
    } catch (error) {
      console.error('Error getting step count:', error);
      return 0;
    }
  }
  
  async getWeeklyStepCounts(): Promise<Array<{ date: string; count: number }>> {
    if (!this.isAvailable || Platform.OS !== 'ios' || !this.isConnected) {
      return [];
    }
    
    try {
      const options: HealthInputOptions = {
        startDate: new Date(new Date().setDate(new Date().getDate() - 7)).toISOString(),
        endDate: new Date().toISOString(),
      };
      
      return new Promise((resolve) => {
        AppleHealthKit.getDailyStepCountSamples(options, (error: string, results: any[]) => {
          if (error) {
            console.error('Error getting weekly step counts from HealthKit:', error);
            resolve([]);
            return;
          }
          
          const formattedResults = results.map(item => ({
            date: item.startDate.split('T')[0],
            count: item.value
          }));
          
          resolve(formattedResults);
        });
      });
    } catch (error) {
      console.error('Error getting weekly step counts:', error);
      return [];
    }
  }
  
  // Get device info for health connection
  async getDeviceInfo(): Promise<{ name: string; version: string }> {
    let deviceName = 'Unknown Device';
    let osVersion = 'Unknown OS';
    
    if (Platform.OS === 'ios') {
      deviceName = 'iPhone';
      osVersion = `iOS ${Platform.Version}`;
      
      try {
        if (Application.applicationId) {
          deviceName = `${deviceName} (${Application.applicationId})`;
        }
      } catch (appError) {
        console.log('Could not get application info:', appError);
      }
    }
    
    return { name: deviceName, version: osVersion };
  }
  
  // Method to manually set step count (for testing/demo purposes)
  async setManualStepCount(steps: number): Promise<void> {
    try {
      await AsyncStorage.setItem(this.MOCK_STEP_KEY, steps.toString());
      await AsyncStorage.setItem(this.LAST_SYNC_DATE_KEY, new Date().toISOString().split('T')[0]);
      console.log(`Manually set step count to ${steps}`);
    } catch (error) {
      console.error('Error setting manual step count:', error);
    }
  }

  async getCurrentLocation(): Promise<LocationData> {
    if (!this.isAvailable || Platform.OS === 'web') {
      // Return mock location data
      return {
        speed: 5, // Mock speed of 5 km/h
        distance: this.totalDistance,
        latitude: 0,
        longitude: 0
      };
    }

    try {
      // Request location permissions if not granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Get current location
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.BestForNavigation
      });

      // Calculate speed in km/h (convert from m/s)
      const speed = location.coords.speed ? location.coords.speed * 3.6 : 0;

      // Update total distance if we have a previous location
      if (this.lastLocation) {
        const distance = await this.calculateDistance(
          this.lastLocation.latitude,
          this.lastLocation.longitude,
          location.coords.latitude,
          location.coords.longitude
        );
        this.totalDistance += distance;
      }

      // Update last location
      this.lastLocation = {
        speed,
        distance: this.totalDistance,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };

      return this.lastLocation;
    } catch (error) {
      console.error('Error getting location:', error);
      return {
        speed: 0,
        distance: this.totalDistance,
        latitude: 0,
        longitude: 0
      };
    }
  }

  async startLocationTracking(): Promise<void> {
    if (!this.isAvailable || Platform.OS === 'web') {
      console.log('Location tracking not available in this environment');
      return;
    }

    try {
      // Request location permissions if not granted
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Location permission not granted');
      }

      // Reset tracking data
      this.totalDistance = 0;
      this.lastLocation = null;

      // Start watching location
      this.locationWatcher = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.BestForNavigation,
          timeInterval: 1000,
          distanceInterval: 1
        },
        location => {
          const speed = location.coords.speed ? location.coords.speed * 3.6 : 0;

          if (this.lastLocation) {
            // Calculate new distance
            this.calculateDistance(
              this.lastLocation.latitude,
              this.lastLocation.longitude,
              location.coords.latitude,
              location.coords.longitude
            ).then(distance => {
              this.totalDistance += distance;
              
              // Update last location
              this.lastLocation = {
                speed,
                distance: this.totalDistance,
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
              };
            });
          } else {
            // First location update
            this.lastLocation = {
              speed,
              distance: 0,
              latitude: location.coords.latitude,
              longitude: location.coords.longitude
            };
          }
        }
      );
    } catch (error) {
      console.error('Error starting location tracking:', error);
    }
  }

  async stopLocationTracking(): Promise<void> {
    if (this.locationWatcher) {
      this.locationWatcher.remove();
      this.locationWatcher = null;
    }
    this.lastLocation = null;
    this.totalDistance = 0;
  }

  private async calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): Promise<number> {
    // Haversine formula to calculate distance between two points
    const R = 6371; // Earth's radius in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const healthService = new HealthService();