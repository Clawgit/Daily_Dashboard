/** Maps a WMO weather code to a human readable condition and a Lucide icon name. */
export function mapWeatherCode(code: number, isDay: boolean): { condition: string; icon: string } {
  switch (code) {
    case 0:
      return { condition: 'Clear Sky', icon: isDay ? 'Sun' : 'Moon' };
    case 1:
      return { condition: 'Mainly Clear', icon: isDay ? 'SunDim' : 'Moon' };
    case 2:
      return { condition: 'Partly Cloudy', icon: isDay ? 'CloudSun' : 'CloudMoon' };
    case 3:
      return { condition: 'Overcast', icon: 'Cloud' };
    case 45:
    case 48:
      return { condition: 'Foggy / Hazy', icon: 'CloudFog' };
    case 51:
    case 53:
    case 55:
      return { condition: 'Drizzle', icon: 'CloudDrizzle' };
    case 61:
    case 63:
    case 65:
      return { condition: 'Rain', icon: 'CloudRain' };
    case 71:
    case 73:
    case 75:
      return { condition: 'Snowfall', icon: 'CloudSnow' };
    case 77:
      return { condition: 'Snow Grains', icon: 'CloudSnow' };
    case 80:
    case 81:
    case 82:
      return { condition: 'Rain Showers', icon: 'CloudRain' };
    case 85:
    case 86:
      return { condition: 'Snow Showers', icon: 'CloudSnow' };
    case 95:
      return { condition: 'Thunderstorm', icon: 'CloudLightning' };
    case 96:
    case 99:
      return { condition: 'Severe Thunderstorm', icon: 'CloudLightning' };
    default:
      return { condition: 'Partly Cloudy', icon: 'Cloud' };
  }
}

export const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
