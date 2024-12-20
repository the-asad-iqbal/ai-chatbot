'use client';

import cx from 'classnames';
import { format, isWithinInterval } from 'date-fns';
import { useEffect, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Moon, Sun, Sunrise, Sunset } from 'lucide-react';

interface WeatherAtLocation {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;
  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
  };
  current: {
    time: string;
    interval: number;
    temperature_2m: number;
  };
  hourly_units: {
    time: string;
    temperature_2m: string;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
  };
  daily_units: {
    time: string;
    sunrise: string;
    sunset: string;
  };
  daily: {
    time: string[];
    sunrise: string[];
    sunset: string[];
  };
}

const SAMPLE = {
  latitude: 37.763283,
  longitude: -122.41286,
  generationtime_ms: 0.027894973754882812,
  utc_offset_seconds: 0,
  timezone: 'GMT',
  timezone_abbreviation: 'GMT',
  elevation: 18,
  current_units: { time: 'iso8601', interval: 'seconds', temperature_2m: '°C' },
  current: { time: '2024-10-07T19:30', interval: 900, temperature_2m: 29.3 },
  hourly_units: { time: 'iso8601', temperature_2m: '°C' },
  hourly: {
    time: [
      '2024-10-07T00:00',
      '2024-10-07T01:00',
      '2024-10-07T02:00',
      '2024-10-07T03:00',
      '2024-10-07T04:00',
      '2024-10-07T05:00',
      '2024-10-07T06:00',
      '2024-10-07T07:00',
      '2024-10-07T08:00',
      '2024-10-07T09:00',
      '2024-10-07T10:00',
      '2024-10-07T11:00',
      '2024-10-07T12:00',
      '2024-10-07T13:00',
      '2024-10-07T14:00',
      '2024-10-07T15:00',
      '2024-10-07T16:00',
      '2024-10-07T17:00',
      '2024-10-07T18:00',
      '2024-10-07T19:00',
      '2024-10-07T20:00',
      '2024-10-07T21:00',
      '2024-10-07T22:00',
      '2024-10-07T23:00',
      '2024-10-08T00:00',
      '2024-10-08T01:00',
      '2024-10-08T02:00',
      '2024-10-08T03:00',
      '2024-10-08T04:00',
      '2024-10-08T05:00',
      '2024-10-08T06:00',
      '2024-10-08T07:00',
      '2024-10-08T08:00',
      '2024-10-08T09:00',
      '2024-10-08T10:00',
      '2024-10-08T11:00',
      '2024-10-08T12:00',
      '2024-10-08T13:00',
      '2024-10-08T14:00',
      '2024-10-08T15:00',
      '2024-10-08T16:00',
      '2024-10-08T17:00',
      '2024-10-08T18:00',
      '2024-10-08T19:00',
      '2024-10-08T20:00',
      '2024-10-08T21:00',
      '2024-10-08T22:00',
      '2024-10-08T23:00',
      '2024-10-09T00:00',
      '2024-10-09T01:00',
      '2024-10-09T02:00',
      '2024-10-09T03:00',
      '2024-10-09T04:00',
      '2024-10-09T05:00',
      '2024-10-09T06:00',
      '2024-10-09T07:00',
      '2024-10-09T08:00',
      '2024-10-09T09:00',
      '2024-10-09T10:00',
      '2024-10-09T11:00',
      '2024-10-09T12:00',
      '2024-10-09T13:00',
      '2024-10-09T14:00',
      '2024-10-09T15:00',
      '2024-10-09T16:00',
      '2024-10-09T17:00',
      '2024-10-09T18:00',
      '2024-10-09T19:00',
      '2024-10-09T20:00',
      '2024-10-09T21:00',
      '2024-10-09T22:00',
      '2024-10-09T23:00',
      '2024-10-10T00:00',
      '2024-10-10T01:00',
      '2024-10-10T02:00',
      '2024-10-10T03:00',
      '2024-10-10T04:00',
      '2024-10-10T05:00',
      '2024-10-10T06:00',
      '2024-10-10T07:00',
      '2024-10-10T08:00',
      '2024-10-10T09:00',
      '2024-10-10T10:00',
      '2024-10-10T11:00',
      '2024-10-10T12:00',
      '2024-10-10T13:00',
      '2024-10-10T14:00',
      '2024-10-10T15:00',
      '2024-10-10T16:00',
      '2024-10-10T17:00',
      '2024-10-10T18:00',
      '2024-10-10T19:00',
      '2024-10-10T20:00',
      '2024-10-10T21:00',
      '2024-10-10T22:00',
      '2024-10-10T23:00',
      '2024-10-11T00:00',
      '2024-10-11T01:00',
      '2024-10-11T02:00',
      '2024-10-11T03:00',
    ],
    temperature_2m: [
      36.6, 32.8, 29.5, 28.6, 29.2, 28.2, 27.5, 26.6, 26.5, 26, 25, 23.5, 23.9,
      24.2, 22.9, 21, 24, 28.1, 31.4, 33.9, 32.1, 28.9, 26.9, 25.2, 23, 21.1,
      19.6, 18.6, 17.7, 16.8, 16.2, 15.5, 14.9, 14.4, 14.2, 13.7, 13.3, 12.9,
      12.5, 13.5, 15.8, 17.7, 19.6, 21, 21.9, 22.3, 22, 20.7, 18.9, 17.9, 17.3,
      17, 16.7, 16.2, 15.6, 15.2, 15, 15, 15.1, 14.8, 14.8, 14.9, 14.7, 14.8,
      15.3, 16.2, 17.9, 19.6, 20.5, 21.6, 21, 20.7, 19.3, 18.7, 18.4, 17.9,
      17.3, 17, 17, 16.8, 16.4, 16.2, 16, 15.8, 15.7, 15.4, 15.4, 16.1, 16.7,
      17, 18.6, 19, 19.5, 19.4, 18.5, 17.9, 17.5, 16.7, 16.3, 16.1,
    ],
  },
  daily_units: {
    time: 'iso8601',
    sunrise: 'iso8601',
    sunset: 'iso8601',
  },
  daily: {
    time: [
      '2024-10-07',
      '2024-10-08',
      '2024-10-09',
      '2024-10-10',
      '2024-10-11',
    ],
    sunrise: [
      '2024-10-07T07:15',
      '2024-10-08T07:16',
      '2024-10-09T07:17',
      '2024-10-10T07:18',
      '2024-10-11T07:19',
    ],
    sunset: [
      '2024-10-07T19:00',
      '2024-10-08T18:58',
      '2024-10-09T18:57',
      '2024-10-10T18:55',
      '2024-10-11T18:54',
    ],
  },
};

function n(num: number): number {
  return Math.ceil(num);
}

export function Weather({
  weatherAtLocation = SAMPLE,
}: {
  weatherAtLocation?: WeatherAtLocation;
}) {
  const currentHigh = Math.max(
    ...weatherAtLocation.hourly.temperature_2m.slice(0, 24),
  );
  const currentLow = Math.min(
    ...weatherAtLocation.hourly.temperature_2m.slice(0, 24),
  );

  const isDay = isWithinInterval(new Date(weatherAtLocation.current.time), {
    start: new Date(weatherAtLocation.daily.sunrise[0]),
    end: new Date(weatherAtLocation.daily.sunset[0]),
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const hoursToShow = isMobile ? 5 : 6;
  const currentTimeIndex = weatherAtLocation.hourly.time.findIndex(
    (time) => new Date(time) >= new Date(weatherAtLocation.current.time),
  );

  const displayTimes = weatherAtLocation.hourly.time.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow,
  );
  const displayTemperatures = weatherAtLocation.hourly.temperature_2m.slice(
    currentTimeIndex,
    currentTimeIndex + hoursToShow,
  );

  return (
    <TooltipProvider>
      <div
        className={cx(
          'flex flex-col gap-6 rounded-3xl p-6 shadow-lg backdrop-blur-sm transition-all duration-300',
          'border border-opacity-20',
          {
            'bg-gradient-to-br from-blue-400 to-blue-500 border-white': isDay,
            'bg-gradient-to-br from-indigo-900 to-indigo-800 border-indigo-300': !isDay,
          }
        )}
      >
        {/* Main Temperature Section */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className={cx(
                      'size-12 rounded-full shadow-lg flex items-center justify-center cursor-pointer',
                      'transform transition-all duration-300 hover:scale-110',
                      {
                        'bg-yellow-300 shadow-yellow-200/50': isDay,
                        'bg-indigo-100 shadow-indigo-400/30': !isDay,
                      }
                    )}
                  >
                    {isDay ? (
                      <Sun className="h-8 w-8 text-yellow-600" />
                    ) : (
                      <Moon className="h-8 w-8 text-indigo-600" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Current conditions: {isDay ? 'Daytime' : 'Nighttime'}</p>
                </TooltipContent>
              </Tooltip>
              <div className="flex flex-col">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="text-5xl font-bold text-white tracking-tight cursor-pointer">
                      {Math.round(weatherAtLocation.current.temperature_2m)}°
                    </div>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">Current temperature</p>
                  </TooltipContent>
                </Tooltip>
                <div className="text-blue-50/80 text-sm">
                  {format(new Date(weatherAtLocation.current.time), 'EEEE, h:mm a')}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-end text-blue-50">
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span className="text-blue-50/80 text-sm">High</span>
                    <span className="font-semibold">{Math.round(currentHigh)}°</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Today's highest temperature</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 cursor-pointer">
                    <span className="text-blue-50/80 text-sm">Low</span>
                    <span className="font-semibold">{Math.round(currentLow)}°</span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Today's lowest temperature</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        {/* Hourly Forecast Section */}
        <div className="flex flex-col gap-4">
          <div className="text-blue-50/80 text-xs font-medium uppercase tracking-wider">
            Hourly Forecast
          </div>
          <div className="grid grid-cols-5 md:grid-cols-6 gap-4">
            {displayTimes.map((time, index) => (
              <Tooltip key={time}>
                <TooltipTrigger asChild>
                  <div
                    className={cx(
                      'flex flex-col items-center gap-2 p-2 rounded-lg transition-all duration-300 cursor-pointer',
                      'hover:bg-white/10'
                    )}
                  >
                    <div className="text-blue-50/90 text-sm font-medium">
                      {format(new Date(time), 'h a')}
                    </div>
                    <div
                      className={cx(
                        'size-8 rounded-full flex items-center justify-center',
                        'transform transition-all duration-300',
                        {
                          'bg-yellow-300/90':
                            isWithinInterval(new Date(time), {
                              start: new Date(weatherAtLocation.daily.sunrise[0]),
                              end: new Date(weatherAtLocation.daily.sunset[0]),
                            }),
                          'bg-indigo-200/90': !isWithinInterval(new Date(time), {
                            start: new Date(weatherAtLocation.daily.sunrise[0]),
                            end: new Date(weatherAtLocation.daily.sunset[0]),
                          }),
                        }
                      )}
                    >
                      {isWithinInterval(new Date(time), {
                        start: new Date(weatherAtLocation.daily.sunrise[0]),
                        end: new Date(weatherAtLocation.daily.sunset[0]),
                      }) ? (
                        <Sun className="h-5 w-5 text-yellow-600" />
                      ) : (
                        <Moon className="h-5 w-5 text-indigo-600" />
                      )}
                    </div>
                    <div className="text-white font-semibold">
                      {Math.round(displayTemperatures[index])}°
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">
                    {format(new Date(time), 'h:mm a')}: {Math.round(displayTemperatures[index])}°C
                  </p>
                </TooltipContent>
              </Tooltip>
            ))}
          </div>
        </div>

        {/* Sunrise/Sunset Info */}
        <div className="flex justify-between items-center pt-2 border-t border-white/10">
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-blue-50/80 text-xs cursor-pointer hover:text-blue-50 transition-colors">
                <Sunrise className="h-4 w-4" />
                Sunrise: {format(new Date(weatherAtLocation.daily.sunrise[0]), 'h:mm a')}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">First light of the day</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className="flex items-center gap-2 text-blue-50/80 text-xs cursor-pointer hover:text-blue-50 transition-colors">
                <Sunset className="h-4 w-4" />
                Sunset: {format(new Date(weatherAtLocation.daily.sunset[0]), 'h:mm a')}
              </div>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-sm">Last light of the day</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    </TooltipProvider>
  );
}